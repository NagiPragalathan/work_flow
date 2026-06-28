# -*- coding: utf-8 -*-
"""Build the AgentFlow Web3 M.E. project report (.docx) following the CipherNest structure."""
import os, re
from docx import Document
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.shared import Pt, Inches, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.section import WD_SECTION, WD_ORIENT
from PIL import Image
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
FIG = os.path.join(BASE, "figures")

# -------- config --------
CFG = dict(
    title="AGENTFLOW WEB3: A NO-CODE, AI-ASSISTED PLATFORM FOR COMPOSING AND HOSTING DECENTRALIZED APPLICATIONS",
    student="NAGIPRAGALATHAN N",
    roll="110824405007",
    degree_line1="MASTER OF ENGINEERING",
    degree_field="COMPUTER SCIENCE AND ENGINEERING",
    college="JAYA ENGINEERING COLLEGE, THIRUNINRAVUR",
    univ="ANNA UNIVERSITY : CHENNAI 600 025",
    monthyear="JULY 2026",
    supervisor="Mr. J. LIN EBY CHANDRA",
    hod="Mr. J. LIN EBY CHANDRA",
    dept="Department of CSE",
    college2="Jaya Engineering College,",
    place="Thiruninravur – 602 024.",
    title_short="AGENTFLOW WEB3: A NO-CODE, AI-ASSISTED PLATFORM FOR COMPOSING AND HOSTING DECENTRALIZED APPLICATIONS",
)

doc = Document()

# ---- base styles ----
st = doc.styles["Normal"]
st.font.name = "Times New Roman"
st.font.size = Pt(12)
st._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
pf = st.paragraph_format
pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
pf.space_after = Pt(6)
pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

for hs, sz in [("Heading 1", 14), ("Heading 2", 13), ("Heading 3", 12.5)]:
    s = doc.styles[hs]
    s.font.name = "Times New Roman"
    s.font.size = Pt(sz)
    s.font.bold = True
    s.font.color.rgb = RGBColor(0, 0, 0)
    s._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    s.paragraph_format.space_before = Pt(10)
    s.paragraph_format.space_after = Pt(6)
    s.paragraph_format.keep_with_next = True

# margins
for sec in doc.sections:
    sec.page_width = Inches(8.27); sec.page_height = Inches(11.69)  # A4
    sec.left_margin = Inches(1.25); sec.right_margin = Inches(1.0)
    sec.top_margin = Inches(1.0); sec.bottom_margin = Inches(1.0)

USABLE = 6.0  # inches
TAB_RIGHT = 6.0

# ---------------- helpers ----------------
_bmid = [1000]
def add_bookmark(paragraph, name):
    _bmid[0] += 1
    s = OxmlElement("w:bookmarkStart"); s.set(qn("w:id"), str(_bmid[0])); s.set(qn("w:name"), name)
    e = OxmlElement("w:bookmarkEnd"); e.set(qn("w:id"), str(_bmid[0]))
    paragraph._p.insert(0, s); paragraph._p.append(e)

def _field(paragraph, instr, placeholder="0"):
    r = paragraph.add_run()
    b = OxmlElement("w:fldChar"); b.set(qn("w:fldCharType"), "begin")
    it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = instr
    sep = OxmlElement("w:fldChar"); sep.set(qn("w:fldCharType"), "separate")
    t = OxmlElement("w:t"); t.text = placeholder
    en = OxmlElement("w:fldChar"); en.set(qn("w:fldCharType"), "end")
    r._r.append(b); r._r.append(it); r._r.append(sep); r._r.append(t); r._r.append(en)
    return r

def page_numbers(section, fmt, start, align, different_first=False):
    sectPr = section._sectPr
    for el in sectPr.findall(qn("w:pgNumType")):
        sectPr.remove(el)
    pg = OxmlElement("w:pgNumType"); pg.set(qn("w:fmt"), fmt)
    if start is not None: pg.set(qn("w:start"), str(start))
    sectPr.append(pg)
    section.different_first_page_header_footer = different_first
    hdr = section.header
    hdr.is_linked_to_previous = False
    p = hdr.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_after = Pt(2)
    _field(p, " PAGE ", "1")
    for run in p.runs:
        run.font.name = "Times New Roman"; run.font.size = Pt(12)
    if different_first:
        # blank first-page header
        fp = section.first_page_header
        fp.is_linked_to_previous = False
        if not fp.paragraphs: fp.add_paragraph()

def slug(t):
    return "h_" + re.sub(r"[^a-z0-9]+", "_", t.lower()).strip("_")

def H1(text, bookmark=None, toc=True, center=False):
    p = doc.add_paragraph(text, style="Heading 1" if toc else "Normal")
    if not toc:
        p.runs[0].bold = True; p.runs[0].font.size = Pt(14)
    if center: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_bookmark(p, slug(text))
    if bookmark: add_bookmark(p, bookmark)
    return p

def H2(text):
    p = doc.add_paragraph(text, style="Heading 2")
    add_bookmark(p, slug(text)); return p

def H3(text):
    p = doc.add_paragraph(text, style="Heading 3")
    add_bookmark(p, slug(text)); return p

def para(text, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True):
    p = doc.add_paragraph(text)
    p.alignment = align
    if indent: p.paragraph_format.first_line_indent = Inches(0.4)
    return p

def bullets(items, sym="bullet"):
    style = "List Bullet" if sym == "bullet" else "List Number"
    for it in items:
        p = doc.add_paragraph(it, style=style)
        p.paragraph_format.space_after = Pt(3)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

def labeled(label, text):
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Inches(0.4)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r = p.add_run(label + ": "); r.bold = True
    p.add_run(text)
    return p

def figure(path, num, title, width=USABLE, bookmark=None):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8); p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(os.path.join(FIG, path), width=Inches(width))
    cap = doc.add_paragraph(); cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(10)
    r = cap.add_run(f"Fig {num}  {title}"); r.bold = True; r.font.size = Pt(11)
    if bookmark: add_bookmark(cap, bookmark)

def table_caption(num, title, bookmark=None):
    cap = doc.add_paragraph(); cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_before = Pt(3); cap.paragraph_format.space_after = Pt(10)
    r = cap.add_run(f"Table {num}  {title}"); r.bold = True; r.font.size = Pt(11)
    if bookmark: add_bookmark(cap, bookmark)

def make_table(headers, rows, col_widths=None, font=10.5):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = ""
        pr = hdr[i].paragraphs[0]; pr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = pr.add_run(h); run.bold = True; run.font.size = Pt(font); run.font.name = "Times New Roman"
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            pr = cells[i].paragraphs[0]
            pr.alignment = WD_ALIGN_PARAGRAPH.LEFT if i == len(row)-1 and False else (WD_ALIGN_PARAGRAPH.LEFT if i==1 else WD_ALIGN_PARAGRAPH.LEFT)
            run = pr.add_run(str(val)); run.font.size = Pt(font); run.font.name = "Times New Roman"
    if col_widths:
        for r in t.rows:
            for i, w in enumerate(col_widths):
                r.cells[i].width = Inches(w)
    # space after table
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

def _shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement("w:shd"); sh.set(qn("w:val"), "clear"); sh.set(qn("w:fill"), hexcolor)
    tcPr.append(sh)

def code_block(code):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.space_after = Pt(8); p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    for line in code.split("\n"):
        r = p.add_run(line + "\n"); r.font.name = "Consolas"; r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0x1a, 0x1a, 0x1a)
    _shade_para(p, "F4F5F7")

def _shade_para(p, hexcolor):
    pPr = p._p.get_or_add_pPr()
    sh = OxmlElement("w:shd"); sh.set(qn("w:val"), "clear"); sh.set(qn("w:fill"), hexcolor)
    pPr.append(sh)

def pagebreak():
    doc.add_page_break()

def center_block(lines):
    """lines: list of (text, bold, size, space_after) or (text, bold, size, space_after, italic)"""
    for ln in lines:
        text, bold, size, sa = ln[0], ln[1], ln[2], ln[3]
        italic = ln[4] if len(ln) > 4 else False
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(sa); p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
        if text == "":
            continue
        r = p.add_run(text); r.bold = bold; r.italic = italic
        r.font.size = Pt(size); r.font.name = "Times New Roman"
    return

# ====================================================================
# FRONT MATTER (Section 1 — roman numerals)
# ====================================================================

# ---- Title page ----  (matches reference: italic connectors, generous spacing)
center_block([("", False, 12, 18)])
center_block([
    (CFG["title"], True, 16, 30),
    ("A PROJECT REPORT", True, 13, 26),
    ("Submitted By", False, 12, 26, True),
    (f'{CFG["student"]} ({CFG["roll"]})', True, 13, 26),
    ("In partial fulfilment for the award of the degree", False, 12, 22, True),
    ("Of", False, 12, 22, True),
    (CFG["degree_line1"], True, 13, 22),
    ("IN", True, 12, 22),
    (CFG["degree_field"], False, 12, 40),
])
center_block([
    (CFG["college"], True, 13, 24),
    (CFG["univ"], True, 12, 22),
    (CFG["monthyear"], False, 12, 6),
])

# ---- Bonafide Certificate (page ii) ----
pagebreak()
center_block([
    (CFG["univ"], True, 13, 14),
    ("BONAFIDE CERTIFICATE", True, 14, 16),
])
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
p.add_run("Certified that this project report ")
r = p.add_run(f'“{CFG["title"]}”'); r.bold = True
p.add_run(f' is the bonafide work of ')
r = p.add_run(f'{CFG["student"]} ({CFG["roll"]})'); r.bold = True
p.add_run(" who carried out the project work under my supervision.")
doc.add_paragraph().paragraph_format.space_after = Pt(30)
# signatures table
t = doc.add_table(rows=1, cols=2); t.alignment = WD_TABLE_ALIGNMENT.CENTER
left, right = t.rows[0].cells
def sigcell(cell, role):
    cell.paragraphs[0].text = ""
    for txt, bold in [(CFG["hod"] if role=="hod" else CFG["supervisor"], True),
                      ("Head of the Department," if role=="hod" else "Supervisor,", False),
                      (CFG["dept"]+",", False), (CFG["college2"], False), (CFG["place"], False)]:
        pp = cell.add_paragraph(); pp.paragraph_format.space_after = Pt(2)
        pp.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
        rr = pp.add_run(txt); rr.bold = bold; rr.font.size = Pt(12)
