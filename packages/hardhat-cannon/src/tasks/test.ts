import path from 'path';

import fs from 'node:fs/promises';
import { task } from 'hardhat/config';
import { HttpNetworkConfig } from 'hardhat/types';
import { loadCannonfile, runRpc } from '@usecannon/cli';
import { TASK_TEST } from '../task-names';
import { CannonWrapperGenericProvider, ChainBuilderContext } from '@usecannon/builder';
import { getProvider } from '@usecannon/cli/dist/src/rpc';
import { glob } from 'typechain';
import { ethers } from 'ethers';
import { pickAnvilOptions } from '@usecannon/cli/dist/src/util/anvil';
import _ from 'lodash';

task(TASK_TEST, 'Utility for running hardhat tests on the cannon network')
  .addPositionalParam('cannonfile', 'test cannonfile to load, by default it will look for "cannonfile.test.toml"',
    'cannonfile.test.toml',
  )
  .addOptionalParam('port', 'Port which the test network JSON-RPC server will be exposed to', '8545')
  .addOptionalParam('buildParams', '(Optional) Parameters to use when building the cannonfile contexts')
  .addOptionalParam(
    'anvilOptions',
    '(Optional) Custom anvil options json file to configure when running on the cannon network or a local forked node'
  )
  .setAction(async ({ cannonfile, port, buildParams, anvilOptions }, hre) => {
    let outputs: ChainBuilderContext;
    let signers: ethers.Signer[];
    let provider: CannonWrapperGenericProvider;

    const networkConfig = hre.network.config as HttpNetworkConfig;

    const providerUrl = networkConfig.url;

    const anvilPort = Number.parseInt(networkConfig.url.split(':')[1]) || hre.config.networks.cannon.port;

    provider = new CannonWrapperGenericProvider({}, new ethers.providers.JsonRpcProvider(providerUrl));

    let anvilOpts;
    if (anvilOptions) {
      if ((anvilOptions as string).endsWith('.json')) {
        anvilOpts = JSON.parse(await fs.readFile(anvilOptions, 'utf8'));
      } else {
        anvilOpts = JSON.parse(anvilOptions);
      }
    }
    anvilOpts = pickAnvilOptions(anvilOpts);

    const node =
      hre.network.name === 'cannon' || hre.network.name === 'hardhat'
        ? await runRpc({ port: anvilPort, accounts: anvilOpts.accounts || 10, ...anvilOpts })
        : await runRpc(
            {
              port: anvilPort,
              chainId: (await hre.ethers.provider.getNetwork()).chainId,
              accounts: anvilOpts.accounts || 10,
              ...anvilOpts,
            },
            {
              forkProvider: new ethers.providers.JsonRpcProvider(providerUrl),
            }
          );

    provider = getProvider(node);

    const { name, version, def } = await loadCannonfile(path.join(hre.config.paths.root, cannonfile));

    const contractSteps = def.allActionNames.filter((action) => /^contract\./.test(action));

    //     before(async function prepareNode() {
    //       this.timeout(900000);

    //       const generatedPath = path.resolve(hre.config.paths.tests, 'generated');
    //       const writeDeployments = path.resolve(generatedPath, 'deployments');

    //       const cannonInfo = await hre.run('cannon:build', buildParams);

    //       // We have to manually write the deployments files instead of using the cannon:inspect
    //       // task because that task needs a local build to exist, but, we don't have it
    //       // on coverage tests because they use --network hardhat instead of --network cannon
    //       await _writeDeploymentsFromOutput(writeDeployments, cannonInfo.outputs.contracts);

    //       const allFiles = glob(hre.config.paths.root, [`${writeDeployments}/**/*.json`]);

    //       outputs = cannonInfo.outputs;
    //       provider = cannonInfo.provider as CannonWrapperGenericProvider;
    //       signers = cannonInfo.signers as ethers.Signer[];

    //       for (const signer of signers) {
    //         await provider.send('hardhat_setBalance', [await signer.getAddress(), `0x${(1e22).toString(16)}`]);
    //       }

    //       try {
    //         await provider.send('anvil_setBlockTimestampInterval', [1]);
    //       } catch (err) {
    //         console.warn('failed when setting block timestamp interval', err);
    //       }
    //     });

    //     function getSigners() {
    //       if (!Array.isArray(signers)) throw new Error('Node not initialized yet');
    //       return [...signers];
    //     }

    //     function getTestProvider() {
    //       if (!provider) throw new Error('Node not initialized yet');
    //       return provider;
    //     }

    //     function getContract<T extends keyof Contracts>(contractName: T, address?: string) {
    //       if (!outputs) throw new Error('Node not initialized yet');
    //       const contract = _getContractFromOutputs(contractName as string, outputs, provider, address);
    //       const [owner] = Array.isArray(signers) ? signers : [];
    //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //       const Contract = owner ? contract.connect(owner as unknown as any) : contract;
    //       return Contract as unknown as Contracts[T];
    //     }

    //     function createSnapshot() {
    //       let snapshotId: string;

    //       before('create snapshot', async function () {
    //         snapshotId = await provider.send('evm_snapshot', []);
    //       });

    //       return async function restoreSnapshot() {
    //         await provider.send('evm_revert', [snapshotId]);
    //         snapshotId = await provider.send('evm_snapshot', []);
    //       };
    //     }

    //     return {
    //       getContract,
    //       getSigners,
    //       getProvider,
    //       createSnapshot,
    //     };
    //   });

    // function _getContractFromOutputs(
    //   contractName: string,
    //   outputs: ChainBuilderContext,
    //   provider: ethers.providers.JsonRpcProvider,
    //   address?: string
    // ) {
    //   let contract;

    //   if (contractName.includes('.')) {
    //     const nestedContracts = contractName.split('.');

    //     // this logic handles deeply nested imports such as synthetix.oracle_manager.Proxy
    //     // which is really outputs.imports.synthetix.imports.oracle_manager.contracts.Proxy

    //     let imports: ChainBuilderContext['imports'] | undefined = outputs.imports;

    //     for (const c of nestedContracts.slice(0, -2)) {
    //       if (!imports![c]) {
    //         throw new Error(`cannonfile does not includes an import named "${c}"`);
    //       } else {
    //         imports = imports![c].imports;
    //       }
    //     }

    //     contract =
    //       imports![nestedContracts[nestedContracts.length - 2]].contracts![
    //         nestedContracts[nestedContracts.length - 1]
    //       ];
    //   } else {
    //     contract = outputs.contracts[contractName];
    //   }

    //   if (!contract) {
    //     throw new Error(`Contract "${contractName}" not found on cannon build`);
    //   }

    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   return new ethers.Contract(address || contract.address, contract.abi, provider as unknown as any);
    // }

    // async function _writeDeploymentsFromOutput(target: string, contracts: ContractMap) {
    //   await fs.mkdir(target, { recursive: true });
    //   await Promise.all(
    //     Object.entries(contracts).map(async ([contractName, contract]) =>
    //       _writeJson(target, contractName, contract)
    //     )
    //   );
    // }

    // async function _writeJson(folder: string, filename: string, data: unknown) {
    //   const filepath = path.resolve(folder, `${filename}.json`);
    //   return fs.writeFile(filepath, JSON.stringify(data, null, 2));
    // }
  });
