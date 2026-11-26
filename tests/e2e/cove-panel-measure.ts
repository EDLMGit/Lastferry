export function measurePanel() {
  const rect = (r: DOMRect) => ({ x: r.x, y: r.y, width: r.width, height: r.height, left: r.left, right: r.right, top: r.top, bottom: r.bottom });
  const dimensions = (e: Element) => {
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return { id: e.id, className: e.className, rect: rect(r), clientWidth: e.clientWidth, scrollWidth: e.scrollWidth, clientHeight: e.clientHeight, scrollHeight: e.scrollHeight, overflowX: s.overflowX, overflowY: s.overflowY, font: s.font, background: s.background, horizontalOverflow: e.scrollWidth > e.clientWidth + 1 };
  };
  const nested = [...document.querySelectorAll('#dialog, #dialog-content, #preview, .passenger-options, #dialog-title, #preview .requirement, #preview .consequence, #preview .preview-result')].map(dimensions);
  const choices = [...document.querySelectorAll<HTMLButtonElement>('#preview .passenger-options button')].map(button => {
    const s = getComputedStyle(button), r = button.getBoundingClientRect();
    const bounds = { left: r.left + parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft), right: r.right - parseFloat(s.borderRightWidth) - parseFloat(s.paddingRight), top: r.top + parseFloat(s.borderTopWidth) + parseFloat(s.paddingTop), bottom: r.bottom - parseFloat(s.borderBottomWidth) - parseFloat(s.paddingBottom) };
    const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
    const lines: { text: string; font: string; fontSize: number; rect: ReturnType<typeof rect>; fits: boolean }[] = [];
    let text: Node | null;
    while ((text = walker.nextNode())) {
      if (!text.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      const style = getComputedStyle(text.parentElement!);
      for (const line of range.getClientRects()) {
        if (line.width < 0.1) continue;
        lines.push({ text: text.textContent.trim(), font: style.font, fontSize: parseFloat(style.fontSize), rect: rect(line), fits: line.left >= bounds.left - 0.75 && line.right <= bounds.right + 0.75 && line.top >= bounds.top - 0.75 && line.bottom <= bounds.bottom + 0.75 });
      }
    }
    const descendants = [...button.querySelectorAll<HTMLElement>('.cove-choice-copy, .cove-choice-name, .cove-choice-capacity')].map(dimensions);
    return { ...dimensions(button), label: button.textContent, selected: button.getAttribute('aria-pressed'), bounds, lines, descendants, fits: lines.length > 0 && lines.every(line => line.fits) && !descendants.some(e => e.horizontalOverflow) };
  });
  const failures = [...nested.filter(e => e.horizontalOverflow).map(e => `${e.id || e.className}: horizontal overflow ${e.scrollWidth}/${e.clientWidth}`), ...choices.filter(e => !e.fits || e.horizontalOverflow).map(e => `${e.id}: text does not fit its content box`)];
  return { viewport: { width: innerWidth, height: innerHeight }, nested, choices, failures, committedHud: document.getElementById('readout')?.textContent, title: document.getElementById('dialog-title')?.textContent, consequence: document.querySelector('#preview .consequence')?.textContent, projected: document.querySelector('#preview .preview-result')?.textContent, confirm: dimensions(document.getElementById('commit')!), close: dimensions(document.getElementById('cancel')!) };
}