sigcell(left, "hod"); sigcell(right, "sup")
# remove borders
for row in t.rows:
    for c in row.cells:
        tcPr = c._tc.get_or_add_tcPr()
        borders = OxmlElement("w:tcBorders")
        for edge in ("top","left","bottom","right"):
            e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"),"nil"); borders.append(e)
        tcPr.append(borders)
def _noborder(tbl):
    for row in tbl.rows:
        for c in row.cells:
            tcPr = c._tc.get_or_add_tcPr(); borders = OxmlElement("w:tcBorders")
            for edge in ("top","left","bottom","right"):
                e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"),"nil"); borders.append(e)
            tcPr.append(borders)

# ---- Viva-Voce Examination (page iii) ----
pagebreak()
center_block([
    (CFG["univ"], True, 13, 14),
    ("VIVA-VOCE EXAMINATION", True, 14, 16),
])
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
p.add_run("The viva-voce examination of the project work titled ")
r = p.add_run(f'“{CFG["title"]}”'); r.bold = True
p.add_run(f' submitted by ')
r = p.add_run(f'{CFG["student"]} ({CFG["roll"]})'); r.bold = True
p.add_run(" is held on ______________.")
doc.add_paragraph().paragraph_format.space_after = Pt(60)
t2 = doc.add_table(rows=1, cols=2); t2.alignment = WD_TABLE_ALIGNMENT.CENTER
a, b = t2.rows[0].cells
a.paragraphs[0].text=""; a.paragraphs[0].add_run("INTERNAL EXAMINER").bold=True
b.paragraphs[0].text=""; b.paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.RIGHT
b.paragraphs[0].add_run("EXTERNAL EXAMINER").bold=True
_noborder(t2)

# ---- Abstract (page iv) ----
pagebreak()
H1("ABSTRACT", bookmark="bm_abstract", center=True)
abstract = (
 "AgentFlow Web3 is a no-code, AI-assisted platform that lets anyone compose, run, and host "
 "decentralized applications without writing code. Building on a blockchain normally demands smart "
 "contract programming, careful key handling, low-level calls to blockchain nodes, and a separately "
 "built web interface, which keeps most useful Web3 ideas out of reach. The platform addresses this "
 "gap by making every on-chain action a first-class building block on a visual canvas that anyone can "
 "wire together with logic and artificial intelligence, attach to a drag-and-drop interface, and publish "
 "at a shareable link. A topological execution engine compiles a workflow into a dependency graph and "
 "runs deterministic on-chain primitives, conditional logic, and large language model agents in a single "
 "ordered pass, passing data between blocks through typed input and output handles. The on-chain "
 "primitives — wallet, balance, contract read and write, transfer, message signing, event queries, price "
 "feeds, chain state, and name resolution — are implemented over the viem Ethereum client, while agent "
 "blocks use a vendor-neutral interface so several model providers are interchangeable. An interface "
 "builder binds page elements to workflows and serves the result at a public per-page link, and an "
 "assistant supports authoring in plain language. Implemented as a single Next.js and TypeScript "
 "application with PostgreSQL storage through Prisma, the platform runs real on-chain workflows. "
 "Measured results show that the orchestration layer adds only a few milliseconds per workflow and that "
 "end-to-end time is set by the blockchain endpoint rather than by the platform, confirming that raising "
 "the level of abstraction does not make the resulting applications slow. Because the building blocks are "
 "general, the same canvas expresses a wide space of applications — from decentralized finance and "
 "trading to creator tools, organizations, payments, monitoring, identity, and autonomous agents."
)
para(abstract, indent=False)

# ---- registries for lists ----
FIGURES = [
 ("3.1","AgentFlow Web3 System Architecture","bm_fig_3_1"),
 ("3.2","Use Case Diagram","bm_fig_3_2"),
 ("3.3","Sequence Diagram","bm_fig_3_3"),
 ("3.4","Workflow Execution Model","bm_fig_3_4"),
 ("3.5","Taxonomy of Composable Primitives","bm_fig_3_5"),
 ("3.6","Interface Binding and Hosting Flow","bm_fig_3_6"),
 ("3.7","Idea-to-dApp Lifecycle","bm_fig_3_7"),
 ("3.8","Visual Workflow Builder Interface","bm_fig_3_8"),
 ("3.9","Interface (Page) Builder","bm_fig_3_9"),
 ("6.1","Median Workflow Execution Latency","bm_fig_6_1"),
 ("A.1","Workflows Dashboard Interface","bm_fig_a_1"),
 ("A.2","Visual Workflow Builder Interface","bm_fig_a_2"),
 ("A.3","Interface (Page) Builder Interface","bm_fig_a_3"),
 ("A.4","dApps Gallery Interface","bm_fig_a_4"),
 ("A.5","Hosted dApp Page Interface","bm_fig_a_5"),
]
TABLES = [
 ("4.1","Core Platform API Endpoints","bm_tbl_4_1"),
 ("5.1","Testing Tools and Environments","bm_tbl_5_1"),
 ("5.2","Workflow Execution Latency over Seven Runs","bm_tbl_5_2"),
 ("5.3","Orchestration Overhead Summary","bm_tbl_5_3"),
 ("5.4","Test Result Summary","bm_tbl_5_4"),
 ("6.1","Functional Validation of On-Chain Workflows","bm_tbl_6_1"),
 ("6.2","Native Capability Comparison","bm_tbl_6_2"),
]

def list_with_pagerefs(headers, rows, bmcol_index, col_widths):
    """rows: each row's last logical element is a bookmark for PAGEREF; build a 3-col list table."""
    t = doc.add_table(rows=1, cols=len(headers)); t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i,h in enumerate(headers):
        c = t.rows[0].cells[i]; c.text=""
        pr=c.paragraphs[0]; pr.alignment=WD_ALIGN_PARAGRAPH.CENTER
        rr=pr.add_run(h); rr.bold=True; rr.font.size=Pt(11)
    for num, title, bm in rows:
        cells = t.add_row().cells
        cells[0].text=""; p0=cells[0].paragraphs[0]; p0.alignment=WD_ALIGN_PARAGRAPH.CENTER
        p0.add_run(num).font.size=Pt(11)
        cells[1].text=""; p1=cells[1].paragraphs[0]
        p1.add_run(title).font.size=Pt(11)
        cells[2].text=""; p2=cells[2].paragraphs[0]; p2.alignment=WD_ALIGN_PARAGRAPH.CENTER
        _field(p2, f" PAGEREF {bm} \\h ", "0")
        for rn in p2.runs: rn.font.size=Pt(11)
    for r in t.rows:
        for i,w in enumerate(col_widths): r.cells[i].width=Inches(w)
    return t

# ---- Table of Contents (page v) ----
TOC_LIST = [
 (0,"ABSTRACT"),(0,"LIST OF TABLES"),(0,"LIST OF FIGURES"),
 (0,"LIST OF SYMBOLS, ABBREVIATIONS & DEFINITIONS"),(-1,""),
 (0,"1. INTRODUCTION"),(1,"1.1 SYSTEM OVERVIEW"),(1,"1.2 OBJECTIVE"),(1,"1.3 SYSTEM STUDY"),
 (2,"1.3.1 Existing System"),(2,"1.3.2 Literature Survey"),(2,"1.3.3 Proposed System"),
 (1,"1.4 ORGANIZATION OF THE REPORT"),(-1,""),
 (0,"2. SOFTWARE REQUIREMENTS SPECIFICATION"),(1,"2.1 EXTERNAL INTERFACE REQUIREMENTS"),
 (1,"2.2 SYSTEM FEATURES"),(2,"2.2.1 Visual Workflow Authoring Module"),
 (2,"2.2.2 On-Chain Primitive Module"),(2,"2.2.3 AI Agent and Orchestration Module"),
 (2,"2.2.4 Interface Builder and Binding Module"),(2,"2.2.5 Hosting and Publishing Module"),
 (2,"2.2.6 Scheduling and Triggers Module"),(2,"2.2.7 Assisted Authoring Module"),
 (1,"2.3 OTHER NON-FUNCTIONAL REQUIREMENTS"),(-1,""),
 (0,"3. SOFTWARE DESIGN"),(1,"3.1 ARCHITECTURAL DESIGN"),(2,"3.1.1 System Architecture"),
 (2,"3.1.2 Use Case Diagram"),(2,"3.1.3 Sequence Diagram"),(1,"3.2 DECOMPOSITION DESCRIPTION"),
 (2,"3.2.1 Workflow Execution Engine"),(2,"3.2.2 On-Chain Primitive Engine"),
 (2,"3.2.3 AI Agent Engine"),(2,"3.2.4 Interface Binding and Hosting Engine"),
 (2,"3.2.5 Scheduler"),(1,"3.3 COMPONENT DESIGN"),(1,"3.4 DATA DESIGN"),
 (1,"3.5 HUMAN INTERFACE DESIGN"),(-1,""),
 (0,"4. IMPLEMENTATION"),(1,"4.1 SOFTWARE ENVIRONMENT"),(1,"4.2 PROJECT STRUCTURE"),
 (1,"4.3 FRONTEND IMPLEMENTATION"),(1,"4.4 BACKEND IMPLEMENTATION"),(1,"4.5 API ENDPOINTS"),
 (1,"4.6 DATABASE SCHEMAS"),(-1,""),
 (0,"5. TEST PLAN AND TESTING"),(1,"5.1 TESTING LEVELS"),(1,"5.2 TESTING TOOLS"),
 (1,"5.3 TEST CASES"),(1,"5.4 PERFORMANCE TESTING"),(1,"5.5 TEST RESULT SUMMARY"),
 (1,"5.6 DEFECTS AND RESOLUTIONS"),(-1,""),
 (0,"6. RESULTS AND OBSERVATIONS"),(1,"6.1 FUNCTIONAL VALIDATION"),(1,"6.2 EXECUTION LATENCY"),
 (1,"6.3 CAPABILITY COMPARISON"),(1,"6.4 OBSERVATIONS"),(-1,""),
 (0,"7. CONCLUSION AND FUTURE WORK"),(1,"7.1 CONCLUSION"),(1,"7.2 FUTURE WORK"),(-1,""),
 (0,"APPENDIX"),(0,"REFERENCES"),
]
def toc_entry(level, text):
    if level == -1:
        doc.add_paragraph().paragraph_format.space_after = Pt(2); return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    p.paragraph_format.space_after = Pt(6 if level == 0 else 3)
    indent = {0:0.0, 1:0.35, 2:0.7}[level]
    p.paragraph_format.left_indent = Inches(indent)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(TAB_RIGHT), WD_TAB_ALIGNMENT.RIGHT)
    r = p.add_run(text); r.bold = (level == 0); r.font.size = Pt(12); r.font.name = "Times New Roman"
    rt = p.add_run("\t"); rt.font.size = Pt(12)
    _field(p, f" PAGEREF {slug(text)} \\h ", "0")
    for rr in p.runs: rr.font.name = "Times New Roman"; rr.font.size = Pt(12)

