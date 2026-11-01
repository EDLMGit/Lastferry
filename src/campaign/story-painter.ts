export type StoryIllustration = 'tide' | 'lantern' | 'ferry' | 'harbor' | 'driftwood' | 'launch';
type Paint = string | CanvasGradient;
type RabbitPose = {
  lift?: number;
  step?: number;
  head?: number;
  warmth?: number;
  guide?: number;
  lantern?: boolean;
  restHand?: number;
};

export function harborComposition(width: number, height: number) {
  const portrait = width < 600;
  const short = !portrait && height < 360;
  const scale = portrait
    ? Math.min((width - 28) / 350, (height - 72) / 290, 1.2)
    : short
      ? Math.min((width - 270) / 610, (height - 42) / 260, 1.95)
      : Math.min((width - 80) / 670, (height - 96) / 330, 1.95);
  const x = portrait ? width * 0.5 : short ? width * 0.66 : width * 0.5 + 38 * scale;
  const y = height * (portrait ? 0.62 : short ? 0.64 : 0.66);
  return {
    portrait,
    x,
    y,
    scale,
    caption: {
      left: short ? 22 : Math.max(26, x - 315 * scale),
      top: short ? 38 : Math.max(52, y - 262 * scale),
      width: short ? Math.min(220, width * 0.3) : Math.min(440, 250 * scale),
    },
  };
}

