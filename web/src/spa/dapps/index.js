/**
 * dApp bundles = a polished Web3 UI + a paired workflow, auto-connected.
 *
 * When a bundle is opened from the Dashboard, its workflow is created (to get
 * an ID), that ID is injected into the UI's buttons (replacing __WF__), and the
 * UI opens in the Page Builder. Clicking a button runs the linked workflow,
 * collecting any [data-wf-field] inputs and showing the result inline.
 */

const PUBLICNODE = 'https://ethereum-rpc.publicnode.com';
const ETH_USD_FEED = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// A sane default holder so a bundle's workflow runs standalone from "Start".
// The dApp UI's typed address overrides this at run time.
const VITALIK = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

let _i = 0;
const nid = () => `n${++_i}`;
const node = (type, label, properties, x, y) => ({
  id: nid(), type, position: { x, y }, data: { label, type, properties: properties || {} },
});
const edge = (s, t, sh = 'main', th = 'main') => ({
  id: `e-${s}-${t}-${sh}-${th}`, source: s, target: t, sourceHandle: sh, targetHandle: th,
});
const reset = () => { _i = 0; };

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>*{font-family:'Inter',system-ui,sans-serif}</style>`;

const RUNTIME = `
<script src="https://cdn.tailwindcss.com"></script>
${FONT}
<script>
  window.runWorkflow = async (el) => {
    const id = el.getAttribute('data-workflow');
    if (!id || id === '__WF__') { alert('This action is not linked to a workflow yet.'); return; }
    const scope = el.closest('[data-dapp]') || document;
    const inputs = {};
    scope.querySelectorAll('[data-wf-field]').forEach((i) => { inputs[i.getAttribute('data-wf-field')] = i.value; });
    const message = el.getAttribute('data-message') || inputs.message || '';
    const resultEl = scope.querySelector('[data-wf-result]');
    const show = (t, ok) => {
      if (resultEl) { resultEl.style.display = 'block'; resultEl.textContent = t; resultEl.style.borderColor = ok === false ? '#ef4444' : ''; }
      else alert(t);
    };
    const original = el.innerHTML; el.style.opacity = '0.6'; el.disabled = true; el.innerHTML = 'Running…';
    show('⏳ Running workflow…');
    try {
      const res = await fetch('/api/trigger/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ workflow_id: id, message, inputs }),
      });
      const data = await res.json();
      let out = data.chat_response ?? data.error ?? 'Workflow finished.';
      try { const o = JSON.parse(out); out = JSON.stringify(o, null, 2); } catch (_) {}
      show(out, !data.error);
    } catch (e) { show('Error: ' + e.message, false); }
    finally { el.style.opacity = '1'; el.disabled = false; el.innerHTML = original; }
  };
  window.connectWallet = async (el) => {
    if (!window.ethereum) { alert('No Web3 wallet found. Install MetaMask.'); return; }
    try { const a = await window.ethereum.request({ method: 'eth_requestAccounts' }); el.innerHTML = a[0].slice(0,6) + '…' + a[0].slice(-4); }
    catch (e) { /* rejected */ }
  };
</script>`;

// Shared building blocks for the UIs
const shell = (inner) => `${FONT}
<div data-dapp class="min-h-screen bg-gradient-to-b from-slate-950 to-indigo-950 text-white flex items-center justify-center p-6">
  ${inner}
</div>${RUNTIME}`;

const resultBox = `<pre data-wf-result style="display:none;white-space:pre-wrap;word-break:break-word" class="mt-5 text-left text-sm bg-black/40 border border-white/15 rounded-xl p-4 text-emerald-200 font-mono"></pre>`;

const field = (label, fieldName, placeholder) => `
  <label class="block text-left text-xs font-semibold text-indigo-200 mb-1 mt-3">${label}</label>
  <input data-wf-field="${fieldName}" placeholder="${placeholder}" class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400" />`;

const runBtn = (label) => `<button data-workflow="__WF__" onclick="runWorkflow(this)" class="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 font-bold text-lg shadow-2xl shadow-indigo-500/30 hover:brightness-110 transition">${label}</button>`;

const card = (icon, title, desc, body) => `
  <div class="max-w-md w-full bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
    <div class="text-5xl mb-3">${icon}</div>
    <h1 class="text-2xl font-extrabold mb-1">${title}</h1>
    <p class="text-slate-400 text-sm mb-4">${desc}</p>
    ${body}
    ${resultBox}
    <p class="text-slate-500 text-[11px] mt-4">⚡ Powered by an on-chain workflow</p>
  </div>`;

