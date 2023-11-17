import { Config } from 'typechain';
import { BuildOutputs } from '../types';

type TypechainConfig = Omit<Config, 'filesToProcess' | 'allFiles' | 'inputDir'>;

export async function runTypeChainForOutputs(config: TypechainConfig, outputs: BuildOutputs) {}
