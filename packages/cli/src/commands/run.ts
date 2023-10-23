import _ from 'lodash-es';
import chalk from 'chalk';
import { ethers } from 'ethers';
import {
  CANNON_CHAIN_ID,
  ChainArtifacts,
  ChainBuilderRuntime,
  ChainDefinition,
  ContractArtifact,
  getOutputs,
  renderTrace,
} from '@usecannon/builder';
import { PackageSpecification } from '../types.js';
import { CannonRpcNode, getProvider } from '../rpc.js';
import { interact } from './interact.js';
import onKeypress from '../util/on-keypress.js';
import { build } from './build.js';
import { getContractsRecursive } from '../util/contracts-recursive.js';
import { createDefaultReadRegistry } from '../registry.js';
import { resolveCliSettings } from '../settings.js';
import { setupAnvil } from '../helpers.js';
import { getMainLoader } from '../loader.js';

export interface RunOptions {
  node: CannonRpcNode;
  logs?: boolean;
  pkgInfo: any;
  preset: string;
  impersonate: string;
  mnemonic?: string;
  privateKey?: string;
  upgradeFrom?: string;
  getArtifact?: (name: string) => Promise<ContractArtifact>;
  registryPriority: 'local' | 'onchain';
  fundAddresses?: string[];
  helpInformation?: string;
  build?: boolean;
}

const INITIAL_INSTRUCTIONS = chalk.green(`Press ${chalk.bold('h')} to see help information for this command.`);
const INSTRUCTIONS = chalk.green(
  `\nPress ${chalk.bold('a')} to toggle displaying the logs from your local node.\nPress ${chalk.bold(
    'i'
  )} to interact with contracts via the command line.\nPress ${chalk.bold(
    'v'
  )} to toggle display verbosity of transaction traces as they run.`
);

