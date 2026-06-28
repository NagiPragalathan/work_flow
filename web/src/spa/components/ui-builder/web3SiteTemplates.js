/**
 * Showcase Web3 website templates for the Page Builder, plus the
 * "element -> workflow action" building blocks that make this a
 * site builder + n8n for Web3.
 *
 * Action runtime: any element with data-workflow="<id>" and
 * onclick="runWorkflow(this)" will trigger that workflow (via
 * /api/trigger/chat) when the page is previewed or published.
 * A "Connect Wallet" button uses the browser's injected provider.
 */

const ACTION_RUNTIME = `
<script>
  window.runWorkflow = async (el) => {
    const id = el.getAttribute('data-workflow');
    const msg = el.getAttribute('data-message') || '';
    if (!id) { alert('Set this button\\'s data-workflow attribute to a Workflow ID (build one in the Workflow Builder and save it).'); return; }
    const original = el.innerHTML; el.style.opacity = '0.6'; el.innerHTML = 'Running…';
    try {
      const res = await fetch('/api/trigger/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workflow_id: id, message: msg })
      });
      const data = await res.json();
      alert(data.chat_response || data.error || 'Workflow finished.');
    } catch (e) { alert('Error: ' + e.message); }
    finally { el.style.opacity = '1'; el.innerHTML = original; }
  };
  window.connectWallet = async (el) => {
    if (!window.ethereum) { alert('No Web3 wallet found. Install MetaMask.'); return; }
    try {
      const accts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      el.innerHTML = accts[0].slice(0, 6) + '…' + accts[0].slice(-4);
    } catch (e) { alert('Wallet connection rejected.'); }
  };
</script>`;

