import { PackageSpecification } from '@usecannon/cli';
import { task } from 'hardhat/config';
import { SUBTASK_LOAD_PACKAGE_DEFINITION, TASK_TYPECHAIN } from '../task-names';

task(TASK_TYPECHAIN, 'Generate Typescript types for the given image using typechain')
  .addPositionalParam('packageName', 'Name and version of the cannon package to inspect')
  .addOptionalParam('chainId', 'Chain ID of the cannon package')
  .addOptionalParam('preset', 'Preset of the cannon package')
  .setAction(async ({ packageName, chainId, preset }, hre) => {
    const packageSpec: PackageSpecification = await hre.run(SUBTASK_LOAD_PACKAGE_DEFINITION, {
      packageWithSettingsParams: packageName ? [packageName] : [],
    });

    if (!chainId) {
      chainId = hre.network.config.chainId || 13370;
    }
  });
