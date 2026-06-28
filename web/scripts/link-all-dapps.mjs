// Ensure every published dApp page is linked to a working workflow. For each
// page we (1) reuse an existing workflow id baked in the HTML, else (2) infer
// the dApp type from the page text and reuse/create a matching workflow, then
// store components.workflowId so the live route injects it into the buttons.
import fs from 'node:fs'; import path from 'node:path';
const here = import.meta.dirname; const root = path.resolve(here, '..');
for (const line of fs.readFileSync(path.resolve(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const cfg = JSON.parse(fs.readFileSync(path.resolve(root, 'local-chain.json'), 'utf8'));
const { rpcUrl: RPC, deployer, token } = cfg;
const ETH_USD_FEED = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();
const N = (id, type, label, properties, x, y) => ({ id, type, position: { x, y }, data: { type, label, properties } });
const E = (s, t, sh = 'main', th = 'main') => ({ id: `e-${s}-${t}-${sh}-${th}`, source: s, target: t, sourceHandle: sh, targetHandle: th });

const all = await prisma.workflow.findMany({ select: { id: true, name: true, userId: true } });
const userId = all.find((w) => w.userId)?.userId || null;
const findWf = (kw) => all.find((w) => w.name.toLowerCase().includes(kw));

// dApp type definitions: detection regex + workflow builder.
const TYPES = [
  { kw: 'gas', re: /gas tracker|gas price/i, name: 'Gas Tracker',
    build: () => ({ nodes: [N('n1','manual-trigger','Start',{},80,120),N('g1','web3-gas-price','Gas Price',{chain:'local',rpcUrl:RPC},420,200),N('o1','readme-viewer','Output',{title:'Gas'},760,200)], edges: [E('n1','g1'),E('g1','o1')] }) },
  { kw: 'erc-20 token', re: /token balance|erc-?20 balance/i, name: 'ERC-20 Token Balance',
    build: () => ({ nodes: [N('n1','manual-trigger','Start',{},80,120),N('b1','web3-token-balance','Token Balance',{chain:'local',rpcUrl:RPC,token:token.address,address:deployer.address},420,200),N('o1','readme-viewer','Output',{title:'Balance'},760,200)], edges: [E('n1','b1'),E('b1','o1')] }) },
  { kw: 'wallet balance', re: /wallet balance/i, name: 'Wallet Balance Checker',
    build: () => ({ nodes: [N('n1','manual-trigger','Start',{},80,120),N('b1','web3-get-balance','Get Balance',{chain:'local',rpcUrl:RPC,address:deployer.address},420,200),N('o1','readme-viewer','Output',{title:'Balance'},760,200)], edges: [E('n1','b1'),E('b1','o1')] }) },
  { kw: 'eth price', re: /eth ?\/ ?usd|eth price/i, name: 'ETH Price Widget',
    build: () => ({ nodes: [N('n1','manual-trigger','Start',{},80,120),N('p1','web3-chainlink-price','ETH/USD',{chain:'ethereum',feedAddress:ETH_USD_FEED},420,200),N('o1','readme-viewer','Output',{title:'Price'},760,200)], edges: [E('n1','p1'),E('p1','o1')] }) },
  { kw: 'assistant', re: /ai web3 assistant|ask the assistant/i, name: 'AI Web3 Assistant',
    build: () => ({ nodes: [N('n1','manual-trigger','Start',{},80,120),N('m1','groq-llama','Groq',{model:'llama-3.1-8b-instant',api_key:''},80,320),N('a1','ai-agent','Assistant',{prompt:'You are a concise, helpful Web3 assistant.'},420,200),N('o1','readme-viewer','Output',{title:'Answer'},760,200)], edges: [E('n1','a1'),E('m1','a1','main','chat-model'),E('a1','o1')] }) },
];

async function ensureWorkflow(type) {
  let wf = findWf(type.kw);
  if (wf) return wf.id;
  const built = type.build();
  const created = await prisma.workflow.create({ data: { name: type.name, description: `dApp workflow: ${type.name}`, nodes: built.nodes, edges: built.edges, userId } });
  all.push({ id: created.id, name: type.name, userId });
  console.log(`  created workflow "${type.name}" -> ${created.id}`);
  return created.id;
}

const pages = await prisma.uIBuilderProject.findMany({ select: { id: true, projectName: true, components: true } });
let linked = 0;
for (const p of pages) {
  const comp = (p.components && typeof p.components === 'object') ? { ...p.components } : {};
  const html = comp.html || '';
  if (!html || comp.workflowId) continue;

  const vals = [...html.matchAll(/data-workflow="([^"]*)"/g)].map((m) => m[1]);
  let wfId = vals.find((v) => v && v !== '__WF__');

  if (!wfId) {
    const type = TYPES.find((t) => t.re.test(html));
    if (type) wfId = await ensureWorkflow(type);
  }
  if (wfId) {
    comp.workflowId = wfId;
    await prisma.uIBuilderProject.update({ where: { id: p.id }, data: { components: comp } });
    console.log(`Linked "${p.projectName}" -> ${wfId}`);
    linked++;
  } else {
    console.log(`SKIP   "${p.projectName}" (no detectable dApp type)`);
  }
}
console.log(`\nLinked ${linked} page(s).`);
await prisma.$disconnect();
