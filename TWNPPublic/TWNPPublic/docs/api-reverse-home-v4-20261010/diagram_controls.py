"""Offline, per-diagram reading-size controls; no application dependencies."""

DEFAULT_PERCENT = 100

CSS = '''
.font-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0;color:#183b43;font-size:12px}
.font-controls[hidden]{display:none}
.font-presets{display:flex;gap:5px}
.font-controls button,.font-controls input{font:inherit;color:#183b43;background:#fff;border:1.5px solid #6f9699;border-radius:4px;min-height:32px;padding:6px 9px}
.font-controls input{width:7em}
.font-controls button{cursor:pointer;font-weight:600}
.font-controls button[aria-pressed="true"]{color:#fff;background:#087e8c;border-color:#087e8c}
.font-controls button:focus-visible,.font-controls input:focus-visible,.diagram:focus-visible{outline:3px solid #087e8c;outline-offset:3px}
.font-custom,.font-controls label{display:flex;align-items:center;gap:6px}
.font-controls input[aria-invalid="true"]{border-color:#a52121}
.font-status{font-weight:600}
@media print{.font-controls{display:none}.diagram{overflow:visible}svg{width:100%!important;min-width:0!important;height:auto!important}}
'''

SCRIPT = r'''
(() => {
  'use strict';
  for (const controls of document.querySelectorAll('[data-font-controls]')) {
    const frame = document.getElementById(controls.dataset.fontControls);
    const svg = frame.querySelector('svg');
    const frameStyle = getComputedStyle(frame);
    const availableWidth = () => frame.clientWidth
      - parseFloat(frameStyle.paddingLeft)
      - parseFloat(frameStyle.paddingRight);
    const input = controls.querySelector('input');
    const form = controls.querySelector('form');
    const status = controls.querySelector('[role="status"]');
    const buttons = [...controls.querySelectorAll('button[data-percent]')];
    function applySize(value) {
      const percent = Number(value);
      const width = availableWidth() * percent / 100;
      if (!String(value).trim() || !Number.isFinite(percent) || percent <= 0 || !Number.isFinite(width) || width <= 0) {
        input.setAttribute('aria-invalid', 'true');
        status.textContent = `請輸入大於 0 的有效百分比；目前 ${svg.dataset.fontPercent}%`;
        return;
      }
      // Expand the entire reading layout with the type. Keeping shape/text/route
      // proportions preserves wrapping and prevents a larger font colliding.
      svg.style.width = `${width}px`;
      svg.style.minWidth = `${percent > 100 ? width : 0}px`;
      svg.dataset.fontPercent = String(percent);
      input.value = String(percent);
      input.removeAttribute('aria-invalid');
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(Number(button.dataset.percent) === percent));
      }
      status.textContent = `目前 ${percent}%`;
    }
    for (const button of buttons) {
      button.addEventListener('click', () => applySize(button.dataset.percent));
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      applySize(input.value);
    });
    applySize(svg.dataset.defaultFontPercent);
    window.addEventListener('resize', () => applySize(svg.dataset.fontPercent), { passive: true });
    controls.hidden = false;
  }
})();
'''


def toolbar(slug):
    frame = slug + '-frame'
    input_id = slug + '-font-percent'
    hint_id = slug + '-font-hint'
    buttons = ''.join(f'<button type="button" data-percent="{size}" aria-controls="{frame}" '
                      f'aria-pressed="{"true" if size == DEFAULT_PERCENT else "false"}">{label}（{size}%）</button>'
                      for label, size in (('小', 60), ('中', 75), ('大', 100)))
    return (f'<div class="font-controls" data-font-controls="{frame}" role="group" aria-label="圖中文字大小" hidden>'
            f'<span>文字大小</span><div class="font-presets">{buttons}</div>'
            f'<form class="font-custom" novalidate><label for="{input_id}">自訂'
            f'<input id="{input_id}" type="number" inputmode="decimal" step="any" value="{DEFAULT_PERCENT}" '
            f'aria-controls="{frame}" aria-describedby="{hint_id}" aria-label="自訂文字大小百分比"/>%</label>'
            '<button type="submit">套用</button></form>'
            f'<span class="font-status" role="status" aria-live="polite" aria-atomic="true">目前 {DEFAULT_PERCENT}%</span>'
            f'<span id="{hint_id}">可輸入小數，按 Enter 或套用</span></div>')