export const web3SiteTemplates = [
  {
    name: 'Web3 SaaS Landing',
    description: 'Hero + features + CTA with a wallet connect and a workflow action.',
    html: `<div class="min-h-screen bg-gradient-to-b from-slate-950 to-indigo-950 text-white font-sans">
  <header class="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
    <div class="text-xl font-extrabold tracking-tight">⚡ ChainFlow</div>
    <button onclick="connectWallet(this)" class="px-5 py-2 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50">Connect Wallet</button>
  </header>
  <section class="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
    <span class="inline-block px-3 py-1 mb-5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">n8n for Web3</span>
    <h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-6">Automate on-chain actions without code</h1>
    <p class="text-lg text-indigo-200 mb-9 max-w-2xl mx-auto">Wire wallets, smart contracts, AI agents and any Web2 app together with a visual workflow builder.</p>
    <div class="flex justify-center gap-4">
      <button data-workflow="" data-message="Launch from landing" onclick="runWorkflow(this)" class="px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 font-semibold shadow-lg hover:brightness-110">Launch App</button>
      <a href="#features" class="px-8 py-3 rounded-xl bg-white/10 font-semibold hover:bg-white/20">Learn More</a>
    </div>
  </section>
  <section id="features" class="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-8 pb-24">
    <div class="bg-white/5 border border-white/10 rounded-2xl p-7"><div class="text-3xl mb-3">🔗</div><h3 class="font-bold text-lg mb-2">Smart Contracts</h3><p class="text-indigo-200 text-sm">Read & write any contract with a drag-and-drop node.</p></div>
    <div class="bg-white/5 border border-white/10 rounded-2xl p-7"><div class="text-3xl mb-3">🤖</div><h3 class="font-bold text-lg mb-2">AI Agents</h3><p class="text-indigo-200 text-sm">Add LLM reasoning, tools and memory to any flow.</p></div>
    <div class="bg-white/5 border border-white/10 rounded-2xl p-7"><div class="text-3xl mb-3">🌉</div><h3 class="font-bold text-lg mb-2">Web2 → Web3</h3><p class="text-indigo-200 text-sm">Trigger transactions from webhooks, forms or chat.</p></div>
  </section>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'NFT Mint Page',
    description: 'A mint landing page; the Mint button runs your mint workflow.',
    html: `<div class="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl border border-white/10 p-8 text-center shadow-2xl">
    <div class="w-full aspect-square rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 mb-6 grid place-items-center text-6xl">🐵</div>
    <h1 class="text-2xl font-extrabold mb-1">Genesis Apes</h1>
    <p class="text-slate-400 mb-5 text-sm">A collection of 10,000 unique on-chain apes.</p>
    <div class="flex items-center justify-between text-sm text-slate-300 mb-6">
      <span>Price: <b class="text-white">0.05 ETH</b></span>
      <span>Minted: <b class="text-white">3,142 / 10,000</b></span>
    </div>
    <button data-workflow="" data-message="mint 1" onclick="runWorkflow(this)" class="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 font-bold text-lg shadow-lg hover:brightness-110 mb-3">Mint Now</button>
    <button onclick="connectWallet(this)" class="w-full py-2.5 rounded-xl bg-white/10 font-semibold hover:bg-white/20">Connect Wallet</button>
  </div>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'Token Dashboard',
    description: 'Portfolio cards with a refresh button bound to a balance workflow.',
    html: `<div class="min-h-screen bg-slate-100 font-sans p-8">
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Portfolio</h1>
      <button data-workflow="" data-message="refresh" onclick="runWorkflow(this)" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">↻ Refresh</button>
    </div>
    <div class="grid md:grid-cols-3 gap-5">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"><p class="text-slate-500 text-sm mb-1">Total Value</p><p class="text-3xl font-extrabold text-slate-900">$12,480.55</p><p class="text-emerald-600 text-sm mt-1">▲ 4.2% (24h)</p></div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"><p class="text-slate-500 text-sm mb-1">ETH</p><p class="text-3xl font-extrabold text-slate-900">5.69</p><p class="text-slate-500 text-sm mt-1">≈ $9,420</p></div>
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"><p class="text-slate-500 text-sm mb-1">USDC</p><p class="text-3xl font-extrabold text-slate-900">3,060.55</p><p class="text-slate-500 text-sm mt-1">Stablecoin</p></div>
    </div>
  </div>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'DAO Governance',
    description: 'Proposal list with vote buttons wired to workflows.',
    html: `<div class="min-h-screen bg-slate-950 text-white font-sans p-8">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-extrabold mb-2">🏛️ MetaDAO Governance</h1>
    <p class="text-slate-400 mb-8">Vote on active proposals. Votes are recorded on-chain via a workflow.</p>
    <div class="space-y-4">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="flex justify-between items-start mb-3"><h3 class="font-bold text-lg">Proposal #42 — Treasury diversification</h3><span class="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">Active</span></div>
        <p class="text-slate-300 text-sm mb-5">Allocate 5% of the treasury into ETH staking.</p>
        <div class="flex gap-3">
          <button data-workflow="" data-message="vote yes 42" onclick="runWorkflow(this)" class="flex-1 py-2.5 rounded-xl bg-emerald-500 font-semibold hover:brightness-110">Vote For</button>
          <button data-workflow="" data-message="vote no 42" onclick="runWorkflow(this)" class="flex-1 py-2.5 rounded-xl bg-rose-500 font-semibold hover:brightness-110">Vote Against</button>
        </div>
      </div>
    </div>
  </div>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'Web3 Action Button',
    description: 'A single button that triggers a workflow — the element→action core.',
    html: `<div class="p-10 text-center">
  <button data-workflow="" data-message="Hello from my site" onclick="runWorkflow(this)"
    class="px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-bold shadow-lg hover:brightness-110">
    Run Web3 Workflow
  </button>
  <p style="font-family:sans-serif;color:#64748b;font-size:12px;margin-top:10px">
    Set this button's <code>data-workflow</code> attribute (Properties → Settings) to a saved Workflow ID.
  </p>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'Connect Wallet Button',
    description: 'A wallet-connect button using the browser provider.',
    html: `<div class="p-10 text-center">
  <button onclick="connectWallet(this)"
    class="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">
    🦊 Connect Wallet
  </button>
</div>${ACTION_RUNTIME}`,
  },
];

export default web3SiteTemplates;
