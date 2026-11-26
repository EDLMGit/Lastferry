export class PanGesture {
  private pointers = new Set<number>();
  private owner: { id: number; startX: number; startY: number; x: number; y: number } | null = null;
  private moved = false;
  private cancelled = false;

  start(id: number, x: number, y: number) {
    this.pointers.add(id);
    if (this.pointers.size !== 1) {
      this.cancelled = true;
      return false;
    }
    this.owner = { id, startX: x, startY: y, x, y };
    this.moved = false;
    this.cancelled = false;
    return true;
  }

  move(id: number, x: number, y: number) {
    const pointer = this.owner;
    if (!pointer || pointer.id !== id || this.cancelled) return null;
    if (!this.moved && Math.hypot(x - pointer.startX, y - pointer.startY) < 10) return null;
    this.moved = true;
    const delta = { x: x - pointer.x, y: y - pointer.y };
    pointer.x = x;
    pointer.y = y;
    return delta;
  }

  end(id: number, cancelled = false) {
    const suppressClick = this.moved || this.cancelled || cancelled;
    this.pointers.delete(id);
    if (this.owner?.id === id) this.owner = null;
    if (!this.pointers.size) {
      this.owner = null;
      this.moved = false;
      this.cancelled = false;
    }
    return suppressClick;
  }
}
