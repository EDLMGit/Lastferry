export class Sound {
  context: AudioContext | null = null;
  muted = localStorage.getItem('last-ferry-muted') === 'true';
  toggle() {
    this.muted = !this.muted;
    localStorage.setItem('last-ferry-muted', String(this.muted));
  }
  play(kind: 'move' | 'board' | 'unload' | 'wait' | 'arrival') {
    if (this.muted) return;
    try {
      this.context ??= new AudioContext();
      const ctx = this.context;
      void ctx.resume();
      const notes =
        kind === 'arrival'
          ? [392, 494, 587, 784]
          : kind === 'move'
            ? [100, 125]
            : kind === 'wait'
              ? [220, 330]
              : [440, 554];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator(),
          gain = ctx.createGain(),
          start = ctx.currentTime + i * 0.11;
        osc.type = kind === 'move' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      /* Audio is optional; gameplay remains available. */
    }
  }
}
