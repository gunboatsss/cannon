import Debug from 'debug';
import { BundledOutput, DeploymentInfo, StepState } from './types';
import { ChainDefinition } from './definition';
import { createInitialContext } from './builder';
import { CannonStorage } from './runtime';
const debug = Debug('cannon:cli:publish');

export type CopyPackageOpts = {
  packageRef: string;
  variant: string;
  tags: string[];
  fromStorage: CannonStorage;
  toStorage: CannonStorage;
  recursive?: boolean;
};

/**
 * Iterate Depth-First-Search over the given DeploymentInfo and its dependencies, and execute the given `action` function. Postfix execution (aka, `action` is only executed after dependants are completed).
 * Each package executes one at a time. No paralellization.
 * @param loader The loader to use for downloading sub-packages
 * @param deployInfo The head node of the tree, which will be executed on `action` last
 * @param action The action to execute
 * @param onlyProvisioned Skip over sub-packages which are not provisioned within the parent
 */
export async function forPackageTree<T>(
  store: CannonStorage,
  deployInfo: DeploymentInfo,
  action: (deployInfo: DeploymentInfo, context: BundledOutput | null) => Promise<T>,
  context?: BundledOutput | null,
  onlyProvisioned = true
): Promise<T[]> {
  const results: T[] = [];

  const deployments = await readDeployRecursive(store, deployInfo, onlyProvisioned);

  for (const [nestedOutput, nestedDeployInfo] of deployments) {
    const result = await forPackageTree(store, nestedDeployInfo, action, nestedOutput, onlyProvisioned);
    results.push(...result);
  }

  results.push(await action(deployInfo, context || null));

  return results;
}

/**
 * Get the imported/provisioned dependencies from the given deployment, ordered Depth-First-Search.
 * @param loader The loader to use for downloading sub-packages
 * @param deployInfo The head node of the tree, which will be executed on `action` last
 * @param onlyProvisioned Skip over sub-packages which are not provisioned within the parent
 */
export async function readDeployRecursive(store: CannonStorage, deployInfo: DeploymentInfo, onlyProvisioned = true) {
  const result = new Map<string, [BundledOutput, DeploymentInfo]>();

  const _readImports = async (deployInfo: DeploymentInfo) => {
    const bundledOutputs = _getImports(deployInfo);

    // Recursively get the imports of the loaded deployments, in Depth-First-Search order
    // TODO: parallelize the requests, we are doing it like this to be able to keep the tree order.
    for (const output of bundledOutputs) {
      // Check that the dependency is not already loaded to avoid download loops.
      if (result.has(output.url)) continue;
      if (onlyProvisioned && !output.tags) continue;

      const misc = (await store.readBlob(output.url)) as DeploymentInfo;
      if (!misc) throw new Error(`deployment not found: ${output.url}`);

      await _readImports(misc);
      result.set(output.url, [output, misc]);
    }
  };

  await _readImports(deployInfo);

  return Array.from(result.values());
}

// Get the urls of the imported packages
function _getImports(deployInfo: DeploymentInfo) {
  if (!deployInfo.state) return [];
  return Object.values(deployInfo.state).flatMap((state) => Object.values(state.artifacts.imports || {}));
}

export async function copyPackage({ packageRef, tags, variant, fromStorage, toStorage, recursive }: CopyPackageOpts) {
  debug(`copy package ${packageRef} (${fromStorage.registry.getLabel()} -> ${toStorage.registry.getLabel()})`);

  const chainId = parseInt(variant.split('-')[0]);

  // this internal function will copy one package's ipfs records and return a publish call, without recursing
  const copyIpfs = async (deployInfo: DeploymentInfo, context: BundledOutput | null) => {
    console.log('COPY IPFS', deployInfo.def.name);
    const newMiscUrl = await toStorage.putBlob(await fromStorage.readBlob(deployInfo!.miscUrl));

    const metaUrl = await fromStorage.registry.getMetaUrl(packageRef, variant);
    let newMetaUrl = metaUrl;

    if (metaUrl) {
      newMetaUrl = await toStorage.putBlob(await fromStorage.readBlob(metaUrl));

      if (!newMetaUrl) {
        throw new Error('error while writing new misc blob');
      }
    }

    deployInfo.miscUrl = newMiscUrl || '';

    const url = await toStorage.putBlob(deployInfo!);

    if (!url) {
      throw new Error('uploaded url is invalid');
    }

    const def = new ChainDefinition(deployInfo.def);

    const preCtx = await createInitialContext(def, deployInfo.meta, 0, deployInfo.options);

    return {
      packagesNames: [def.getVersion(preCtx), ...(context ? context.tags || [] : tags)].map(
        (t) => `${def.getName(preCtx)}:${t}`
      ),
      variant: context ? `${chainId}-${context.preset}` : variant,
      url,
      metaUrl: newMetaUrl || '',
    };
  };

  const preset = variant.substring(variant.indexOf('-') + 1);

  const deployData = await fromStorage.readDeploy(packageRef, preset, chainId);

  if (!deployData) {
    throw new Error('ipfs could not find deployment artifact. please double check your settings, and rebuild your package.');
  }

  if (recursive) {
    const calls = await forPackageTree(fromStorage, deployData, copyIpfs);
    return toStorage.registry.publishMany(calls);
  } else {
    const call = await copyIpfs(deployData, null);

    return toStorage.registry.publish(call.packagesNames, call.variant, call.url, call.metaUrl);
  }
}
