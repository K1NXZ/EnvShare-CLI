# EnvShare-CLI

EnvShare-CLI is a command-line tool that allows you to securely share and fetch environment variable files with your team. It is build on top of [EnvShare.dev](https://envshare.dev) - [Github](https://github.com/chronark/envshare). It uses encryption to protect sensitive data and provides a convenient way to share and access environment variables.

## Installation

To install EnvShare-CLI, you can use npm. Make sure you have [Node.js](https://nodejs.org/) installed on your system.

```bash
npm install -g envshare-cli
```

## Usage

### Sharing an Environment File

To share an environment file, use the `share` command.

```bash
envshare-cli share
```

This command will prompt you to select an environment file (if multiple are available) and then upload it securely. You can specify optional TTL (Time to Live in seconds) and number of reads using the `-t` and `-r` options, respectively.

After sharing an environment file, EnvShare-CLI provides an option to copy the ID or the fetch command to your clipboard for easy sharing with others.

### Fetching an Environment File

To fetch an environment file, use the `fetch` command and provide the ID of the file you want to retrieve.

```bash
envshare-cli fetch <ID>
```

You can also specify an output file using the `-o` option:bash

```bash
envshare-cli fetch <ID> -o <output-file>;
```

EnvShare-CLI uses encryption to protect your environment files during transmission.

## Contributing

Feel free to contribute to this project by creating issues or submitting pull requests on the GitHub repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

#### Author

Name: Angelo Walczak<br>
Email: angelo.walczak@gmail.com<br>
GitHub: https://github.com/K1NXZ

## Additional Information

For more information and updates, visit the GitHub repository.

Thank you for using envshare! We hope it simplifies the process of sharing and accessing environment files within your team.