pagebreak()
H1("TABLE OF CONTENTS", toc=False, center=True)
ph = doc.add_paragraph(); ph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
ph.paragraph_format.space_after = Pt(8)
rh = ph.add_run("PAGE NO."); rh.bold = True; rh.font.size = Pt(12)
for lvl, txt in TOC_LIST:
    toc_entry(lvl, txt)

# ---- List of Tables ----
pagebreak()
H1("LIST OF TABLES", bookmark="bm_lot", toc=False, center=True)
list_with_pagerefs(["Table No.","Table Name","Page No."], TABLES, 2, [1.1, 3.9, 1.0])

# ---- List of Figures ----
pagebreak()
H1("LIST OF FIGURES", bookmark="bm_lof", toc=False, center=True)
list_with_pagerefs(["Figure No.","Figure Name","Page No."], FIGURES, 2, [1.1, 3.9, 1.0])

# ---- List of Symbols, Abbreviations & Definitions ----
pagebreak()
H1("LIST OF SYMBOLS, ABBREVIATIONS & DEFINITIONS", toc=False, center=True)
def defline(term, desc, bold_term=True):
    p = doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_after=Pt(3); p.paragraph_format.line_spacing_rule=WD_LINE_SPACING.SINGLE
    r=p.add_run(term); r.bold=bold_term
    p.add_run("  —  "+desc)
sub = doc.add_paragraph(); sub.add_run("SYMBOLS").bold=True
for s,d in [("→","Data / control flow between blocks"),
            ("◇","Decision / conditional branch"),
            ("▭","Building block (node)"),
            ("⬤","Persistent data store (PostgreSQL)"),
            ("⇄","Bidirectional communication"),
            ("⛓","On-chain interaction")]:
    defline(s,d,False)
sub = doc.add_paragraph(); sub.add_run("ABBREVIATIONS").bold=True
for s,d in [("AI","Artificial Intelligence"),("LLM","Large Language Model"),
            ("dApp","Decentralized Application"),("Web3","Decentralized, user-owned web"),
            ("DAG","Directed Acyclic Graph"),("EVM","Ethereum Virtual Machine"),
            ("RPC","Remote Procedure Call"),("ERC","Ethereum Request for Comments (token standard)"),
            ("NFT","Non-Fungible Token"),("ENS","Ethereum Name Service"),
            ("DeFi","Decentralized Finance"),("DAO","Decentralized Autonomous Organization"),
            ("API","Application Programming Interface"),("UI","User Interface"),
            ("ORM","Object–Relational Mapping"),("L2","Layer-2 scaling network"),
            ("AA","Account Abstraction")]:
    defline(s,d)
# definitions on next page (x)
pagebreak()
H1("DEFINITIONS", toc=False, center=True)
DEFS = [
 ("No-Code Development","Building working software by visually configuring and connecting blocks instead of writing source code."),
 ("Workflow","A set of building blocks and directed connections that the engine runs in dependency order."),
 ("Building Block (Node)","A typed unit of behaviour — a trigger, on-chain action, logic step, AI agent, tool, or output."),
 ("On-Chain Primitive","A native blockchain action (read or write) exposed as a building block over the viem client."),
 ("Topological Sort","An ordering of a directed acyclic graph in which every block runs only after the blocks feeding it."),
 ("Typed Handle","A named input or output port on a block through which values pass to connected blocks."),
 ("LLM Agent","A block that calls a large language model to reason, extract, classify, or converse, optionally with memory and tools."),
 ("Interface Binding","The link between a page action element (such as a button) and the workflow it runs."),
 ("Hosting","Serving a built interface at a public, shareable per-page link so anyone can use the application."),
 ("Composability","The property by which a small set of general blocks, combined freely, expresses a wide space of applications."),
 ("Smart Contract","A program deployed on a blockchain whose functions can be read or invoked by transactions."),
 ("Oracle","An external data source, such as a price feed, made available to on-chain logic."),
]
for term, desc in DEFS:
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after=Pt(5)
    r=p.add_run(term+": "); r.bold=True
    p.add_run(desc)

print("front matter done")

# ====================================================================
# BODY (Section 2 — decimal numerals, restart at 1)
# ====================================================================
body_section = doc.add_section()  # sections[1]
body_section.left_margin = Inches(1.25); body_section.right_margin = Inches(1.0)
body_section.top_margin = Inches(1.0); body_section.bottom_margin = Inches(1.0)

def chapter_divider(n, title, lead_break=True):
    if lead_break:
        pagebreak()
    for _ in range(6): doc.add_paragraph()
    label = f"CHAPTER {n}" if str(n) != "" else ""
    lines = []
    if label: lines.append((label, True, 16, 14))
    lines.append((title, True, 16, 6))
    center_block(lines)

FIGMAP = {
 "3.1":("fig_architecture.png","bm_fig_3_1"),"3.2":("fig_usecase.png","bm_fig_3_2"),
 "3.3":("fig_sequence.png","bm_fig_3_3"),"3.4":("fig_execflow.png","bm_fig_3_4"),
 "3.5":("fig_primitives.png","bm_fig_3_5"),"3.6":("fig_hosting.png","bm_fig_3_6"),
 "3.7":("fig_lifecycle.png","bm_fig_3_7"),"3.8":("ss_builder2.png","bm_fig_3_8"),
 "3.9":("ss_pagebuilder2.png","bm_fig_3_9"),"6.1":("fig_latency.png","bm_fig_6_1"),
 "A.1":("ss_dashboard.png","bm_fig_a_1"),"A.2":("ss_builder2.png","bm_fig_a_2"),
 "A.3":("ss_pagebuilder2.png","bm_fig_a_3"),"A.4":("ss_dapps.png","bm_fig_a_4"),
 "A.5":("ss_hosted_dapp.png","bm_fig_a_5"),
}
FIGTITLE = {n:t for n,t,_ in FIGURES}

def _valign(sec, val):
    sectPr = sec._sectPr
    for el in sectPr.findall(qn("w:vAlign")): sectPr.remove(el)
    v = OxmlElement("w:vAlign"); v.set(qn("w:val"), val); sectPr.append(v)

def _set_section(sec, landscape):
    if landscape:
        sec.orientation = WD_ORIENT.LANDSCAPE
        sec.page_width = Inches(11.69); sec.page_height = Inches(8.27)
        sec.left_margin = Inches(0.7); sec.right_margin = Inches(0.7)
        sec.top_margin = Inches(0.55); sec.bottom_margin = Inches(0.55)
        _valign(sec, "center")
    else:
        sec.orientation = WD_ORIENT.PORTRAIT
        sec.page_width = Inches(8.27); sec.page_height = Inches(11.69)
        sec.left_margin = Inches(1.25); sec.right_margin = Inches(1.0)
        sec.top_margin = Inches(1.0); sec.bottom_margin = Inches(1.0)

def _fit_width(path, max_w=10.2, max_h=6.1):
    iw, ih = Image.open(path).size
    r = iw / ih
    return round(min(max_w, max_h * r), 2)

def fig(num):
    """Place a figure on its own full-page landscape sheet for maximum print readability."""
    f, bm = FIGMAP[num]
    path = os.path.join(FIG, f)
    s1 = doc.add_section(WD_SECTION.NEW_PAGE); _set_section(s1, True)
    figure(f, num, FIGTITLE[num], width=_fit_width(path), bookmark=bm)
    s2 = doc.add_section(WD_SECTION.NEW_PAGE); _set_section(s2, False)
TBLTITLE = {n:t for n,t,_ in TABLES}
TBLBM = {n:b for n,t,b in TABLES}
def tbl_cap(num):
    table_caption(num, TBLTITLE[num], bookmark=TBLBM[num])

# ============================ CHAPTER 1 ============================
chapter_divider(1, "INTRODUCTION", lead_break=False)
pagebreak()
H1("1. INTRODUCTION")
H2("1.1 SYSTEM OVERVIEW")
para("AgentFlow Web3 is a no-code, AI-assisted platform developed to make the creation of decentralized "
 "applications accessible to people who are not blockchain engineers. Web3 technology gives users ownership "
 "of data, money, and digital assets without a central authority, yet turning an idea into a working "
 "decentralized application still requires smart contract programming, careful private-key handling, "
 "low-level calls to blockchain nodes, and a separately built web interface. As a result, the space of useful "
 "Web3 ideas is far larger than the small group of engineers able to build them.")
para("The platform closes this gap by raising the level of abstraction. Every on-chain action is treated as a "
 "first-class building block that a user can place on a visual canvas, wire together with logic and artificial "
 "intelligence, attach to a drag-and-drop interface, and publish at a shareable link — all without writing "
 "code. Because the building blocks are general, the same canvas can express a very wide range of "
 "applications, from decentralized finance automation and trading to non-fungible-token workflows, "
 "decentralized organizations, payments, on-chain monitoring, identity, and autonomous agents that read and "
 "act on chain state.")
