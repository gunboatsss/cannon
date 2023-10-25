import { anvilOptions } from './util/anvil';

const commandsConfig = {
  run: {
    description: 'Utility for instantly loading cannon packages in standalone contexts',
    usage: '[global options] ...[<name>[:<semver>] ...[<key>=<value>]]',
    arguments: [
      {
        flags: '<packageNames...>',
        description: 'List of packages to load, optionally with custom settings for each one',
      },
    ],
    anvilOptions: anvilOptions,
    options: [
      {
        flags: '-n --provider-url [url]',
        description: 'RPC endpoint to fork off of',
      },
      {
        flags: '--build',
        description: 'Specify to rebuild generated artifacts with latest, even if no changed settings have been defined.',
      },
      {
        flags: '--upgrade-from [cannon-package:0.0.1]',
        description: 'Specify a package to use as a new base for the deployment.',
      },
      {
        flags: '--registry-priority <registry>',
        description: 'Change the default registry to read from first. Default: onchain',
      },
      {
        flags: '--preset <preset>',
        description: 'Load an alternate setting preset',
      },
      {
        flags: '--logs',
        description: 'Show RPC logs instead of an interactive prompt',
      },
      {
        flags: '--fund-addresses <fundAddresses...>',
        description: 'Pass a list of addresses to receive a balance of 10,000 ETH',
      },
      {
        flags: '--impersonate <address>',
        description: 'Impersonate all calls from the given signer instead of a real wallet. Only works with --fork',
        defaultValue: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      },
      {
        flags: '--mnemonic <phrase>',
        description: 'Use the specified mnemonic to initialize a chain of signers while running',
      },
      {
        flags: '--private-key [key]',
        description: 'Specify a comma separated list of private keys which may be needed to sign a transaction',
      },
    ],
  },
  build: {
    description: 'Build a package from a Cannonfile',
    arguments: [
      {
        flags: '[cannonfile]',
        description: 'Path to a cannonfile',
        defaultValue: 'cannonfile.toml',
      },
      {
        flags: '[settings...]',
        description: 'Custom settings for building the cannonfile',
      },
    ],
    anvilOptions: anvilOptions,
    options: [
      {
        flags: '-n --provider-url [url]',
        description: 'RPC endpoint to execute the deployment on',
      },
      {
        flags: '-c --chain-id <number>',
        description: 'The chain id to run against',
      },
      {
        flags: '-p --preset <preset>',
        description: 'The preset label for storing the build with the given settings',
      },
      {
        flags: '--dry-run',
        description: 'Simulate building on a local fork rather than deploying on the real network',
      },
      {
        flags: '--private-key [key]',
        description: 'Specify a comma separated list of private keys which may be needed to sign a transaction',
      },
      {
        flags: '--wipe',
        description: 'Clear the existing deployment state and start this deploy from scratch.',
      },
      {
        flags: '--upgrade-from [cannon-package:0.0.1]',
        description: 'Specify a package to use as a new base for the deployment.',
      },
      {
        flags: '--registry-priority <registry>',
        description: 'Change the default registry to read from first. Default: onchain',
      },
      {
        flags: '--gas-price <gasPrice>',
        description: 'Specify a gas price to use for the deployment',
      },
      {
        flags: '--max-gas-fee <maxGasFee>',
        description: 'Specify max fee per gas (EIP-1559) for deployment',
      },
      {
        flags: '--max-priority-gas-fee <maxpriorityGasFee>',
        description: 'Specify max fee per gas (EIP-1559) for deployment',
      },
      {
        flags: '--skip-compile',
        description: 'Skip the compilation step and use the existing artifacts',
      },
      {
        flags: '-q --quiet',
        description: 'Suppress extra logging',
      },
      {
        flags: '-v',
        description: 'print logs for builder,equivalent to DEBUG=cannon:builder',
      },
      {
        flags: '-vv',
        description:
          'print logs for builder and its definition section,equivalent to DEBUG=cannon:builder,cannon:builder:definition',
      },
      {
        flags: '-vvv',
        description: 'print logs for builder and its all sub sections,equivalent to DEBUG=cannon:builder*',
      },
      {
        flags: '-vvvv',
        description: 'print all cannon logs,equivalent to DEBUG=cannon:*',
      },
    ],
  },
  verify: {
    description: 'Verify a package on Etherscan',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Name and version of the Cannon package to verify',
      },
    ],
    options: [
      {
        flags: '-a --api-key <apiKey>',
        description: 'Etherscan API key',
      },
      {
        flags: '-c --chain-id <chainId>',
        description: 'Chain ID of deployment to verify',
        defaultValue: '1',
      },
      {
        flags: '-p --preset <preset>',
        description: 'Preset of the deployment to verify',
      },
    ],
  },
  alter: {
    description: 'Change a cannon package outside of the regular build process.',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Name and version of the Cannon package to alter',
      },
      {
        flags: '<command>',
        description:
          'Alteration command to execute. Current options: set-url, set-contract-address, mark-complete, mark-incomplete',
      },
      {
        flags: '[options...]',
        description: 'Additional options for your alteration command',
      },
    ],
    options: [
      {
        flags: '-c --chain-id <chainId>',
        description: 'Chain ID of deployment to alter',
      },
      {
        flags: '-p --preset <preset>',
        description: 'Preset of the deployment to alter',
      },
    ],
  },
  publish: {
    description: 'Publish a Cannon package to the registry',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Name and version of the package to publish',
      },
    ],
    options: [
      {
        flags: '-n --registry-provider-url [url]',
        description: 'RPC endpoint to publish to',
      },
      {
        flags: '--private-key <key>',
        description: 'Private key to use for publishing the registry package',
      },
      {
        flags: '--chain-id <number>',
        description: 'The chain ID of the package to publish',
      },
      {
        flags: '--preset <preset>',
        description: 'The preset of the packages to publish',
      },
      {
        flags: '-t --tags <tags>',
        description: 'Comma separated list of labels for your package',
        defaultValue: 'latest',
      },
      {
        flags: '--gas-limit <gasLimit>',
        description: 'The maximum units of gas spent for the registration transaction',
      },
      {
        flags: '--max-fee-per-gas <maxFeePerGas>',
        description: 'The maximum value (in gwei) for the base fee when submitting the registry transaction',
      },
      {
        flags: '--max-priority-fee-per-gas <maxPriorityFeePerGas>',
        description: 'The maximum value (in gwei) for the miner tip when submitting the registry transaction',
      },
      {
        flags: '-q --quiet',
        description: 'Only output final JSON object at the end, no human readable output',
      },
    ],
  },
  inspect: {
    description: 'Inspect the details of a Cannon package',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Name and version of the cannon package to inspect',
      },
    ],
    options: [
      {
        flags: '-c --chain-id <chainId>',
        description: 'Chain ID of the variant to inspect',
        defaultValue: '13370',
      },
      {
        flags: '-p --preset <preset>',
        description: 'Preset of the variant to inspect',
      },
      {
        flags: '-j --json',
        description: 'Output as JSON',
      },
      {
        flags: '-w --write-deployments <writeDeployments>',
        description: 'Path to write the deployments data (address and ABIs), like "./deployments"',
      },
      {
        flags: '-q --quiet',
        description: 'Suppress extra logging',
      },
    ],
  },
  prune: {
    description: 'Clean cannon storage of excessive/transient build files older than a certain age',
    options: [
      {
        flags: '--filter-package <packageName>',
        description: 'Only keep deployments in local storage which match the given package name. Default: do not filter',
      },
      {
        flags: '--filter-variant <variant>',
        description: 'Only keep deployments which match the specifiec variant(s). Default: do not filter',
      },
      {
        flags: '--keep-age <seconds>',
        description: 'Number of seconds old a package must be before it should be deleted',
        defaultValue: '2592000',
      },
      {
        flags: '--dry-run',
        description: 'Print out information about prune without committing',
      },
      {
        flags: '-y --yes',
        description: 'Skip confirmation prompt',
      },
    ],
  },
  trace: {
    description: 'Get a full stack trace for a transaction hash or explicit transaction call',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Name and version of the cannon package to use',
      },
      {
        flags: '<transactionHash OR bytes32Data>',
        description: 'base 16 encoded transaction data to input to a function call, or transaction hash',
      },
    ],
    options: [
      {
        flags: '-c --chain-id <chainId>',
        description: 'Chain ID of the variant to inspect',
        defaultValue: '13370',
        required: true,
      },
      {
        flags: '-f --from <source>',
        description: 'Caller for the transaction to trace',
      },
      {
        flags: '-t --to <target>',
        description: 'Contract which should be called',
      },
      {
        flags: '-v --value <value>',
        description: 'Amonut of gas token to send in the traced call',
      },
      {
        flags: '-b --block-number <value>',
        description: 'The block to simulate when the call is on',
      },
      {
        flags: '-p --preset <preset>',
        description: 'Preset of the variant to inspect',
        defaultValue: 'main',
      },
      {
        flags: '-n --provider-url [url]',
        description: 'RPC endpoint to fork off of',
      },
      {
        flags: '-j --json',
        description: 'Output as JSON',
      },
    ],
  },
  decode: {
    description: 'decode transaction data using the ABIs of the given Cannon package',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Name and version of the cannon package to use',
      },
      {
        flags: '<bytes32Data...>',
        description: 'bytes32 encoded transaction data to decode',
      },
    ],
    options: [
      {
        flags: '-c --chain-id <chainId>',
        description: 'Chain ID of the variant to inspect',
        defaultValue: '13370',
      },
      {
        flags: '-p --preset <preset>',
        description: 'Preset of the variant to inspect',
        defaultValue: 'main',
      },
      {
        flags: '-j --json',
        description: 'Output as JSON',
      },
    ],
  },
  test: {
    description: 'Run forge tests on a cannon deployment. To pass arguments through to `forge test`, use `--`.',
    usage: '[cannonfile] [-- forge options...]',
    arguments: [
      {
        flags: '[cannonfile]',
        description: 'Path to a cannonfile',
        defaultValue: 'cannonfile.toml',
      },
      {
        flags: '[forge options...]',
        description: 'Additional options to send to forge',
      },
    ],
    options: [
      {
        flags: '-n --provider-url [url]',
        description: 'RPC endpoint to fork off of',
      },
      {
        flags: '-c --chain-id',
        description: 'Chain ID to connect to and run fork tests with',
      },
      {
        flags: '-p --preset <preset>',
        description: 'The preset label for storing the build with the given settings',
        defaultValue: 'main',
      },
      {
        flags: '--wipe',
        description: 'Clear the existing deployment state and start this deploy from scratch.',
      },
      {
        flags: '--upgrade-from [cannon-package:0.0.1]',
        description: 'Specify a package to use as a new base for the deployment.',
      },
      {
        flags: '--registry-priority <registry>',
        description: 'Change the default registry to read from first. Default: onchain',
      },
    ],
  },
  interact: {
    description: 'Start an interactive terminal against a set of active cannon deployments',
    arguments: [
      {
        flags: '<packageName>',
        description: 'Package to deploy, optionally with custom settings',
      },
    ],
    options: [
      {
        flags: '-c --chain-id <chainId>',
        description: 'Chain ID of deployment to interact with ',
        required: true,
      },
      {
        flags: '-n --provider-url [url]',
        description: 'RPC endpoint to execute the deployment on',
      },
      {
        flags: '-p --preset <preset>',
        description: 'Load an alternate setting preset',
        defaultValue: 'main',
      },
      {
        flags: '--mnemonic <phrase>',
        description: 'Use the specified mnemonic to initialize a chain of signers while running',
      },
      {
        flags: '--private-key [key]',
        description: 'Specify a comma separated list of private keys which may be needed to sign a transaction',
      },
      {
        flags: '--gas-price <gasPrice>',
        description: 'Specify a gas price to use for the deployment',
      },
      {
        flags: '--max-gas-fee <maxGasFee>',
        description: 'Specify max fee per gas (EIP-1559) for deployment',
      },
      {
        flags: '--max-priority-gas-fee <maxpriorityGasFee>',
        description: 'Specify max fee per gas (EIP-1559) for deployment',
      },
    ],
  },
  setup: {
    description: 'Initialize cannon settings file',
  },
  clean: {
    description: 'Delete packages cache directories',
    options: [
      {
        flags: '--no-confirm',
        description: 'Do not ask for confirmation before deleting',
      },
    ],
  },
  plugin: {
    description: 'Manage Cannon plug-in modules',
    commands: {
      list: {
        description: 'List all installed Cannon plug-ins',
      },
      add: {
        description: 'Add a Cannon plug-in',
        arguments: [
          {
            flags: '<name>',
            description: 'npm package name of the Cannon plug-in',
          },
        ],
      },
      remove: {
        description: 'Remove a Cannon plug-in',
        arguments: [
          {
            flags: '<name>',
            description: 'npm package name of the Cannon plug-in',
          },
        ],
      },
    },
  },
};

export default commandsConfig;