/**
 * Premium showcase Web3 website templates for the Page Builder, plus the
 * "element -> workflow action" building blocks (site builder + n8n for Web3).
 *
 * Action runtime: any element with data-workflow="<id>" and
 * onclick="runWorkflow(this)" triggers that workflow (via /api/trigger/chat)
 * when the page is previewed or published. connectWallet() uses the injected
 * provider.
 */

const ACTION_RUNTIME = `
<script src="https://cdn.tailwindcss.com"></script>
<script>
  window.runWorkflow = async (el) => {
    const id = el.getAttribute('data-workflow');
    const msg = el.getAttribute('data-message') || '';
    if (!id) { alert('Set this button\\'s data-workflow attribute to a saved Workflow ID (build & save one in the Workflow Builder).'); return; }
    const original = el.innerHTML; el.style.opacity = '0.6'; el.innerHTML = 'Running…';
    try {
      const res = await fetch('/api/trigger/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
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
      const a = await window.ethereum.request({ method: 'eth_requestAccounts' });
      el.innerHTML = a[0].slice(0, 6) + '…' + a[0].slice(-4);
    } catch (e) { alert('Wallet connection rejected.'); }
  };
</script>`;

const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"><style>*{font-family:'Inter',system-ui,sans-serif}</style>`;

export const web3SiteTemplates = [
  {
    name: 'Web3 SaaS Landing',
    description: 'Premium landing: sticky nav, gradient hero, stats, features, steps, CTA, footer.',
    html: `${FONT}
<div class="bg-[#0b0b14] text-white overflow-hidden">
  <!-- Nav -->
  <nav class="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0b14]/70 border-b border-white/10">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2 font-extrabold text-lg"><span class="w-8 h-8 grid place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500">⚡</span> ChainFlow</div>
      <div class="hidden md:flex items-center gap-8 text-sm text-slate-300">
        <a href="#features" class="hover:text-white transition">Features</a>
        <a href="#how" class="hover:text-white transition">How it works</a>
        <a href="#" class="hover:text-white transition">Docs</a>
      </div>
      <button onclick="connectWallet(this)" class="px-5 py-2.5 rounded-xl bg-white text-[#0b0b14] text-sm font-bold hover:bg-indigo-50 transition">Connect Wallet</button>
    </div>
  </nav>

  <!-- Hero -->
  <header class="relative">
    <div class="absolute inset-0 opacity-60" style="background:radial-gradient(600px 300px at 70% 0%,rgba(168,85,247,.35),transparent),radial-gradient(500px 300px at 10% 30%,rgba(56,189,248,.25),transparent)"></div>
    <div class="relative max-w-4xl mx-auto text-center px-6 pt-24 pb-20">
      <span class="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold rounded-full bg-white/10 border border-white/15 text-indigo-200">🚀 The n8n for Web3</span>
      <h1 class="text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">Automate <span class="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">on-chain</span><br/>actions without code</h1>
      <p class="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Connect wallets, smart contracts, AI agents and any Web2 app with a drag-and-drop workflow builder. Ship in minutes.</p>
      <div class="flex flex-wrap justify-center gap-4">
        <button data-workflow="" data-message="Launch from landing" onclick="runWorkflow(this)" class="px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 font-bold shadow-2xl shadow-indigo-500/30 hover:brightness-110 hover:-translate-y-0.5 transition">Launch App →</button>
        <a href="#features" class="px-8 py-4 rounded-2xl bg-white/10 border border-white/15 font-semibold hover:bg-white/20 transition">View Features</a>
      </div>
      <div class="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div><div class="text-3xl font-extrabold">12k+</div><div class="text-xs text-slate-400 mt-1">Workflows run</div></div>
        <div><div class="text-3xl font-extrabold">8</div><div class="text-xs text-slate-400 mt-1">Chains supported</div></div>
        <div><div class="text-3xl font-extrabold">99.9%</div><div class="text-xs text-slate-400 mt-1">Uptime</div></div>
      </div>
    </div>
  </header>

  <!-- Features -->
  <section id="features" class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-3xl md:text-4xl font-extrabold text-center mb-3">Everything you need on-chain</h2>
    <p class="text-slate-400 text-center mb-12">Composable nodes for the entire Web3 stack.</p>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-fuchsia-400/40 hover:-translate-y-1 transition"><div class="w-12 h-12 grid place-items-center rounded-2xl bg-fuchsia-500/20 text-2xl mb-5">🔗</div><h3 class="font-bold text-xl mb-2">Smart Contracts</h3><p class="text-slate-400 text-sm leading-relaxed">Read & write any contract, transfer tokens & NFTs with drag-and-drop nodes.</p></div>
      <div class="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-indigo-400/40 hover:-translate-y-1 transition"><div class="w-12 h-12 grid place-items-center rounded-2xl bg-indigo-500/20 text-2xl mb-5">🤖</div><h3 class="font-bold text-xl mb-2">AI Agents</h3><p class="text-slate-400 text-sm leading-relaxed">Add LLM reasoning, web search tools and memory to any automation.</p></div>
      <div class="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-sky-400/40 hover:-translate-y-1 transition"><div class="w-12 h-12 grid place-items-center rounded-2xl bg-sky-500/20 text-2xl mb-5">🌉</div><h3 class="font-bold text-xl mb-2">Web2 → Web3</h3><p class="text-slate-400 text-sm leading-relaxed">Trigger transactions from webhooks, forms, schedules or chat messages.</p></div>
    </div>
  </section>

  <!-- How it works -->
  <section id="how" class="max-w-5xl mx-auto px-6 py-16">
    <div class="grid md:grid-cols-3 gap-8 text-center">
      <div><div class="text-5xl font-black text-white/10 mb-2">01</div><h4 class="font-bold mb-1">Design the flow</h4><p class="text-slate-400 text-sm">Drag nodes onto the canvas and connect them.</p></div>
      <div><div class="text-5xl font-black text-white/10 mb-2">02</div><h4 class="font-bold mb-1">Wire your UI</h4><p class="text-slate-400 text-sm">Bind any button to a workflow with one attribute.</p></div>
      <div><div class="text-5xl font-black text-white/10 mb-2">03</div><h4 class="font-bold mb-1">Run on-chain</h4><p class="text-slate-400 text-sm">Click run — transactions execute automatically.</p></div>
    </div>
  </section>

  <!-- CTA -->
  <section class="max-w-5xl mx-auto px-6 py-16">
    <div class="rounded-3xl p-12 text-center bg-gradient-to-r from-fuchsia-600/30 to-indigo-600/30 border border-white/10">
      <h2 class="text-3xl font-extrabold mb-3">Ready to automate Web3?</h2>
      <p class="text-slate-300 mb-7">Build your first on-chain workflow in under five minutes.</p>
      <button data-workflow="" data-message="Get started" onclick="runWorkflow(this)" class="px-8 py-4 rounded-2xl bg-white text-[#0b0b14] font-bold hover:bg-indigo-50 transition">Get Started Free</button>
    </div>
  </section>

  <footer class="border-t border-white/10 py-8 text-center text-slate-500 text-sm">© 2025 ChainFlow · Built with the n8n-for-Web3 builder</footer>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'NFT Mint Page',
    description: 'Two-column mint hero with live progress bar, quantity, mint + connect actions.',
    html: `${FONT}
<div class="min-h-screen bg-[#0a0a12] text-white">
  <nav class="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
    <div class="font-extrabold text-lg flex items-center gap-2"><span>🐵</span> Genesis Apes</div>
    <button onclick="connectWallet(this)" class="px-5 py-2.5 rounded-xl bg-white text-[#0a0a12] text-sm font-bold hover:bg-slate-100 transition">Connect Wallet</button>
  </nav>
  <div class="max-w-6xl mx-auto px-8 py-12 grid md:grid-cols-2 gap-12 items-center">
    <div class="relative">
      <div class="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 blur-2xl"></div>
      <div class="relative aspect-square rounded-[2rem] bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 grid place-items-center text-[9rem] shadow-2xl">🐵</div>
    </div>
    <div>
      <span class="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300">● Mint Live</span>
      <h1 class="text-5xl font-black mb-3">Genesis Apes</h1>
      <p class="text-slate-400 mb-6 leading-relaxed">A collection of 10,000 unique, fully on-chain apes. Holders unlock governance, drops and IRL events.</p>
      <div class="mb-2 flex justify-between text-sm text-slate-300"><span>Minted</span><span><b class="text-white">3,142</b> / 10,000</span></div>
      <div class="h-3 rounded-full bg-white/10 overflow-hidden mb-6"><div class="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500" style="width:31.4%"></div></div>
      <div class="flex items-center gap-4 mb-6">
        <div class="flex items-center rounded-xl border border-white/15 overflow-hidden"><button class="px-4 py-3 text-lg hover:bg-white/10">−</button><span class="px-5 py-3 font-bold">1</span><button class="px-4 py-3 text-lg hover:bg-white/10">+</button></div>
        <div class="text-sm text-slate-400">Price <span class="text-white font-bold text-base">0.05 ETH</span></div>
      </div>
      <button data-workflow="" data-message="mint 1" onclick="runWorkflow(this)" class="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 font-bold text-lg shadow-2xl shadow-indigo-500/30 hover:brightness-110 transition">Mint Now</button>
      <div class="grid grid-cols-3 gap-3 mt-8 text-center text-sm">
        <div class="bg-white/5 rounded-xl py-3"><div class="font-bold">10k</div><div class="text-slate-500 text-xs">Supply</div></div>
        <div class="bg-white/5 rounded-xl py-3"><div class="font-bold">0.05Ξ</div><div class="text-slate-500 text-xs">Price</div></div>
        <div class="bg-white/5 rounded-xl py-3"><div class="font-bold">5/wallet</div><div class="text-slate-500 text-xs">Max</div></div>
      </div>
    </div>
  </div>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'Token Dashboard',
    description: 'Portfolio dashboard: total value, holdings table, refresh bound to a workflow.',
    html: `${FONT}
<div class="min-h-screen bg-slate-50 text-slate-900">
  <nav class="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
    <div class="font-extrabold text-lg flex items-center gap-2"><span class="w-8 h-8 grid place-items-center rounded-lg bg-indigo-600 text-white">◈</span> Portfolio</div>
    <button onclick="connectWallet(this)" class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition">Connect Wallet</button>
  </nav>
  <div class="max-w-6xl mx-auto px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <div><p class="text-slate-500 text-sm">Total balance</p><h1 class="text-4xl font-black">$12,480.55 <span class="text-emerald-600 text-base font-bold align-middle">▲ 4.2%</span></h1></div>
      <button data-workflow="" data-message="refresh" onclick="runWorkflow(this)" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">↻ Refresh</button>
    </div>
    <div class="grid md:grid-cols-3 gap-5 mb-8">
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"><div class="flex items-center gap-2 text-slate-500 text-sm mb-2"><span class="w-6 h-6 grid place-items-center rounded-full bg-slate-100">Ξ</span> Ethereum</div><p class="text-2xl font-extrabold">5.69 ETH</p><p class="text-slate-500 text-sm">≈ $9,420</p></div>
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"><div class="flex items-center gap-2 text-slate-500 text-sm mb-2"><span class="w-6 h-6 grid place-items-center rounded-full bg-blue-100 text-blue-600">$</span> USDC</div><p class="text-2xl font-extrabold">3,060.55</p><p class="text-slate-500 text-sm">Stablecoin</p></div>
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"><div class="flex items-center gap-2 text-slate-500 text-sm mb-2"><span class="w-6 h-6 grid place-items-center rounded-full bg-purple-100 text-purple-600">◆</span> NFTs</div><p class="text-2xl font-extrabold">14 items</p><p class="text-slate-500 text-sm">3 collections</p></div>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 font-bold">Holdings</div>
      <table class="w-full text-sm">
        <thead class="text-slate-400 text-left"><tr><th class="px-6 py-3 font-medium">Asset</th><th class="px-6 py-3 font-medium">Balance</th><th class="px-6 py-3 font-medium">Value</th><th class="px-6 py-3 font-medium">24h</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
          <tr><td class="px-6 py-4 font-semibold">Ethereum</td><td class="px-6 py-4">5.69</td><td class="px-6 py-4">$9,420</td><td class="px-6 py-4 text-emerald-600">+4.2%</td></tr>
          <tr><td class="px-6 py-4 font-semibold">USD Coin</td><td class="px-6 py-4">3,060.55</td><td class="px-6 py-4">$3,060</td><td class="px-6 py-4 text-slate-400">0.0%</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'DAO Governance',
    description: 'Governance portal: stats, active proposals with vote actions wired to workflows.',
    html: `${FONT}
<div class="min-h-screen bg-[#0b0b14] text-white">
  <nav class="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
    <div class="font-extrabold text-lg">🏛️ MetaDAO</div>
    <button onclick="connectWallet(this)" class="px-5 py-2.5 rounded-xl bg-white text-[#0b0b14] text-sm font-bold">Connect Wallet</button>
  </nav>
  <div class="max-w-5xl mx-auto px-8 py-8">
    <h1 class="text-4xl font-black mb-2">Governance</h1>
    <p class="text-slate-400 mb-8">Vote on active proposals — votes are recorded on-chain via a workflow.</p>
    <div class="grid grid-cols-3 gap-5 mb-10">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5"><div class="text-2xl font-extrabold">1.2M</div><div class="text-slate-400 text-sm">Voting power</div></div>
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5"><div class="text-2xl font-extrabold">8</div><div class="text-slate-400 text-sm">Active proposals</div></div>
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5"><div class="text-2xl font-extrabold">73%</div><div class="text-slate-400 text-sm">Participation</div></div>
    </div>
    <div class="space-y-5">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div class="flex justify-between items-start mb-3"><h3 class="font-bold text-lg">Proposal #42 — Treasury diversification</h3><span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">Active · 2d left</span></div>
        <p class="text-slate-300 text-sm mb-5">Allocate 5% of the treasury into ETH staking to earn yield.</p>
        <div class="flex gap-2 text-xs mb-1 text-slate-400"><span class="flex-1">For 68%</span><span>Against 32%</span></div>
        <div class="flex h-2.5 rounded-full overflow-hidden mb-5"><div class="bg-emerald-500" style="width:68%"></div><div class="bg-rose-500" style="width:32%"></div></div>
        <div class="flex gap-3">
          <button data-workflow="" data-message="vote yes 42" onclick="runWorkflow(this)" class="flex-1 py-3 rounded-xl bg-emerald-500 font-semibold hover:brightness-110 transition">Vote For</button>
          <button data-workflow="" data-message="vote no 42" onclick="runWorkflow(this)" class="flex-1 py-3 rounded-xl bg-rose-500 font-semibold hover:brightness-110 transition">Vote Against</button>
        </div>
      </div>
    </div>
  </div>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'Web3 Action Button',
    description: 'A single button that triggers a workflow — the element→action core.',
    html: `${FONT}
<div class="p-12 text-center bg-[#0b0b14]">
  <button data-workflow="" data-message="Hello from my site" onclick="runWorkflow(this)"
    class="px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-bold text-lg shadow-2xl shadow-indigo-500/30 hover:brightness-110 hover:-translate-y-0.5 transition">
    Run Web3 Workflow →
  </button>
  <p class="text-slate-400 text-xs mt-4">Set <code class="text-indigo-300">data-workflow</code> (Properties → Settings) to a saved Workflow ID.</p>
</div>${ACTION_RUNTIME}`,
  },
  {
    name: 'Connect Wallet Button',
    description: 'A wallet-connect button using the browser provider.',
    html: `${FONT}
<div class="p-12 text-center bg-[#0b0b14]">
  <button onclick="connectWallet(this)"
    class="px-7 py-3.5 rounded-2xl bg-white text-[#0b0b14] font-bold hover:bg-slate-100 transition shadow-lg">
    🦊 Connect Wallet
  </button>
</div>${ACTION_RUNTIME}`,
  },
];

export default web3SiteTemplates;