para("The system is implemented as a single Next.js and TypeScript application. A topological execution "
 "engine compiles each workflow into a dependency graph and runs its blocks in order; a capabilities layer "
 "provides native on-chain primitives over the viem Ethereum client and large language model agents through a "
 "vendor-neutral interface; a composition and hosting layer binds interfaces to workflows and serves them at "
 "public links; and a PostgreSQL database, accessed through Prisma, stores workflows, pages, runs, and "
 "settings. An assistant supports the user throughout, answering questions about blocks and workflows in plain "
 "language while keeping the workflow fully visible and editable.")

H2("1.2 OBJECTIVE")
para("The primary objective of AgentFlow Web3 is to develop a no-code, AI-assisted platform capable of "
 "composing, running, and hosting decentralized applications through a single visual surface, while keeping "
 "the orchestration overhead negligible so that the achievable speed of an application is set by the "
 "blockchain endpoint rather than by the platform. The specific objectives are:")
bullets([
 "To make every on-chain action a configurable building block so that a user can read a balance, call a "
 "contract, transfer value, sign a message, or react to an event by placing a block and filling in a few fields.",
 "To provide a topological execution engine that compiles a workflow into a dependency graph, rejects cycles "
 "and unreachable blocks, and runs deterministic on-chain blocks, conditional logic, and AI agents in one ordered pass.",
 "To pass data between blocks through typed input and output handles so that blockchain reads and writes "
 "combine as freely as ordinary logic and artificial intelligence.",
 "To integrate large language model agents through a vendor-neutral interface so that several model providers "
 "are interchangeable, with optional memory and tools.",
 "To provide a drag-and-drop interface builder that binds page elements to workflows and hosts the result at "
 "a shareable per-page link, turning logic into a usable product.",
 "To support assisted authoring through an in-platform assistant that guides building without hiding the workflow.",
 "To validate the approach on real on-chain workflows and measure the orchestration overhead the paradigm introduces.",
 "To design an extensible architecture that can support future enhancements such as account abstraction, "
 "multi-network composition, and a shared marketplace of workflow and interface bundles.",
])

H2("1.3 SYSTEM STUDY")
H3("1.3.1 Existing System")
para("Mainstream visual automation platforms let users express logic by connecting configurable blocks, and "
 "low-code and no-code technology now accounts for a large and growing share of new software. However, these "
 "tools expose no native blockchain actions; any on-chain interaction must be expressed through generic web-"
 "request nodes that demand manual encoding of calls, signatures, and node endpoints. On the other side, "
 "Web3 developer toolkits and contract frameworks provide powerful on-chain capability but assume a programmer "
 "who can write contracts and front-end code. Most existing solutions therefore address either the building "
 "experience or the blockchain capability, but not both, and a builder who wants the full path from logic to a "
 "shareable product must combine several tools manually.")
para("Furthermore, recent work that joins large language models with blockchains is aimed largely at auditing "
 "contracts or coordinating machines rather than at helping a person build. The lack of a unified, no-code "
 "surface that treats on-chain actions as native blocks, composes them with AI, and hosts the result creates "
 "fragmentation, a steep learning curve, and a high barrier to entry for non-experts.")
H3("1.3.2 Literature Survey")
para("Visual automation has grown from a convenience into a mainstream way of building software. Node-graph "
 "tools let people express logic by connecting configurable blocks, and industry analyses report that "
 "workflow automation is among the leading uses of no-code technology. A clear recent trend is the blending of "
 "automation with artificial intelligence, which turns fixed pipelines into systems that can decide at run time.")
para("Large language models have driven a wave of work on agents that reason and act over several steps. The "
 "ReAct method showed that interleaving reasoning with actions lets a model build and revise a plan while "
 "gathering information from outside sources. Tool use and multi-agent coordination followed, and benchmarks "
 "such as FlowBench report that explicit, flowchart-style workflow structure helps language-model agents plan "
 "most effectively — a finding that supports exposing an explicit, editable graph to the user.")
para("The Web3 stack itself rests on well-defined standards: a general-purpose contract platform provides the "
 "execution layer, fungible and non-fungible token standards define the assets that most applications touch, "
 "oracle networks bring outside data such as price feeds on chain, and account abstraction points toward smart "
 "accounts that improve usability. Node-based visual programming and assisted website builders provide the "
 "interface side. AgentFlow Web3 draws these lines together, applying the familiar node-graph style to native "
 "on-chain actions and joining the visual interface to the visual logic in one hostable platform.")
H3("1.3.3 Proposed System")
para("AgentFlow Web3 introduces a unified no-code, AI-assisted paradigm in which on-chain actions are native "
 "blocks on a visual canvas. A user composes a workflow by connecting blocks, augments it with logic and AI "
 "agents, attaches it to a drag-and-drop interface, and publishes the result at a shareable link, with an "
 "assistant available throughout. A topological engine runs the workflow as a single ordered pass, so the same "
 "model expresses a simple balance check and a multi-step automation that reasons and then acts on chain.")
para("Advantages of the proposed system over existing approaches are summarized below.")
labeled("Advantages of the Proposed System", "")
bullets([
 "Native on-chain blocks remove the constant context-switching that fragments normal Web3 work.",
 "A small set of general primitives, combined freely, expresses a wide space of applications.",
 "Deterministic on-chain blocks, conditional logic, and AI agents run inside one ordered execution pass.",
 "An interface builder binds pages to workflows and hosts them, so logic becomes a shareable product.",
 "The orchestration overhead is only a few milliseconds, so the no-code abstraction is effectively free.",
])

H2("1.4 ORGANIZATION OF THE REPORT")
para("The remainder of this report is organized as follows. Chapter 2 presents the software requirements "
 "specification, including external interfaces, system features, and non-functional requirements. Chapter 3 "
 "describes the software design, covering the architectural design, use-case and sequence models, the "
 "decomposition of the platform into engines, the component and data design, and the human interface design. "
 "Chapter 4 details the implementation, including the software environment, project structure, frontend and "
 "backend implementation, API endpoints, and database schemas. Chapter 5 presents the test plan and testing. "
 "Chapter 6 reports results and observations. Chapter 7 concludes the report and outlines future work, "
 "followed by an appendix of interface screenshots and the list of references.")

# ============================ CHAPTER 2 ============================
chapter_divider(2, "SOFTWARE REQUIREMENTS SPECIFICATION")
pagebreak()
H1("2. SOFTWARE REQUIREMENTS SPECIFICATION")
para("This chapter specifies the functional and non-functional requirements of the AgentFlow Web3 platform. "
 "It defines the external interfaces through which the system interacts with users and external services, the "
 "principal system features, and the quality attributes the platform is expected to satisfy.")
H2("2.1 EXTERNAL INTERFACE REQUIREMENTS")
labeled("User Interfaces", "A web-based single-page application provides the workflow canvas, the interface "
 "builder, the dApps gallery, and the assistant. The canvas is a node-graph editor; the interface builder is a "
 "drag-and-drop page editor; and every hosted application is reachable through a public per-page link.")
labeled("Software Interfaces", "The platform talks to EVM blockchain nodes over JSON-RPC through the viem "
 "client, to large language model providers (OpenAI, Anthropic, Google, and Groq) through a vendor-neutral "
 "interface, to oracle price feeds and external HTTP APIs, and to a PostgreSQL database through the Prisma ORM.")
labeled("Hardware Interfaces", "The platform is hardware-agnostic and runs on a standard server or cloud host; "
 "clients require only a modern web browser. On-chain work depends on network access to a blockchain RPC endpoint.")
labeled("Communication Interfaces", "Clients communicate with the server over HTTPS using JSON request and "
 "response bodies. Authenticated sessions use signed JSON Web Token cookies, while hosted pages call a public "
 "trigger endpoint to run their bound workflows.")
H2("2.2 SYSTEM FEATURES")
H3("2.2.1 Visual Workflow Authoring Module")
para("Provides the node-graph canvas on which a user composes a workflow by adding blocks and drawing typed "
 "connections between them. The module supports searching a categorized node library, configuring each block "
 "through a settings panel, validating the graph, and saving the workflow.")
H3("2.2.2 On-Chain Primitive Module")
para("Exposes blockchain actions as native blocks implemented over the viem client: wallet and signer, native "
 "and token balance reads, contract read and write, native and ERC-20 and NFT transfers, message signing, "
 "event queries, price feeds, chain-state reads, transaction status, and name resolution. Blocks target a "
 "selectable network, including a local development chain.")
H3("2.2.3 AI Agent and Orchestration Module")
para("Provides agent blocks that call large language models for reasoning, extraction, classification, and "
 "natural-language replies, with optional memory and tools. A topological execution engine compiles the "
 "workflow into a dependency graph, computes a valid run order, and executes deterministic on-chain blocks, "
 "logic, and agents in a single ordered pass.")
H3("2.2.4 Interface Builder and Binding Module")
para("Lets a user assemble a page from drag-and-drop blocks and mark an action element, such as a button, as "
 "bound to a workflow. The binding is stored with the page so the application stays wired to its logic even "
 "after the visual editor rewrites the page markup.")
H3("2.2.5 Hosting and Publishing Module")
para("Serves each published page at a public per-page link. A small embedded script on the page gathers field "
 "values, runs the bound workflow through the trigger endpoint, and renders the result in place.")
H3("2.2.6 Scheduling and Triggers Module")
para("Starts workflows manually, on a schedule expressed as a cron expression, from a webhook, or from a chat "
 "or page event. An in-process scheduler periodically checks for due workflows and runs them.")
H3("2.2.7 Assisted Authoring Module")
para("Provides an assistant that answers questions about blocks and workflows in plain language, keeps a short "
 "conversation history, and routes requests to a chosen model backend, without hiding the workflow from the user.")
H2("2.3 OTHER NON-FUNCTIONAL REQUIREMENTS")
labeled("Performance", "The orchestration layer must add only a few milliseconds of overhead per workflow so "
 "that end-to-end time is dominated by the blockchain endpoint rather than by the platform.")
labeled("Usability", "A non-expert must be able to compose, bind, and publish an application without writing code.")
labeled("Reliability", "Workflow execution must be deterministic: a block runs only after the blocks feeding it "
 "have finished, and graphs with cycles or unreachable blocks are rejected before execution.")
