import {
    CANNON_CHAIN_ID,
    CannonWrapperGenericProvider,
    ChainBuilder,
    downloadPackagesRecursive,
    Events,
    ContractArtifact,
    CannonRegistry,
  } from '@usecannon/builder';
  import { ethers } from 'ethers';
  import { findPackage, loadCannonfile } from '../helpers';
  import { PackageDefinition } from '../types';
  import { printChainBuilderOutput } from '../util/printer';
  import { getProvider, runRpc } from '../rpc';
  import { ChainDefinition } from '@usecannon/builder';
  import fs from 'fs';
  import { red } from 'chalk';
  
  interface PlanOptions {
    packageDefinition: PackageDefinition;
    cannonDirectory: string;
    projectDirectory?: string;
  
    getArtifact?: (name: string) => Promise<ContractArtifact>;
  
    overrideCannonfilePath?: string;
  
    provider: ethers.providers.Provider;
    defaultSigner: string;
  
    preset: string;

    registry: CannonRegistry
  }
  
  export async function plan(options: PlanOptions) {
    let def: ChainDefinition;
    if (options.overrideCannonfilePath) {
      const { def: overrideDef, name, version } = loadCannonfile(options.overrideCannonfilePath);
  
      if (name !== options.packageDefinition.name || version !== options.packageDefinition.version) {
        throw new Error('supplied cannonfile manifest does not match requseted packageDefinitionDeployment');
      }
  
      def = overrideDef;
    } else {
      def = new ChainDefinition(
        findPackage(options.cannonDirectory, options.packageDefinition.name, options.packageDefinition.version).def
      );
    }
  
    const { chainId } = await options.provider.getNetwork();
    let cannonProvider = new CannonWrapperGenericProvider({}, options.provider);
    
    // set up cannon anvil network
    const connection = (options.provider as ethers.providers.JsonRpcProvider).connection;
    if (connection) {
      const node = await runRpc({
        port: 8545,
        forkUrl: connection.url,
        chainId,
      });

      const anvilProvider = await getProvider(node);

      cannonProvider = new CannonWrapperGenericProvider({}, anvilProvider);
    } else {
      throw new Error('cannot fork supplied non-jsonrpc network (are you sure you need to dry-run?)');
    }
  
    // setup signers

    const getSigner = async (addr: string) => {
      // on test network any user can be conjured
      await cannonProvider.send('hardhat_impersonateAccount', [addr]);
      await cannonProvider.send('hardhat_setBalance', [addr, `0x${(1e22).toString(16)}`]);
      return cannonProvider.getSigner(addr);
    };

    const getDefaultSigner = () => getSigner(options.defaultSigner);
  
    const builder = new ChainBuilder({
      name: options.packageDefinition.name,
      version: options.packageDefinition.version,
      def,
      preset: options.preset,
  
      readMode: 'none',
      writeMode: 'metadata',
  
      provider: cannonProvider,
      chainId,
      baseDir: options.projectDirectory,
      savedPackagesDir: options.cannonDirectory,
      getSigner,
      getDefaultSigner,
      getArtifact: options.getArtifact,
    });
  
    try {
      await fs.promises.access(`${builder.packageDir}/${CANNON_CHAIN_ID}-main`);
    } catch (error) {
      console.log(red('You must build this package before planning a deployment to a remote network.'));
      process.exit();
    }
  
    const dependencies = await builder.def.getRequiredImports(
      await builder.populateSettings(options.packageDefinition.settings)
    );
  
    for (const dependency of dependencies) {
      console.log(`Loading dependency tree ${dependency.source} (${dependency.chainId}-${dependency.preset})`);
      await downloadPackagesRecursive(
        dependency.source,
        dependency.chainId,
        dependency.preset,
        options.registry,
        builder.provider,
        builder.packagesDir
      );
    }
  
    builder.on(Events.PreStepExecute, (t, n) => console.log(`\nexec: ${t}.${n}`));
    builder.on(Events.DeployContract, (n, c) => console.log(`deployed contract ${n} (${c.address})`));
    builder.on(Events.DeployTxn, (n, t) => console.log(`ran txn ${n} (${t.hash})`));
    builder.on(Events.DeployExtra, (n, v) => console.log(`extra data ${n} (${v})`));
  
    const outputs = await builder.build(options.packageDefinition.settings);
  
    printChainBuilderOutput(outputs);
  
    cannonProvider.artifacts = outputs;
  
    return { outputs, provider: cannonProvider };
  }
  