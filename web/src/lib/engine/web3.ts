/**
 * Web3 helpers (viem) shared by the Web3 node executors.
 * Turns this workflow builder into "n8n for Web3": read/write contracts,
 * transfer tokens, query chain state, react to on-chain events.
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
  type Abi,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import * as chains from "viem/chains";

/** Friendly chain aliases -> viem chain objects. */
const CHAIN_ALIASES: Record<string, Chain> = {
  ethereum: chains.mainnet,
  mainnet: chains.mainnet,
  sepolia: chains.sepolia,
  holesky: chains.holesky,
  polygon: chains.polygon,
  "polygon-amoy": chains.polygonAmoy,
  base: chains.base,
  "base-sepolia": chains.baseSepolia,
  arbitrum: chains.arbitrum,
  "arbitrum-sepolia": chains.arbitrumSepolia,
  optimism: chains.optimism,
  "optimism-sepolia": chains.optimismSepolia,
  bsc: chains.bsc,
  "bsc-testnet": chains.bscTestnet,
  avalanche: chains.avalanche,
};

export function resolveChain(name?: string): Chain {
  if (!name) return chains.mainnet;
  const key = String(name).toLowerCase().trim();
  return CHAIN_ALIASES[key] ?? chains.mainnet;
}

export function getPublicClient(chainName?: string, rpcUrl?: string): PublicClient {
  const chain = resolveChain(chainName);
  return createPublicClient({ chain, transport: http(rpcUrl || undefined) });
}

export function getAccount(privateKey: string): PrivateKeyAccount {
  const pk = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  return privateKeyToAccount(pk as `0x${string}`);
}

export function getWalletClient(
  privateKey: string,
  chainName?: string,
  rpcUrl?: string
): { wallet: WalletClient; account: PrivateKeyAccount } {
  const chain = resolveChain(chainName);
  const account = getAccount(privateKey);
  const wallet = createWalletClient({ account, chain, transport: http(rpcUrl || undefined) });
  return { wallet, account };
}

/** Parse an ABI that may arrive as a JSON string or an already-parsed array. */
export function parseAbi(raw: unknown): Abi {
  if (Array.isArray(raw)) return raw as Abi;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Abi;
    } catch {
      /* fall through */
    }
  }
  return [] as Abi;
}

/** JSON-safe conversion (BigInt -> string) for outputs. */
export function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, jsonSafe(v)])
    );
  }
  return value;
}

/** Minimal ERC-20 ABI for transfers / balances / metadata. */
export const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const satisfies Abi;

/** Minimal ERC-721 ABI for NFT transfers / ownership / metadata. */
export const ERC721_ABI = [
  {
    type: "function",
    name: "safeTransferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const satisfies Abi;

/** Chainlink AggregatorV3 price-feed ABI (latestRoundData + decimals). */
export const CHAINLINK_ABI = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const satisfies Abi;