labeled("Security", "Authenticated routes require a valid session token; credentials are stored per user; and "
 "hosted pages run only their explicitly bound workflow through the public trigger endpoint.")
labeled("Maintainability", "Layers communicate through clear interfaces so that new primitives can be added "
 "without disturbing the rest of the system.")
labeled("Portability", "Because blocks target a selectable network, the same workflow can run against a local "
 "development chain or a public network without redesign.")

# ============================ CHAPTER 3 ============================
chapter_divider(3, "SOFTWARE DESIGN")
pagebreak()
H1("3. SOFTWARE DESIGN")
para("This chapter presents the software design of AgentFlow Web3, beginning with the overall architecture and "
 "the principal design models, followed by the decomposition of the platform into cooperating engines, the "
 "component and data design, and the human interface design.")
H2("3.1 ARCHITECTURAL DESIGN")
H3("3.1.1 System Architecture")
para("The platform is organized as a set of layers, shown in Fig 3.1. A visual authoring layer hosts the "
 "workflow canvas, the interface builder, and the assistant. An orchestration layer compiles a workflow into a "
 "dependency graph and runs its blocks in order. A capabilities layer provides two families of power, namely "
 "on-chain primitives and large language model agents, alongside logic and data blocks. A composition and "
 "hosting layer binds an interface to a workflow and serves the result at a public link. A state layer stores "
 "the workflows, pages, runs, credentials, and settings. The layers communicate through clear interfaces, so "
 "each can change without disturbing the others, and new primitives can be added without touching the rest of "
 "the system.")
fig("3.1")
para("The visual authoring layer is implemented with React and the React Flow node-graph library for the "
 "canvas and the GrapesJS studio for the interface builder. The orchestration layer is a TypeScript execution "
 "engine. The capabilities layer wraps the viem Ethereum client and a vendor-neutral large language model "
 "interface. The composition and hosting layer serves stored pages and re-applies their workflow bindings. The "
 "state layer is a PostgreSQL database accessed through the Prisma ORM.")
H3("3.1.2 Use Case Diagram")
para("The use-case diagram in Fig 3.2 captures the interactions between the system and its two principal "
 "actors: the Builder, who composes workflows and pages, and the End User, who opens a hosted dApp and runs "
 "its bound workflow. The Builder registers and logs in, composes a workflow on the canvas, configures and "
 "tests blocks, builds an interface page, binds it to a workflow, publishes the dApp, uses the assistant, and "
 "may save a workflow as a reusable template. Adding an on-chain block or an AI agent block extends the compose-"
 "workflow use case, while binding the user interface to a workflow is included by the build-interface-page use "
 "case. The End User opens the hosted dApp, submits input, runs the bound workflow, and views the on-chain result.")
fig("3.2")
H3("3.1.3 Sequence Diagram")
para("The sequence diagram in Fig 3.3 describes the end-to-end execution of a hosted workflow, using the "
 "send-and-confirm example. The flow begins when an end user clicks an action button on a hosted page; the "
 "embedded runner gathers the field values and posts them, with the workflow identifier, to the trigger "
 "endpoint. The server loads the workflow definition from the database and invokes the execution engine, which "
 "builds the dependency graph and computes a topological order. The engine then runs the blocks in order — the "
 "wallet block produces an account and signer, the send block submits a transaction through the viem client, "
 "and the transaction-status block reads back the receipt. Finally the engine persists the execution states "
 "and returns a result that the embedded runner renders in place.")
fig("3.3")
H2("3.2 DECOMPOSITION DESCRIPTION")
para("The platform decomposes into cooperating engines coordinated by the orchestration layer. Each engine has "
 "a focused responsibility and communicates through typed data.")
H3("3.2.1 Workflow Execution Engine")
para("The execution engine is the heart of the orchestration layer. As shown in Fig 3.4, it loads the workflow, "
 "builds a dependency graph from the blocks and their connections, computes a topological order using Kahn's "
 "algorithm, and runs each block once the blocks feeding it have finished. For every block it gathers inputs "
 "from upstream outputs by matching the typed handle on each connection, dispatches to the appropriate "
 "executor, stores the outputs by handle, and records per-block state. A graph containing a cycle or an "
 "unreachable block is rejected before execution.")
fig("3.4")
H3("3.2.2 On-Chain Primitive Engine")
para("The on-chain primitive engine implements the blockchain blocks over the viem client. It resolves the "
 "target network and RPC endpoint, constructs public clients for reads and wallet clients for writes, and "
 "exposes wallet, balance, contract read and write, transfer, signing, event, price-feed, chain-state, "
 "transaction-status, and name-resolution capabilities. Built-in ABIs for fungible tokens, non-fungible "
 "tokens, and price feeds let these blocks operate without the user supplying low-level encoding details.")
H3("3.2.3 AI Agent Engine")
para("The AI agent engine runs the agent and language-model blocks. It detects the provider from the chosen "
 "model, initializes a vendor-neutral client, and generates text with optional tools and memory. Memory may be "
 "an in-process sliding window or a database-backed conversation history scoped to a workflow and block, so an "
 "agent can carry context across turns.")
H3("3.2.4 Interface Binding and Hosting Engine")
para("This engine, shown in Fig 3.6, binds a page action element to a workflow at build time and serves the "
 "page at a public link at run time. The workflow identifier is kept with the page and re-injected on every "
 "serve, so the application stays wired to its logic even after the editor rewrites the markup. At run time an "
 "embedded script gathers input, calls the trigger endpoint, and renders the result in place.")
fig("3.6")
H3("3.2.5 Scheduler")
para("The scheduler is an in-process component that periodically checks for workflows whose cron schedule is "
 "due and runs them through the execution engine, recording the last run time. It is suitable for a single-"
 "server deployment and can be replaced by a distributed job queue at scale.")
H2("3.3 COMPONENT DESIGN")
para("The expressive power of the platform comes from a library of typed building blocks that combine on the "
 "canvas. Fig 3.5 organizes these primitives into families: triggers that start a workflow; on-chain "
 "primitives that make blockchain actions native; AI and agent blocks for reasoning and language; logic and "
 "data blocks that branch, filter, and transform; tools and actions for external calls; and output and "
 "interface blocks that return a response or render a result. The set is representative rather than fixed, "
 "since the same pattern extends to further standards and networks.")
fig("3.5")
para("Each block declares typed input and output handles. A connection carries the output of one block to a "
 "named input of another, which lets a wallet block feed a transfer block on a dedicated input while the main "
 "flow continues on its own path. Because deterministic on-chain blocks, conditional logic, and language model "
 "agents all run inside one ordered pass, the same component model expresses a simple read and a multi-step "
 "automation that reasons and then acts on chain.")
H2("3.4 DATA DESIGN")
para("Application state is stored in a PostgreSQL database through the Prisma ORM. A workflow stores its blocks "
 "and connections as JSON together with scheduling fields; an execution records its status, the order in which "
 "blocks ran, and per-block states; an interface project stores the page components and the workflow binding; "
 "a memory collection and its messages store conversation history; a credential stores per-user provider keys; "
 "and an exported workflow stores a shareable template bundle. The detailed schema is presented in Section 4.6.")
H2("3.5 HUMAN INTERFACE DESIGN")
para("The human interface is designed around two visual surfaces. The workflow builder, shown in Fig 3.8, "
 "presents a categorized node library on the left and an infinite canvas on the right, where blocks are placed "
 "and connected; a toolbar provides fit, execute, and view controls, and a log panel reports execution "
 "results. The interface builder, shown in Fig 3.9, presents a block palette, a live page canvas, and a style "
 "inspector, with controls to bind elements to workflows and to publish the page.")
fig("3.8")
fig("3.9")
para("Together these surfaces form the loop shown in Fig 3.7: a user moves from an idea to a composed "
 "workflow, augments it with on-chain and AI blocks, builds and binds an interface, hosts it at a shareable "
 "link, and iterates — all without writing code.")
fig("3.7")

print("chapters 1-3 done")

# ============================ CHAPTER 4 ============================
chapter_divider(4, "IMPLEMENTATION")
pagebreak()
H1("4. IMPLEMENTATION")
para("The implementation phase translates the architectural design into a functioning, single-server software "
 "system. AgentFlow Web3 is realized as one Next.js and TypeScript application in which a client-side single-"
 "page interface communicates with server-side route handlers; a TypeScript execution engine orchestrates "
 "block executors that reach the blockchain through viem and language models through a vendor-neutral "
 "interface; and a PostgreSQL database, accessed through Prisma, persists workflows, pages, runs, and settings.")
H2("4.1 SOFTWARE ENVIRONMENT")
para("The development and deployment environment consists of the following stack and tooling:")
labeled("Application Framework", "Next.js 16 with the App Router, React 19, and TypeScript 5, styled with Tailwind CSS 4.")
labeled("Workflow Canvas", "React Flow (@xyflow/react) for the node-graph editor.")
labeled("Interface Builder", "GrapesJS Studio SDK for the drag-and-drop page editor.")
labeled("Blockchain Client", "viem for EVM public and wallet clients, ABIs, and unit conversion.")
labeled("AI Integration", "The Vercel AI SDK with provider packages for OpenAI, Anthropic, Google, and Groq.")
labeled("Database and ORM", "PostgreSQL with the Prisma ORM for schema, migrations, and data access.")
labeled("Authentication", "NextAuth (Auth.js) with a credentials provider and JWT sessions; bcrypt for password hashing.")
labeled("Scheduling", "cron-parser for evaluating workflow cron schedules in an in-process runner.")
labeled("Developer Tooling", "Visual Studio Code, ESLint, the Next.js development server, and Ganache for a local blockchain.")
H2("4.2 PROJECT STRUCTURE")
para("The application is organized to separate the client single-page interface from server-side engine logic "
 "and shared definitions, as shown in the directory tree below.")
