import { detect } from 'detect-package-manager'

export async function fetchCommand(id: string) {
  const pm = await detect()
  switch (pm) {
    case 'pnpm':
      return `pnpx envshare-cli@latest fetch ${id}`
    case 'bun':
      return `bunx envshare-cli@latest fetch ${id}`
    default:
      return `npx envshare-cli@latest fetch ${id}`
  }
}
