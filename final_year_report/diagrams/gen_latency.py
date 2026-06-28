# -*- coding: utf-8 -*-
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch

# Table 3 medians
data = [
    ("Sign Message", 4, "local"),
    ("Latest Block", 5, "local"),
    ("Read Token Supply", 6, "local"),
    ("Wallet Balance", 7, "local"),
    ("Token Transfer Events", 7, "local"),
    ("Token Balance", 12, "local"),
    ("Send and Confirm", 26, "local"),
    ("Gas Price", 267, "public"),
    ("Price Feed", 267, "public"),
]
labels = [d[0] for d in data]
vals   = [d[1] for d in data]
local  = "#10b981"; public = "#f59e0b"
colors = [local if d[2]=="local" else public for d in data]

plt.rcParams["font.family"] = "DejaVu Sans"
fig, ax = plt.subplots(figsize=(11.2, 5.6), dpi=220)
bars = ax.bar(range(len(vals)), vals, color=colors, width=0.62,
              edgecolor="white", linewidth=0.8, zorder=3)
ax.set_yscale("log")
ax.set_ylim(1, 600)
ax.set_ylabel("Median engine execution time (ms, log scale)", fontsize=12)
ax.set_xticks(range(len(labels)))
ax.set_xticklabels(labels, rotation=28, ha="right", fontsize=10.5)
ax.set_title("Median Workflow Execution Latency",
             fontsize=15, fontweight="bold", color="#4338ca", pad=12)
ax.grid(axis="y", color="#e5e7eb", linewidth=0.9, zorder=0)
for s in ["top","right"]: ax.spines[s].set_visible(False)
for s in ["left","bottom"]: ax.spines[s].set_color("#9ca3af")

for b, v in zip(bars, vals):
    ax.text(b.get_x()+b.get_width()/2, v*1.08, f"{v}",
            ha="center", va="bottom", fontsize=10.5, fontweight="bold", color="#374151")

# divider note between local and public
ax.axvline(6.5, color="#cbd5e1", linewidth=1.2, linestyle="--", zorder=1)
ax.text(3.0, 430, "Local chain — engine bound", ha="center", fontsize=10.5,
        color="#065f46", fontweight="bold")
ax.text(7.5, 430, "Public network — network bound", ha="center", fontsize=10.5,
        color="#92400e", fontweight="bold")

legend = [Patch(facecolor=local, label="Local chain workflow"),
          Patch(facecolor=public, label="Public RPC workflow")]
ax.legend(handles=legend, loc="upper left", frameon=False, fontsize=10.5)

plt.tight_layout()
out = r"C:\Users\Admin\Documents\Work\work_flow\final_year_report\figures\fig_latency.png"
plt.savefig(out, bbox_inches="tight", facecolor="white")
print("saved", out)