export async function run(packages: PackageSpecification[], options: RunOptions) {
  await setupAnvil();

  console.log(chalk.bold('Starting local node...\n'));

  // Start the rpc server
  const node = options.node;
  const provider = getProvider(node);
  const nodeLogging = await createLoggingInterface(node);

  if (options.fundAddresses && options.fundAddresses.length) {
    for (const fundAddress of options.fundAddresses) {
      await provider.send('hardhat_setBalance', [fundAddress, `0x${(1e22).toString(16)}`]);
    }
  }

  const cliSettings = resolveCliSettings(options);
  const resolver = await createDefaultReadRegistry(cliSettings);

  const buildOutputs: { pkg: PackageSpecification; outputs: ChainArtifacts }[] = [];

  let signers: ethers.Signer[] = [];

  // set up signers
  for (const addr of (options.impersonate || '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266').split(',')) {
    await provider.send('hardhat_impersonateAccount', [addr]);
    await provider.send('hardhat_setBalance', [addr, `0x${(1e22).toString(16)}`]);
    signers = [provider.getSigner(addr)];
  }

  const chainId = (await provider.getNetwork()).chainId;

  const basicRuntime = new ChainBuilderRuntime(
    {
      provider: provider,
      chainId,
      async getSigner(addr: string) {
        // on test network any user can be conjured
        await provider.send('hardhat_impersonateAccount', [addr]);
        await provider.send('hardhat_setBalance', [addr, `0x${(1e22).toString(16)}`]);
        return provider.getSigner(addr);
      },
      snapshots: chainId === CANNON_CHAIN_ID,
      allowPartialDeploy: false,
    },
    resolver,
    getMainLoader(cliSettings)
  );

  for (const pkg of packages) {
    const { name, version, preset = 'main' } = pkg;

    if (options.preset && preset) {
      console.warn(
        chalk.yellow(
          chalk.bold(
            `Duplicate preset definitions in package reference "${name}:${version}@${preset}" and in --preset argument: "${options.preset}"`
          )
        )
      );
      console.warn(
        chalk.yellow(chalk.bold(`The --preset option is deprecated. Defaulting to package reference "${preset}"...`))
      );
    }

    const selectedPreset = preset || options.preset || 'main';

    if (options.build || Object.keys(pkg.settings).length) {
      const { outputs } = await build({
        ...options,
        packageDefinition: pkg,
        provider,
        overrideResolver: resolver,
        presetArg: selectedPreset,
        upgradeFrom: options.upgradeFrom,
        persist: false,
      });

      buildOutputs.push({ pkg, outputs });
    } else {
      // just get outputs
      const deployData = await basicRuntime.readDeploy(`${pkg.name}:${pkg.version}`, selectedPreset, basicRuntime.chainId);

      if (!deployData) {
        throw new Error(
          `deployment not found: ${name}:${version}. please make sure it exists for the ${selectedPreset} preset and network ${basicRuntime.chainId}`
        );
      }

      const outputs = await getOutputs(basicRuntime, new ChainDefinition(deployData.def), deployData.state);

      if (!outputs) {
        throw new Error(
          `no cannon build found for chain ${basicRuntime.chainId}/${selectedPreset}. Did you mean to run instead?`
        );
      }

      buildOutputs.push({ pkg, outputs });
    }

    console.log(
      chalk.greenBright(
        `${chalk.bold(`${name}:${version}`)} has been deployed to a local node running at ${chalk.bold(
          'localhost:' + node.port
        )}`
      )
    );

    if (node.forkProvider) {
      console.log(chalk.gray('Running from fork provider'));
    }
  }

  if (!signers.length) {
    console.warn(
      chalk.yellow(
        '\nWARNING: no signers resolved. Specify signers with --mnemonic or --private-key (or use --impersonate if on a fork).'
      )
    );
  }

  if (options.logs) {
    return {
      signers,
      outputs: buildOutputs,
      provider,
      node,
    };
  }

  const mergedOutputs =
    buildOutputs.length == 1
      ? buildOutputs[0].outputs
      : ({
          imports: _.fromPairs(_.entries(_.map(buildOutputs, 'outputs'))),
        } as ChainArtifacts);

  let traceLevel = 0;

  async function debugTracing(blockNumber: number) {
    if (traceLevel == 0) {
      return;
    }
    const bwt = await provider.getBlockWithTransactions(blockNumber);

    for (const txn of bwt.transactions) {
      try {
        const traces = await provider.send('trace_transaction', [txn.hash]);

        let renderedTrace = renderTrace(mergedOutputs, traces);

        if (traceLevel === 1) {
          // only show lines containing `console.log`s, and prettify
          renderedTrace = renderedTrace
            .split('\n')
            .filter((l) => l.includes('console.log('))
            .map((l) => l.trim())
            .join('\n');
        }

        if (renderedTrace) {
          console.log(`trace: ${txn.hash}`);
          console.log(renderedTrace);
          console.log();
        }
      } catch (err) {
        console.log('could not render trace for transaction:', err);
      }
    }
  }

  provider.on('block', debugTracing);

  console.log();

  console.log(INITIAL_INSTRUCTIONS);
  console.log(INSTRUCTIONS);

  await onKeypress(async (evt, { pause, stop }) => {
    if (evt.ctrl && evt.name === 'c') {
      stop();
      process.exit();
    } else if (evt.name === 'a') {
      // Toggle showAnvilLogs when the user presses "a"
      if (nodeLogging.enabled()) {
        console.log(chalk.gray('Paused anvil logs...'));
        console.log(INSTRUCTIONS);
        nodeLogging.disable();
      } else {
        console.log(chalk.gray('Unpaused anvil logs...'));
        nodeLogging.enable();
      }
    } else if (evt.name === 'i') {
      if (nodeLogging.enabled()) return;

      await pause(async () => {
        const [signer] = signers;

        const contracts = buildOutputs.map((info) => getContractsRecursive(info.outputs, signer));

        await interact({
          packages,
          packagesArtifacts: buildOutputs.map((info) => info.outputs),
          contracts,
          signer,
          provider,
        });
      });

      console.log(INITIAL_INSTRUCTIONS);
      console.log(INSTRUCTIONS);
    } else if (evt.name == 'v') {
      // Toggle showAnvilLogs when the user presses "a"
      if (traceLevel === 0) {
        traceLevel = 1;
        console.log(chalk.gray('Enabled display of console.log events from transactions...'));
      } else if (traceLevel === 1) {
        traceLevel = 2;
        console.log(chalk.gray('Enabled display of full transaction logs...'));
      } else {
        traceLevel = 0;
        console.log(chalk.gray('Disabled transaction tracing...'));
      }
    } else if (evt.name === 'h') {
      if (nodeLogging.enabled()) return;

      if (options.helpInformation) console.log('\n' + options.helpInformation);
      console.log();
      console.log(INSTRUCTIONS);
    }
  });
}

async function createLoggingInterface(node: CannonRpcNode) {
  let enabled = false;
  let outputBuffer = '';
  node.stdout!.on('data', (rawChunk) => {
    const chunk = rawChunk.toString('utf8');
    const newData = chunk
      .split('\n')
      .map((m: string) => {
        return chalk.gray('anvil: ') + m;
      })
      .join('\n');

    if (enabled) {
      console.log(newData);
    } else {
      outputBuffer += '\n' + newData;
    }
  });

  const logging = {
    enabled: () => enabled,

    enable: () => {
      if (outputBuffer) {
        console.log(outputBuffer);
        outputBuffer = '';
      }

      enabled = true;
    },

    disable: () => {
      enabled = false;
    },
  };

  return logging;
}
