/**
 * Built-in starter workflows ("n8n for Web3").
 * Each template is an importable { name, description, nodes, edges } object —
 * loaded into the canvas via the same path as file import.
 */

// Handy constants used by the examples.
const MAINNET_RPC = 'https://ethereum-rpc.publicnode.com';
const VITALIK = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ETH_USD_FEED = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

let _id = 0;
const nid = () => `n${++_id}`;

// Node builder: n(type, label, properties, x, y)
const n = (type, label, properties, x, y) => ({
  id: nid(),
  type,
  position: { x, y },
  data: { label, type, properties: properties || {} },
});

// Edge builder
const e = (source, target, sourceHandle = 'main', targetHandle = 'main') => ({
  id: `e-${source}-${target}-${sourceHandle}-${targetHandle}`,
  source,
  target,
  sourceHandle,
  targetHandle,
});

function build(fn) {
  _id = 0; // reset ids per template so they're stable
  return fn();
}

export const workflowTemplates = [
  build(() => {
    const t = n('manual-trigger', 'Start', { message: 'Check balance' }, 80, 200);
    const b = n('web3-get-balance', 'Get Balance', { chain: 'ethereum', address: VITALIK, rpcUrl: MAINNET_RPC }, 400, 200);
    const o = n('readme-viewer', 'Reply', {}, 720, 200);
    return {
      name: 'Wallet Balance Checker',
      description: 'Read the native ETH balance of an address and report it.',
      category: 'Web3',
      icon: '💰',
      nodes: [t, b, o],
      edges: [e(t.id, b.id), e(b.id, o.id)],
    };
  }),

  build(() => {
    const t = n('manual-trigger', 'Start', {}, 80, 200);
    const b = n('web3-token-balance', 'ERC-20 Balance', { chain: 'ethereum', token: USDC, address: VITALIK, rpcUrl: MAINNET_RPC }, 400, 200);
    const o = n('readme-viewer', 'Result', {}, 720, 200);
    return {
      name: 'ERC-20 Token Balance',
      description: 'Look up an ERC-20 token balance (symbol + decimals) for a holder.',
      category: 'Web3',
      icon: '🪙',
      nodes: [t, b, o],
      edges: [e(t.id, b.id), e(b.id, o.id)],
    };
  }),

  build(() => {
    const t = n('manual-trigger', 'Start', {}, 80, 200);
    const p = n('web3-chainlink-price', 'ETH/USD Price', { chain: 'ethereum', feedAddress: ETH_USD_FEED, rpcUrl: MAINNET_RPC }, 400, 200);
    const o = n('readme-viewer', 'Reply', {}, 720, 200);
    return {
      name: 'ETH Price (Chainlink)',
      description: 'Fetch the latest ETH/USD price from a Chainlink price feed.',
      category: 'Web3',
      icon: '📈',
      nodes: [t, p, o],
      edges: [e(t.id, p.id), e(p.id, o.id)],
    };
  }),

  build(() => {
    const t = n('schedule', 'Every Hour', { interval: 'hours', value: 1 }, 80, 200);
    const g = n('web3-gas-price', 'Gas Price', { chain: 'ethereum', rpcUrl: MAINNET_RPC }, 400, 200);
    const o = n('readme-viewer', 'Report', {}, 720, 200);
    return {
      name: 'Gas Price Monitor',
      description: 'On a schedule, read the current network gas price.',
      category: 'Web3',
      icon: '⛽',
      nodes: [t, g, o],
      edges: [e(t.id, g.id), e(g.id, o.id)],
    };
  }),

  build(() => {
    const t = n('manual-trigger', 'Start', {}, 60, 120);
    const w = n('web3-wallet', 'Wallet', { chain: 'sepolia', privateKey: '' }, 60, 320);
    const s = n('web3-send-transaction', 'Send ETH', { chain: 'sepolia', to: '0x0000000000000000000000000000000000000000', value: '0.001' }, 420, 200);
    const o = n('readme-viewer', 'Confirmation', {}, 760, 200);
    return {
      name: 'Send ETH Payment',
      description: 'Send native currency using a connected wallet (testnet by default). Add your private key to the Wallet node.',
      category: 'Web3',
      icon: '💸',
      nodes: [t, w, s, o],
      edges: [e(t.id, s.id), e(w.id, s.id, 'main', 'wallet'), e(s.id, o.id)],
    };
  }),

  build(() => {
    const t = n('manual-trigger', 'Start', {}, 60, 120);
    const w = n('web3-wallet', 'Wallet', { chain: 'sepolia', privateKey: '' }, 60, 320);
    const x = n('web3-erc20-transfer', 'ERC-20 Transfer', { chain: 'sepolia', token: '0x...', to: '0x...', amount: '1.0' }, 420, 200);
    const o = n('readme-viewer', 'Receipt', {}, 760, 200);
    return {
      name: 'ERC-20 Token Transfer',
      description: 'Transfer an ERC-20 token from your wallet to a recipient.',
      category: 'Web3',
      icon: '🔁',
      nodes: [t, w, x, o],
      edges: [e(t.id, x.id), e(w.id, x.id, 'main', 'wallet'), e(x.id, o.id)],
    };
  }),

  build(() => {
    const t = n('manual-trigger', 'Start', {}, 60, 120);
    const w = n('web3-wallet', 'Wallet', { chain: 'sepolia', privateKey: '' }, 60, 320);
    const x = n('web3-nft-transfer', 'NFT Transfer', { chain: 'sepolia', contractAddress: '0x...', to: '0x...', tokenId: '1' }, 420, 200);
    const o = n('readme-viewer', 'Confirmation', {}, 760, 200);
    return {
      name: 'NFT Transfer (ERC-721)',
      description: 'Transfer an ERC-721 NFT to another wallet.',
      category: 'Web3',
      icon: '🖼️',
      nodes: [t, w, x, o],
      edges: [e(t.id, x.id), e(w.id, x.id, 'main', 'wallet'), e(x.id, o.id)],
    };
  }),

  build(() => {
    const tr = n('web3-event-trigger', 'Transfer Events', { chain: 'ethereum', contractAddress: USDC, eventName: 'Transfer', blockRange: 200, rpcUrl: MAINNET_RPC }, 60, 200);
    const m = n('groq-llama', 'Groq Llama', { model: 'llama-3.1-8b-instant', api_key: '' }, 60, 420);
    const a = n('ai-agent', 'Summarizer', { prompt: 'You analyze on-chain event logs. Summarize the recent activity in plain English with key numbers.' }, 440, 200);
    const o = n('readme-viewer', 'Summary', {}, 820, 200);
    return {
      name: 'On-chain Event → AI Summary',
      description: 'Fetch recent contract events and have an AI agent summarize them.',
      category: 'Web3 + AI',
      icon: '🧠',
      nodes: [tr, m, a, o],
      edges: [e(tr.id, a.id), e(m.id, a.id, 'main', 'chat-model'), e(a.id, o.id)],
    };
  }),

  build(() => {
    const c = n('when-chat-received', 'Chat In', { channel: 'web' }, 60, 160);
    const m = n('groq-llama', 'Groq Llama', { model: 'llama-3.1-8b-instant', api_key: '' }, 60, 380);
    const mem = n('window-buffer-memory', 'Memory', { windowSize: 20 }, 320, 420);
    const tool = n('duckduckgo-search', 'Web Search', { maxResults: 5, region: 'us-en' }, 560, 420);
    const a = n('ai-agent', 'Web3 Assistant', { prompt: 'You are a helpful Web3 assistant. Use web search when needed and answer clearly.' }, 440, 180);
    const o = n('readme-viewer', 'Reply', {}, 820, 180);
    return {
      name: 'AI Web3 Assistant (chat + tools + memory)',
      description: 'A chat assistant with conversation memory and web search, ready to answer Web3 questions.',
      category: 'Web3 + AI',
      icon: '🤖',
      nodes: [c, m, mem, tool, a, o],
      edges: [
        e(c.id, a.id),
        e(m.id, a.id, 'main', 'chat-model'),
        e(mem.id, a.id, 'main', 'memory'),
        e(tool.id, a.id, 'main', 'tools'),
        e(a.id, o.id),
      ],
    };
  }),

  build(() => {
    const t = n('webhook', 'Webhook', { path: '/onchain', method: ['POST'] }, 60, 120);
    const w = n('web3-wallet', 'Wallet', { chain: 'sepolia', privateKey: '' }, 60, 320);
    const wc = n('web3-write-contract', 'Write Contract', { chain: 'sepolia', contractAddress: '0x...', abi: '[]', functionName: 'mint', args: '[]' }, 420, 200);
    const o = n('readme-viewer', 'Tx Sent', {}, 780, 200);
    return {
      name: 'Webhook → Smart Contract Write',
      description: 'Web2 webhook triggers an on-chain transaction — the bridge from any app into Web3.',
      category: 'Web2 → Web3',
      icon: '🌉',
      nodes: [t, w, wc, o],
      edges: [e(t.id, wc.id), e(w.id, wc.id, 'main', 'wallet'), e(wc.id, o.id)],
    };
  }),
];

export default workflowTemplates;