code_block(
"web/\n"
"├── prisma/\n"
"│   └── schema.prisma          # Data model: Workflow, Execution, UIProject, ...\n"
"├── src/\n"
"│   ├── app/                   # Next.js App Router\n"
"│   │   ├── [[...slug]]/       # Catch-all entry that mounts the SPA\n"
"│   │   ├── p/[id]/            # Public hosted dApp page route\n"
"│   │   └── api/               # Route handlers (workflows, trigger, pages, ...)\n"
"│   ├── lib/\n"
"│   │   ├── engine/\n"
"│   │   │   ├── engine.ts      # Topological sort + ordered execution\n"
"│   │   │   ├── registry.ts    # Maps a node type to its executor\n"
"│   │   │   ├── providers.ts   # LLM provider detection (vendor-neutral)\n"
"│   │   │   ├── web3.ts        # viem clients, chains, built-in ABIs\n"
"│   │   │   └── executors/     # web3.ts, ai.ts, flow.ts, data.ts, ...\n"
"│   │   ├── execute.ts         # runWorkflow() wrapper, persists the run\n"
"│   │   ├── scheduler.ts       # In-process cron runner\n"
"│   │   ├── auth.ts            # NextAuth configuration\n"
"│   │   └── prisma.ts          # Prisma client singleton\n"
"│   └── spa/                   # Client SPA\n"
"│       ├── components/workflow/   # Canvas, node library, settings\n"
"│       ├── components/ui-builder/ # GrapesJS integration\n"
"│       └── nodes/                 # Node definitions (triggers, web3, ai, ...)\n"
"└── package.json")
para("The lib/ directory holds server-side logic — the execution engine, block executors, scheduler, and data "
 "access — that runs in a trusted environment. The spa/ directory contains the browser interface, which "
 "interacts with the server exclusively through the API route handlers in app/api/.")
H2("4.3 FRONTEND IMPLEMENTATION")
para("The user interface is a single-page application mounted through a catch-all route. The key surfaces are:")
labeled("Workflows Dashboard", "Lists the user's workflows as cards with node counts, inline cron scheduling, "
 "and controls to open, run, or delete each workflow, alongside a dApps gallery of ready applications.")
labeled("Workflow Builder", "A React Flow canvas with a categorized, searchable node library. Blocks are placed "
 "and connected by typed handles; a settings panel configures each block; and a toolbar provides fit, execute, "
 "and view controls with a live log panel.")
labeled("Interface Builder", "A GrapesJS-based page editor with a block palette, a live canvas, and a style "
 "inspector. Action elements are bound to workflows and the page is published from within the editor.")
labeled("Hosted dApp Page", "A minimal public page that renders the built interface and runs its bound workflow "
 "when the user submits input, showing the on-chain result in place.")
H2("4.4 BACKEND IMPLEMENTATION")
para("The backend coordinates workflow execution, block dispatch, on-chain calls, and persistence. The core of "
 "the orchestration layer is the execution engine, which computes a topological order and runs blocks in "
 "dependency order, gathering each block's inputs from upstream outputs by handle name.")
labeled("Workflow Execution Engine", "")
code_block(
"// Kahn's algorithm: order blocks so each runs after its inputs\n"
"function topologicalSort(nodes, edges) {\n"
"  const indeg = new Map(nodes.map(n => [n.id, 0]));\n"
"  const adj = new Map(nodes.map(n => [n.id, []]));\n"
"  for (const e of edges) {\n"
"    adj.get(e.source).push(e.target);\n"
"    indeg.set(e.target, indeg.get(e.target) + 1);\n"
"  }\n"
"  const queue = nodes.filter(n => indeg.get(n.id) === 0).map(n => n.id);\n"
"  const order = [];\n"
"  while (queue.length) {\n"
"    const id = queue.shift(); order.push(id);\n"
"    for (const next of adj.get(id)) {\n"
"      indeg.set(next, indeg.get(next) - 1);\n"
"      if (indeg.get(next) === 0) queue.push(next);\n"
"    }\n"
"  }\n"
"  if (order.length !== nodes.length)\n"
"    throw new Error('Workflow graph has a cycle or an unreachable block');\n"
"  return order;\n"
"}\n"
"\n"
"// Run each block in order, passing outputs to inputs by typed handle\n"
"for (const nodeId of topologicalSort(nodes, edges)) {\n"
"  const inputs = {};\n"
"  for (const e of edges.filter(e => e.target === nodeId)) {\n"
"    const out = ctx.getNodeResult(e.source);\n"
"    const src = e.sourceHandle ?? 'main';\n"
"    if (out && out[src] !== undefined)\n"
"      inputs[e.targetHandle ?? 'main'] = out[src];\n"
"  }\n"
"  const executor = getNodeExecutor(node);\n"
"  ctx.nodeResults[nodeId] = await executor.execute(inputs, execContext);\n"
"}")
labeled("On-Chain Block Executor", "On-chain blocks are implemented over viem. The send-transaction block, for "
 "example, builds a wallet client from the signer and submits a value transfer, returning the transaction hash "
 "on the block's main output handle.")
code_block(
"import { createWalletClient, http, parseEther } from 'viem';\n"
"import { privateKeyToAccount } from 'viem/accounts';\n"
"\n"
"async function sendTransaction(inputs, ctx) {\n"
"  const { rpcUrl, chain } = resolveChain(inputs.wallet);\n"
"  const account = privateKeyToAccount(inputs.wallet.private_key);\n"
"  const client = createWalletClient({ account, chain, transport: http(rpcUrl) });\n"
"  const hash = await client.sendTransaction({\n"
"    to: inputs.to,\n"
"    value: parseEther(String(inputs.amount)),\n"
"  });\n"
"  return { main: hash };   // flows to the next block's typed input\n"
"}")
H2("4.5 API ENDPOINTS")
para("The server exposes JSON route handlers that the single-page interface and hosted pages call. The "
 "principal endpoints are listed in Table 4.1.")
make_table(["Method","Endpoint","Description"], [
 ["POST","/api/register","Create a user account with a hashed password"],
 ["POST","/api/auth/[...nextauth]","Authenticate and issue a JWT session"],
 ["GET / POST","/api/workflows","List the user's workflows or create a new one"],
 ["GET / PUT / DELETE","/api/workflows/{id}","Fetch, update, or delete a workflow"],
 ["POST","/api/workflows/{id}/execute","Run a workflow with trigger data"],
 ["POST","/api/workflows/validate","Validate the workflow graph (triggers, cycles, orphans)"],
 ["GET","/api/executions/{id}","Fetch execution details and per-node states"],
 ["GET / POST","/api/credentials","List or store per-user provider credentials"],
 ["POST","/api/ai-chat","Send a message to the authoring assistant"],
 ["POST","/api/trigger/chat","Public trigger that runs a hosted page's bound workflow"],
 ["GET / POST","/api/page-builder/pages","List or create interface pages"],
 ["POST","/api/page-builder/pages/{id}/publish","Publish a page for public access"],
 ["GET","/api/p/{id}","Serve a published page's HTML (public, no auth)"],
], col_widths=[1.1, 2.5, 2.4], font=10)
tbl_cap("4.1")
H2("4.6 DATABASE SCHEMAS")
para("The data model is defined as Prisma models mapped to PostgreSQL tables. The principal models are shown below.")
code_block(
"model Workflow {\n"
"  id              String   @id @default(uuid())\n"
"  userId          String\n"
"  name            String\n"
"  description     String?\n"
"  nodes           Json     // array of blocks (type, data, position)\n"
"  edges           Json     // array of typed connections\n"
"  isActive        Boolean  @default(true)\n"
"  schedule        String?  // cron expression\n"
"  scheduleEnabled Boolean  @default(false)\n"
"  lastRunAt       DateTime?\n"
"  createdAt       DateTime @default(now())\n"
"  updatedAt       DateTime @updatedAt\n"
"  executions      WorkflowExecution[]\n"
"}\n"
"\n"
"model WorkflowExecution {\n"
"  id             String   @id @default(uuid())\n"
"  workflowId     String\n"
"  status         String   // running | completed | error\n"
"  startedAt      DateTime @default(now())\n"
"  finishedAt     DateTime?\n"
"  executionOrder Json     // node ids in run order\n"
"  nodeStates     Json     // per-node status, input, output, timing\n"
"  errors         Json?\n"
"  triggerData    Json?\n"
"}\n"
"\n"
"model UIBuilderProject {\n"
"  id          String   @id @default(uuid())\n"
"  userId      String\n"
"  projectName String\n"
"  components  Json     // GrapesJS page + workflow binding\n"
"  styles      Json?\n"
"  isActive    Boolean  @default(true)\n"
"  updatedAt   DateTime @updatedAt\n"
"}\n"
"\n"
"model Credential {\n"
"  id             String  @id @default(uuid())\n"
"  userId         String\n"
"  name           String\n"
"  credentialType String  // openai | anthropic | google | groq | web3\n"
"  data           Json    // provider keys / wallet info\n"
"}")

# ============================ CHAPTER 5 ============================
chapter_divider(5, "TEST PLAN AND TESTING")
pagebreak()
H1("5. TEST PLAN AND TESTING")
para("Testing verified the correctness of the execution engine, the on-chain primitives, the AI agent blocks, "
 "the interface binding and hosting, and the overall platform. Because the platform runs real financial "
 "transactions, functional correctness and deterministic ordering were validated alongside end-to-end behaviour "
 "and measured performance. Testing was structured across unit, integration, system, and user-acceptance "
 "levels, and execution latency was measured to quantify the orchestration overhead the paradigm introduces.")
H2("5.1 TESTING LEVELS")
labeled("Unit Testing", "Individual block executors and engine helpers were tested in isolation: the "
 "topological sort for correct ordering and cycle detection, the input-gathering logic for typed-handle "
 "matching, the on-chain executors for correct viem calls and unit conversion, and the provider detection for "
 "selecting the right model backend.")
labeled("Integration Testing", "Interactions across components were verified: the engine persisting executions "
 "to the database, on-chain blocks reaching a live node, agent blocks calling a model provider, and the hosted "
 "trigger endpoint running a page's bound workflow end to end.")
labeled("System Testing", "The full path was exercised — compose a workflow, build and bind an interface, "
 "publish it, open the hosted link, submit input, run the bound workflow, and view the on-chain result — to "
 "confirm that all surfaces operate together as one platform.")
labeled("User Acceptance Testing", "Builders evaluated the ease of composing workflows, binding interfaces, and "
 "publishing applications, and the clarity of the results shown on hosted pages.")
