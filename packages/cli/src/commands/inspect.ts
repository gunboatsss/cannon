import { ContractData, ChainArtifacts, ChainDefinition, DeploymentState } from '@usecannon/builder';
import chalk from 'chalk';
import { PackageReference } from '@usecannon/builder/dist/package.js';
import { createDefaultReadRegistry } from '../registry.js';
import { resolveCliSettings } from '../settings.js';
import fse from 'fs-extra/esm';
import path from 'path';
import { getMainLoader } from '../loader.js';

export async function inspect(
  packageRef: string,
  chainId: number,
  presetArg: string,
  json: boolean,
  writeDeployments: string
) {
  const { name, version, preset } = new PackageReference(packageRef);

  if (presetArg && preset) {
    console.warn(
      chalk.yellow(
        chalk.bold(
          `Duplicate preset definitions in package reference "${packageRef}" and in --preset argument: "${presetArg}"`
        )
      )
    );
    console.warn(
      chalk.yellow(chalk.bold(`The --preset option is deprecated. Defaulting to package reference "${preset}"...`))
    );
  }

  const selectedPreset = preset || presetArg || 'main';

  const resolver = await createDefaultReadRegistry(resolveCliSettings());

  const loader = getMainLoader(resolveCliSettings());

  const deployUrl = await resolver.getUrl(`${name}:${version}`, `${chainId}-${selectedPreset}`);

  if (!deployUrl) {
    throw new Error(
      `deployment not found: ${`${name}:${version}`}. please make sure it exists for the variant ${chainId}-${selectedPreset}.`
    );
  }

  if (!chainId) {
    console.warn(
      chalk.yellow(
        "The deployment data for the latest local version of this package (which runs with 'cannon PACKAGE_NAME') was exported. \
      Specify the --chain-id parameter to retrieve the addresses/ABIs for other deployments."
      )
    );
  }

  const deployData = await loader[deployUrl.split(':')[0] as 'ipfs' | 'file'].read(deployUrl);

  if (!deployData) {
    throw new Error(`deployment data could not be downloaded for ${deployUrl} from ${`${name}:${version}`}.`);
  }

  const chainDefinition = new ChainDefinition(deployData.def);

  if (writeDeployments) {
    const stateContracts = _getNestedStateContracts(deployData.state, writeDeployments);
    const files = Array.from(stateContracts.entries());

    await Promise.all(
      files.map(([filepath, contractData]) => {
        return fse.outputFile(filepath, JSON.stringify(contractData, null, 2));
      })
    );
  }

  if (json) {
    // use process.stdout.write and write in chunks because bash piping seems to have some sort of
    // a problem with outputting huge amounts of data all at once while using pipes
    const toOutput = JSON.stringify(deployData, null, 2);

    const chunkSize = 16;
    for (let i = 0; i < toOutput.length; i += chunkSize) {
      process.stdout.write(toOutput.slice(i, i + chunkSize));
    }
  } else {
    const metaUrl = await resolver.getMetaUrl(`${name}:${version}`, `${chainId}-${selectedPreset}`);

    console.log(chalk.green(chalk.bold(`\n=============== ${name}:${version} ===============`)));
    console.log();
    console.log(
      '   Deploy Status:',
      deployData.status === 'partial'
        ? chalk.yellow(chalk.bold(deployData.status))
        : chalk.green(deployData.status || 'complete')
    );
    console.log(
      '         Options:',
      Object.entries(deployData.options)
        .map((o) => `${o[0]}=${o[1]}`)
        .join(' ') || '(none)'
    );
    console.log('     Package URL:', deployUrl);
    console.log('        Misc URL:', deployData.miscUrl);
    console.log('Package Info URL:', metaUrl);
    console.log();
    console.log(chalk.cyan(chalk.bold('Cannonfile Topology')));
    console.log(chalk.cyan(chainDefinition.printTopology().join('\n')));
  }

  return deployData;
}

function _getNestedStateContracts(state: DeploymentState, pathname = '', result = new Map<string, ContractData>()) {
  for (const { artifacts } of Object.values(state)) {
    _getNestedStateFiles(artifacts, pathname, result);
  }

  return result;
}

function _getNestedStateFiles(artifacts: ChainArtifacts, pathname: string, result: Map<string, ContractData>) {
  if (artifacts.contracts) {
    for (const [contractName, contractData] of Object.entries(artifacts.contracts)) {
      const filepath = path.join(pathname, `${contractName}.json`);
      result.set(filepath, contractData);
    }
  }

  if (artifacts.imports) {
    for (const [importName, importArtifacts] of Object.entries(artifacts.imports)) {
      _getNestedStateFiles(importArtifacts, path.join(pathname, importName), result);
    }
  }

  return result;
}
