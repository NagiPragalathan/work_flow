/**
 * Web3 Node Definitions — the on-chain building blocks that make this
 * "n8n for Web3". Backed by viem in the server execution engine.
 */
import { createNode } from '../base/nodeFactory';
import { textProperty, selectProperty, jsonProperty, valueProperty } from '../base/commonProperties';

const CHAIN_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum Mainnet' },
  { value: 'sepolia', label: 'Ethereum Sepolia (testnet)' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'base', label: 'Base' },
  { value: 'base-sepolia', label: 'Base Sepolia (testnet)' },
  { value: 'arbitrum', label: 'Arbitrum One' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'bsc', label: 'BNB Smart Chain' },
  { value: 'avalanche', label: 'Avalanche C-Chain' },
];

const chainProperty = (def = 'ethereum') => selectProperty('Chain', def, CHAIN_OPTIONS, true);
const rpcProperty = () => textProperty('Custom RPC URL (optional)', false, 'https://...');
const privateKeyProperty = () => ({
  type: 'password',
  label: 'Private Key',
  default: '',
  placeholder: '0x... (kept server-side; use a dedicated hot wallet)',
  description: 'Private key used to sign transactions. Prefer connecting a Wallet node or storing it as a credential.',
});

const COLOR = '#f59e0b'; // amber — distinct "web3" family color

// Signer nodes accept an optional Wallet config input + a main flow input.
const signerInputs = [
  { name: 'main', type: 'main', required: false, displayName: 'Input' },
  { name: 'wallet', type: 'ai', required: false, displayName: 'Wallet', maxConnections: 1 },
];
const mainOut = [{ name: 'main', type: 'main', displayName: 'Output' }];

