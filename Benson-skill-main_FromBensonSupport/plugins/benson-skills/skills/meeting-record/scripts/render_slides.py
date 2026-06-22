"""
meeting-record / scripts / render_slides.py
============================================
把 slides_html/ 內的所有 *.html 用 Playwright 渲染成 1920×1080 PNG。

Usage:
    python render_slides.py [slides_html_dir] [output_dir]

Default:
    slides_html/  →  slides/

依賴：playwright + chromium
    pip install playwright
    playwright install chromium
"""
import asyncio
import sys
import os
from pathlib import Path
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')


async def render_all(html_dir: Path, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    html_files = sorted(html_dir.glob("*.html"))
    if not html_files:
        print(f"❌ No *.html found in {html_dir}")
        return

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
        )
        for html in html_files:
            page = await ctx.new_page()
            url = html.absolute().as_uri()
            await page.goto(url)
            await page.wait_for_load_state("networkidle")
            out = out_dir / (html.stem + ".png")
            await page.screenshot(
                path=str(out),
                full_page=False,
                clip={"x": 0, "y": 0, "width": 1920, "height": 1080},
            )
            print(f"  -> {out}")
            await page.close()
        await browser.close()
    print(f"\n✅ Rendered {len(html_files)} slides to {out_dir}")


if __name__ == "__main__":
    html_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "slides_html")
    out_dir = Path(sys.argv[2] if len(sys.argv) > 2 else "slides")
    asyncio.run(render_all(html_dir, out_dir))
