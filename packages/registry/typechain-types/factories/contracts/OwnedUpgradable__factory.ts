/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  OwnedUpgradable,
  OwnedUpgradableInterface,
} from "../../contracts/OwnedUpgradable";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "ImplementationIsSterile",
    type: "error",
  },
  {
    inputs: [],
    name: "NoChange",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "NotAContract",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "NotNominated",
    type: "error",
  },
  {
    inputs: [],
    name: "OwnerNoChange",
    type: "error",
  },
  {
    inputs: [],
    name: "OwnerZeroAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "UpgradeSimulationFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerNominated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "self",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newNominatedOwner",
        type: "address",
      },
    ],
    name: "nominateNewOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nominatedOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceNomination",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "simulateUpgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newImplementation",
        type: "address",
      },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611050806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c806379ba50971161005b57806379ba5097146100ed5780638da5cb5b146100f7578063aaf10f4214610115578063c7f62cda1461013357610088565b80631627540c1461008d5780633659cfe6146100a957806353a47bb7146100c5578063718fe928146100e3575b600080fd5b6100a760048036038101906100a29190610d6c565b61014f565b005b6100c360048036038101906100be9190610d6c565b610314565b005b6100cd610328565b6040516100da9190610da8565b60405180910390f35b6100eb61035b565b005b6100f5610442565b005b6100ff6105cf565b60405161010c9190610da8565b60405180910390f35b61011d610602565b60405161012a9190610da8565b60405180910390f35b61014d60048036038101906101489190610d6c565b610635565b005b6000610159610860565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161461019857610197610893565b5b60006101a261090c565b9050600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561020b576040517f12c44af200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610295576040517f45ae98d200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b828160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f906a1c6bd7e3091ea86693dd029a831c19049ce77f1dce2ce0bab1cacbabce22836040516103079190610da8565b60405180910390a1505050565b61031c610893565b6103258161093d565b50565b600061033261090c565b60010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600061036561090c565b90503373ffffffffffffffffffffffffffffffffffffffff168160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146103fb57336040517fa0e5a0d70000000000000000000000000000000000000000000000000000000081526004016103f29190610da8565b60405180910390fd5b60008160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600061044c61090c565b905060008160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146104e757336040517fa0e5a0d70000000000000000000000000000000000000000000000000000000081526004016104de9190610da8565b60405180910390fd5b7fb532073b38c83145e3e5135377a08bf9aab55bc0fd7c1179cd4fb995d2a5159c8260000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff168260405161053c929190610dc3565b60405180910390a1808260000160016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008260010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b60006105d961090c565b60000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600061060c610b7f565b60000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b600061063f610b7f565b905060018160000160146101000a81548160ff02191690831515021790555060008160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050828260000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008373ffffffffffffffffffffffffffffffffffffffff163073ffffffffffffffffffffffffffffffffffffffff16633659cfe6846040516024016107109190610da8565b604051602081830303815290604052915060e01b6020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505060405161075f9190610e66565b600060405180830381855af49150503d806000811461079a576040519150601f19603f3d011682016040523d82523d6000602084013e61079f565b606091505b5050905080158061080757508173ffffffffffffffffffffffffffffffffffffffff166107ca610b7f565b60000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b1561083e576040517fa1cfa5a800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008360000160146101000a81548160ff021916908315150217905550600080fd5b600061086a61090c565b60000160019054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b61089b610860565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461090a57336040517f8e4a23d60000000000000000000000000000000000000000000000000000000081526004016109019190610da8565b60405180910390fd5b565b60008060405160200161091e90610f00565b6040516020818303038152906040528051906020012090508091505090565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156109a4576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6109ad81610bb0565b6109ee57806040517f8a8b41ec0000000000000000000000000000000000000000000000000000000081526004016109e59190610da8565b60405180910390fd5b60006109f8610b7f565b90508060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610a84576040517fa88ee57700000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8060000160149054906101000a900460ff16158015610aa85750610aa782610bc3565b5b15610aea57816040517f15504301000000000000000000000000000000000000000000000000000000008152600401610ae19190610da8565b60405180910390fd5b818160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503073ffffffffffffffffffffffffffffffffffffffff167f5d611f318680d00598bb735d61bacf0c514c6b50e1e5ad30040a4df2b12791c783604051610b739190610da8565b60405180910390a25050565b600080604051602001610b9190610f92565b6040516020818303038152906040528051906020012090508091505090565b600080823b905060008111915050919050565b60008060003073ffffffffffffffffffffffffffffffffffffffff163073ffffffffffffffffffffffffffffffffffffffff1663c7f62cda86604051602401610c0c9190610da8565b604051602081830303815290604052915060e01b6020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610c5b9190610e66565b600060405180830381855af49150503d8060008114610c96576040519150601f19603f3d011682016040523d82523d6000602084013e610c9b565b606091505b509150915081158015610d00575063a1cfa5a860e01b604051602001610cc19190610fff565b6040516020818303038152906040528051906020012081604051602001610ce89190610e66565b60405160208183030381529060405280519060200120145b92505050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610d3982610d0e565b9050919050565b610d4981610d2e565b8114610d5457600080fd5b50565b600081359050610d6681610d40565b92915050565b600060208284031215610d8257610d81610d09565b5b6000610d9084828501610d57565b91505092915050565b610da281610d2e565b82525050565b6000602082019050610dbd6000830184610d99565b92915050565b6000604082019050610dd86000830185610d99565b610de56020830184610d99565b9392505050565b600081519050919050565b600081905092915050565b60005b83811015610e20578082015181840152602081019050610e05565b83811115610e2f576000848401525b50505050565b6000610e4082610dec565b610e4a8185610df7565b9350610e5a818560208601610e02565b80840191505092915050565b6000610e728284610e35565b915081905092915050565b600082825260208201905092915050565b7f696f2e73796e7468657469782e636f72652d636f6e7472616374732e4f776e6160008201527f626c650000000000000000000000000000000000000000000000000000000000602082015250565b6000610eea602383610e7d565b9150610ef582610e8e565b604082019050919050565b60006020820190508181036000830152610f1981610edd565b9050919050565b7f696f2e73796e7468657469782e636f72652d636f6e7472616374732e50726f7860008201527f7900000000000000000000000000000000000000000000000000000000000000602082015250565b6000610f7c602183610e7d565b9150610f8782610f20565b604082019050919050565b60006020820190508181036000830152610fab81610f6f565b9050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6000819050919050565b610ff9610ff482610fb2565b610fde565b82525050565b600061100b8284610fe8565b6004820191508190509291505056fea26469706673582212205fad9b874f509c982638d7e503ef0512890e62c4faac2cc7eeff91ae8e8e9fa064736f6c634300080b0033";

type OwnedUpgradableConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OwnedUpgradableConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OwnedUpgradable__factory extends ContractFactory {
  constructor(...args: OwnedUpgradableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<OwnedUpgradable> {
    return super.deploy(overrides || {}) as Promise<OwnedUpgradable>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): OwnedUpgradable {
    return super.attach(address) as OwnedUpgradable;
  }
  override connect(signer: Signer): OwnedUpgradable__factory {
    return super.connect(signer) as OwnedUpgradable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OwnedUpgradableInterface {
    return new utils.Interface(_abi) as OwnedUpgradableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OwnedUpgradable {
    return new Contract(address, _abi, signerOrProvider) as OwnedUpgradable;
  }
}