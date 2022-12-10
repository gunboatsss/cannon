import _ from 'lodash';
import Debug from 'debug';
import { JTDDataType } from 'ajv/dist/core';

import { importFrom } from '../helpers/import-from';
import { ChainBuilderContext, ChainBuilderRuntime, ChainArtifacts } from '../types';
import { hashFs, hashObj } from '../util';
import { getCachedStep, putCachedStep } from '../storage';

const debug = Debug('cannon:builder:run');

const config = {
  properties: {
    exec: { type: 'string' },
    func: { type: 'string' },
    modified: { elements: { type: 'string' } },
  },
  optionalProperties: {
    args: { elements: { type: 'string' } },
    env: { elements: { type: 'string' } },
    depends: { elements: { type: 'string' } },
  },
} as const;

export type Config = JTDDataType<typeof config>;

// ensure the specified contract is already deployed
// if not deployed, deploy the specified hardhat contract with specfied options, export address, abi, etc.
// if already deployed, reexport deployment options for usage downstream and exit with no changes
export default {
  validate: config,

  async getState(runtime: ChainBuilderRuntime, ctx: ChainBuilderContext, config: Config) {
    if (!runtime.baseDir) {
      return null; // skip consistency check
      // todo: might want to do consistency check for config but not files, will see
    }

    const newConfig = this.configInject(ctx, config);

    const auxHashes = newConfig.modified.map((pathToScan) => {
      try {
        return hashFs(pathToScan).toString('hex');
      } catch (err) {
        if ((err as any).code === 'ENOENT') {
          console.warn(`warning: could not check modified file at path '${pathToScan}'. this may be an error.`);
          return 'notfound';
        } else {
          throw err;
        }
      }
    });

    // also hash the executed file itself
    auxHashes.push(newConfig.exec);

    return {
      auxHashes,
      config: newConfig,
    };
  },

  configInject(ctx: ChainBuilderContext, config: Config) {
    config = _.cloneDeep(config);

    config.exec = _.template(config.exec)(ctx);

    config.modified = _.map(config.modified, (v) => {
      return _.template(v)(ctx);
    });

    if (config.args) {
      config.args = _.map(config.args, (v) => {
        // just convert it to a JSON string when. This will allow parsing of complicated nested structures
        return JSON.parse(JSON.stringify(_.template(v)(ctx)));
      });
    }

    if (config.env) {
      config.env = _.map(config.env, (v) => {
        return _.template(v)(ctx);
      });
    }

    return config;
  },

  async exec(runtime: ChainBuilderRuntime, ctx: ChainBuilderContext, config: Config): Promise<ChainArtifacts> {
    debug('exec', config);

    const stateHash = hashObj(config).toString('hex');

    debug(`run step state hash: ${stateHash}`);

    const cachedStep = await getCachedStep(runtime.packageDir!, stateHash);
    if (cachedStep) {
      debug(`loaded ${cachedStep.txns.length} cached transactions`);

      for (const txn of cachedStep.txns) {
        await (await runtime.getSigner(txn.from!)).sendTransaction(txn);
      }

      return cachedStep.output;
    }

    if (!runtime.baseDir) {
      throw new Error(
        'run steps cannot be executed outside of their original project directory. This is likely a misconfiguration upstream.'
      );
    }

    const runfile = await importFrom(runtime.baseDir, config.exec);

    runtime.provider.resetRecordedTransactions();
    const outputs = (await runfile[config.func](runtime, ...(config.args || []))) as Omit<ChainArtifacts, 'deployedOn'>;


    if (!_.isObject(outputs)) {
      throw new Error(
        'deployed contracts/txns not returned from script. Please supply any deployed contract in contracts property of returned json. If no contracts were deployed or transactions were run, return an empty object.'
      );
    }

    outputs.contracts = _.mapValues(outputs.contracts, (c) => ({
      ...c,
      deployedOn: runtime.currentLabel!,
    }));

    outputs.txns = _.mapValues(outputs.txns, (t) => ({
      ...t,
      deployedOn: runtime.currentLabel!,
    }));

    const txns = runtime.provider.resetRecordedTransactions();
    debug(`captured ${txns.length} transactions from run step. caching.`)
    await putCachedStep(runtime.packageDir!, stateHash, 
    {
      txns,
      output: outputs
    });

    return outputs;
  },
};
