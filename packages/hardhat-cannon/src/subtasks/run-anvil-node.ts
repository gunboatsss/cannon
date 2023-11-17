import { runRpc } from '@usecannon/cli';
import { subtask } from 'hardhat/config';
import { SUBTASK_RUN_ANVIL_NODE } from '../task-names';

import type { CannonRpcNode, RpcOptions } from '@usecannon/cli/src/rpc';
import type { AnvilOptions } from '@usecannon/cli/src/util/anvil';
import type { HttpNetworkConfig } from 'hardhat/types';

export type SubtaskRunAnvilNodeResult = CannonRpcNode | undefined;

subtask(SUBTASK_RUN_ANVIL_NODE).setAction(async ({ dryRun, anvilOptions }, hre): Promise<SubtaskRunAnvilNodeResult> => {
  if (hre.network.name === 'hardhat') return;
  if (!dryRun && hre.network.name !== 'cannon') return;

  const nodeOptions: AnvilOptions = {
    port: hre.config.networks.cannon.port,
    ...(anvilOptions || {}),
  };

  const rpcOptions: RpcOptions = {};

  if (dryRun && !['hardhat', 'cannon'].includes(hre.network.name)) {
    if (!nodeOptions.chainId) {
      nodeOptions.chainId = (await hre.ethers.provider.getNetwork()).chainId;
    }

    const providerUrl = (hre.network.config as HttpNetworkConfig).url;
    rpcOptions.forkProvider = new hre.ethers.providers.JsonRpcProvider(providerUrl);
  }

  return runRpc(nodeOptions, rpcOptions);
});
