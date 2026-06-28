// Point the web3 read-workflows at the local chain + deployed DEMO token, and
// create real write-workflows (send ETH, ERC-20 transfer) that execute on the
// local node. Run after deploy-local-token.mjs.
import fs from 'node:fs';
import path from 'node:path';
const here = import.meta.dirname;
const root = path.resolve(here, '..');
for (const line of fs.readFileSync(path.resolve(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const cfg = JSON.parse(fs.readFileSync(path.resolve(root, 'local-chain.json'), 'utf8'));
const { rpcUrl: RPC, deployer, account1, token } = cfg;

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

// --- 1) Re-point existing read workflows at the local chain ---
const all = await prisma.workflow.findMany({ select: { id: true, name: true, nodes: true, userId: true } });
let userId = all.find((w) => w.userId)?.userId || null;
let repointed = 0;
for (const w of all) {
  const nodes = Array.isArray(w.nodes) ? w.nodes : [];
  let changed = false;
  for (const n of nodes) {
    const t = n.data?.type;
    const p = (n.data.properties = n.data.properties || {});
    if (t === 'web3-get-balance') {
      p.chain = 'local'; p.rpcUrl = RPC; p.address = deployer.address; changed = true;
    } else if (t === 'web3-token-balance') {
      p.chain = 'local'; p.rpcUrl = RPC; p.token = token.address; p.address = deployer.address; changed = true;
    }
  }
  if (changed) { await prisma.workflow.update({ where: { id: w.id }, data: { nodes } }); repointed++; }
}
console.log(`Re-pointed ${repointed} read workflow(s) to local chain.`);

// --- 2) Create write workflows (idempotent: delete same-named first) ---
const N = (id, type, label, properties, x, y) => ({ id, type, position: { x, y }, data: { type, label, properties } });
const E = (s, t, sh = 'main', th = 'main') => ({ id: `e-${s}-${t}-${sh}-${th}`, source: s, target: t, sourceHandle: sh, targetHandle: th });

const sendEth = {
  name: 'Local: Send ETH',
  description: 'Send 0.5 ETH from the funded deployer to account #1 on the local chain.',
  nodes: [
    N('n1', 'manual-trigger', 'Start', {}, 80, 120),
    N('w1', 'web3-wallet', 'Wallet', { chain: 'local', rpcUrl: RPC, privateKey: deployer.privateKey }, 80, 320),
    N('s1', 'web3-send-transaction', 'Send ETH', { chain: 'local', rpcUrl: RPC, to: account1.address, value: '0.5' }, 420, 200),
    N('o1', 'readme-viewer', 'Output', { title: 'Tx Receipt' }, 760, 200),
  ],
  edges: [E('n1', 's1'), E('w1', 's1', 'main', 'wallet'), E('s1', 'o1')],
};

const erc20 = {
  name: 'Local: ERC-20 Transfer',
  description: 'Transfer 10 DEMO from the deployer to account #1 on the local chain.',
  nodes: [
    N('n1', 'manual-trigger', 'Start', {}, 80, 120),
    N('w1', 'web3-wallet', 'Wallet', { chain: 'local', rpcUrl: RPC, privateKey: deployer.privateKey }, 80, 320),
    N('x1', 'web3-erc20-transfer', 'ERC-20 Transfer', { chain: 'local', rpcUrl: RPC, token: token.address, to: account1.address, amount: '10' }, 420, 200),
    N('o1', 'readme-viewer', 'Output', { title: 'Transfer Receipt' }, 760, 200),
  ],
  edges: [E('n1', 'x1'), E('w1', 'x1', 'main', 'wallet'), E('x1', 'o1')],
};

for (const wf of [sendEth, erc20]) {
  await prisma.workflow.deleteMany({ where: { name: wf.name, userId } });
  const created = await prisma.workflow.create({
    data: { name: wf.name, description: wf.description, nodes: wf.nodes, edges: wf.edges, userId },
  });
  console.log(`Created "${wf.name}" -> ${created.id}`);
}

await prisma.$disconnect();
