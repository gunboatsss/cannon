import { findTarget } from 'typechain/dist/typechain/findTarget';
import { BuildOutputs } from '../types';

import type { Config } from 'typechain';

type TypechainConfig = Omit<Config, 'filesToProcess' | 'allFiles' | 'inputDir'>;

export async function runTypeChainForOutputs(config: TypechainConfig, outputs: BuildOutputs) {
  const target = findTarget({
    ...config,
    allFiles: [],
    filesToProcess: [],
    inputDir: '',
  });

  console.log({ target });
}
