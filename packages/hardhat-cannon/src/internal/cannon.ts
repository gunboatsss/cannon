import path from 'node:path';
import { ChainBuilderContext } from '@usecannon/builder';
import { build, getProvider, loadCannonfile, PackageSettings } from '@usecannon/cli';
import { ethers } from 'ethers';
import { SUBTASK_GET_ARTIFACT } from '../task-names';
import { getHardhatSigners } from './get-hardhat-signers';
import { loadPackageJson } from './load-pkg-json';

import type { BuildOutputs } from '../types';
import type { CannonRpcNode } from '@usecannon/cli/src/rpc';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

interface BuildOptions {
  hre: HardhatRuntimeEnvironment;
  node: CannonRpcNode;
  cannonfile: string;
  preset: string;
  settings: PackageSettings;
  registryPriority?: 'local' | 'onchain';
}

export async function cannonBuild(options: BuildOptions) {
  const { hre } = options;
  const provider = getProvider(options.node);
  const signers = getHardhatSigners(options.hre, provider);

  const getSigner = async (address: string) => {
    const addr = ethers.utils.getAddress(address);
    for (const signer of signers) {
      if (addr === (await signer.getAddress())) {
        return signer.connect(provider);
      }
    }

    throw new Error(`Signer for address "${address}" not found`);
  };

  const { name, version, def } = await loadCannonfile(path.join(hre.config.paths.root, options.cannonfile));

  const { outputs } = await build({
    provider,
    def,
    packageDefinition: {
      name,
      version,
      settings: options.settings,
    },
    getArtifact: async (contractName: string) => await hre.run(SUBTASK_GET_ARTIFACT, { name: contractName }),
    getSigner,
    getDefaultSigner: async () => signers[0],
    presetArg: options.preset,
    pkgInfo: loadPackageJson(path.join(hre.config.paths.root, 'package.json')),
    projectDirectory: hre.config.paths.root,
    registryPriority: options.registryPriority,
    publicSourceCode: false,
  });

  return { outputs };
}

export function getContractDataFromOutputs(contractName: string, outputs: BuildOutputs) {
  let contract;

  if (contractName.includes('.')) {
    const nestedContracts = contractName.split('.');

    // this logic handles deeply nested imports such as synthetix.oracle_manager.Proxy
    // which is really outputs.imports.synthetix.imports.oracle_manager.contracts.Proxy

    let imports: ChainBuilderContext['imports'] | undefined = outputs.imports;

    for (const c of nestedContracts.slice(0, -2)) {
      if (!imports![c]) {
        throw new Error(`cannonfile does not includes an import named "${c}"`);
      } else {
        imports = imports![c].imports;
      }
    }

    contract = imports![nestedContracts[nestedContracts.length - 2]].contracts![nestedContracts[nestedContracts.length - 1]];
  } else {
    contract = outputs.contracts?.[contractName];
  }

  if (!contract) {
    throw new Error(`Contract "${contractName}" not found on cannon build`);
  }

  return contract;
}