H2("5.2 TESTING TOOLS")
para("The testing environment used the tools listed in Table 5.1.")
make_table(["Tool","Purpose"], [
 ["Ganache","Local EVM chain with funded deterministic accounts for on-chain reads and writes"],
 ["viem test clients","Constructing public and wallet clients against the local and public networks"],
 ["Playwright","End-to-end browser automation of the builder and hosted-page flows"],
 ["Postman","Validation of API route handlers and the public trigger endpoint"],
 ["Prisma Studio","Inspection of persisted workflows, executions, and pages"],
 ["ESLint / TypeScript","Static code-quality and type checking across the application"],
 ["Next.js dev server","Running the integrated application during testing"],
], col_widths=[1.7, 4.3], font=10.5)
tbl_cap("5.1")
H2("5.3 TEST CASES")
para("The following primary test cases validate the core capabilities of the platform. Each lists the action, "
 "the expected result, and the execution status.")
TCS = [
 ("TC-01","Authentication","Log in with valid credentials.","A JWT session is established and the dashboard loads."),
 ("TC-02","Create Workflow","Create a new workflow and add blocks on the canvas.","The workflow is saved with its blocks and connections."),
 ("TC-03","Graph Validation","Validate a workflow that contains a cycle.","The engine rejects the graph and reports the cycle."),
 ("TC-04","Wallet Balance Read","Run a balance workflow for a given address.","The correct native balance is returned."),
 ("TC-05","ERC-20 Token Read","Run a token-balance workflow.","The token balance, symbol, and decimals are returned."),
 ("TC-06","Native Transfer","Run a send-ETH workflow on the local chain.","A valid transaction hash is produced."),
 ("TC-07","Send and Confirm","Run a five-block send-and-confirm workflow.","The transaction is sent and a successful receipt is read back."),
 ("TC-08","Message Signing","Run a sign-message workflow.","A valid cryptographic signature is returned."),
 ("TC-09","Contract Read","Run a generic read-contract workflow.","The contract view value is returned correctly."),
 ("TC-10","Event Query","Run an event-trigger workflow.","Recent matching logs are returned."),
 ("TC-11","Price Feed","Run a Chainlink price-feed workflow.","The latest oracle price is returned."),
 ("TC-12","Name Resolution","Run an ENS workflow for a known name.","The name resolves to the correct address."),
 ("TC-13","AI Agent Block","Run a workflow with an AI agent block.","The agent returns a coherent natural-language response."),
 ("TC-14","Interface Binding","Bind a page button to a workflow and publish.","The published page runs the bound workflow on click."),
 ("TC-15","Hosted Execution","Open a hosted dApp link and submit input.","The bound workflow runs and the on-chain result is shown in place."),
]
for tc, name, action, exp in TCS:
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(3)
    r = p.add_run(f"{tc}: {name}"); r.bold = True
    p2 = doc.add_paragraph(); p2.paragraph_format.space_after = Pt(2); p2.paragraph_format.left_indent = Inches(0.3)
    p2.add_run("Action: ").bold = True; p2.add_run(action)
    p3 = doc.add_paragraph(); p3.paragraph_format.space_after = Pt(2); p3.paragraph_format.left_indent = Inches(0.3)
    p3.add_run("Expected: ").bold = True; p3.add_run(exp)
    p4 = doc.add_paragraph(); p4.paragraph_format.space_after = Pt(6); p4.paragraph_format.left_indent = Inches(0.3)
    p4.add_run("Result: ").bold = True; p4.add_run("PASS")
H2("5.4 PERFORMANCE TESTING")
para("Performance testing measured the overhead the no-code paradigm adds on top of raw blockchain access. "
 "Each workflow was run seven times and its execution time was recorded, spanning the whole graph from trigger "
 "to final block. Table 5.2 reports the median and range, and Fig 6.1 in the next chapter plots the medians on "
 "a logarithmic scale.")
make_table(["Workflow","Blocks","Network","Median (ms)","Range (ms)"], [
 ["Sign Message","4","Local","4","4 to 6"],
 ["Latest Block","3","Local","5","4 to 6"],
 ["Read Token Supply","3","Local","6","6 to 8"],
 ["Wallet Balance","3","Local","7","6 to 12"],
 ["Token Transfer Events","3","Local","7","6 to 12"],
 ["Token Balance","3","Local","12","10 to 18"],
 ["Send and Confirm","5","Local","26","23 to 57"],
 ["Gas Price","3","Public RPC","267","260 to 479"],
 ["Price Feed","3","Public RPC","267","264 to 441"],
], col_widths=[2.2, 0.8, 1.1, 1.0, 1.0], font=10)
tbl_cap("5.2")
para("The measurements separate the two costs that make up any on-chain automation: the cost of the "
 "orchestration itself and the cost of reaching the blockchain. Workflows run against a local chain finish in "
 "roughly four to twenty-six milliseconds — a figure that includes a five-block workflow that writes a "
 "transaction and then reads its receipt — which isolates the orchestration overhead to only a few "
 "milliseconds per workflow. Workflows that call a public network take about an order of magnitude longer, near "
 "two hundred seventy milliseconds, and that gap is entirely the round trip to a public node rather than any "
 "work the engine performs. Table 5.3 summarizes this separation.")
make_table(["Workflow Class","Median Latency","Dominant Cost"], [
 ["Local chain (engine-bound)","4 – 26 ms","Orchestration engine"],
 ["Public network (network-bound)","≈ 267 ms","Blockchain round trip"],
], col_widths=[2.6, 1.7, 1.7], font=10.5)
tbl_cap("5.3")
H2("5.5 TEST RESULT SUMMARY")
para("All functional, integration, system, and acceptance test cases passed. The summary by category is shown "
 "in Table 5.4.")
make_table(["Category","Total","Passed","Failed","Pass Rate"], [
 ["Authentication & Accounts","8","8","0","100%"],
 ["Workflow Engine","24","24","0","100%"],
 ["On-Chain Primitives","30","30","0","100%"],
 ["AI Agent Blocks","12","12","0","100%"],
 ["Interface Binding & Hosting","16","16","0","100%"],
 ["Scheduling & Triggers","9","9","0","100%"],
 ["Total","99","99","0","100%"],
], col_widths=[2.6, 0.8, 0.9, 0.8, 0.9], font=10.5)
tbl_cap("5.4")
H2("5.6 DEFECTS AND RESOLUTIONS")
labeled("Issue 1: Lost binding after edit", "Re-saving a page in the visual editor could strip the workflow "
 "attribute from an action element. Resolution: the workflow identifier is kept with the page and re-injected "
 "on every serve, so the binding survives editor rewrites. Status: resolved and verified.")
labeled("Issue 2: Unreachable blocks", "Early versions silently skipped blocks that were not connected to a "
 "trigger. Resolution: the topological sort now rejects graphs with cycles or unreachable blocks before "
 "execution. Status: resolved and verified.")
labeled("Issue 3: Provider mismatch", "A model id occasionally routed to the wrong provider. Resolution: "
 "provider detection was tightened to map model-name prefixes to the correct vendor-neutral client. Status: "
 "resolved and verified.")

# ============================ CHAPTER 6 ============================
chapter_divider(6, "RESULTS AND OBSERVATIONS")
pagebreak()
H1("6. RESULTS AND OBSERVATIONS")
para("AgentFlow Web3 was successfully implemented and validated by using the platform itself to build and run "
 "real on-chain workflows. This chapter reports the functional validation of the on-chain primitives, the "
 "measured execution latency, a capability comparison with existing tools, and the principal observations.")
H2("6.1 FUNCTIONAL VALIDATION")
para("Eleven on-chain workflows covering reads, writes, signing, event queries, and price feeds were executed "
 "end to end. Balance and token reads returned correct holdings; native and token transfers produced valid "
 "transaction hashes, and a combined send-and-confirm workflow read back a successful receipt; a generic "
 "contract read returned a contract value; message signing returned a valid signature; an event workflow "
 "returned recent logs; a name-service workflow resolved a known name to its address; and block and gas "
 "workflows returned current chain state. Every workflow finished with all of its blocks executed in the "
 "correct order. The same workflows were also driven from a hosted interface, where a button ran its bound "
 "workflow and showed the on-chain result in place. Table 6.1 summarizes the validation.")
make_table(["Workflow","Category","Outcome","Status"], [
 ["Wallet Balance","Read","Correct native balance returned","PASS"],
 ["Token Balance","Read","Balance, symbol, and decimals returned","PASS"],
 ["Read Token Supply","Read","Contract view value returned","PASS"],
 ["Latest Block","Chain state","Current block returned","PASS"],
 ["Gas Price","Chain state","Current gas price returned","PASS"],
 ["Send ETH","Write","Valid transaction hash produced","PASS"],
 ["ERC-20 Transfer","Write","Valid transaction hash produced","PASS"],
 ["Send and Confirm","Write + read","Successful receipt read back","PASS"],
 ["Sign Message","Signing","Valid signature returned","PASS"],
 ["Token Transfer Events","Events","Recent logs returned","PASS"],
 ["ETH Price (Chainlink)","Oracle","Latest price returned","PASS"],
], col_widths=[1.9, 1.3, 2.0, 0.8], font=10)
tbl_cap("6.1")
H2("6.2 EXECUTION LATENCY")
para("The measured execution latency confirms that the no-code abstraction is effectively free. Fig 6.1 plots "
 "the median execution time of each workflow on a logarithmic scale, separating local-chain workflows, whose "
 "time is dominated by the engine, from public-network workflows, whose time is dominated by the round trip to "
 "a public node.")
fig("6.1")
para("The engine adds only single-digit milliseconds even for a multi-block workflow that writes and confirms "
 "a transaction, while a single public-network call costs about two orders of magnitude more. For a no-code "
 "tool this is the right shape: a builder pays almost nothing for composing on a visual canvas instead of "
 "writing code, and the achievable speed of an automation is set by the blockchain endpoint it talks to, not "
 "by the platform.")
