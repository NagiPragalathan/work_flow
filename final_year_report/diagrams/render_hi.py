# -*- coding: utf-8 -*-
"""Render each diagram HTML's #stage element at 2x device scale for crisp print output."""
import os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "figures")
JOBS = [
    ("arch.html", "fig_architecture.png"),
    ("usecase.html", "fig_usecase.png"),
    ("sequence.html", "fig_sequence.png"),
    ("execflow.html", "fig_execflow.png"),
    ("primitives.html", "fig_primitives.png"),
    ("hosting.html", "fig_hosting.png"),
    ("lifecycle.html", "fig_lifecycle.png"),
]
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=2)
    for html, png in JOBS:
        url = "file:///" + os.path.join(HERE, html).replace("\\", "/")
        page.goto(url)
        page.wait_for_timeout(350)
        el = page.locator("#stage")
        el.screenshot(path=os.path.join(OUT, png))
        print("rendered", png)
    browser.close()
print("done")
