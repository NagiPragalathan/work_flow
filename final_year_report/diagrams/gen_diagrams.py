# -*- coding: utf-8 -*-
import os
from icons import icon

OUT = os.path.dirname(os.path.abspath(__file__))

# accent -> (badge_bg, icon_fg, top_border, band_bg, band_head_bg, band_head_fg, band_border)
AC = {
 "violet":("#eef2ff","#4f46e5","#6366f1","#fafaff","#eef2ff","#4338ca","#c7d2fe"),
 "blue":  ("#eff6ff","#2563eb","#3b82f6","#f8fbff","#eff6ff","#1d4ed8","#bfdbfe"),
 "cyan":  ("#ecfeff","#0891b2","#06b6d4","#f7feff","#ecfeff","#0e7490","#a5f3fc"),
 "green": ("#ecfdf5","#059669","#10b981","#f6fefb","#ecfdf5","#047857","#a7f3d0"),
 "amber": ("#fffbeb","#d97706","#f59e0b","#fffdf5","#fffbeb","#b45309","#fde68a"),
 "rose":  ("#fff1f2","#e11d48","#f43f5e","#fffafb","#fff1f2","#be123c","#fecdd3"),
 "slate": ("#f1f5f9","#475569","#64748b","#fafbfc","#f1f5f9","#334155","#cbd5e1"),
 "purple":("#f5f3ff","#7c3aed","#8b5cf6","#fbfaff","#f5f3ff","#6d28d9","#ddd6fe"),
}

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#fff}
body{font-family:"Segoe UI",-apple-system,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased}
#stage{background:#ffffff;padding:34px 40px 30px}
.dtitle{text-align:center;font-weight:800;letter-spacing:.4px;color:#312e81;font-size:34px}
.dsub{text-align:center;color:#64748b;font-size:18px;margin-top:8px}
.badge{display:inline-flex;align-items:center;justify-content:center;border-radius:9px;flex:none}
.band{border:1.5px solid #e5e7eb;border-radius:16px;padding:18px;position:relative}
.band-h{position:absolute;top:-13px;left:20px;font-weight:700;font-size:15px;letter-spacing:.6px;
  padding:3px 14px;border-radius:30px;border:1.5px solid;text-transform:uppercase}
.row{display:flex;gap:14px}.row.eq>*{flex:1}
.card{background:#fff;border:1.5px solid #e8eaee;border-radius:13px;padding:14px 15px;
  box-shadow:0 1px 2px rgba(15,23,42,.05)}
.card .ct{font-weight:700;font-size:18px;color:#0f172a;margin-top:11px}
.card .cd{font-size:14.5px;color:#475569;margin-top:5px;line-height:1.45}
.legend{display:flex;gap:24px;justify-content:center;align-items:center;flex-wrap:wrap;
  margin-top:22px;border-top:1px dashed #d8dee7;padding-top:14px;font-size:15px;color:#334155}
.legend .k{display:flex;align-items:center;gap:9px}
.dot{width:14px;height:14px;border-radius:3px}
.flowarrow{display:flex;justify-content:center;margin:7px 0;color:#cbd5e1}
</style></head><body>"""

def badge(name, accent, box=46, isz=26):
    bg,fg,*_ = AC[accent]
    return f'<span class="badge" style="width:{box}px;height:{box}px;background:{bg}">{icon(name,isz,fg)}</span>'

def card(accent, ic, title, desc, extra=""):
    bg,fg,top,*_ = AC[accent]
    return (f'<div class="card" style="border-top:4px solid {top}">'
            f'{badge(ic,accent)}<div class="ct">{title}</div>'
            f'<div class="cd">{desc}</div>{extra}</div>')

def band(accent, head, inner, style=""):
    _,_,_,bbg,hbg,hfg,hbd = AC[accent]
    return (f'<div class="band" style="background:{bbg};{style}">'
            f'<div class="band-h" style="background:{hbg};color:{hfg};border-color:{hbd}">{head}</div>'
            f'{inner}</div>')

def arrow(dirn="down"):
    ch = "&#9660;" if dirn=="down" else "&#9654;"
    return f'<div class="flowarrow" style="font-size:22px">{ch}</div>'

def legend(items):
    ks = "".join(f'<div class="k"><span class="dot" style="background:{c}"></span>{t}</div>' for t,c in items)
    return f'<div class="legend">{ks}</div>'

def write(name, body, width):
    html = HEAD + f'<div id="stage" style="width:{width}px">' + body + '</div></body></html>'
    open(os.path.join(OUT,name),"w",encoding="utf-8").write(html)
    print("wrote",name)

# ---------- 1. ARCHITECTURE ----------
def arch():
    title = '<div class="dtitle">AGENTFLOW WEB3 &mdash; PLATFORM ARCHITECTURE</div>'\
            '<div class="dsub">From a visual canvas to a hosted decentralized application &mdash; no code, one platform.</div>'
    actors = band("slate","Actors &amp; Entry Points",
        '<div class="row eq">'+
        card("slate","user","Builder / Creator","Composes workflows and pages on the visual canvas.")+
        card("slate","user-check","End User","Opens a hosted dApp link and runs the bound workflow.")+
        card("slate","clock","Trigger Sources","Manual run, schedule (cron), webhook, or chat message.")+
        card("slate","bot","AI Assistant","Answers questions and guides authoring in plain language.")+
        '</div>')

    left = band("violet","Visual Authoring Layer",
        card("violet","git-branch","Workflow Canvas","React Flow node-graph editor.")+
        '<div style="height:10px"></div>'+
        card("violet","layout-template","Interface Builder","GrapesJS drag-and-drop pages.")+
        '<div style="height:10px"></div>'+
        card("violet","message-square","Assistant Panel","Conversational build help."),
        style="height:100%")

    core = (
      band("blue","Orchestration Layer &mdash; Workflow Execution Engine",
        '<div class="row eq">'+
        card("blue","git-branch","Dependency Graph","Builds a DAG from blocks and typed connections.")+
        card("blue","list-ordered","Topological Sort","Orders blocks; rejects cycles and unreachable nodes.")+
        card("blue","play","Block Runner","Runs each block once its inputs are ready.")+
        card("blue","share","Typed Handles","Passes outputs to inputs by handle name.")+
        '</div>')
      + '<div style="height:14px"></div>' +
      band("green","Capabilities Layer",
        '<div class="row eq">'+
        card("green","link","On-Chain Primitives","Wallet, balance, read/write contract, transfer, sign, events, price feed, chain state, ENS &mdash; via viem.")+
        card("green","cpu","LLM Agent Blocks","Reasoning, extraction, classification with memory &amp; tools.")+
        card("green","repeat","Logic &amp; Data Blocks","Branch, filter, transform, code, HTTP.")+
        '</div>')
      + '<div style="height:14px"></div>' +
      band("amber","Composition &amp; Hosting Layer",
        '<div class="row eq">'+
        card("amber","link","Interface Binding","Binds a page action element to a workflow.")+
        card("amber","globe","Public Hosting","Serves each page at a shareable per-page link.")+
        card("amber","code","Embedded Runner","In-page script runs the bound workflow on click.")+
        '</div>')
    )

    right = band("cyan","External Services",
        card("cyan","server","Blockchain Nodes","EVM RPC: Ethereum, Polygon, Base, local chain.")+
        '<div style="height:10px"></div>'+
        card("cyan","sparkles","LLM Providers","OpenAI, Anthropic, Google, Groq.")+
        '<div style="height:10px"></div>'+
        card("cyan","trending-up","Oracles &amp; APIs","Chainlink price feeds, web search, HTTP."),
        style="height:100%")

    middle = ('<div class="row" style="align-items:stretch">'
        f'<div style="width:222px;flex:none">{left}</div>'
        f'<div style="flex:1">{core}</div>'
        f'<div style="width:222px;flex:none">{right}</div></div>')

    def pill(t,s):
        return (f'<div style="flex:1;background:#fff;border:1.5px solid #e8eaee;border-radius:11px;'
                f'padding:12px 9px;text-align:center"><div style="font-weight:700;font-size:16px;color:#0f172a">{t}</div>'
                f'<div style="font-size:13.5px;color:#475569;margin-top:3px">{s}</div></div>')
    state = band("rose","State Layer &mdash; PostgreSQL via Prisma",
        '<div style="display:flex;gap:12px">'+
        pill("Workflows","nodes &amp; edges (JSON)")+pill("UI Projects","pages &amp; bindings")+
        pill("Executions","run states &amp; order")+pill("Memory","conversation history")+
        pill("Credentials","encrypted keys")+pill("Users &amp; Templates","accounts, bundles")+
        '</div>')

    leg = legend([("Visual Authoring","#6366f1"),("Orchestration","#3b82f6"),("Capabilities","#10b981"),
                  ("Composition &amp; Hosting","#f59e0b"),("External Services","#06b6d4"),("State / Storage","#f43f5e")])
    body = title+'<div style="height:18px"></div>'+actors+arrow()+middle+arrow()+state+leg
    write("arch.html", body, 1640)

# ---------- 2. EXECUTION FLOW ----------
def execflow():
    steps = [
      ("violet","zap","Trigger",["Manual run","Schedule (cron)","Webhook","Chat / page button"]),
      ("blue","download","Load Workflow",["Fetch nodes &amp; edges","Attach trigger data","Resolve credentials"]),
      ("cyan","git-branch","Build Graph",["Nodes &rarr; vertices","Connections &rarr; edges","Compute in-degrees"]),
      ("green","list-ordered","Topological Sort",["Order by dependency","Reject cycles","Reject unreachable"]),
      ("amber","play","Run Blocks in Order",["Gather typed inputs","Dispatch to executor","On-chain / AI / logic","Store outputs by handle"]),
      ("rose","save","Persist Run",["Execution order","Per-node states","Errors &amp; timing"]),
      ("purple","send","Return Result",["execution_id","chat / output value","Render in page"]),
    ]
    cells=[]
    for i,(acc,ic,t,items) in enumerate(steps):
        bg,fg,top,*_=AC[acc]
        lis="".join(f'<li>{x}</li>' for x in items)
        num=(f'<span style="width:32px;height:32px;border-radius:50%;background:{top};color:#fff;'
             f'font-weight:800;font-size:17px;display:inline-flex;align-items:center;justify-content:center">{i+1}</span>')
        cell=(f'<div style="flex:1;display:flex"><div style="flex:1;background:#fff;border:1.5px solid #e8eaee;'
              f'border-top:4px solid {top};border-radius:13px;padding:15px 13px;box-shadow:0 1px 2px rgba(15,23,42,.05);'
              f'display:flex;flex-direction:column">'
              f'<div style="display:flex;align-items:center;justify-content:space-between">{num}{badge(ic,acc,44,25)}</div>'
              f'<div style="font-weight:700;font-size:18px;margin-top:12px;color:#0f172a">{t}</div>'
              f'<ul style="margin:9px 0 0 18px;padding:0">{lis}</ul></div></div>')
        cells.append(cell)
        if i<len(steps)-1:
            cells.append('<div style="display:flex;align-items:center;width:30px;justify-content:center;color:#c4b5fd;font-size:26px">&#9654;</div>')
    body = ('<div class="dtitle">WORKFLOW EXECUTION MODEL</div>'
            '<div class="dsub">A single ordered pass runs deterministic on-chain blocks, logic, and AI agents on one graph.</div>'
            '<style>#stage li{font-size:14px;color:#475569;line-height:1.55;margin-bottom:3px}</style>'
            '<div style="display:flex;align-items:stretch;margin-top:22px">'+"".join(cells)+'</div>'
            + legend([("Trigger","#6366f1"),("Load","#3b82f6"),("Graph build","#06b6d4"),("Ordering","#10b981"),
                      ("Execution","#f59e0b"),("Persistence","#f43f5e"),("Response","#8b5cf6")]))
    write("execflow.html", body, 1640)

# ---------- 3. PRIMITIVES ----------
def primitives():
    fams = [
     ("violet","zap","Triggers","Start a workflow by hand, on time, or from an event.",
       ["Manual","Schedule (cron)","Webhook","Chat message","Page event"]),
     ("green","link","On-Chain Primitives","Native blockchain reads and writes via viem &mdash; the defining family.",
       ["Wallet","Get Balance","Token Balance","Read Contract","Write Contract","Send Tx","ERC-20 Transfer","NFT Transfer","Sign Message","Event Trigger","Price Feed","Gas / Block","Tx Status","ENS"]),
     ("purple","cpu","AI &amp; Agents","Reasoning and language across providers, with memory and tools.",
       ["AI Agent","OpenAI","Anthropic","Google Gemini","Groq","Summarize","Extract","Classify","Sentiment","Q&amp;A Chain"]),
     ("blue","repeat","Logic &amp; Data","Branch, filter, and transform data between blocks.",
       ["If / Else","Switch","Merge","Filter","Edit Fields","Code (JS)"]),
     ("amber","wrench","Tools &amp; Actions","External calls and utilities a flow can invoke.",
       ["HTTP Request","Web Search","DuckDuckGo","Calculator","Google Sheets","API Caller"]),
     ("rose","monitor","Output &amp; UI","Return a response or render a result in a hosted page.",
       ["Respond to Chat","Content Viewer","Render UI Component","Readme Viewer"]),
    ]
    cells=[]
    for acc,ic,t,desc,chips in fams:
        bg,fg,top,*_=AC[acc]
        ch="".join(f'<span style="font-size:14.5px;font-weight:600;padding:6px 13px;border-radius:8px;'
                   f'background:{bg};color:{fg};border:1px solid {fg}33">{c}</span>' for c in chips)
        cell=(f'<div style="background:#fff;border:1.5px solid #e8eaee;border-radius:15px;overflow:hidden;'
              f'box-shadow:0 1px 3px rgba(15,23,42,.06)">'
              f'<div style="display:flex;align-items:center;gap:12px;padding:14px 17px;background:{top}">'
              f'<span class="badge" style="width:42px;height:42px;background:#ffffff33">{icon(ic,25,"#ffffff")}</span>'
              f'<span style="color:#fff;font-weight:700;font-size:19px">{t}</span></div>'
              f'<div style="padding:15px 17px 18px"><div style="font-size:14.5px;color:#475569;margin-bottom:12px;line-height:1.45">{desc}</div>'
              f'<div style="display:flex;flex-wrap:wrap;gap:8px">{ch}</div></div></div>')
        cells.append(cell)
    body=('<div class="dtitle">TAXONOMY OF COMPOSABLE PRIMITIVES</div>'
          '<div class="dsub">Typed building blocks combine freely on one canvas &mdash; a small set expresses a wide space of applications.</div>'
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:22px">'+"".join(cells)+'</div>'
          + legend([("Triggers","#6366f1"),("On-Chain","#10b981"),("AI &amp; Agents","#8b5cf6"),
                    ("Logic &amp; Data","#3b82f6"),("Tools &amp; Actions","#f59e0b"),("Output &amp; UI","#f43f5e")]))
    write("primitives.html", body, 1560)

# ---------- 4. HOSTING ----------
def hosting():
    def step(acc,ic,t,d):
        bg,fg,top,*_=AC[acc]
        return (f'<div style="flex:1;display:flex"><div style="flex:1;background:#fff;border:1.5px solid #e8eaee;'
                f'border-top:4px solid {top};border-radius:12px;padding:16px 13px;text-align:center;'
                f'box-shadow:0 1px 2px rgba(15,23,42,.05);display:flex;flex-direction:column;align-items:center">'
                f'{badge(ic,acc,50,28)}<div style="font-weight:700;font-size:17px;margin-top:11px;color:#0f172a">{t}</div>'
                f'<div style="font-size:14px;color:#475569;margin-top:6px;line-height:1.45">{d}</div></div></div>')
    def ar(c): return f'<div style="display:flex;align-items:center;width:34px;justify-content:center;color:{c};font-size:26px">&#9654;</div>'
    build = band("violet","Build Time &mdash; Builder",
        '<div style="display:flex">'+
        step("violet","palette","Assemble Page","Drag-and-drop blocks in the interface builder.")+ar("#a5b4fc")+
        step("violet","pointer","Mark Action Element","Tag a button / form as the action.")+ar("#a5b4fc")+
        step("violet","link","Bind to Workflow","Attach a workflow id to the element.")+ar("#a5b4fc")+
        step("violet","globe","Publish","Serve at a public per-page link.")+'</div>')
    run = band("green","Run Time &mdash; End User",
        '<div style="display:flex">'+
        step("green","mail","Open Link","Platform serves stored page; re-applies binding.")+ar("#6ee7b7")+
        step("green","keyboard","Submit Input","Embedded script gathers field values.")+ar("#6ee7b7")+
        step("green","settings","Run Bound Workflow","Calls the trigger endpoint; engine executes.")+ar("#6ee7b7")+
        step("green","check-circle","Show Result","On-chain result rendered in place.")+'</div>')
    note=(f'<div style="margin-top:18px;background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;'
          f'padding:14px 18px;display:flex;gap:12px;align-items:center">'
          f'{badge("pin","amber",40,23)}<span style="font-size:15px;color:#92400e">'
          f'<b>Binding persistence:</b> the workflow id is kept with the page and re-injected on every serve, so the '
          f'application stays wired to its logic even after the visual editor rewrites the page markup.</span></div>')
    body=('<div class="dtitle">INTERFACE BINDING &amp; HOSTING</div>'
          '<div class="dsub">A visual page is bound to a workflow and served at a shareable link &mdash; logic becomes a product.</div>'
          '<div style="height:18px"></div>'+build+
          '<div style="text-align:center;color:#64748b;font-size:16px;margin:12px 0;font-weight:600">&#9660;&nbsp; shareable link</div>'+
          run+note)
    write("hosting.html", body, 1500)

# ---------- 5. LIFECYCLE ----------
def lifecycle():
    nodes=[("violet","lightbulb","Idea","A useful on-chain automation in mind."),
           ("blue","puzzle","Compose","Wire blocks on the workflow canvas."),
           ("cyan","cpu","Augment","Add on-chain, AI, and logic blocks."),
           ("green","palette","Build &amp; Bind","Make a page; bind it to the workflow."),
           ("amber","globe","Host","Publish at a shareable link."),
           ("rose","rocket","Share","Anyone opens it and it runs.")]
    cells=[]
    for i,(acc,ic,t,d) in enumerate(nodes):
        bg,fg,top,*_=AC[acc]
        cell=(f'<div style="width:208px;background:#fff;border:1.5px solid #e8eaee;border-top:5px solid {top};'
              f'border-radius:14px;padding:18px 15px;text-align:center;box-shadow:0 2px 5px rgba(15,23,42,.07);'
              f'display:flex;flex-direction:column;align-items:center">'
              f'{badge(ic,acc,56,32)}<div style="font-weight:700;font-size:18px;margin-top:11px;color:#0f172a">{t}</div>'
              f'<div style="font-size:14px;color:#475569;margin-top:6px;line-height:1.45">{d}</div></div>')
        cells.append(cell)
        if i<len(nodes)-1:
            cells.append('<div style="width:52px;text-align:center;color:#a78bfa;font-size:30px;font-weight:700">&rarr;</div>')
    loop=('<div style="text-align:center;margin-top:26px"><span style="display:inline-flex;align-items:center;gap:12px;'
          'background:#eef2ff;border:1.5px dashed #c7d2fe;border-radius:30px;padding:13px 26px;color:#4338ca;'
          'font-weight:600;font-size:16px">&#8635;&nbsp; Iterate &mdash; refine the workflow or interface and re-publish, all without writing code</span></div>')
    body=('<div class="dtitle">FROM AN IDEA TO A HOSTED dAPP &mdash; NO CODE</div>'
          '<div class="dsub">The full path from logic to a shareable product happens on one platform.</div>'
          '<div style="display:flex;align-items:center;justify-content:center;margin-top:28px">'+"".join(cells)+'</div>'+loop)
    write("lifecycle.html", body, 1560)

arch(); execflow(); primitives(); hosting(); lifecycle()
print("done")