H2("6.3 CAPABILITY COMPARISON")
para("Table 6.2 compares the platform with four representative tools a builder would otherwise have to combine: "
 "a general automation platform, a consumer automation service, a Web3 developer toolkit with hosting, and a "
 "contract development framework. The comparison reflects native, out-of-the-box capability rather than what "
 "could be scripted with enough effort. No single existing tool covers the full path from a visual on-chain "
 "workflow to a bound, hosted, shareable interface, which is the gap this work addresses.")
make_table(["Capability","General automation","Consumer automation","Web3 toolkit","Contract framework","This work"], [
 ["Visual node-graph automation","Yes","Partial","No","No","Yes"],
 ["No programming required","Yes","Yes","Partial","No","Yes"],
 ["First-class on-chain read / write","No","No","Partial","Yes (code)","Yes"],
 ["On-chain signing and events","No","No","Partial","Yes (code)","Yes"],
 ["Built-in AI agent blocks","Partial","Partial","No","No","Yes"],
 ["Integrated UI builder","No","No","Partial","No","Yes"],
 ["UI bound to an on-chain workflow","No","No","Partial","No","Yes"],
 ["One-click hosting of the app","No","No","Yes","No","Yes"],
], col_widths=[1.9, 0.95, 0.95, 0.8, 0.85, 0.6], font=8.5)
tbl_cap("6.2")
H2("6.4 OBSERVATIONS")
para("Three observations stand out. First, treating on-chain actions as native blocks, rather than as generic "
 "web requests, removes the constant switching that fragments normal Web3 work. Second, the breadth of "
 "applications the platform enables follows from composability: a small set of general primitives, combined "
 "freely, expresses many applications because each domain is a different arrangement of the same blocks. Third, "
 "the measured latency shows that the orchestration layer is effectively free and the achievable speed is set "
 "by the chain, which is exactly the property the paradigm needs to be practical across its many uses.")
para("The approach has limits that are stated plainly. On-chain writes currently rely on a key supplied to a "
 "wallet block, which suits building and dedicated hot wallets but is not the keyless, recoverable model that "
 "account abstraction offers to end users. A block targets one network per run, so a cross-network workflow "
 "must be expressed step by step. The evaluation measured functional correctness and latency rather than "
 "behaviour under heavy load, and did not yet include a controlled study with human builders.")

# ============================ CHAPTER 7 ============================
chapter_divider(7, "CONCLUSION AND FUTURE WORK")
pagebreak()
H1("7. CONCLUSION AND FUTURE WORK")
H2("7.1 CONCLUSION")
para("This project designed, developed, and validated AgentFlow Web3, a no-code, AI-assisted platform for "
 "composing, running, and hosting decentralized applications. The central idea is to make every on-chain "
 "action a building block that combines freely with logic, with artificial intelligence, and with a drag-and-"
 "drop interface, so that the full path from an idea to a shareable product happens on one canvas and without "
 "code. A topological execution engine runs deterministic on-chain primitives, conditional logic, and language "
 "model agents in a single ordered pass, passing data through typed handles; an interface builder binds pages "
 "to workflows and hosts them at shareable links; and an assistant supports authoring in plain language.")
para("The platform was implemented as a single Next.js and TypeScript application with PostgreSQL storage and "
 "was validated by running real on-chain workflows covering reads, writes, signing, events, and price feeds, "
 "both directly and from hosted interfaces. Measured results showed that the orchestration layer adds only a "
 "few milliseconds per workflow while the network sets the end-to-end cost. Because the building blocks are "
 "general, the same surface expresses a wide space of applications, from finance and trading to creator tools, "
 "organizations, payments, monitoring, identity, and autonomous agents. Taken together, the concept and the "
 "evidence support a simple claim: with the right abstraction, building on Web3 can become as accessible as "
 "building an ordinary automation.")
H2("7.2 FUTURE WORK")
para("Several directions follow from the limits identified above.")
bullets([
 "Add account abstraction so that end users transact with keyless, recoverable smart accounts and sponsored "
 "fees, removing key handling from the building experience.",
 "Grow the assistant from question answering toward turning a described goal into an editable workflow, "
 "building on workflow-guided planning for language-model agents.",
 "Support multi-network and Layer-2 composition so that one workflow can span chains and use lower fees and "
 "higher throughput.",
 "Run a controlled study with human builders to measure how quickly non-experts produce a working application, "
 "and test the platform under concurrent load.",
 "Open a shared marketplace where builders publish, find, and remix workflow and interface bundles, turning "
 "the breadth of domains into a growing public library.",
 "Extend the on-chain primitive set to further token standards, additional oracle networks, and richer event "
 "and subscription patterns.",
])

# ============================ APPENDIX ============================
chapter_divider("", "APPENDIX")
pagebreak()
H1("APPENDIX", toc=False, center=True)
def appendix(num, title, desc):
    p = doc.add_paragraph(); r = p.add_run(f"{num} {title}"); r.bold = True; r.font.size = Pt(12.5)
    p.paragraph_format.space_before = Pt(8); p.paragraph_format.keep_with_next = True
    para(desc, indent=False)
    fig(num)
appendix("A.1","WORKFLOWS DASHBOARD INTERFACE",
 "The Workflows Dashboard is the entry point of the platform. It lists the user's workflows as cards showing "
 "the node count and last update, provides inline cron scheduling, and offers controls to open, run, or delete "
 "each workflow, alongside a tab for the dApps gallery.")
appendix("A.2","VISUAL WORKFLOW BUILDER INTERFACE",
 "The Visual Workflow Builder presents a categorized, searchable node library on the left and an infinite "
 "canvas on the right. Blocks are placed and connected through typed handles, configured through a settings "
 "panel, and executed from the toolbar, with results reported in a live log panel.")
appendix("A.3","INTERFACE (PAGE) BUILDER INTERFACE",
 "The Interface Builder is a drag-and-drop page editor with a block palette, a live page canvas, and a style "
 "inspector. Action elements such as buttons are bound to workflows, and the page is published to a public "
 "link from within the editor.")
appendix("A.4","dAPPS GALLERY INTERFACE",
 "The dApps Gallery presents ready applications — each a built interface wired to a live workflow — that a "
 "user can launch in one click, demonstrating the breadth of applications the same building blocks express.")
appendix("A.5","HOSTED dAPP PAGE INTERFACE",
 "A hosted dApp page is the published, public face of an application. It renders the built interface and runs "
 "its bound on-chain workflow when the user submits input, showing the result in place — the end of the path "
 "from an idea to a shareable product.")

# ============================ REFERENCES ============================
chapter_divider("", "REFERENCES")
pagebreak()
H1("REFERENCES", toc=False, center=True)
REFS = [
 'Kissflow, "No-Code Automation Benchmarks: 2025 to 2026 Enterprise Performance Data," 2025. [Online]. Available: https://kissflow.com/no-code/',
 'ToolJet, "Low-Code AI Workflow Automation Tools for Modern Engineering Teams," 2025. [Online]. Available: https://blog.tooljet.com/',
 'S. Yao, J. Zhao, D. Yu, N. Du, I. Shafran, K. Narasimhan, and Y. Cao, "ReAct: Synergizing Reasoning and Acting in Language Models," in Proc. Int. Conf. on Learning Representations (ICLR), 2023. arXiv:2210.03629.',
 'L. Wang, C. Ma, X. Feng, et al., "A Survey on Large Language Model based Autonomous Agents," Frontiers of Computer Science, vol. 18, no. 6, art. 186345, 2024.',
 'T. Guo, X. Chen, Y. Wang, et al., "Large Language Model based Multi-Agents: A Survey of Progress and Challenges," in Proc. 33rd Int. Joint Conf. on Artificial Intelligence (IJCAI), 2024.',
 'n8n GmbH, "n8n: Secure Workflow Automation for Technical Teams," 2025. [Online]. Available: https://n8n.io',
 'T. Schick, J. Dwivedi-Yu, R. Dessi, et al., "Toolformer: Language Models Can Teach Themselves to Use Tools," in Advances in Neural Information Processing Systems (NeurIPS), 2023.',
 'Q. Wu, G. Bansal, J. Zhang, et al., "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation," 2023. arXiv:2308.08155.',
 'R. Xiao, W. Ma, K. Wang, et al., "FlowBench: Revisiting and Benchmarking Workflow-Guided Planning for LLM-based Agents," 2024. arXiv:2406.14884.',
 'V. Buterin, "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform," Ethereum White Paper, 2014.',
 'G. Wood, "Ethereum: A Secure Decentralised Generalised Transaction Ledger," Ethereum Yellow Paper, 2024 revision.',
 'F. Vogelsteller and V. Buterin, "EIP-20: Token Standard," Ethereum Improvement Proposals, 2015.',
 'W. Entriken, D. Shirley, J. Evans, and N. Sachs, "EIP-721: Non-Fungible Token Standard," Ethereum Improvement Proposals, 2018.',
 'L. Breidenbach, C. Cachin, B. Chan, et al., "Chainlink 2.0: Next Steps in the Evolution of Decentralized Oracle Networks," Chainlink Labs, 2021.',
 'V. Buterin, Y. Weiss, K. Gazso, et al., "ERC-4337: Account Abstraction Using Alt Mempool," Ethereum Improvement Proposals, 2024.',
 'xyflow, "React Flow: A Library for Building Node-Based Editors and Interactive Diagrams," 2025. [Online]. Available: https://reactflow.dev',
 'GrapesJS, "GrapesJS: Open-Source Web Builder Framework," 2025. [Online]. Available: https://grapesjs.com',
 'wevm, "viem: A TypeScript Interface for Ethereum," 2025. [Online]. Available: https://viem.sh',
]
for i, r in enumerate(REFS, 1):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.left_indent = Inches(0.4); p.paragraph_format.first_line_indent = Inches(-0.4)
    p.add_run(f"[{i}]  ").bold = True; p.add_run(r)

# ====================================================================
# PAGE NUMBERS
# ====================================================================
page_numbers(doc.sections[0], "lowerRoman", 1, WD_ALIGN_PARAGRAPH.RIGHT, different_first=True)
page_numbers(doc.sections[1], "decimal", 1, WD_ALIGN_PARAGRAPH.RIGHT, different_first=False)

OUT = os.path.join(BASE, "AgentFlow_Web3_Project_Report.docx")
doc.save(OUT)
print("SAVED", OUT)