export function createCoveStoryPainter(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Story artwork requires Canvas2D.');
  const ctx: CanvasRenderingContext2D = context;
  let W = 1,
    H = 1,
    DPR = 1;
  const C = {
    ink: '#173e43',
    deep: '#1d4b55',
    water: '#76aaa6',
    rim: '#dfd9b8',
    grass: '#879a78',
    rock: '#436c69',
    cream: '#c8d2bc',
    tan: '#a7a88a',
    gold: '#f5d996',
  };
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const ease = (x: number) => {
    x = clamp(x);
    return x * x * (3 - 2 * x);
  };
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const durations: Record<StoryIllustration, number> = {
    tide: 6,
    lantern: 6,
    ferry: 7,
    harbor: 5,
    driftwood: 7,
    launch: 8,
  };
  const grains = Array.from({ length: 560 }, (_, i) => ({
    x: ((i * 173 + 43) % 997) / 997,
    y: ((i * 353 + 53) % 991) / 991,
    r: 0.4 + (i % 3) * 0.3,
  }));
  function ellipse(x: number, y: number, rx: number, ry: number, color: Paint, rot = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function path(d: string, fill?: Paint | null, stroke?: string | null, lw = 1) {
    const p = new Path2D(d);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(p);
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke(p);
    }
  }
  function line(points: number[][], color: string, lw = 1) {
    ctx.beginPath();
    points.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  function glow(x: number, y: number, r: number, power = 1) {
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, `rgba(255,232,164,${0.42 * power})`);
    g.addColorStop(0.25, `rgba(255,218,144,${0.23 * power})`);
    g.addColorStop(1, 'rgba(255,214,143,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  function lantern(x: number, y: number, s: number, lit = 1, swing = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(swing);
    ctx.scale(s, s);
    glow(0, 0, 43, lit);
    ctx.strokeStyle = '#304c47';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -13, 5, Math.PI, Math.PI * 2);
    ctx.stroke();
    path('M -8 -11 L 8 -11 L 10 10 L -10 10 Z', '#284c49', '#ddc494', 1.2);
    const lg = ctx.createLinearGradient(-5, -6, 5, 7);
    lg.addColorStop(0, '#fff2b9');
    lg.addColorStop(1, '#e7ba6d');
    ctx.fillStyle = lg;
    ctx.fillRect(-5, -7, 10, 14);
    line(
      [
        [0, -7],
        [0, 7],
      ],
      '#8b815d',
      1,
    );
    line(
      [
        [-10, 11],
        [10, 11],
      ],
      '#e4c991',
      2.5,
    );
    ellipse(0, 0, 1.8, 4, '#fff5d1');
    ctx.restore();
  }
  function rabbit(x: number, y: number, s: number, kind: 'tan' | 'cream', p: RabbitPose = {}) {
    const lift = p.lift || 0,
      step = p.step || 0,
      head = p.head || 0,
      warmth = p.warmth || 0,
      guide = p.guide || 0;
    const base = kind === 'tan' ? C.tan : C.cream,
      shade = kind === 'tan' ? '#7d927b' : '#a3b8a6',
      rim = kind === 'tan' ? '#e1c89b' : '#efdfb9';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(6, 2, 28, 5, 'rgba(21,58,59,.20)');
    ctx.rotate(-Math.sin(step * Math.PI) * 0.055);
    ellipse(10, -25, 22, 30, base, 0.08);
    ellipse(19, -23, 14, 25, shade, 0.18);
    ellipse(22, -19, 8, 15, base, 0.18);
    ellipse(31, -17, 7, 7, base);
    const foot = Math.sin(step * Math.PI * 4) * 3;
    ellipse(-5 - foot, -2, 13, 5, base);
    ellipse(15 + foot, -2, 16, 5, base);
    line(
      [
        [-13, -1],
        [-7, -1],
      ],
      rim,
      1.2,
    );
    line(
      [
        [8, -1],
        [16, -1],
      ],
      rim,
      1.2,
    );
    ctx.save();
    ctx.translate(-1, -49);
    ctx.rotate(head);
    ellipse(1, -6, 17, 19, base, -0.1);
    ellipse(-11, -38, 6.5, 25, base, -0.17);
    ellipse(6, -38, 6, 23, base, 0.16);
    ellipse(-11, -38, 2.1, 17, kind === 'tan' ? '#c5ad88' : '#d7c7ab', -0.17);
    ellipse(6, -38, 1.9, 15, kind === 'tan' ? '#c5ad88' : '#d7c7ab', 0.16);
    ellipse(-13, 1, 11, 9, base);
    ellipse(-22, 0, 2.7, 2.2, '#284c49');
    ellipse(-8, -10, 2, 2.3, '#24494a');
    ellipse(-8.6, -10.8, 0.65, 0.7, '#f8e9c4');
    ctx.beginPath();
    ctx.moveTo(-18, 6);
    ctx.quadraticCurveTo(-13, 9, -10, 6);
    ctx.strokeStyle = shade;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-11, -22);
    ctx.quadraticCurveTo(2, -29, 12, -19);
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.9;
    ctx.stroke();
    if (warmth > 0) {
      ctx.globalAlpha = 0.28 * warmth;
      ellipse(-12, 0, 7, 9, '#f6d59e');
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    const ax = mix(mix(-9, -34, lift), -2, p.restHand || 0),
      ay = mix(mix(-25, -61, lift), -34, p.restHand || 0);
    line(
      [
        [0, -35],
        [ax, ay],
      ],
      base,
      9,
    );
    ellipse(ax, ay, 4.7, 4.7, base);
    const backX = mix(18, 31, guide),
      backY = mix(-31, -41, guide);
    line(
      [
        [15, -36],
        [backX, backY],
      ],
      base,
      7,
    );
    if (p.lantern) lantern(ax - 7, ay + 14, 1, 0.5 + 0.5 * lift, Math.sin(lift * Math.PI) * -0.14);
    ctx.beginPath();
    ctx.moveTo(12, -51);
    ctx.quadraticCurveTo(30, -32, 24, -12);
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  function sheep(x: number, y: number, s: number, nod = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    line(
      [
        [-14, -8],
        [-14, 5],
      ],
      '#284a48',
      5,
    );
    line(
      [
        [13, -8],
        [13, 5],
      ],
      '#284a48',
      5,
    );
    [
      [-19, -19, 12],
      [-12, -29, 13],
      [3, -32, 13],
      [17, -24, 13],
      [12, -12, 13],
      [-3, -10, 14],
    ].forEach(([a, b, r], i) => ellipse(a, b, r, r, i > 3 ? '#b6c7b0' : '#d3d8be'));
    ctx.save();
    ctx.translate(22, -27);
    ctx.rotate(nod);
    ellipse(0, 0, 11, 15, '#31504b', -0.15);
    ellipse(5, -11, 8, 4, '#31504b', -0.3);
    ellipse(4, -3, 1.6, 1.6, '#f3deb1');
    ellipse(4.4, -3.6, 0.5, 0.5, '#fff3cf');
    ctx.restore();
    line(
      [
        [-16, -36],
        [-6, -42],
        [5, -42],
      ],
      '#f0dfb9',
      2,
    );
    ctx.restore();
  }
  function boat(
    x: number,
    y: number,
    s: number,
    t: number,
    u: number,
    occupied = true,
    moving = true,
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.rotate(Math.sin(t * 1.5) * 0.01 * (1 - ease((u - 0.8) / 0.2)));
    for (let i = 0; i < (moving ? 9 : 0); i++) {
      const age = i / 9;
      ctx.globalAlpha = 0.23 * (1 - age);
      ctx.strokeStyle = '#dce6cc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(-102 - i * 15, 16 + i * 1.4, 24 + i * 10, 3 + i * 0.9, 0, 0, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const rf = ctx.createLinearGradient(0, 8, 0, 65);
    rf.addColorStop(0, 'rgba(229,195,117,.25)');
    rf.addColorStop(1, 'rgba(229,195,117,0)');
    ellipse(0, 36, 99, 25, rf);
    path('M -99 -3 L 103 -3 Q 89 25 59 33 L -66 33 Q -93 22 -99 -3 Z', '#a48d54');
    path('M -94 4 L 96 4 Q 88 16 78 19 L -80 19 Z', '#e4c984');
    path('M -80 20 L 77 20 L 61 28 L -68 28 Z', '#c1ab67');
    line(
      [
        [-100, -5],
        [105, -5],
      ],
      '#f5e6b8',
      4,
    );
    line(
      [
        [-66, 31],
        [58, 33],
      ],
      '#4c7161',
      4,
    );
    ctx.fillStyle = '#a97263';
    ctx.fillRect(-67, -61, 70, 54);
    ctx.fillStyle = '#91665b';
    ctx.fillRect(-3, -59, 9, 51);
    path('M -75 -62 Q -35 -76 12 -62 L 15 -56 L -75 -56 Z', '#7e5958', '#d2b097', 1.5);
    ctx.fillStyle = '#315656';
    ctx.fillRect(-57, -51, 22, 26);
    ctx.fillRect(-27, -51, 22, 26);
    line(
      [
        [-53, -48],
        [-39, -48],
      ],
      '#d8c7a0',
      2,
    );
    line(
      [
        [-23, -48],
        [-8, -48],
      ],
      '#d8c7a0',
      2,
    );
    line(
      [
        [-38, -69],
        [-38, -83],
      ],
      '#425b50',
      5,
    );
    line(
      [
        [-63, -16],
        [-9, -16],
      ],
      '#deb98a',
      2,
    );
    if (occupied) sheep(43, -10, 0.85, Math.sin(ease((t - 0.8) / 1.8) * Math.PI) * -0.16);
    line(
      [
        [80, -6],
        [80, -41],
      ],
      '#52654e',
      3,
    );
    lantern(80, -42, 0.78, 1);
    line(
      [
        [-93, -20],
        [-93, -5],
      ],
      '#77826c',
      2,
    );
    line(
      [
        [-82, -20],
        [-82, -5],
      ],
      '#77826c',
      2,
    );
    line(
      [
        [-93, -20],
        [-67, -20],
      ],
      '#dbc69a',
      2,
    );
    ctx.globalAlpha = 0.6;
    line(
      [
        [88, 12],
        [104, 9],
        [113, 14],
      ],
      '#dce5c9',
      1.5,
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function tower(x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    path('M -76 10 Q -62 -9 -23 -9 Q 18 -24 81 9 L 84 32 L -80 32 Z', '#6f9388');
    path('M -15 5 L -10 -99 L 10 -99 L 17 5 Z', '#bcc4a9');
    path('M 2 -99 L 10 -99 L 17 5 L 5 5 Z', '#92a68e');
    ctx.fillStyle = '#5d7b75';
    ctx.fillRect(-16, -107, 32, 9);
    ctx.fillRect(-15, -120, 30, 14);
    path('M -22 -121 L 0 -136 L 22 -121 Z', '#536e70');
    glow(0, -114, 62, 0.7);
    ctx.fillStyle = '#ffe6a7';
    ctx.fillRect(-11, -118, 22, 9);
    line(
      [
        [-6, -119],
        [-6, -106],
      ],
      '#74866e',
      1.7,
    );
    line(
      [
        [6, -119],
        [6, -106],
      ],
      '#74866e',
      1.7,
    );
    path('M -4 5 L -4 -13 Q 2 -22 8 -13 L 8 5 Z', '#526f69');
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = '#e5d4a2';
      ctx.fillRect(-4, -43 - i * 25, 7, 9);
    }
    path('M -62 8 L -62 -20 L -32 -20 L -32 8 Z', '#86a08b');
    path('M -68 -21 L -47 -35 L -25 -21 Z', '#617f75');
    ctx.fillStyle = '#efcf8d';
    ctx.fillRect(-54, -11, 11, 11);
    ctx.restore();
  }
  function reeds(x: number, y: number, s: number, t: number, front = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (let i = 0; i < 6; i++) {
      const xx = (i - 2) * 6,
        yy = -29 - ((i * 13) % 38);
      ctx.beginPath();
      ctx.moveTo(xx, 14);
      ctx.quadraticCurveTo(xx + 8, yy * 0.5, xx + 4 + Math.sin(t * 0.5 + i) * 1.2, yy);
      ctx.strokeStyle = front ? '#17414a' : '#668b7d';
      ctx.lineWidth = 2;
      ctx.stroke();
      ellipse(
        xx + 4 + Math.sin(t * 0.5 + i) * 1.2,
        yy,
        2.3,
        8,
        front ? '#294d50' : '#748f7b',
        -0.12,
      );
    }
    ctx.restore();
  }
  function backdrop(t: number, variant = 0) {
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.72);
    sky.addColorStop(0, '#b0a9bb');
    sky.addColorStop(0.42, '#ddc7b9');
    sky.addColorStop(1, '#f2dbb6');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    const mx = W * (variant === 1 ? 0.8 : 0.66),
      my = H * (variant === 1 ? 0.25 : 0.21);
    glow(mx, my, H * 0.22, 0.14);
    ellipse(mx, my, Math.min(23, H * 0.058), Math.min(23, H * 0.058), '#ece2bf');
    const shift = Math.sin(t * 0.1) * 2;
    path(
      `M -20 ${H * 0.48} Q ${W * 0.03 + shift} ${H * 0.34} ${W * 0.17} ${H * 0.41} Q ${W * 0.28} ${H * 0.29} ${W * 0.42} ${H * 0.43} Q ${W * 0.57} ${H * 0.3} ${W * 0.75} ${H * 0.45} Q ${W * 0.91} ${H * 0.38} ${W + 20} ${H * 0.49} L ${W + 20} ${H * 0.65} L -20 ${H * 0.65} Z`,
      '#9cafaa',
    );
    path(
      `M -20 ${H * 0.55} Q ${W * 0.1} ${H * 0.45} ${W * 0.29} ${H * 0.51} Q ${W * 0.49} ${H * 0.4} ${W * 0.65} ${H * 0.51} Q ${W * 0.86} ${H * 0.42} ${W + 20} ${H * 0.55} L ${W + 20} ${H * 0.68} L -20 ${H * 0.68} Z`,
      '#7e9f98',
    );
    const water = ctx.createLinearGradient(0, H * 0.51, 0, H);
    water.addColorStop(0, '#9abbac');
    water.addColorStop(0.35, '#72a7a1');
    water.addColorStop(1, '#285765');
    ctx.fillStyle = water;
    ctx.fillRect(0, H * 0.53, W, H * 0.47);
    for (let i = 0; i < 23; i++) {
      const y = H * 0.54 + ((i * 41) % Math.round(H * 0.4)),
        x = ((i * 131 + t * (i % 2 ? 2 : -1)) % (W + 80)) - 40;
      ctx.globalAlpha = 0.07 + (i % 4) * 0.02;
      line(
        [
          [x, y],
          [x + 16 + ((i * 23) % 70), y],
        ],
        '#dfdfc2',
        i % 5 === 0 ? 1.4 : 0.8,
      );
    }
    ctx.globalAlpha = 1;
  }
  function shore(cx: number, cy: number, sw: number) {
    path(
      `M ${cx - sw * 0.65} ${cy + 28} Q ${cx - sw * 0.45} ${cy - 1} ${cx - sw * 0.1} ${cy + 2} Q ${cx + sw * 0.24} ${cy - 7} ${cx + sw * 0.8} ${cy + 23} L ${cx + sw} ${H + 40} L ${cx - sw} ${H + 40} Z`,
      C.rock,
    );
    path(
      `M ${cx - sw * 0.65} ${cy + 28} Q ${cx - sw * 0.45} ${cy - 1} ${cx - sw * 0.1} ${cy + 2} Q ${cx + sw * 0.24} ${cy - 7} ${cx + sw * 0.8} ${cy + 23} Q ${cx + sw * 0.36} ${cy + 18} ${cx - sw * 0.08} ${cy + 13} Q ${cx - sw * 0.36} ${cy + 11} ${cx - sw * 0.65} ${cy + 28} Z`,
      C.grass,
    );
    for (let i = 0; i < 8; i++) {
      const x = cx - sw * 0.39 + i * sw * 0.11;
      line(
        [
          [x, cy + 10],
          [x - 2, cy + 2 - (i % 3) * 2],
        ],
        '#a4b18b',
        1.4,
      );
    }
    ctx.globalAlpha = 0.35;
    path(
      `M ${cx - sw * 0.35} ${cy + 27} L ${cx - sw * 0.1} ${cy + 39} L ${cx + sw * 0.04} ${cy + 61} M ${cx + sw * 0.35} ${cy + 27} L ${cx + sw * 0.2} ${cy + 57}`,
      null,
      '#729482',
      1,
    );
    ctx.globalAlpha = 1;
  }
  function foregroundWater(top: number, t: number, reflection?: { x: number; strength: number }) {
    const fill = ctx.createLinearGradient(0, top, 0, H);
    fill.addColorStop(0, '#82b0a3');
    fill.addColorStop(0.4, '#609997');
    fill.addColorStop(1, '#285763');
    ctx.beginPath();
    ctx.moveTo(0, top);
    for (let x = 0; x <= W + 5; x += 5) ctx.lineTo(x, top + Math.sin(x * 0.025 - t * 0.6) * 1.3);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.beginPath();
    for (let x = 0; x <= W; x += 5) {
      const y = top + Math.sin(x * 0.025 - t * 0.6) * 1.3;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = '#c9d8bc';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (let i = 0; i < 28; i++) {
      const y = top + 8 + ((i * 0.113) % 1) * (H - top),
        x = ((i * 97 + t * (i % 2 ? 3 : -2)) % (W + 70)) - 35;
      ctx.globalAlpha = 0.09 + (i % 4) * 0.02;
      line(
        [
          [x, y],
          [x + 16 + ((i * 29) % 67), y - 0.7],
        ],
        '#c9dfcd',
        i % 5 === 0 ? 1.5 : 0.8,
      );
    }
    ctx.globalAlpha = 1;
    if (reflection) {
      const { x, strength } = reflection;
      for (let i = 0; i < 17; i++) {
        const y = top + 5 + (i * (H - top)) / 19,
          span = 3 + i * 0.8;
        ctx.globalAlpha = 0.2 * strength * (1 - i / 17);
        line(
          [
            [x - span + Math.sin(i + t) * 2, y],
            [x + span + Math.sin(i + t) * 2, y],
          ],
          '#ffe7a9',
          2,
        );
      }
      ctx.globalAlpha = 1;
    }
  }
  function finish(t: number) {
    const grad = ctx.createLinearGradient(0, H * 0.87, 0, H);
    grad.addColorStop(0, 'rgba(19,54,63,0)');
    grad.addColorStop(1, 'rgba(19,54,63,.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.87, W, H * 0.13);
    ctx.globalAlpha = 0.055;
    grains.forEach((g) => ellipse(g.x * W, g.y * H, g.r, g.r, g.y < 0.5 ? '#fff0d4' : '#d0e3ce'));
    ctx.globalAlpha = 1;
    reeds(-3, H + 3, H < 300 ? 1.1 : 1.65, t);
    reeds(W + 1, H + 14, H < 300 ? 0.85 : 1.3, -t);
  }
  function tideShot(t: number) {
    const p = W < 480,
      short = H < 300,
      rise = ease((t - 0.45) / 4.7),
      retreat = ease((t - 3.6) / 1.3);
    backdrop(t);
    tower(W * 0.84, H * 0.47, p ? 0.48 : short ? 0.48 : 0.63);
    const cx = W * (p ? 0.78 : 0.76),
      cy = H * 0.665,
      sw = p ? 127 : 195;
    shore(cx, cy, sw);
    for (let i = 0; i < 5; i++) {
      const u = i / 4,
        x = cx - sw * (0.89 - 0.47 * u),
        y = cy + 15 + (1 - u) * (short ? 37 : 53),
        rw = p ? 10 : 15;
      path(
        `M ${x - rw} ${y - 4} Q ${x} ${y - 7} ${x + rw} ${y - 3} L ${x + rw + 2} ${y + 16} L ${x - rw - 2} ${y + 16} Z`,
        '#547b70',
      );
      ellipse(x, y - 4, rw, 3.2, '#b8bb96');
    }
    const postX = W * (p ? 0.21 : 0.29);
    line(
      [
        [postX, H * 0.585],
        [postX, H * 0.89],
      ],
      '#566f5c',
      8,
    );
    line(
      [
        [postX - 3, H * 0.585],
        [postX + 3, H * 0.585],
      ],
      '#cfbc8e',
      2,
    );
    for (let i = 0; i < 5; i++)
      line(
        [
          [postX - 3, H * 0.63 + i * (short ? 9 : 13)],
          [postX + 3, H * 0.63 + i * (short ? 9 : 13)],
        ],
        '#e6d6a8',
        2,
      );
    const scale = p ? 0.75 : short ? 0.68 : 0.98;
    rabbit(cx + 19 + retreat * 10, cy + 3, scale, 'cream', { step: retreat, head: retreat * 0.11 });
    rabbit(cx - 34 + retreat * 8, cy + 4, scale * 1.05, 'tan', {
      step: retreat,
      head: -0.08,
      lantern: true,
      guide: Math.sin(retreat * Math.PI),
    });
    const top = mix(H * 0.825, H * 0.721, rise);
    foregroundWater(top, t, { x: cx + 7, strength: 0.3 });
    for (let i = 0; i < 3; i++) {
      const expand = (t * 0.32 + i * 0.29) % 1,
        xx = postX + (i - 1) * 10;
      ctx.globalAlpha = 0.17 * (1 - expand) * rise;
      ctx.strokeStyle = '#e3e5c4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(xx, top + 3, 9 + expand * 32, 2 + expand * 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    finish(t);
  }
  function lanternShot(t: number) {
    const p = W < 480,
      short = H < 300,
      lift = ease((t - 1.4) / 2.8),
      step = ease(t / 1.4);
    backdrop(t, 1);
    const ly = H * (p ? 0.47 : 0.46);
    tower(W * 0.88, ly, p ? 0.35 : short ? 0.37 : 0.48);
    const floor = H * (p ? 0.83 : 0.86),
      sw = p ? W * 0.66 : W * 0.35,
      cx = W * (p ? 0.62 : 0.76);
    shore(cx, floor, sw);
    const scale = Math.min(p ? 1.82 : short ? 1.2 : 2.2, (H * 0.46) / 91),
      rueX = W * (p ? 0.44 : 0.65) + step * 7,
      pipX = W * (p ? 0.73 : short ? 0.76 : 0.84) + step * 4;
    const ground = floor + 5;
    rabbit(pipX, ground, scale * 0.82, 'cream', {
      step,
      head: mix(-0.15, 0.08, lift),
      warmth: lift,
    });
    rabbit(rueX, ground, scale, 'tan', {
      step,
      lift,
      head: mix(0.06, -0.12, lift),
      warmth: lift,
      lantern: true,
      guide: Math.sin(step * Math.PI) * 0.8,
    });
    const lampX = rueX + (mix(-9, -34, lift) - 7) * scale,
      lampY = ground + (mix(-25, -61, lift) + 14) * scale;
    glow(lampX, lampY, 65 * scale, 0.16 + 0.28 * lift);
    const top = H * 0.96;
    foregroundWater(top, t, { x: lampX, strength: 1 });
    reeds(W * 0.06, H + 20, short ? 1 : 1.6, t);
    finish(t);
  }
  function answerShot(t: number) {
    const p = W < 480,
      short = H < 300,
      u = ease((t - 0.4) / 5.4);
    backdrop(t, 2);
    tower(W * (p ? 0.79 : 0.79), H * (p ? 0.44 : 0.45), p ? 0.64 : short ? 0.53 : 0.82);
    const cx = W * (p ? 0.87 : 0.91),
      cy = H * 0.64,
      sw = p ? 103 : 149;
    shore(cx, cy, sw);
    const rs = p ? 0.55 : short ? 0.56 : 0.78;
    rabbit(cx + 15, cy + 4, rs, 'cream', { head: 0.1 });
    rabbit(cx - 21, cy + 5, rs * 1.05, 'tan', { lift: 1, head: -0.12, lantern: true, warmth: 1 });
    foregroundWater(H * 0.731, t, { x: W * 0.79, strength: 0.9 });
    const s = p ? Math.min(0.95, W / 290) : short ? 0.91 : 1.45;
    const bx = mix(-110 * s, W * (p ? 0.39 : 0.44), u),
      by = H * (p ? 0.842 : 0.838);
    boat(bx, by, s, t, u);
    finish(t);
  }
  function harborShot(t: number) {
    const composition = harborComposition(W, H),
      { portrait, x, y, scale: s } = composition,
      place = ease((t - 0.6) / 2.6),
      rest = ease((t - 3.4) / 1.1),
      lift = 1 - place;
    backdrop(t, 1);
    tower(x + (portrait ? 125 : 215) * s, y - 108 * s, s * 0.45);
    const distantX = x - (portrait ? 128 : 236) * s,
      distantY = y - (portrait ? 148 : 145) * s;
    path(
      `M ${distantX - 9} ${distantY} L ${distantX - 9} ${distantY - 9} L ${distantX + 7} ${distantY - 9} L ${distantX + 7} ${distantY} Z`,
      '#6e9388',
    );
    path(
      `M ${distantX - 13} ${distantY - 9} L ${distantX - 1} ${distantY - 17} L ${distantX + 11} ${distantY - 9} Z`,
      '#617f75',
    );
    glow(distantX, distantY - 4, 15, 0.22);
    ctx.fillStyle = '#efcf8d';
    ctx.fillRect(distantX - 2, distantY - 7, 4, 5);
    foregroundWater(y - 80 * s, t, { x: distantX, strength: 0.3 });
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const left = portrait ? -44 : -45,
      right = portrait ? 172 : 263,
      back = portrait ? -17 : -20,
      waterline = portrait ? 92 : 102;
    path(
      `M ${left} 9 Q ${left + 8} -8 ${left + 35} ${back} L ${right - 24} ${back - 15} L ${right} -2 L ${right - 11} ${waterline - 2} Q ${right - 49} ${waterline + 22} ${left + 19} ${waterline} Z`,
      C.rock,
    );
    path(
      `M ${left} 9 Q ${left + 8} -8 ${left + 35} ${back} L ${right - 24} ${back - 15} L ${right} -2 L ${right - 7} 17 L ${left + 14} 23 Z`,
      C.grass,
    );
    line(
      [
        [left + 12, 23],
        [right - 7, 17],
      ],
      '#b8bb96',
      2,
    );
    for (const offset of [28, 106, 183])
      if (left + offset < right - 15)
        line([[left + offset, 30], [left + offset + 8, waterline - 10]], '#729482', 1.3);
    path(`M ${left + 20} 49 L ${right - 16} 42 M ${left + 24} 76 L ${right - 20} 68`, null, '#60877b', 1.4);
    ellipse((left + right) / 2, waterline + 2, (right - left) * 0.45, 7, 'rgba(25,71,72,.22)');
    line([[left + 27, waterline + 5], [right - 48, waterline + 4]], '#a9c7b2', 1.6);
    const boatX = portrait ? -90 : -184,
      boatY = portrait ? 82 : 84,
      boatScale = portrait ? 0.78 : 1.08;
    line([[left + 8, 14], [boatX + 80 * boatScale, boatY - 8]], '#b9a57d', 1.7);
    boat(boatX, boatY, boatScale, 7, 1, false, false);
    const scale = portrait ? 1.22 : 1.44,
      rueX = portrait ? -1 : 28,
      pipX = portrait ? 72 : 120,
      mossX = portrait ? 132 : 207;
    const mossSettle = ease((t - 0.5) / 2);
    sheep(mossX, -5 + mossSettle * 2, scale * 0.87, Math.sin(mossSettle * Math.PI) * 0.12);
    rabbit(pipX, -5, scale * 0.82, 'cream', {
      head: mix(0.1, -0.16, ease((t - 1.7) / 1.7)),
      warmth: 0.45,
    });
    rabbit(rueX, 0, scale, 'tan', {
      lift,
      restHand: rest,
      head: mix(-0.12, 0.05, place),
      warmth: 0.7,
    });
    const lampX = rueX + (mix(-9, -34, lift) - 7) * scale,
      lampY = (mix(-25, -61, lift) + 14) * scale;
    ellipse(rueX - 16 * scale, 2, 15 * scale, 3 * scale, 'rgba(21,58,59,.20)');
    lantern(lampX, lampY, scale, 1, Math.sin(place * Math.PI) * 0.04);
    glow(lampX, lampY, 58 * scale, 0.22);
    ctx.restore();
    finish(t);
  }
  function driftwoodShot(t: number) {
    const portrait = W < 480,
      short = H < 300,
      lift = ease((t - 1.1) / 2.3),
      turn = ease((t - 3.4) / 1.8),
      working = Math.sin(Math.min(1, t / 1.1) * Math.PI * 4) * (1 - lift),
      s = Math.min(portrait ? 2.3 : short ? 1.4 : 2.5, (H * 0.63) / 130),
      x = W * (portrait ? 0.48 : 0.735),
      ground = H * 0.845;
    backdrop(t, 1);
    foregroundWater(H * 0.58, t, { x: W * (portrait ? 0.17 : 0.46), strength: 0.34 });
    const lightX = W * (portrait ? 0.11 : 0.46),
      lightY = H * 0.62;
    glow(lightX, lightY, 15, 0.5 + turn * 0.3);
    ellipse(lightX, lightY, 2.1, 2.1, '#ffe9b2');
    path(
      `M ${x - 100 * s} ${ground + 8 * s} Q ${x - 103 * s} ${ground - 1 * s} ${x - 80 * s} ${ground - 3 * s} L ${W + 20} ${ground - 3 * s} L ${W + 20} ${H + 20} L ${x - 85 * s} ${H + 20} Z`,
      '#496d65',
    );
    path(
      `M ${x - 97 * s} ${ground + 2 * s} L ${W + 20} ${ground - 3 * s} L ${W + 20} ${ground + 12 * s} L ${x - 90 * s} ${ground + 18 * s} Z`,
      '#a2916c',
      '#c8b38a',
      1.5,
    );
    for (let i = 0; i < 5; i++) {
      const y = ground + (22 + 12 * i) * s;
      line(
        [
          [x - 81 * s, y],
          [W, y - 6 * s],
        ],
        '#57766a',
        1.3,
      );
    }
    ctx.save();
    ctx.translate(x, ground);
    ctx.scale(s, s);
    ellipse(0, 3, 56, 8, 'rgba(21,58,59,.23)');
    ellipse(43, -8, 36, 13, '#5b4438', -0.24);
    line(
      [
        [24, -10],
        [48, -20],
        [62, -18],
      ],
      '#80634b',
      1.3,
    );
    line(
      [
        [32, -2],
        [53, -13],
        [69, -11],
      ],
      '#80634b',
      1.3,
    );
    line(
      [
        [41, -23],
        [50, -1],
      ],
      '#423c33',
      1,
    );
    line(
      [
        [52, -23],
        [62, -5],
      ],
      '#423c33',
      1,
    );
    ellipse(8, -33, 30, 36, '#8e6848', -0.1);
    ellipse(-3, -34, 20, 29, '#c3a47a', 0.15);
    ellipse(25, -36, 14, 29, '#76573f', -0.16);
    ellipse(-9, -1, 18, 6, '#8e6848');
    ellipse(20, -1, 19, 6, '#8e6848');
    line(
      [
        [-18, -1],
        [-10, -1],
      ],
      '#c3a47a',
      1.5,
    );
    ctx.save();
    ctx.translate(-4, -71);
    ctx.rotate(mix(0.08, -0.13, turn));
    ellipse(-17, -15, 9, 10, '#8e6848', -0.18);
    ellipse(17, -14, 9, 10, '#8e6848', 0.15);
    ellipse(-17, -15, 4, 5, '#b38a65');
    ellipse(17, -14, 4, 5, '#b38a65');
    ellipse(0, -2, 27, 25, '#8e6848');
    ellipse(12, 3, 16, 20, '#76573f');
    ellipse(-13, 12, 20, 13, '#c3a47a');
    ellipse(0, 12, 13, 12, '#c3a47a');
    ellipse(-23, 7, 8, 6, '#3f352d');
    ellipse(-11, -5, 2.6, 3, '#223b36');
    ellipse(9, -4, 2.2, 2.8, '#223b36');
    ellipse(-11.8, -6, 0.8, 0.9, '#fff0cd');
    ctx.fillStyle = '#f3e4bf';
    ctx.fillRect(-16, 21, 6, 7);
    ctx.fillRect(-9, 21, 6, 7);
    line(
      [
        [-18, 18],
        [-9, 20],
        [-1, 17],
      ],
      '#795b43',
      1.2,
    );
    line(
      [
        [-21, -15],
        [-9, -22],
        [7, -21],
      ],
      '#bf956a',
      1.5,
    );
    ctx.restore();
    const handX = mix(-46, -43, lift),
      handY = mix(-40 + working * 2, -109, lift);
    line(
      [
        [-16, -47],
        [-30, mix(-40, -73, lift)],
        [handX, handY],
      ],
      '#8e6848',
      12,
    );
    ellipse(handX, handY, 6.5, 6.5, '#b28b64');
    line(
      [
        [19, -44],
        [9 - turn * 4, -31],
      ],
      '#8e6848',
      11,
    );
    ellipse(9 - turn * 4, -31, 6.5, 6, '#b28b64');
    ctx.restore();
    const railX = x - 91 * s,
      railY = ground - 25 * s;
    path(
      `M ${railX} ${railY} L ${railX + 55 * s} ${railY - 2 * s} L ${railX + 55 * s} ${railY + 8 * s} L ${railX} ${railY + 10 * s} Z`,
      '#8d7754',
      '#d1bd92',
      1.2,
    );
    line(
      [
        [railX + 7 * s, railY + 8 * s],
        [railX + 10 * s, ground + 5 * s],
      ],
      '#6b624b',
      6 * s,
    );
    line(
      [
        [railX + 45 * s, railY + 7 * s],
        [railX + 42 * s, ground + 3 * s],
      ],
      '#6b624b',
      6 * s,
    );
    ellipse(railX + 15 * s, railY - 3 * s, 10 * s, 3.5 * s, '#b5a072');
    ellipse(railX + 15 * s, railY - 3 * s, 6 * s, 2 * s, '#706449');
    const lampX = x + (mix(-46, -43, lift) - 7) * s,
      lampY = ground + (mix(-40 + working * 2, -109, lift) + 14) * s;
    glow(lampX, lampY, 60 * s, 0.32);
    lantern(lampX, lampY, s, 1, Math.sin(lift * Math.PI) * -0.1);
    finish(t);
  }
  function launchBeaver(x: number, y: number, s: number, release: number, acknowledge: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(30, -6, 30, 11, '#5b4438', -0.18);
    line(
      [
        [12, -9],
        [42, -17],
        [53, -10],
      ],
      '#80634b',
      1.4,
    );
    line(
      [
        [26, -18],
        [32, 1],
      ],
      '#423c33',
      1.2,
    );
    line(
      [
        [39, -20],
        [44, -2],
      ],
      '#423c33',
      1.2,
    );
    ellipse(0, -28, 25, 31, '#8e6848');
    ellipse(-10, -30, 18, 25, '#c3a47a');
    ellipse(-13, -1, 17, 5, '#8e6848');
    ellipse(13, -1, 17, 5, '#8e6848');
    ctx.save();
    ctx.translate(-5, -60);
    ctx.rotate(mix(0.08, -0.1, acknowledge));
    ellipse(-15, -15, 8, 9, '#8e6848');
    ellipse(15, -14, 8, 9, '#8e6848');
    ellipse(-15, -15, 3.7, 4.6, '#b38a65');
    ellipse(15, -14, 3.7, 4.6, '#b38a65');
    ellipse(0, 0, 24, 23, '#8e6848');
    ellipse(-12, 11, 19, 12, '#c3a47a');
    ellipse(-24, 8, 7, 5, '#3f352d');
    ellipse(-9, -5, 2.5, 2.8, '#223b36');
    ellipse(9, -4, 2.1, 2.6, '#223b36');
    ellipse(-9.8, -6, 0.8, 0.9, '#fff0cd');
    ctx.fillStyle = '#f3e4bf';
    ctx.fillRect(-16, 20, 6, 7);
    ctx.fillRect(-9, 20, 6, 7);
    line(
      [
        [-17, 17],
        [-9, 19],
        [-1, 17],
      ],
      '#795b43',
      1.2,
    );
    ctx.restore();
    const handX = mix(-38, -33, release),
      handY = mix(-20, -65, release);
    line(
      [
        [-14, -37],
        [-29, mix(-23, -43, release)],
        [handX, handY],
      ],
      '#8e6848',
      11,
    );
    ellipse(handX, handY, 6, 6, '#b28b64');
    line(
      [
        [17, -34],
        [23, -20],
      ],
      '#8e6848',
      10,
    );
    ellipse(23, -20, 5.5, 5.5, '#b28b64');
    ctx.restore();
  }
  function readyFerry(x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(0, 29, 132, 10, 'rgba(20,61,65,.22)');
    path(
      'M -130 -13 Q -137 12 -105 31 Q 5 48 104 29 Q 130 20 139 -6 L 121 -31 L -105 -39 Z',
      '#d3a84e',
      '#b0aa7d',
      1.5,
    );
    path(
      'M -129 8 Q -110 31 -89 29 L 96 27 Q 123 23 137 4 Q 126 32 102 36 Q 0 49 -104 36 Q -128 28 -129 8 Z',
      '#b88f43',
    );
    path(
      'M -130 -14 Q -131 -27 -105 -41 Q 0 -48 118 -31 Q 135 -25 139 -6 Q 127 12 103 15 Q -6 26 -106 13 Z',
      '#e9c268',
      '#f0db9b',
      2.4,
    );
    path(
      'M -119 -15 Q -120 -28 -99 -32 Q 3 -39 115 -24 Q 128 -19 129 -7 Q 118 5 99 7 Q -3 17 -101 5 Z',
      '#bba37a',
      '#e6cf99',
      1.5,
    );
    for (let i = 0; i < 8; i++)
      line(
        [
          [-101 + 29 * i, -29],
          [-105 + 29 * i, 9],
        ],
        '#8a7f60',
        1,
      );
    path('M -106 -17 L -106 -84 L -32 -80 L -15 -63 L -15 -11 Z', '#a95e4f', '#d2b38c', 1.5);
    path('M -32 -80 L -15 -63 L -15 -11 L -32 -20 Z', '#804d45');
    path(
      'M -114 -86 L -89 -105 L -25 -96 L -7 -63 L -32 -74 L -111 -78 Z',
      '#b86c58',
      '#dfb88a',
      1.8,
    );
    line(
      [
        [-82, -103],
        [-63, -82],
      ],
      '#d58b6b',
      1.2,
    );
    line(
      [
        [-54, -99],
        [-37, -78],
      ],
      '#d58b6b',
      1.2,
    );
    ctx.fillStyle = '#3c615b';
    ctx.fillRect(-96, -67, 25, 27);
    ctx.fillRect(-60, -65, 21, 27);
    ctx.fillStyle = '#ead7a9';
    ctx.fillRect(-92, -63, 17, 19);
    ctx.fillRect(-56, -61, 13, 19);
    line(
      [
        [-84, -100],
        [-84, -119],
      ],
      '#425b50',
      6,
    );
    line(
      [
        [-106, -17],
        [-32, -13],
      ],
      '#e9cf93',
      2,
    );
    for (const [xx, yy] of [
      [-120, -15],
      [-4, 17],
      [51, 15],
      [100, 10],
      [126, -10],
    ]) {
      line(
        [
          [xx, yy],
          [xx, yy - 17],
        ],
        '#657363',
        2.4,
      );
    }
    line(
      [
        [-120, -32],
        [-106, -32],
      ],
      '#e8d5a2',
      2.3,
    );
    line(
      [
        [-4, 0],
        [51, -2],
        [100, -7],
        [126, -27],
      ],
      '#e8d5a2',
      2.3,
    );
    ellipse(-119, 8, 7, 9, '#465b54');
    ellipse(74, 25, 7, 9, '#465b54');
    ellipse(-119, 8, 3, 4.5, '#bb9a54');
    ellipse(74, 25, 3, 4.5, '#bb9a54');
    ctx.restore();
  }
  function launchShot(t: number) {
    const portrait = W < 480,
      short = H < 300,
      release = ease((t - 1.1) / 2),
      glide = ease((t - 3.1) / 3.2),
      acknowledge = ease((t - 5.8) / 1.4),
      settle = t < 6.1 ? 0 : Math.sin((t - 6.1) * Math.PI * 1.4) * Math.max(0, 1 - (t - 6.1) / 1.6),
      s = Math.min(
        portrait ? (W * 0.88) / 280 : (W * 0.4) / 280,
        H / 210,
        portrait ? 1.2 : short ? 1.02 : 1.8,
      ),
      ground = H * (portrait ? 0.58 : 0.56),
      quayLeft = W * (portrait ? 0.58 : 0.81),
      shoreTop = ground - 22 * s,
      waterline = ground + 69 * s,
      boatX = W * (portrait ? 0.5 : 0.625) - glide * 19 * s,
      boatY = waterline - 35 * s + settle * 1.1,
      nellS = s * 0.77,
      nellX = quayLeft + 30 * s,
      nellFeet = ground - 3 * s,
      cleatX = nellX - 34 * nellS,
      cleatY = nellFeet - 14 * nellS;
    backdrop(t, 1);
    foregroundWater(ground + 8 * s, t, { x: boatX, strength: 0.3 });
    path(
      `M ${quayLeft + 38 * s} ${shoreTop} Q ${W * 0.89} ${shoreTop - 15 * s} ${W + 30} ${shoreTop - 30 * s} L ${W + 30} ${waterline + 38 * s} Q ${W * 0.89} ${waterline + 12 * s} ${quayLeft + 52 * s} ${waterline - 12 * s} Z`,
      '#648478',
    );
    path(
      `M ${quayLeft + 38 * s} ${shoreTop} Q ${W * 0.89} ${shoreTop - 15 * s} ${W + 30} ${shoreTop - 30 * s} L ${W + 30} ${ground + 2 * s} Q ${W * 0.88} ${ground + 20 * s} ${quayLeft + 36 * s} ${ground + 14 * s} Z`,
      '#a6aa85',
      '#d2c69d',
      1.4,
    );
    for (const offset of [5, 65, 127]) {
      const px = quayLeft + offset * s;
      line(
        [
          [px, ground + 4 * s],
          [px, waterline + 16 * s],
        ],
        '#536b59',
        8 * s,
      );
      line(
        [
          [px - 2 * s, ground + 7 * s],
          [px - 2 * s, waterline + 12 * s],
        ],
        '#a69b73',
        2 * s,
      );
      ellipse(px, waterline + 14 * s, 13 * s, 2.1 * s, 'rgba(38,79,74,.24)');
    }
    path(
      `M ${quayLeft - 13 * s} ${ground - 5 * s} L ${W + 25} ${ground - 17 * s} L ${W + 25} ${ground + 1 * s} L ${quayLeft - 13 * s} ${ground + 12 * s} Z`,
      '#9d8c66',
      '#d5bf90',
      1.4,
    );
    path(
      `M ${quayLeft - 13 * s} ${ground + 12 * s} L ${W + 25} ${ground + 1 * s} L ${W + 25} ${ground + 9 * s} L ${quayLeft - 13 * s} ${ground + 20 * s} Z`,
      '#726c51',
    );
    for (let px = quayLeft; px < W + 25; px += 19 * s)
      line(
        [
          [px, ground - 5 * s],
          [px + 4 * s, ground + 10 * s],
        ],
        '#b9aa80',
        1,
      );
    const houseX = W * 0.94,
      houseY = shoreTop - 3 * s,
      houseS = s * 0.7;
    ctx.save();
    ctx.translate(houseX, houseY);
    ctx.scale(houseS, houseS);
    path('M -58 0 L -58 -71 L 38 -71 L 38 0 Z', '#729181', '#b4b695', 1.5);
    path('M -66 -71 L -13 -106 L 47 -70 Z', '#536e70', '#a6a78b', 1.6);
    path('M -24 0 L -24 -55 Q 0 -70 20 -53 L 20 0 Z', '#345c5c');
    line(
      [
        [-47, -61],
        [-47, -4],
      ],
      '#abc0a0',
      3,
    );
    ctx.restore();
    const helperS = s * (portrait ? 0.46 : 0.48);
    rabbit(quayLeft + 78 * s, ground - 6 * s, helperS, 'cream', {
      guide: Math.sin(release * Math.PI) * 0.9,
      head: mix(-0.13, 0.09, glide),
    });
    rabbit(quayLeft + 111 * s, ground - 9 * s, helperS * 0.93, 'tan', {
      head: mix(-0.14, 0.07, acknowledge),
      warmth: 0.35,
    });
    readyFerry(boatX, boatY, s);
    line(
      [
        [cleatX - 8 * s, cleatY],
        [cleatX + 8 * s, cleatY],
      ],
      '#4b6157',
      4 * s,
    );
    line(
      [
        [cleatX, cleatY],
        [cleatX, ground + 7 * s],
      ],
      '#4b6157',
      4 * s,
    );
    if (release < 1) {
      ctx.globalAlpha = 1 - release;
      line(
        [
          [cleatX, cleatY],
          [mix(cleatX, boatX + 125 * s, 0.5), mix(cleatY, boatY - 13 * s, 0.5) + release * 12 * s],
          [boatX + 125 * s, boatY - 13 * s],
        ],
        '#d6be8d',
        2.6 * s,
      );
      ctx.globalAlpha = 1;
    }
    launchBeaver(nellX, nellFeet, nellS, release, acknowledge);
    const handX = nellX + mix(-38, -33, release) * nellS,
      handY = nellFeet + mix(-20, -65, release) * nellS;
    line(
      [
        [cleatX, cleatY],
        [handX - 8 * nellS, handY + 15 * nellS],
        [handX, handY],
      ],
      '#d6be8d',
      2.3,
    );
    if (glide > 0) {
      ctx.globalAlpha = 0.35 * Math.sin(glide * Math.PI);
      for (let i = 0; i < 3; i++)
        line(
          [
            [boatX + 141 * s + i * 8, waterline + i * 4],
            [boatX + 165 * s + i * 9, waterline + 1 + i * 4],
          ],
          '#dce5c9',
          1.6,
        );
      ctx.globalAlpha = 1;
    }
    finish(t);
  }
  return {
    durations,
    resize(width: number, height: number, dpr = 1) {
      W = Math.max(1, width);
      H = Math.max(1, height);
      DPR = Math.max(1, Math.min(2, dpr));
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
    },
    draw(illustration: StoryIllustration, elapsedSeconds: number) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = Math.max(
        0,
        Math.min(durations[illustration], Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0),
      );
      ({
        tide: tideShot,
        lantern: lanternShot,
        ferry: answerShot,
        harbor: harborShot,
        driftwood: driftwoodShot,
        launch: launchShot,
      })[illustration](t);
    },
  };
}