export const web3Nodes = {
  'web3-wallet': createNode({
    name: 'Wallet',
    category: 'Web3',
    color: COLOR,
    icon: 'FiKey',
    description: 'Configure a signing wallet (private key) for downstream on-chain actions',
    nodeType: 'web3-config',
    inputs: [],
    outputs: [{ name: 'main', type: 'ai', displayName: 'Wallet' }],
    properties: {
      chain: chainProperty(),
      privateKey: privateKeyProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-get-balance': createNode({
    name: 'Get Balance',
    category: 'Web3',
    color: COLOR,
    icon: 'FiDollarSign',
    description: 'Read the native token balance of an address',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      address: textProperty('Address', true, '0x...'),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-read-contract': createNode({
    name: 'Read Contract',
    category: 'Web3',
    color: COLOR,
    icon: 'FiBox',
    description: 'Call a read-only (view/pure) function on a smart contract',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      contractAddress: textProperty('Contract Address', true, '0x...'),
      abi: jsonProperty('ABI', '[]'),
      functionName: textProperty('Function Name', true, 'balanceOf'),
      args: jsonProperty('Arguments (JSON array)', '[]'),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-write-contract': createNode({
    name: 'Write Contract',
    category: 'Web3',
    color: COLOR,
    icon: 'FiEdit3',
    description: 'Send a state-changing transaction to a smart contract function',
    inputs: signerInputs,
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      contractAddress: textProperty('Contract Address', true, '0x...'),
      abi: jsonProperty('ABI', '[]'),
      functionName: textProperty('Function Name', true, 'mint'),
      args: jsonProperty('Arguments (JSON array)', '[]'),
      value: textProperty('Native Value (ETH, optional)', false, '0'),
      privateKey: privateKeyProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-send-transaction': createNode({
    name: 'Send Transaction',
    category: 'Web3',
    color: COLOR,
    icon: 'FiSend',
    description: 'Send native currency (ETH/MATIC/etc.) to an address',
    inputs: signerInputs,
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      to: textProperty('To Address', true, '0x...'),
      value: textProperty('Amount (in native units)', true, '0.01'),
      privateKey: privateKeyProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-erc20-transfer': createNode({
    name: 'ERC-20 Transfer',
    category: 'Web3',
    color: COLOR,
    icon: 'FiDollarSign',
    description: 'Transfer an ERC-20 token to an address',
    inputs: signerInputs,
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      token: textProperty('Token Contract Address', true, '0x...'),
      to: textProperty('To Address', true, '0x...'),
      amount: textProperty('Amount (token units)', true, '1.0'),
      privateKey: privateKeyProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-ens': createNode({
    name: 'ENS Resolver',
    category: 'Web3',
    color: COLOR,
    icon: 'FiLink',
    description: 'Resolve an ENS name to an address, or reverse-resolve an address',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      name: textProperty('ENS Name', false, 'vitalik.eth'),
      address: textProperty('Address (for reverse)', false, '0x...'),
    },
  }),

  'web3-sign-message': createNode({
    name: 'Sign Message',
    category: 'Web3',
    color: COLOR,
    icon: 'FiFeather',
    description: 'Sign an arbitrary message with the wallet private key',
    inputs: signerInputs,
    outputs: mainOut,
    properties: {
      message: textProperty('Message', false, 'Message to sign'),
      privateKey: privateKeyProperty(),
    },
  }),

  'web3-event-trigger': createNode({
    name: 'On-chain Event',
    category: 'Web3',
    color: COLOR,
    icon: 'FiZap',
    description: 'Trigger / fetch recent logs for a smart contract event',
    nodeType: 'trigger',
    inputs: [],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      contractAddress: textProperty('Contract Address', true, '0x...'),
      abi: jsonProperty('ABI', '[]'),
      eventName: textProperty('Event Name', false, 'Transfer'),
      blockRange: valueProperty(1000, 1, 100000, 'Block Range', 'How many recent blocks to scan'),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-token-balance': createNode({
    name: 'ERC-20 Balance',
    category: 'Web3',
    color: COLOR,
    icon: 'FiDollarSign',
    description: 'Read an ERC-20 token balance (with symbol & decimals)',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      token: textProperty('Token Contract Address', true, '0x...'),
      address: textProperty('Holder Address', true, '0x...'),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-gas-price': createNode({
    name: 'Gas Price',
    category: 'Web3',
    color: COLOR,
    icon: 'FiActivity',
    description: 'Get the current network gas price (gwei)',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-get-block': createNode({
    name: 'Get Block',
    category: 'Web3',
    color: COLOR,
    icon: 'FiBox',
    description: 'Fetch the latest block (number, hash, timestamp, gas used)',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-tx-status': createNode({
    name: 'Transaction Status',
    category: 'Web3',
    color: COLOR,
    icon: 'FiActivity',
    description: 'Get a transaction receipt / wait for confirmation',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      txHash: textProperty('Transaction Hash', false, '0x...'),
      waitForReceipt: { type: 'boolean', label: 'Wait for confirmation', default: true },
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-nft-transfer': createNode({
    name: 'NFT Transfer (ERC-721)',
    category: 'Web3',
    color: COLOR,
    icon: 'FiSend',
    description: 'Transfer an ERC-721 NFT to another address',
    inputs: signerInputs,
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      contractAddress: textProperty('NFT Contract Address', true, '0x...'),
      to: textProperty('To Address', true, '0x...'),
      tokenId: textProperty('Token ID', true, '1'),
      privateKey: privateKeyProperty(),
      rpcUrl: rpcProperty(),
    },
  }),

  'web3-chainlink-price': createNode({
    name: 'Chainlink Price Feed',
    category: 'Web3',
    color: COLOR,
    icon: 'FiTrendingUp',
    description: 'Read an asset price from a Chainlink price feed',
    inputs: [{ name: 'main', type: 'main', required: false, displayName: 'Input' }],
    outputs: mainOut,
    properties: {
      chain: chainProperty(),
      feedAddress: textProperty('Feed Address', true, '0x... (e.g. ETH/USD)'),
      rpcUrl: rpcProperty(),
    },
  }),
};
