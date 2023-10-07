#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import fs from 'node:fs/promises'
import inquirer from 'inquirer'
import path from 'node:path'
import { decrypt, encrypt } from './lib/encryption.js'
import { fromBase58, toBase58 } from './lib/base58.js'
import ncp from 'copy-paste'
import untildify from 'untildify'

const program = new Command().name('envshare-cli').version('1.0.0')

async function getEnvFiles() {
  const files = await fs.readdir(process.cwd())
  const envFiles = files.filter((file) => file.startsWith('.env'))
  return envFiles
}

async function uploadFile(
  filepath: string,
  ttl: number = 3600,
  reads: number = 1
) {
  const fileContent = await fs.readFile(filepath, 'utf8')
  const { encrypted, iv, key } = await encrypt(fileContent)

  const response = await fetch('https://envshare.dev/api/v1/secret', {
    method: 'POST',
    headers: {
      'envshare-ttl': ttl.toString(),
      'envshare-reads': reads.toString(),
    },
    body: toBase58(encrypted),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const json = await response.json()

  const compositeKey = `${json.data.id}.${toBase58(key)}.${toBase58(iv)}`
  return compositeKey
}

async function fetchFile(compositeKey: string) {
  const [id, key, iv] = compositeKey.split('.')
  const encryptionKey = fromBase58(key)
  const res = await fetch(`https://envshare.dev/api/v1/secret/${id}`)

  if (res.status === 404) {
    throw new Error(`ID ${id} not found`)
  }

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const json = await res.json()
  const decrypted = await decrypt(json.data.secret, encryptionKey, iv)
  return decrypted
}

program
  .command('share')
  .summary('Share an env file')
  .option('-f, --file <envFile>', 'Env file to share')
  .option(
    '-t, --ttl <ttl>',
    'Time to live in seconds (default 3600 (1 hour))',
    parseInt
  )
  .option('-r, --reads <reads>', 'Number of reads (default 1)', parseInt)
  .action(async ({ file, ttl, reads }) => {
    let envFile = file
    if (!envFile) {
      const envFiles = await getEnvFiles()
      if (envFiles.length === 0) {
        console.error(
          `No env files found in current directory ${process.cwd()}`
        )
        return
      }
      const answers = await inquirer.prompt({
        type: 'list',
        name: 'envFile',
        message: 'Select env file to share',
        choices: await getEnvFiles(),
      })
      envFile = answers.envFile
    }

    const envFilePath = path.join(process.cwd(), envFile!)
    const compositeKey = await uploadFile(envFilePath, ttl, reads)

    console.log(
      `
Env file uploaded successfully.
name: ${path.basename(envFilePath)}
ID: ${compositeKey}
Command: npx envshare-cli@latest fetch ${compositeKey}
      `
    )

    const copyAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'copy',
        message: 'Copy to clipboard?',
      },
    ])

    if (copyAnswers.copy) {
      const copyAnswersKind = await inquirer.prompt([
        {
          type: 'list',
          name: 'kind',
          message: 'What do you want to copy?',
          choices: ['Copy ID to share', 'Copy command to share'],
        },
      ])
      switch (copyAnswersKind.kind) {
        case 'ID':
          ncp.copy(compositeKey)
          console.log(`ID "${compositeKey}" copied to clipboard`)
          break
        case 'Command':
          const c = `npx envshare-cli@latest fetch ${compositeKey}`
          ncp.copy(c)
          console.log(`Command "${c}" copied to clipboard`)
          break
      }
    }
  })

program
  .command('fetch')
  .summary('Fetch an env file')
  .argument('ID', 'ID of the env file to fetch')
  .option('-o, --output <path>', 'Output file')
  .action(async (ID, { output }) => {
    let newOutput = output
    try {
      if (!output) {
        const answers = await inquirer.prompt({
          type: 'input',
          name: 'filename',
          message: 'Enter filename to save to',
          default: '.env',
        })
        newOutput = answers.filename
      }

      newOutput = untildify(newOutput!)

      const content = await fetchFile(ID)
      await fs.writeFile(newOutput!, content)
      console.log(`File written to ${newOutput}`)
      await fs.writeFile(newOutput!, content)
    } catch (e) {
      console.log(e)
      console.error(`ID ${ID} not found`)
    }
  })

program.parse()
