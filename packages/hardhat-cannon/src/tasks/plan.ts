import { task } from 'hardhat/config';
import { createRegistry, plan } from '@usecannon/cli';
import { SUBTASK_LOAD_PACKAGE_DEFINITION, TASK_PLAN } from '../task-names';
import { ethers } from 'ethers';
import { HttpNetworkConfig, HttpNetworkHDAccountsConfig } from 'hardhat/types';
import { CANNON_NETWORK_NAME } from '../constants';
import { augmentProvider } from '../internal/augment-provider';
import { CannonWrapperGenericProvider } from '@usecannon/builder';
import path from 'path';
import { getHardhatSigners } from '../internal/get-hardhat-signers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import prompts from 'prompts';

task(TASK_PLAN, 'Run a simulated deployment on the specified hardhat network with an impersonated signer. The result will be recorded.')
  .addOptionalParam(
    'overrideManifest',
    'Use a different manifest file for this network deployment. NOTE: this is not reccomended for regular use, it is simply an escape hatch'
  )
  .addOptionalVariadicPositionalParam('packageWithSettings', 'Package to deploy, optionally with custom settings')
  .addOptionalParam('preset', 'Load an alternate setting preset', 'main')
  .addOptionalParam('prefix', 'Specify a prefix to apply to the deployment artifact outputs')
  .addOptionalParam('defaultSigner', 'The signer address which should be used when not signing')
  .setAction(async (opts, hre) => {
    if (hre.network.name === CANNON_NETWORK_NAME) {
      throw new Error(`cannot plan deployment to '${CANNON_NETWORK_NAME}'. Use cannon:build instead.`);
    }

    const packageDefinition = await hre.run(SUBTASK_LOAD_PACKAGE_DEFINITION, {
      packageWithSettingsParams: opts.packageWithSettings,
    });

    if (!hre.network.config.chainId) {
      throw new Error('Selected network must have chainId set in hardhat configuration');
    }

    const signers = await hre.ethers.getSigners();

    // hardhat is kind of annoying when it comes to providers. When on `hardhat` network, they include a `connection`
    // object in the provider, but this connection leads to nowhere (it isn't actually exposed)
    // also, when using local network, it attempts to create its own proxy which similarly is not exposed through its reported connection.
    // so we have to do special handling to get the results we want here.

    let provider: ethers.providers.JsonRpcProvider;
    if (hre.network.name === 'hardhat') {
      provider = new CannonWrapperGenericProvider(
        {},
        hre.ethers.provider,
        false
      ) as unknown as ethers.providers.JsonRpcProvider;

      for (const signer of getHardhatSigners(hre)) {
        const address = await signer.getAddress();
        signers.push((await provider.getSigner(address)) as unknown as SignerWithAddress);
      }
    } else {
      provider = new ethers.providers.JsonRpcProvider((hre.network.config as HttpNetworkConfig).url);
    }

    const registry = createRegistry({
      registryAddress: hre.config.cannon.registryAddress,
      registryRpc: hre.config.cannon.registryEndpoint,
      ipfsUrl: hre.config.cannon.ipfsEndpoint,
      ipfsAuthorizationHeader: hre.config.cannon.ipfsAuthorizationHeader,
    });

    const { outputs } = await plan({
      packageDefinition,
      overrideCannonfilePath: opts.overrideManifest ? path.resolve(hre.config.paths.root, opts.overrideManifest) : undefined,

      // we have to wrap the provider here because of the third argument, prevent any reading-into for the hardhat-network
      provider,

      // it is sometimes necessary (and reasonable) to access different artifacts for subsequent network deployments. this allows for artifact pass-through
      getArtifact: (contractName: string) => hre.artifacts.readArtifact(contractName),

      defaultSigner: signers[0].address,
      preset: opts.preset,
      cannonDirectory: hre.config.paths.cannon,
      registry,
      projectDirectory: hre.config.paths.root,
    });

    augmentProvider(hre, outputs);

    return { outputs, provider, signers };
  });
