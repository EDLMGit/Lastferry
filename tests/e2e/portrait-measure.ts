export function measurePortraits() {
  const rect = (e: Element) => {
    const r = e.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };
  const choices = [...document.querySelectorAll<HTMLButtonElement>('#preview .cove-choice')].map(button => {
    const image = button.querySelector<HTMLImageElement>('img');
    const check = button.querySelector('.cove-choice-check');
    const b = rect(button), i = image ? rect(image) : null, c = check ? rect(check) : null;
    const contained = (r: ReturnType<typeof rect> | null) => !!r && r.left >= b.left && r.right <= b.right && r.top >= b.top && r.bottom <= b.bottom;
    const overlaps = i && c ? Math.min(i.right, c.right) > Math.max(i.left, c.left) && Math.min(i.bottom, c.bottom) > Math.max(i.top, c.top) : false;
    return {
      id: button.id,
      name: button.querySelector('.cove-choice-name')?.textContent,
      capacity: button.querySelector('.cove-choice-capacity')?.textContent,
      selected: button.getAttribute('aria-pressed'),
      button: b,
      image: image ? { src: image.getAttribute('src'), currentSrc: image.currentSrc, complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, alt: image.alt, draggable: image.draggable, tabIndex: image.tabIndex, display: getComputedStyle(image).display, visibility: getComputedStyle(image).visibility, opacity: getComputedStyle(image).opacity, pointerEvents: getComputedStyle(image).pointerEvents, rect: i } : null,
      check: c,
      imageContained: contained(i),
      checkContained: contained(c),
      checkOverlapsPortrait: !!overlaps,
    };
  });
  return { choices, imageCount: document.querySelectorAll('#preview img').length, canvasCount: document.querySelectorAll('canvas').length };
}
