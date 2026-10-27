export type StoryIllustration = 'tide' | 'lantern' | 'ferry' | 'harbor';
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
  const durations: Record<StoryIllustration, number> = { tide: 6, lantern: 6, ferry: 7, harbor: 5 };
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
    const portrait = W < 480,
      short = H < 300,
      place = ease((t - 0.6) / 2.6),
      rest = ease((t - 3.4) / 1.1),
      lift = 1 - place;
    backdrop(t, 1);
    tower(W * 0.86, H * 0.46, portrait ? 0.62 : short ? 0.53 : 0.78);
    const distantX = W * (portrait ? 0.15 : 0.45),
      distantY = H * 0.51;
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
    foregroundWater(H * 0.61, t, { x: distantX, strength: 0.3 });
    const boatScale = portrait ? Math.min(0.6, W / 650) : short ? 0.62 : 0.94;
    boat(W * (portrait ? 0.18 : 0.3), H * 0.88, boatScale, 7, 1, false, false);
    const ground = H * (portrait ? 0.765 : 0.82),
      left = W * (portrait ? 0.34 : 0.54),
      right = W + 20;
    path(
      `M ${left} ${ground + 9} Q ${left + 8} ${ground - 8} ${left + 35} ${ground - 8} L ${right} ${ground - 8} L ${right} ${H + 20} L ${left + 20} ${H + 20} Z`,
      C.rock,
    );
    path(
      `M ${left} ${ground + 9} Q ${left + 8} ${ground - 8} ${left + 35} ${ground - 8} L ${right} ${ground - 8} L ${right} ${ground + 13} L ${left + 14} ${ground + 17} Z`,
      C.grass,
    );
    line(
      [
        [left + 12, ground + 17],
        [right, ground + 13],
      ],
      '#b8bb96',
      2,
    );
    line(
      [
        [left + 19, ground + 24],
        [left + 32, H],
      ],
      '#729482',
      1.3,
    );
    const scale = Math.min(portrait ? 1.55 : short ? 1.02 : 1.75, (H * 0.4) / 91),
      rueX = W * (portrait ? 0.5 : 0.66),
      pipX = W * (portrait ? 0.72 : 0.79),
      mossX =
        portrait && W < 360
          ? Math.min(W * 0.855, W - 38 * scale * 0.87 - 6)
          : W * (portrait ? 0.855 : 0.915);
    const mossSettle = ease((t - 0.5) / 2);
    sheep(mossX, ground - 3 + mossSettle * 2, scale * 0.87, Math.sin(mossSettle * Math.PI) * 0.12);
    rabbit(pipX, ground, scale * 0.82, 'cream', {
      head: mix(0.1, -0.16, ease((t - 1.7) / 1.7)),
      warmth: 0.45,
    });
    rabbit(rueX, ground, scale, 'tan', {
      lift,
      restHand: rest,
      head: mix(-0.12, 0.05, place),
      warmth: 0.7,
    });
    const lampX = rueX + (mix(-9, -34, lift) - 7) * scale,
      lampY = ground + (mix(-25, -61, lift) + 14) * scale;
    ellipse(rueX - 16 * scale, ground + 2, 15 * scale, 3 * scale, 'rgba(21,58,59,.20)');
    lantern(lampX, lampY, scale, 1, Math.sin(place * Math.PI) * 0.04);
    glow(lampX, lampY, 58 * scale, 0.22);
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
      ({ tide: tideShot, lantern: lanternShot, ferry: answerShot, harbor: harborShot })[
        illustration
      ](t);
    },
  };
}