export const dappBundles = [
  {
    name: 'Wallet Balance Checker',
    description: 'Enter any wallet address and fetch its live ETH balance on-chain.',
    icon: '💰',
    category: 'Web3',
    site: { html: shell(card('💰', 'Wallet Balance', 'Check the native ETH balance of any address.',
      field('Wallet address', 'address', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045') + runBtn('Check Balance'))) },
    workflow: (() => {
      reset();
      const t = node('manual-trigger', 'Start', {}, 80, 200);
      const b = node('web3-get-balance', 'Get Balance', { chain: 'ethereum', rpcUrl: PUBLICNODE, address: VITALIK }, 400, 200);
      const o = node('readme-viewer', 'Output', { title: 'Result' }, 720, 200);
      return { name: 'Wallet Balance Checker', nodes: [t, b, o], edges: [edge(t.id, b.id), edge(b.id, o.id)] };
    })(),
  },
  {
    name: 'ERC-20 Token Balance',
    description: 'Look up any ERC-20 token balance for any holder.',
    icon: '🪙',
    category: 'Web3',
    site: { html: shell(card('🪙', 'Token Balance', 'Check an ERC-20 balance (symbol + decimals).',
      field('Token contract', 'token', USDC) + field('Holder address', 'address', '0x…') + runBtn('Check Token Balance'))) },
    workflow: (() => {
      reset();
      const t = node('manual-trigger', 'Start', {}, 80, 200);
      const b = node('web3-token-balance', 'ERC-20 Balance', { chain: 'ethereum', rpcUrl: PUBLICNODE, token: USDC, address: VITALIK }, 400, 200);
      const o = node('readme-viewer', 'Output', { title: 'Result' }, 720, 200);
      return { name: 'ERC-20 Token Balance', nodes: [t, b, o], edges: [edge(t.id, b.id), edge(b.id, o.id)] };
    })(),
  },
  {
    name: 'ETH Price Widget',
    description: 'Live ETH/USD price pulled from a Chainlink price feed.',
    icon: '📈',
    category: 'Web3',
    site: { html: shell(card('📈', 'ETH / USD', 'Fetch the latest price from Chainlink.',
      runBtn('Get ETH Price'))) },
    workflow: (() => {
      reset();
      const t = node('manual-trigger', 'Start', {}, 80, 200);
      const p = node('web3-chainlink-price', 'ETH/USD', { chain: 'ethereum', feedAddress: ETH_USD_FEED, rpcUrl: PUBLICNODE }, 400, 200);
      const o = node('readme-viewer', 'Output', { title: 'Result' }, 720, 200);
      return { name: 'ETH Price Widget', nodes: [t, p, o], edges: [edge(t.id, p.id), edge(p.id, o.id)] };
    })(),
  },
  {
    name: 'Gas Tracker',
    description: 'One click to read the current network gas price.',
    icon: '⛽',
    category: 'Web3',
    site: { html: shell(card('⛽', 'Gas Tracker', 'Current Ethereum gas price (gwei).',
      runBtn('Check Gas Price'))) },
    workflow: (() => {
      reset();
      const t = node('manual-trigger', 'Start', {}, 80, 200);
      const g = node('web3-gas-price', 'Gas Price', { chain: 'ethereum', rpcUrl: PUBLICNODE }, 400, 200);
      const o = node('readme-viewer', 'Output', { title: 'Result' }, 720, 200);
      return { name: 'Gas Tracker', nodes: [t, g, o], edges: [edge(t.id, g.id), edge(g.id, o.id)] };
    })(),
  },
  {
    name: 'AI Web3 Assistant',
    description: 'Ask anything — an AI agent answers (powered by Groq).',
    icon: '🤖',
    category: 'Web3 + AI',
    site: { html: shell(card('🤖', 'AI Web3 Assistant', 'Ask a question and the AI agent responds.',
      field('Your question', 'message', 'What is an ERC-20 token?') + runBtn('Ask the Assistant'))) },
    workflow: (() => {
      reset();
      const c = node('manual-trigger', 'Start', {}, 60, 160);
      const m = node('groq-llama', 'Groq Llama', { model: 'llama-3.1-8b-instant', api_key: '' }, 60, 380);
      const a = node('ai-agent', 'Assistant', { prompt: 'You are a concise, helpful Web3 assistant. Answer clearly.' }, 420, 200);
      const o = node('readme-viewer', 'Output', { title: 'Answer' }, 780, 200);
      return {
        name: 'AI Web3 Assistant',
        nodes: [c, m, a, o],
        edges: [edge(c.id, a.id), edge(m.id, a.id, 'main', 'chat-model'), edge(a.id, o.id)],
      };
    })(),
  },
];

export default dappBundles;
