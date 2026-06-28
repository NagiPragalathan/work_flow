# -*- coding: utf-8 -*-
# Generate the sequence diagram SVG for AgentFlow Web3 hosted-dApp run.
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

W, H = 1680, 940
lifelines = [
    ("End User\n(Hosted Page)", 120,  "#eef2ff", "#6366f1"),
    ("Embedded\nRunner",        345,  "#eff6ff", "#3b82f6"),
    ("Trigger API\n/api/trigger/chat", 600, "#ecfeff", "#06b6d4"),
    ("Execution\nEngine",       860,  "#ecfdf5", "#10b981"),
    ("Block\nExecutors",        1110, "#fffbeb", "#f59e0b"),
    ("Blockchain\nRPC (viem)",  1360, "#f5f3ff", "#8b5cf6"),
    ("PostgreSQL\n(Prisma)",    1560, "#fff1f2", "#f43f5e"),
]
x = {name.replace("\n"," "): xx for name,xx,_,_ in lifelines}
# also allow shorthand keys used in msgs
alias = {
  "End User":"End User (Hosted Page)",
  "Embedded Runner":"Embedded Runner",
  "Trigger API":"Trigger API /api/trigger/chat",
  "Execution Engine":"Execution Engine",
  "Block Executors":"Block Executors",
  "Blockchain RPC":"Blockchain RPC (viem)",
  "PostgreSQL":"PostgreSQL (Prisma)",
}
def X(k): return x[alias[k]]

top = 24; boxh=58; head_bottom = top+boxh
foot = 902
boxw = 150

# messages: (from, to, label, kind)  kind: call|return|self
msgs = [
 ("End User","Embedded Runner","1: Click action button → gather field values","call"),
 ("Embedded Runner","Trigger API","2: POST { workflow_id, inputs }","call"),
 ("Trigger API","PostgreSQL","3: Load workflow (nodes, edges)","call"),
 ("PostgreSQL","Trigger API","4: Workflow definition","return"),
 ("Trigger API","Execution Engine","5: runWorkflow(nodes, edges, triggerData)","call"),
 ("Execution Engine","Execution Engine","6: Build DAG + topological sort","self"),
 ("Execution Engine","Block Executors","7: Execute Wallet block","call"),
 ("Block Executors","Execution Engine","8: Account & signer ready","return"),
 ("Execution Engine","Block Executors","9: Execute Send-ETH (write)","call"),
 ("Block Executors","Blockchain RPC","10: sendTransaction()","call"),
 ("Blockchain RPC","Block Executors","11: Transaction hash","return"),
 ("Execution Engine","Block Executors","12: Execute Tx-Status block","call"),
 ("Block Executors","Blockchain RPC","13: getTransactionReceipt()","call"),
 ("Blockchain RPC","Block Executors","14: Receipt (success)","return"),
 ("Execution Engine","PostgreSQL","15: Save execution states & order","call"),
 ("Execution Engine","Trigger API","16: Result { execution_id, response }","return"),
 ("Trigger API","Embedded Runner","17: JSON result","return"),
 ("Embedded Runner","End User","18: Render on-chain result in place","return"),
]

y0=150; dy=40
out=[]
out.append(f'<!doctype html><html><head><meta charset="utf-8"><style>*{{margin:0;padding:0;box-sizing:border-box}}body{{background:#fff;font-family:"Segoe UI",Arial,sans-serif}}#stage{{width:{W}px;background:#fff;padding:10px}}</style></head><body><div id="stage">')
out.append(f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
out.append('<defs><marker id="af" markerWidth="11" markerHeight="11" refX="8.5" refY="3.2" orient="auto"><path d="M0,0 L9,3.2 L0,6.4 Z" fill="#475569"/></marker>'
           '<marker id="afo" markerWidth="11" markerHeight="11" refX="8.5" refY="3.2" orient="auto"><path d="M0,0 L9,3.2 L0,6.4" fill="none" stroke="#475569" stroke-width="1.2"/></marker></defs>')
out.append(f'<text x="{W/2}" y="20" text-anchor="middle" font-size="13" fill="#9ca3af"></text>')

# lifelines
for name,xx,fill,stroke in lifelines:
    out.append(f'<line x1="{xx}" y1="{head_bottom}" x2="{xx}" y2="{foot}" stroke="#cbd5e1" stroke-width="1.4" stroke-dasharray="5 5"/>')
    out.append(f'<rect x="{xx-boxw/2}" y="{top}" width="{boxw}" height="{boxh}" rx="9" fill="{fill}" stroke="{stroke}" stroke-width="1.8"/>')
    lines=name.split("\n")
    if len(lines)==2:
        out.append(f'<text x="{xx}" y="{top+24}" text-anchor="middle" font-size="17" font-weight="700" fill="#111827">{lines[0]}</text>')
        out.append(f'<text x="{xx}" y="{top+43}" text-anchor="middle" font-size="14" fill="#64748b">{lines[1]}</text>')
    else:
        out.append(f'<text x="{xx}" y="{top+34}" text-anchor="middle" font-size="17" font-weight="700" fill="#111827">{lines[0]}</text>')
    out.append(f'<rect x="{xx-90}" y="{foot}" width="180" height="0"/>')

# messages
y=y0
for frm,to,label,kind in msgs:
    xf,xt=X(frm),X(to)
    if kind=="self":
        # self loop
        out.append(f'<path d="M{xf},{y} h60 v22 h-56" fill="none" stroke="#475569" stroke-width="1.6" marker-end="url(#af)"/>')
        out.append(f'<text x="{xf+70}" y="{y-5}" font-size="15" fill="#1f2937">{label}</text>')
        y+=dy+8
        continue
    dash=' stroke-dasharray="6 5"' if kind=="return" else ''
    marker='url(#afo)' if kind=="return" else 'url(#af)'
    out.append(f'<line x1="{xf}" y1="{y}" x2="{xt}" y2="{y}" stroke="#475569" stroke-width="1.6"{dash} marker-end="{marker}"/>')
    # label centered above, anchored toward direction
    midx=(xf+xt)/2
    out.append(f'<text x="{midx}" y="{y-8}" text-anchor="middle" font-size="15" fill="#1f2937">{label}</text>')
    y+=dy

# activation bars (simple) on engine across its active span
out.append('</svg></div></body></html>')
open(r'C:\Users\Admin\Documents\Work\work_flow\final_year_report\diagrams\sequence.html','w',encoding='utf-8').write("".join(out))
print("wrote sequence.html ; last y =", y)
