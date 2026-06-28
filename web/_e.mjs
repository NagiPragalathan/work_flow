import fs from 'node:fs'; import path from 'node:path';
const here = import.meta.dirname;
for (const line of fs.readFileSync(path.resolve(here, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();
const w = await prisma.workflow.findFirst({ where:{ name:'ENS Resolver' }, select:{id:true} });
const res = await fetch('http://localhost:3000/api/trigger/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workflow_id:w.id})});
const d = await res.json();
console.log('status:', d.status);
console.log('errors:', JSON.stringify(d.execution?.errors));
await prisma.$disconnect(); process.exit(0);
