import type { IllustrationId } from './registry';

export type StoryIllustration = IllustrationId;
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
    reeds: 7,
    reef: 7,
    orchard: 7,
    ternhaven: 7,
    'drowned-orchard': 7,
    'last-lights': 7,
    'far-shore': 6,
    'last-ferry': 6,
    supper: 8,
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
  function rabbit(x: number, y: number, s: number, kind: 'tan' | 'cream' | 'honey-tan', p: RabbitPose = {}) {
    const lift = p.lift || 0,
      step = p.step || 0,
      head = p.head || 0,
      warmth = p.warmth || 0,
      guide = p.guide || 0;
    const base = kind === 'honey-tan' ? '#c79869' : kind === 'tan' ? C.tan : C.cream,
      shade = kind === 'honey-tan' ? '#a47c55' : kind === 'tan' ? '#7d927b' : '#a3b8a6',
      rim = kind === 'honey-tan' ? '#f2d6a0' : kind === 'tan' ? '#e1c89b' : '#efdfb9';
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
    ellipse(-11, -38, 2.1, 17, kind === 'honey-tan' ? '#d6a083' : kind === 'tan' ? '#c5ad88' : '#d7c7ab', -0.17);
    ellipse(6, -38, 1.9, 15, kind === 'honey-tan' ? '#d6a083' : kind === 'tan' ? '#c5ad88' : '#d7c7ab', 0.16);
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
    occupied: boolean | (() => void) = true,
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
    if (typeof occupied === 'function') occupied();
    else if (occupied) sheep(43, -10, 0.85, Math.sin(ease((t - 0.8) / 1.8) * Math.PI) * -0.16);
    const lampPost = typeof occupied === 'function' ? 92 : 80;
    line([[lampPost, -6], [lampPost, -41]], '#52654e', 3);
    lantern(lampPost, -42, 0.78, 1);
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
  function backdrop(t: number, variant = 0, skyHeight = H) {
    const sky = ctx.createLinearGradient(0, 0, 0, skyHeight * 0.72);
    sky.addColorStop(0, '#b0a9bb');
    sky.addColorStop(0.42, '#ddc7b9');
    sky.addColorStop(1, '#f2dbb6');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    const mx = W * (variant === 1 ? 0.8 : 0.66),
      my = skyHeight * (variant === 1 ? 0.25 : 0.21);
    glow(mx, my, skyHeight * 0.22, 0.14);
    ellipse(mx, my, Math.min(23, skyHeight * 0.058), Math.min(23, skyHeight * 0.058), '#ece2bf');
    const shift = Math.sin(t * 0.1) * 2;
    path(
      `M -20 ${skyHeight * 0.48} Q ${W * 0.03 + shift} ${skyHeight * 0.34} ${W * 0.17} ${skyHeight * 0.41} Q ${W * 0.28} ${skyHeight * 0.29} ${W * 0.42} ${skyHeight * 0.43} Q ${W * 0.57} ${skyHeight * 0.3} ${W * 0.75} ${skyHeight * 0.45} Q ${W * 0.91} ${skyHeight * 0.38} ${W + 20} ${skyHeight * 0.49} L ${W + 20} ${skyHeight * 0.65} L -20 ${skyHeight * 0.65} Z`,
      '#9cafaa',
    );
    path(
      `M -20 ${skyHeight * 0.55} Q ${W * 0.1} ${skyHeight * 0.45} ${W * 0.29} ${skyHeight * 0.51} Q ${W * 0.49} ${skyHeight * 0.4} ${W * 0.65} ${skyHeight * 0.51} Q ${W * 0.86} ${skyHeight * 0.42} ${W + 20} ${skyHeight * 0.55} L ${W + 20} ${skyHeight * 0.68} L -20 ${skyHeight * 0.68} Z`,
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
  function launchBeaver(x: number, y: number, s: number, release: number, acknowledge: number, waveToBoat = false) {
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
    ctx.translate(-5, -60 - (waveToBoat ? acknowledge * 3.5 : 0));
    ctx.rotate(waveToBoat ? mix(-0.09, 0.14, acknowledge) : mix(0.08, -0.1, acknowledge));
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
    const handX = mix(-38, waveToBoat ? -57 : -33, release),
      handY = mix(-20, -65, release);
    line(
      [
        [-14, -37],
        [mix(-29, waveToBoat ? -49 : -29, release), mix(-23, -43, release)],
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
  function readyFerry(x: number, y: number, scale: number, passengers?: () => void) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ellipse(0, 38, 106, 7, 'rgba(20,61,65,.24)');
    path('M -106 -16 C -117 -5 -108 20 -88 33 C -53 53 35 54 72 35 Q 99 23 117 -20 L 105 -31 C 49 -12 -61 -12 -106 -16 Z', '#ce933b');
    path('M -105 1 C -91 35 -35 42 19 39 Q 78 38 107 1 Q 88 43 43 47 Q -46 59 -87 36 Q -104 24 -105 1 Z', '#996d40');
    path('M -96 21 C -51 47 62 47 97 18 C 57 58 -63 55 -96 21 Z', '#8c5d40');
    path('M -108 -17 C -103 -37 -73 -42 -39 -37 C 14 -33 78 -30 109 -39 Q 120 -36 117 -22 C 98 2 53 15 0 15 C -55 15 -96 7 -108 -17 Z', '#e8bd68', '#e7cd8e', 1.7);
    path('M -99 -17 C -91 -32 -64 -34 -40 -31 C 15 -27 78 -24 105 -33 C 97 -17 59 4 5 6 C -44 7 -84 1 -99 -17 Z', '#be986b');
    path('M -108 -16 C -91 13 -45 17 1 17 C 53 17 98 4 117 -21 L 113 -12 C 88 12 49 22 1 22 C -49 22 -92 16 -106 -7 Z', '#f7df9e');
    for (const [a, b] of [[8, 4], [35, 29], [61, 54], [85, 78]])
      line([[a, -23], [b, b > 52 ? -5 : 4]], '#a98760', 1.2);
    path('M -85 -19 L -82 -73 Q -82 -83 -72 -85 L -14 -82 Q -7 -82 -4 -74 L 0 -12 Q -36 -5 -85 -14 Z', '#b65f4c', '#ddae7f', 1.5);
    path('M -12 -81 Q 4 -83 15 -71 L 18 -21 L 0 -12 L -4 -73 Z', '#8e5043');
    path('M -93 -78 Q -91 -91 -73 -96 Q -41 -102 -11 -92 Q 6 -89 19 -76 Q 23 -69 14 -67 L -4 -74 Q -58 -83 -89 -74 Z', '#ad5346', '#d08c68', 2);
    path('M -91 -83 Q -58 -98 -12 -88 Q 5 -85 14 -78', null, '#df966e', 2.3);
    path('M -69 -91 L -69 -111 Q -66 -116 -59 -113 L -57 -91 Z', '#48615b');
    ellipse(-64, -113, 7, 3, '#354e49');
    line([[-69, -108], [-58, -107]], '#d5c69b', 2.6);
    path('M -73 -64 Q -73 -68 -68 -68 L -48 -66 L -47 -39 L -73 -40 Z', '#e3c78e');
    path('M -68 -62 L -52 -61 L -52 -44 L -68 -45 Z', '#56858a');
    path('M -39 -63 Q -39 -66 -34 -65 L -15 -64 L -13 -38 L -38 -39 Z', '#e3c78e');
    path('M -34 -60 L -19 -59 L -18 -43 L -33 -43 Z', '#396972');
    path('M 0 -61 L 10 -58 L 11 -38 L 1 -36 Z', '#78a5a0');
    line([[-67, -60], [-62, -59]], '#9dc3b6', 2.2);
    passengers?.();
    line([[-16, -8], [-16, -25]], '#876d50', 2.5);
    line([[35, 10], [35, -6], [71, -12], [103, -27]], '#e1c597', 2.7);
    line([[71, 3], [71, -12]], '#8b765b', 2.5);
    line([[104, -11], [104, -27]], '#8b765b', 2.5);
    for (const [fx, fy] of [[-80, 19], [55, 24]]) {
      ellipse(fx, fy, 7.2, 9.1, '#40524e', -0.1);
      ellipse(fx, fy, 3.2, 4.1, '#c5964d', -0.1);
    }
    ctx.restore();
  }
  function connectionLayout() {
    const portrait = W < 600;
    const left = portrait ? 0 : W * 0.4;
    return {
      portrait,
      center: (W + left) / 2,
      scale: Math.min((W - left - 12) / 320, H / 216, 2.3),
    };
  }
  function aboardBeaver(x: number, y: number, size: number, paw: number, turn: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-size, size);
    launchBeaver(0, 0, 1, paw, turn);
    ctx.restore();
  }
  function approachWake(x: number, y: number, progress: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.6 * Math.sin(Math.PI * progress);
    path('M -90 21 Q -108 27 -132 26 M -101 27 Q -128 36 -149 32', null, '#dce5c9', 1.8);
    ctx.restore();
  }
  function reedsShot(seconds: number) {
    const t = Math.min(seconds, 5.8);
    const { portrait, center, scale } = connectionLayout();
    const approach = ease((t - 0.25) / 4.0);
    const step = ease((t - 1.25) / 1.85);
    const greeting = ease((t - 2.65) / 1.3);
    const answer = ease((t - 3.75) / 1.5);
    const bankY = H * (portrait ? 0.55 : 0.575);
    backdrop(t, 1);
    foregroundWater(H * 0.47, t, { x: center + 76 * scale, strength: 0.24 });
    ctx.save();
    ctx.translate(center, bankY);
    ctx.scale(scale, scale);
    ellipse(110, 24, 80, 6, 'rgba(25,69,68,.20)');
    path('M 22 7 Q 36 -4 54 -5 Q 84 -18 110 -10 Q 144 -18 185 -7 L 195 8 Q 180 25 155 21 Q 124 28 86 24 Q 48 26 22 13 Z', '#697f6b');
    path('M 22 7 Q 36 -4 54 -5 Q 84 -18 110 -10 Q 144 -18 185 -7 L 191 3 Q 170 8 150 7 Q 105 17 70 10 Q 42 15 22 7 Z', '#a7ab7e');
    path('M 25 13 Q 52 22 75 20 M 93 24 Q 121 26 146 22', null, '#c9c8a0', 1.5);
    reeds(139, -2, 0.82, t, false);
    reeds(69, -7, 0.57, -t, false);
    const rabbitX = mix(126, 86, step);
    rabbit(rabbitX, 3, 0.83, 'cream', {
      step,
      head: mix(0.13, -0.16, greeting),
      lift: greeting,
    });
    reeds(145, 9, 0.73, t, false);
    path('M 47 13 Q 65 9 75 11 M 100 13 Q 107 7 115 9', null, '#c0bc92', 1.3);
    const boatX = mix(-51, -11, approach);
    const boatY = Math.min((H - bankY) / scale - 45, (portrait ? 113 : 58) - 5 * approach);
    approachWake(boatX, boatY, approach);
    boat(boatX, boatY, 1, t, approach, () => {
      aboardBeaver(58, -13, 0.53, 0.06, greeting);
      aboardBeaver(18, -7, 0.6, answer, answer);
    }, false);
    ctx.restore();
    finish(t);
  }
  function wrackLanding(x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ellipse(1, 15, 53, 5, 'rgba(36,71,68,.18)');
    path('M -56 5 Q -40 -11 -12 -8 Q 15 -17 39 -6 L 57 2 L 49 13 Q 5 22 -43 14 Z', '#63857f');
    path('M -56 5 Q -40 -11 -12 -8 Q 15 -17 39 -6 L 57 2 Q 16 9 -36 9 Z', '#afaf8f');
    path('M -47 4 Q -41 2 -33 2 L -16 -5 L -14 -3 L -30 5 L -26 9 L -31 10 Z', '#876f58');
    line([[-44, 5], [-34, 4], [-25, 0]], '#c5aa81', 1.4);
    ctx.restore();
  }
  function shellLanding(x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ellipse(3, 20, 48, 4, 'rgba(35,71,69,.22)');
    path('M -51 1 L -38 -9 Q -15 -14 7 -10 L 31 -17 L 53 -3 L 48 12 L 30 20 L -30 16 Z', '#6c8980');
    path('M -51 1 L -38 -9 Q -11 -13 7 -10 L 31 -17 L 53 -3 Q 21 10 -31 7 Z', '#bdba98');
    ellipse(27, -4, 10, 3.6, '#7fa5a0', -0.08);
    for (const [sx, sy] of [[18, 4], [29, 2], [41, -3]]) {
      path(`M ${sx} ${sy} q -5 -1 -4 -4 q 1 -3 3 -2 q 3 -3 5 0 q 2 2 -4 6 Z`, '#ded2ae');
      line([[sx, sy - 1], [sx + 1, sy - 4]], '#a79e85', 0.8);
    }
    ctx.restore();
  }
  function reefRocks(x: number, y: number, scale: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ellipse(0, 3, 42, 6, '#80a69a');
    path('M -35 1 L -21 -9 L -11 -7 L -5 -16 L 8 -13 L 20 -3 L 33 1 L 21 5 L -22 4 Z', '#496f70');
    path('M -21 -9 L -11 -7 L -5 -16 L 8 -13 L 0 -8 L -4 -2 L -18 0 Z', '#8f9e92');
    path('M -42 4 Q -33 8 -19 7 M 15 6 Q 28 7 38 3', null, '#d0d6b8', 1.3);
    ctx.restore();
  }
  function reefShot(seconds: number) {
    const t = Math.min(seconds, 6);
    const { portrait, center, scale } = connectionLayout();
    const approach = ease((t - 0.15) / 4.45);
    const firstLight = ease((t - 1.15) / 1.85);
    const answeringLight = ease((t - 3.05) / 2.1);
    const ground = H * (portrait ? 0.53 : 0.5);
    backdrop(t);
    foregroundWater(H * 0.43, t, { x: center + 82 * scale, strength: 0.2 + firstLight * 0.22 });
    ctx.save();
    ctx.translate(center, ground);
    ctx.scale(scale, scale);
    const dotX = portrait ? -72 : 32;
    const flickX = portrait ? 93 : 129;
    const shellY = portrait ? -21 : 1;
    const wrackY = portrait ? 0 : -15;
    shellLanding(flickX, shellY, 0.86);
    rabbit(flickX - 2, shellY, 0.64, 'tan', {
      lift: firstLight, head: -0.07 * firstLight, lantern: true, warmth: firstLight,
    });
    wrackLanding(dotX, wrackY, 0.95);
    ctx.save();
    ctx.translate(dotX, wrackY);
    ctx.scale(-1, 1);
    rabbit(0, 0, 0.72, 'cream', {
      lift: answeringLight, head: -0.14 * answeringLight, lantern: true, warmth: answeringLight,
    });
    ctx.restore();
    reefRocks(portrait ? 29 : 75, portrait ? 44 : 32, 0.79);
    reefRocks(portrait ? 113 : 130, portrait ? 68 : 57, 0.54);
    const boatX = mix(portrait ? -31 : -75, portrait ? 8 : -46, approach);
    const boatY = Math.min((H - ground) / scale - (portrait ? 59 : 50), (portrait ? 151 : 88) - 5 * approach);
    approachWake(boatX, boatY + 18, approach);
    readyFerry(boatX, boatY, portrait ? 1.08 : 0.94, () => {
      aboardBeaver(77, -16, 0.60, 0.1, firstLight);
      sheep(28, -7, 0.78, -0.13 * Math.sin(answeringLight * Math.PI));
    });
    ctx.restore();
    finish(t);
  }
  function orchardTree(x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(2, 4, 40, 6, 'rgba(28,64,58,.17)');
    path('M -6 3 Q -4 -24 -14 -49 L -8 -53 L 1 -34 L 15 -62 L 20 -58 L 8 -27 L 8 3 Z', '#796850', '#b39c70', 1.2);
    for (const [px, py, rx, ry, color] of [
      [-19, -64, 32, 27, '#6c8c74'], [17, -70, 34, 30, '#77957a'],
      [41, -52, 27, 24, '#638674'], [-42, -46, 27, 24, '#819879'],
      [3, -45, 38, 29, '#859d79'],
    ] as const) ellipse(px, py, rx, ry, color, -0.12);
    path('M -47 -52 Q -35 -66 -21 -64 M -5 -79 Q 17 -90 32 -72 M 13 -47 Q 30 -54 42 -42', null, '#b1b792', 1.8);
    for (const [px, py] of [[-37, -44], [-13, -65], [22, -70], [35, -41], [3, -35]]) {
      ellipse(px, py, 4.8, 5.4, '#bb7255');
      ellipse(px - 1.4, py - 1.2, 1.4, 2.3, '#e1a77b');
      line([[px, py - 4], [px + 1.5, py - 8]], '#4e6655', 1.1);
    }
    ctx.restore();
  }
  function orchardDeer(x: number, y: number, s: number, look: number, greeting: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ellipse(4, 3, 36, 6, 'rgba(30,61,52,.21)');
    for (const [lx, ly] of [[24, -28], [5, -29]]) {
      path(`M ${lx - 5} ${ly} Q ${lx - 7} -6 ${lx - 4} 0 L ${lx + 4} 0 L ${lx + 6} ${ly} Z`, '#905d39');
      ellipse(lx, 0, 6.6, 4.2, '#4f4937');
    }
    ellipse(12, -40, 28, 37, '#b67e4c', -0.13);
    ellipse(27, -40, 16, 30, '#98623c', -0.11);
    ellipse(35, -54, 8, 13, '#e4cd9a', 0.47);
    path('M -15 -43 Q -20 -27 -22 -3 L -15 0 Q -10 -23 -6 -41 Z', '#bc8550');
    ellipse(-19, -1, 6.9, 4.1, '#514936');
    const hoofX = mix(-4, -27, greeting), hoofY = mix(-2, -48, greeting);
    line([[0, -47], [mix(-2, -21, greeting), mix(-23, -36, greeting)], [hoofX, hoofY]], '#c38b54', 10);
    ellipse(hoofX, hoofY, 7, 5, '#574a36', -0.35 * greeting);
    path('M -10 -63 Q -16 -51 -8 -33 Q 4 -23 11 -41 L 8 -68 Z', '#d8bb84');
    for (const [px, py, rr] of [[16, -61, 3.5], [28, -51, 4], [18, -42, 3.1], [31, -35, 3.1]])
      ellipse(px, py, rr, rr * 1.25, '#ebd6a2', -0.2);
    ctx.save();
    ctx.translate(-7, -78 + 6 * (1 - look));
    ctx.rotate(mix(-0.22, 0.045, look));
    for (const [sx, sy, tilt] of [[-21, -18, -0.64], [21, -18, 0.64]]) {
      ellipse(sx, sy, 8.5, 17, '#bc8757', tilt);
      ellipse(sx, sy, 4.6, 11, '#dfb78a', tilt);
    }
    line([[-12, -30], [-16, -50], [-22, -62]], '#7b6543', 5);
    line([[-17, -52], [-8, -61]], '#8b7350', 4);
    line([[12, -31], [15, -51], [24, -63]], '#7b6543', 5);
    line([[15, -51], [7, -60]], '#927b54', 4);
    ellipse(0, -6, 22, 28, '#ba8251', 0.05);
    ellipse(5, 5, 17, 17, '#dbc18c', 0.07);
    ellipse(-7, 8, 12, 11, '#e5cc98', -0.12);
    ellipse(-13, 5, 6.2, 5.4, '#514b36');
    ellipse(-12, -11, 4.3, 6.0, '#544d35');
    ellipse(12, -9, 4.2, 6.0, '#544d35');
    ellipse(-13, -13, 1.3, 2, '#f4e4bc');
    ellipse(11, -11, 1.3, 2, '#f4e4bc');
    path('M -10 17 Q -3 21 4 17', null, '#8f7650', 1.2);
    path('M -14 -27 Q -3 -35 10 -26', null, '#d4a66d', 2);
    ctx.restore();
    ctx.restore();
  }
  function orchardShot(seconds: number) {
    const t = Math.min(seconds, 6.1);
    const portrait = W < 600;
    const scale = portrait
      ? Math.min((W - 28) / 350, (H - 64) / 365, 1.4)
      : Math.min((W * 0.6 - 24) / 400, (H - 34) / 235, 1.9);
    const center = W * (portrait ? 0.5 : 0.705);
    const ground = H * (portrait ? 0.47 : 0.53);
    const approach = ease((t - 0.2) / 4.3);
    const look = ease((t - 1.2) / 1.6);
    const greeting = ease((t - 2.45) / 0.9) * (1 - ease((t - 4.25) / 1.15));
    const orchardX = portrait ? 76 : 131;
    const orchardY = portrait ? -35 : 12;
    const springX = portrait ? -101 : -119;
    const springY = portrait ? 57 : 27;
    backdrop(t, 1);
    foregroundWater(H * 0.47, t, { x: center + 53 * scale, strength: 0.2 });
    ctx.save();
    ctx.translate(center, ground);
    ctx.scale(scale, scale);
    ctx.save();
    ctx.translate(orchardX, orchardY);
    ellipse(6, 20, 85, 8, 'rgba(29,66,61,.19)');
    path('M -53 -1 Q -38 -19 -10 -18 Q 31 -30 73 -15 L 95 -2 L 85 16 Q 58 32 14 28 L -48 20 Z', '#647b65');
    path('M -53 -1 Q -38 -19 -10 -18 Q 31 -30 73 -15 L 95 -2 Q 68 7 26 8 Q -16 10 -53 -1 Z', '#a3aa78');
    path('M -48 20 Q -16 29 14 28 M 34 28 Q 63 27 82 17', null, '#d1c59a', 1.6);
    orchardTree(47, -18, portrait ? 0.88 : 0.80);
    path('M -53 2 L -21 0 L -14 12 L -57 16 Z', '#acaa89', '#d7c9a3', 1.3);
    line([[-47, 9], [-23, 7]], '#828e75', 1.2);
    orchardDeer(-14, 4, portrait ? 0.88 : 0.81, look, greeting);
    ctx.restore();
    ctx.save();
    ctx.translate(springX, springY);
    ellipse(4, 30, 72, 6, 'rgba(29,66,61,.19)');
    path('M -73 -3 Q -65 -22 -33 -21 Q 2 -27 38 -15 L 57 3 L 49 19 Q 24 33 -19 32 L -66 22 Z', '#738875');
    path('M -73 -3 Q -65 -22 -33 -21 Q 2 -27 38 -15 L 57 3 Q 18 13 -21 10 L -73 6 Z', '#b3b292');
    for (let i = 0; i < 3; i++) {
      const sx = 26 + i * 7, sy = 12 + i * 8;
      path(`M ${sx - 17} ${sy} L ${sx + 25} ${sy - 3} L ${sx + 29} ${sy + 5} L ${sx - 17} ${sy + 8} Z`, '#b0ad8e', '#d3c8a2', 1);
      line([[sx - 14, sy + 8], [sx + 27, sy + 5]], '#7c8d7a', 1.5);
    }
    sheep(-24, 2, portrait ? 0.95 : 0.91, -0.05 * look);
    rabbit(22, 3, portrait ? 0.72 : 0.63, 'tan', { head: -0.1 * look });
    ctx.restore();
    const boatX = mix(portrait ? -10 : -49, portrait ? 34 : -5, approach);
    const boatY = (portrait ? 155 : 89) - 5 * approach;
    approachWake(boatX, boatY + 22, approach);
    readyFerry(boatX, boatY, portrait ? 1.02 : 0.84);
    ctx.restore();
    finish(t);
  }
  function ternhavenShot(seconds: number) {
    const t = Math.min(seconds, 5.9);
    const portrait = W < 600;
    const scale = portrait
      ? Math.min((W - 16) / 325, (H - 56) / 283, 1.45)
      : Math.min((W * 0.61 - 18) / 377, (H - 26) / 208, 2.24);
    const center = W * (portrait ? 0.50 : 0.694);
    const approach = ease((t - 0.12) / 4.55);
    const look = ease((t - 1.18) / 1.18);
    const wave = ease((t - 2.55) / 0.9) * (1 - 0.82 * ease((t - 4.3) / 1.15));
    backdrop(t, 1);
    foregroundWater(H * (portrait ? 0.42 : 0.48), t);
    ctx.save();
    ctx.translate(center, H * (portrait ? 0.48 : 0.53));
    ctx.scale(scale, scale);

    ctx.save();
    ctx.translate(portrait ? 69 : 126, portrait ? -17 : -5);
    ellipse(5, 14, 69, 6, 'rgba(30,66,68,.22)');
    path('M -63 2 Q -52 -8 -38 -8 Q -19 -16 7 -13 Q 43 -22 64 -5 L 78 4 Q 65 19 37 20 L -2 22 Q -44 18 -63 10 Z', '#647d6c');
    path('M -63 2 Q -52 -8 -38 -8 Q -19 -16 7 -13 Q 43 -22 64 -5 L 78 4 Q 49 3 30 8 Q 2 13 -17 7 Q -48 10 -63 2 Z', '#a6ad82');
    path('M -55 12 Q -29 20 -6 19 M 20 21 Q 48 20 63 13', null, '#c9c6a3', 1.4);
    reeds(45, -7, 0.79, t, false);
    reeds(61, -2, 0.49, t + 2, false);
    ellipse(0, 2, 33, 4, 'rgba(60,75,54,.19)');
    launchBeaver(-7, 0, portrait ? 0.97 : 0.88, wave, look, true);
    path('M -48 5 Q -40 3 -36 4 M 28 10 Q 34 8 41 8', null, '#c6bb93', 1.3);
    ctx.restore();

    const boatX = mix(portrait ? -64 : -97, portrait ? -24 : -62, approach);
    const boatY = (portrait ? 117 : 57) - 4 * approach;
    const buoyX = portrait ? 125 : 96;
    const buoyY = (portrait ? 100 : 67) + 0.9 * Math.sin(t * 1.8);
    ctx.save();
    ctx.translate(buoyX, buoyY);
    path('M -19 3 Q -8 8 16 4 M -13 8 Q -2 10 8 8', null, '#b0caba', 1.4);
    ellipse(0, 2, 10, 3.4, '#5a8380');
    path('M -9 -2 Q -5 -5 -4 -12 L 4 -12 Q 4 -5 9 -2 Q 5 3 0 3 Q -6 2 -9 -2 Z', '#b6614d');
    line([[0, -8], [0, -29]], '#6e6150', 3.7);
    path('M -5 -21 L 0 -31 L 5 -21 Z', '#e3c788', '#9d7753', 1);
    ellipse(0, -4, 6.3, 2, '#ebd6ac');
    ctx.restore();

    approachWake(boatX, boatY + 22, approach);
    readyFerry(boatX, boatY, 1.04, () => {
      ctx.save();
      ctx.translate(27, -22);
      ctx.scale(-1, 1);
      orchardDeer(0, 0, 0.67, 1, 0);
      ctx.restore();
      ctx.save();
      ctx.translate(92, -23);
      ctx.scale(-1, 1);
      rabbit(0, 0, 0.49, 'honey-tan', { head: -0.06 * look });
      ctx.restore();
      sheep(54, -4, 0.70, -0.06 * look);
    });
    ctx.restore();
    finish(t);
  }
  function placed(x: number, y: number, scale: number, paint: () => void) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    paint();
    ctx.restore();
  }
  function lateSceneLayout() {
    const portrait = W < 600;
    return {
      portrait,
      x: W * (portrait ? 0.5 : 0.694),
      y: H * (portrait ? 0.52 : 0.55),
      scale: Math.min(
        (W * (portrait ? 1 : 0.61) - 16) / 345,
        (H - (portrait ? 60 : 20)) / (portrait ? 260 : 221),
        2.2,
      ),
    };
  }
  function eveningWater(t: number, horizon: number, dusk = false) {
    backdrop(t, 1, horizon / 0.53);
    foregroundWater(horizon, t);
    if (dusk) {
      const shade = ctx.createLinearGradient(0, 0, W * 0.62, H * 0.88);
      shade.addColorStop(0, 'rgba(116,93,113,.04)');
      shade.addColorStop(0.52, 'rgba(97,83,115,.16)');
      shade.addColorStop(1, 'rgba(39,77,85,.48)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, W, H);
    }
  }
  function stoneShelf(x: number, y: number, size: number) {
    placed(x, y, size, () => {
      ellipse(1, 21, 69, 5, 'rgba(25,62,64,.19)');
      path('M -64 -2 Q -56 -15 -25 -16 Q 0 -26 33 -21 L 60 -10 L 69 1 L 61 14 Q 42 21 9 23 L -43 20 L -63 11 Z', '#678275');
      path('M -64 -2 Q -56 -15 -25 -16 Q 0 -26 33 -21 L 60 -10 L 69 1 Q 40 14 12 10 Q -23 14 -64 3 Z', '#a8ad84');
      path('M -59 12 Q -36 21 -10 18 M 4 22 Q 42 23 62 12', null, '#d0ccab', 1.6);
      path('M -53 2 Q -39 -1 -26 -1 M 12 -12 Q 33 -18 44 -12', null, '#bfbd98', 1.2);
    });
  }
  function timberLanding(x: number, y: number, size: number) {
    placed(x, y, size, () => {
      for (const px of [-25, 30]) {
        line([[px, 5], [px - 1, 19]], '#766e55', 4.5);
        ellipse(px - 1, 20, 6, 1.4, 'rgba(207,217,187,.57)');
      }
      path('M -32 -8 L 25 -14 L 38 3 L -23 12 Z', '#b79a6f', '#d2bd8c', 1.4);
      for (let n = 0; n < 4; n++)
        line([[-30 + n * 2.6, -6 + n * 4], [27 + n * 2.6, -12 + n * 4]], '#8b805e', 1);
    });
  }
  function drownedOrchardShot(seconds: number) {
    const t = Math.min(seconds, 5.9);
    const { portrait, x, y, scale } = lateSceneLayout();
    const look = ease((t - 1.0) / 1.8);
    const greeting = ease((t - 2.4) / 1.25) * (1 - 0.76 * ease((t - 4.15) / 1.3));
    eveningWater(t, y - (portrait ? 72 : 54) * scale);
    placed(x, y, scale, () => {
      const orchardY = portrait ? -37 : -12;
      const springY = portrait ? 54 : 26;
      stoneShelf(81, orchardY, 1.23);
      orchardTree(114, orchardY - 12, 0.74);
      timberLanding(57, orchardY + 19, 0.78);
      orchardDeer(55, orchardY + 1, 0.64, look, 0);
      sheep(110, orchardY + 5, 0.82, -0.13 * look);
      placed(-81, portrait ? -57 : -45, 0.65, () => {
        path('M -48 3 L 9 -9 L 39 -1 L -17 13 Z', '#79a49c');
        for (let i = 0; i < 4; i++) line([[-39 + 9 * i, 3 - i * 2], [-19 + 9 * i, 9 - i * 2]], '#86afa3', 1.2);
        for (const px of [-36, 16]) {
          line([[px, 2], [px, -15]], '#726f59', 4.5);
          ellipse(px, -15, 2.4, 1.3, '#d3b88a');
          path(`M ${px - 8} 3 q 6 3 14 1`, null, '#d2d7b6', 1.4);
        }
      });
      stoneShelf(-94, springY, 0.97);
      for (let i = 0; i < 3; i++)
        path(`M ${-96 + i * 3} ${springY + 6 + i * 5} l 39 -4 l 6 5 l -39 5 Z`, i === 2 ? '#829f8f' : '#bab492', '#d2c8a4', 1);
      launchBeaver(-116, springY, 0.64, greeting, look, true);
      rabbit(-72, springY + 2, 0.54, 'cream', { head: -0.08 * look });
      const boatY = orchardY + 89;
      readyFerry(78, boatY + Math.sin(t * 1.7) * (1 - look), 0.65);
      path(`M 34 ${orchardY + 26} Q 17 ${orchardY + 58} 34 ${boatY - 3}`, null, '#d5bd85', 1.5);
    });
    finish(t);
  }
  function farShoreShot(seconds: number) {
    const t = Math.min(seconds, 5.1);
    const { portrait, x, y, scale } = lateSceneLayout();
    const turn = ease((t - 0.45) / 2.4);
    const answer = ease((t - 2.4) / 1.2) * (1 - 0.75 * ease((t - 4) / 1));
    eveningWater(t, y - (portrait ? 80 : 65) * scale);
    placed(x, y, scale, () => {
      const rushY = portrait ? -46 : -34;
      stoneShelf(94, rushY, 0.83);
      reeds(126, rushY - 4, 0.7, t, false);
      orchardDeer(90, rushY + 3, 0.54, turn, 0);
      stoneShelf(-81, rushY - 20, 0.63);
      rabbit(-80, rushY - 18, 0.46, 'honey-tan', { head: 0.12 * turn });
      const stepY = portrait ? 66 : 53;
      stoneShelf(-73, stepY, 1.09);
      for (let i = 0; i < 3; i++)
        path(`M ${-91 + i * 3} ${stepY + 4 + i * 5} l 66 -4 l 5 5 l -67 5 Z`, '#b6b495', '#d8d1ad', 1.2);
      sheep(-117, stepY, 0.95, 0.13 * turn);
      placed(-49, stepY - 2, 0.70, () => {
        ctx.scale(-1, 1);
        rabbit(0, 0, 1, 'cream', { lift: answer, head: -0.09 * turn });
      });
      readyFerry(66, stepY + 14 + Math.sin(t * 2) * (1 - turn), 0.73);
    });
    finish(t);
  }
  function lastFerryShot(seconds: number) {
    const t = Math.min(seconds, 5.1);
    const { portrait, x, y, scale } = lateSceneLayout();
    const turn = ease((t - 0.35) / 1.8);
    const wave = ease((t - 1.6) / 1.2) * (1 - 0.8 * ease((t - 3.45) / 1.35));
    backdrop(t, 1);
    tower(x - 104 * scale, H * 0.43 - 7 * scale, scale * 0.30);
    foregroundWater(H * 0.43, t, { x: x - 104 * scale, strength: 0.42 });
    placed(x, y, scale, () => {
      const laceY = portrait ? 8 : -3, quiltY = portrait ? -36 : -24;
      stoneShelf(-99, laceY, 0.81);
      reeds(-139, laceY - 5, 0.48, t, false);
      timberLanding(-87, laceY + 10, 0.72);
      rabbit(-113, laceY, 0.56, 'cream', { head: -0.08 * turn });
      rabbit(-82, laceY + 1, 0.57, 'honey-tan', { lift: wave, head: -0.06 * turn });
      stoneShelf(92, quiltY, 1.02);
      path(`M 112 ${quiltY - 5} v -29 h 31 v 27 M 116 ${quiltY - 29} v 21`, null, '#796e53', 3.4);
      path(`M 106 ${quiltY - 33} l 9 -13 l 27 -3 l 9 13 Z`, '#a56950', '#d2aa78', 1.4);
      sheep(62, quiltY + 2, 0.77, -0.07 * turn);
      launchBeaver(103, quiltY + 2, 0.66, 0, turn);
      const boatY = portrait ? 104 : 69;
      readyFerry(4, boatY, 0.88);
      placed(132, boatY - 1, 1, () => {
        path('M -11 4 q 9 5 23 0 M -6 9 q 7 3 11 0', null, '#c7d7bb', 1.4);
        path('M -7 0 l 5 -11 h 4 l 6 11 q -7 5 -15 0 Z', '#a76750', '#c4bb85', 1);
        line([[0, -7], [0, -26]], '#546b60', 3);
        lantern(0, -28, 0.41, 0.8);
      });
    });
    finish(t);
  }
  function refugePier() {
    path('M -170 4 Q -158 -8 -113 -14 L 83 -27 Q 134 -32 158 -19 L 174 -3 L 166 53 Q 128 81 48 83 L -119 81 Q -160 75 -170 49 Z', '#5f7c70');
    path('M -170 4 Q -151 -15 -105 -15 L 85 -29 Q 142 -33 165 -11 L 172 19 Q 139 43 63 55 L -89 62 Q -150 61 -169 41 Z', '#a8a982');
    path('M -166 40 Q -146 57 -90 57 L 61 51 Q 131 42 167 20 M -135 68 L -105 71 M 110 69 L 145 58', null, '#c6bf94', 1.8);
    path('M -109 62 l 7 11 l -3 7 M 14 60 l -6 12 l 8 9 M 96 50 l 8 9', null, '#71897a', 1.8);
    path('M -158 72 Q -136 85 -86 85 M 26 86 Q 79 88 122 73', null, '#b8ccae', 1.4);
    for (const [px, py] of [[-146,17],[-120,49],[117,26],[135,10],[-44,51]]) {
      path(`M ${px} ${py} q 6 -4 13 -2 m 2 2 l 3 -2`, null, '#c1bd93', 1.3);
    }
  }
  function table(unfold: number) {
    path('M -91 6 L -85 9 L -87 35 L -93 36 Z M 83 0 L 90 -1 L 86 24 L 81 25 Z', '#71634c');
    path('M -95 -12 L 74 -24 L 101 -12 L -73 6 Z', '#bc996a', '#d2bc8c', 1.6);
    path('M -95 -12 L -73 6 L 101 -12 L 99 -3 L -74 16 L -96 -4 Z', '#997851');
    path('M -74 16 L -66 15 L -67 42 L -73 44 Z M 91 0 L 96 -1 L 92 26 L 86 27 Z', '#907451');
    const edge = mix(36, -93, unfold);
    const height = 8 * Math.sin(unfold * Math.PI);
    const cloth = `M ${edge} ${-12 - height} L 73 -25 L 103 -12 L 100 6 Q 76 8 61 10 L ${edge + 22} ${25 - height} Q ${edge + 11} ${21 - height} ${edge + 15} ${7 - height} Z`;
    path(cloth, '#d7bf98', '#ead9b4', 1.4);
    ctx.save();
    ctx.clip(new Path2D(cloth));
    for (let x = -118; x < 128; x += 22) {
      path(`M ${x} -25 l 6 -1 l 24 20 l -2 31 l -5 1 l 1 -31 Z`, '#ac7865');
      path(`M ${x + 9} -25 l 1.8 0 l 24 20 l -1 31 l -2 0 l 1 -30 Z`, '#b18b6b');
    }
    for (const y of [-12, 0, 13]) {
      line([[-112, y + 7], [113, y - 15]], 'rgba(147,92,76,.56)', 3.8);
      line([[-112, y + 11], [113, y - 11]], '#ebdbb3', 1.6);
    }
    path('M -78 6 L 104 -13 L 101 11 L -78 30 Z', 'rgba(127,83,67,.16)');
    ctx.restore();
    if (unfold < 0.98) {
      line([[edge + 2, -13 - height], [edge + 25, 4 - height]], '#b89877', 6 * (1 - unfold) + 1);
      line([[edge + 2, -15 - height], [edge + 24, 2 - height]], '#edd8ac', 2);
    }
  }
  function bellFrame(x: number, y: number, scale: number) {
    placed(x, y, scale, () => {
      path('M -17 0 L -17 -53 Q -1 -58 18 -53 L 17 0 M 0 -54 L 1 -42', null, '#78674e', 4.7);
      path('M -18 -54 Q 1 -60 19 -54', null, '#c0a57b', 2.4);
      path('M -2 -44 Q 5 -46 7 -39 L 9 -29 Q 9 -25 14 -22 Q 2 -16 -12 -21 Q -7 -25 -7 -29 L -6 -37 Q -6 -42 -2 -44 Z', '#c4a060', '#836f4d', 1.4);
      ellipse(1, -21, 12, 2.5, '#ab884e');
      ellipse(1, -19, 2.5, 3.2, '#705d45');
      path('M -3 -38 Q -2 -41 2 -41 M -7 -24 Q -2 -22 5 -23', null, '#f4d791', 1.6);
    });
  }
  function litWindows(x: number, y: number, s: number) {
    placed(x, y, s, () => {
      path('M -42 -1 L -41 -23 L 5 -25 L 20 -19 L 20 -1 Z', '#7b9481');
      path('M -47 -22 L -34 -35 L 5 -37 L 21 -20 L 6 -22 Z', '#976e5c');
      for (const dx of [-31, -15, 1]) {
        glow(dx + 3, -13, 13, 0.65);
        path(`M ${dx} -18 h 8 v 11 h -8 Z`, '#eac88d', '#a58c61', 0.8);
        line([[dx + 4, -18], [dx + 4, -7]], '#b59a6c', 1);
      }
    });
  }
  function lastLightsShot(seconds: number) {
    const t = Math.min(seconds, 6);
    const { portrait, x, y, scale } = lateSceneLayout();
    const unfold = ease((t - 0.4) / 3.1);
    const settle = ease((t - 1.9) / 2.7);
    const signal = ease((t - 3.8) / 1.7);
    const bankY = portrait ? -83 : -53;
    eveningWater(t, y + (bankY - 9) * scale, true);
    placed(x, y, scale, () => {
      stoneShelf(28, bankY, 0.54);
      rabbit(18, bankY - 1, 0.28, 'honey-tan', { lift: signal, lantern: true });
      rabbit(38, bankY - 1, 0.27, 'cream', { head: 0.1 * signal });
      glow(7, bankY - 13, 27, signal * 0.6);
      for (const [offset, width] of [[11, 6], [16, 10], [22, 7]])
        line([[6 - width, bankY + offset], [6 + width, bankY + offset - 1]], `rgba(246,219,153,${0.19 + signal * 0.3})`, 1.6);
      const quayY = portrait ? 38 : 20;
      placed(0, quayY, 1, () => {
        litWindows(-104, -23, 1.06);
        refugePier();
        bellFrame(112, -5, 1.1);
        sheep(81, -6, 0.86, 0.12 * signal);
        placed(-110, 9, 1, () => {
          ctx.scale(1, 1 - 0.12 * settle);
          sheep(0, 0, 1.04, 0.13 * settle);
        });
        const tansyX = mix(46, -47, unfold);
        const lift = 0.24 + 0.24 * Math.sin(unfold * Math.PI);
        rabbit(tansyX, 2, 0.78, 'cream', {
          lift, step: unfold,
          head: 0.13 * unfold - 0.2 * signal,
        });
        placed(-5, 10, 0.99, () => table(unfold));
        const release = ease((t - 3.08) / 0.6);
        if (release < 1) {
          const pawX = tansyX + 0.78 * mix(-9, -34, lift);
          const pawY = 2 + 0.78 * mix(-25, -61, lift);
          const hemY = mix(pawY + 1.8, -2, release);
          path(`M ${pawX - 10} -1 Q ${pawX - 4} ${hemY + 13} ${pawX} ${hemY} Q ${pawX + 5} ${hemY + 6} ${pawX + 13} -3 L ${pawX + 8} 1 Z`, '#d9c29e', '#e9d7af', 1);
          path(`M ${pawX + 1} ${hemY + 4} Q ${pawX + 4} ${hemY + 12} ${pawX + 9} -2`, null, '#b37e69', 2);
          ellipse(pawX, pawY, 3.7, 3.4, C.cream);
        }
        lantern(34, 18, 0.64, 0.66);
      });
    });
    finish(t);
  }
  function emptyChair(x: number, y: number) {
    placed(x, y, 1, () => {
      ellipse(1, 23, 24, 4.2, 'rgba(51,67,52,.21)');
      path('M -18 -36 Q -8 -43 11 -39 L 14 -32 L -15 -28 Z', '#bf9a6d', '#8e7456', 1.8);
      line([[-16, -32], [-12, 19]], '#846e53', 4.4);
      line([[11, -36], [14, 15]], '#846e53', 4.4);
      for (const dx of [-10, -2, 6]) line([[dx, -31], [dx + 2, -8]], '#b99a72', 3.2);
      path('M -15 -8 L 11 -13 L 23 -4 L -4 3 Z', '#d0aa72', '#947b59', 1.6);
      line([[-4, 3], [-3, 25]], '#9f815b', 4.6);
      line([[21, -4], [19, 18]], '#987e5a', 3.8);
    });
  }
  function placeSetting(x: number, y: number, s: number) {
    placed(x, y, s, () => {
      ellipse(0, 0, 13, 4.8, '#b3b694', -0.07);
      ellipse(0, -1.5, 13, 4.4, '#e8d8ae', -0.07);
      ellipse(0, -1.6, 9.3, 2.75, '#b2bd9e', -0.07);
      ellipse(0, -1.45, 7.3, 1.95, '#dcd7b5', -0.07);
      path('M 13 -10 q 11 -5 7 3 q -2 2 -6 1', null, '#a08a64', 1.4);
      path('M 8 -11 l 9 -1 l -1 6 q -4 3 -8 0 Z', '#c3b28c');
      ellipse(12.5, -11.2, 4.6, 1.5, '#735e48');
    });
  }
  function orchardBough(x: number, y: number) {
    placed(x, y, 1, () => {
      path('M -25 1 Q -5 2 14 -8 L 30 -10 M -7 0 L -12 -7 M 7 -5 L 11 -16', null, '#826849', 2.5);
      for (const [lx, ly, rot] of [[-13, -7, 0.58], [-3, -4, -0.8], [12, -14, -0.85], [22, -9, 0.25], [28, -12, -0.42]]) {
        ellipse(lx, ly, 5.7, 2.4, '#6c8c69', rot);
      }
      for (const [ax, ay] of [[-8, -4], [6, -8], [17, -8]]) {
        ellipse(ax, ay, 4.2, 4.6, '#bc7054');
        ellipse(ax - 1, ay - 1.5, 1.1, 1.6, '#e4ae82');
      }
    });
  }
  function supperSweep(lampX: number, lampY: number, t: number) {
    const sweep = ease((t - 1.3) / 4.9);
    if (sweep <= 0 || sweep >= 1) return;
    ctx.save();
    ctx.translate(lampX, lampY);
    ctx.rotate(mix(3.12, 0.48, sweep));
    ctx.globalCompositeOperation = 'screen';
    const strength = Math.sin(Math.PI * sweep);
    const shaft = ctx.createLinearGradient(0, 0, 272, 0);
    shaft.addColorStop(0, 'rgba(255,235,173,.075)');
    shaft.addColorStop(0.52, 'rgba(255,224,153,.045)');
    shaft.addColorStop(1, 'rgba(253,215,145,0)');
    ctx.globalAlpha = strength;
    for (let i = 0; i < 10; i++) {
      const spread = 12 + i * 5;
      path(`M 0 -1.6 Q 128 ${-spread * 0.43} 280 ${-spread} L 280 ${spread} Q 128 ${spread * 0.43} 0 1.6 Z`, shaft);
    }
    ctx.restore();
  }
  function supperShot(seconds: number) {
    const t = Math.min(seconds, 6.7);
    const { portrait, x, y, scale } = lateSceneLayout();
    const settle = ease((t - 0.15) / 2.1);
    const welcome = ease((t - 1.4) / 1.1) * (1 - 0.86 * ease((t - 4.25) / 1.5));
    const towerY = portrait ? -71 : -42;
    eveningWater(t, y + (towerY - 1) * scale, true);
    placed(x, y, scale, () => {
      tower(123, towerY, 0.37);
      litWindows(76, towerY + 9, 0.64);
      const quayY = portrait ? 28 : 4;
      placed(0, quayY, 1, () => {
        refugePier();
        sheep(-78, 0, 1.0, -0.12 * settle);
        rabbit(-26, -1, 0.71, 'cream', { lift: welcome, head: -0.09 * settle });
        rabbit(mix(31, 17, settle), -3, 0.69, 'honey-tan', { step: settle, head: -0.15 * settle });
        launchBeaver(69, -5, 0.84, 0.18 * welcome, settle);
        placed(1, 13, 1.02, () => {
          table(1);
          placeSetting(-58, -7, 1);
          placeSetting(48, -15, 0.67);
          orchardBough(-10, -10);
          ellipse(27, -15, 11, 3.8, '#c2bb95');
          ellipse(27, -18, 9, 4.7, '#c99257', -0.09);
          path('M 22 -21 l 2 4 M 27 -22 l 2 4 M 32 -21 l 2 3', null, '#e7c894', 1.3);
          path('M -41 -16 q 5 10 18 2 l -2 6 q -8 6 -13 -1 Z', '#ac8564', '#d2ab81', 1);
          ellipse(-32, -15, 9.3, 3.4, '#e4c28c', -0.09);
          ellipse(-32, -15, 7.5, 2.2, '#c08c5f', -0.09);
          lantern(75, -24, 0.58, 0.85);
        });
        emptyChair(-114, 19);
        timberLanding(35, 57, 0.85);
        placed(-23, 44, 1, () => {
          line([[0, -4], [0, 7]], '#817253', 7);
          line([[-6, -5], [6, -6]], '#aa936d', 4);
          for (let i = 3; i >= 0; i--) {
            ctx.beginPath();
            ctx.ellipse(-11, 12 - i * 1.3, 11 + i * 0.8, 3.4, -0.05, 0, Math.PI * 2);
            ctx.strokeStyle = i % 2 ? '#947747' : '#d8b97c';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          path('M -7 8 Q -4 2 2 3 Q 9 7 16 6', null, '#dec18a', 2);
        });
      });
      const boatY = portrait ? 134 : 76;
      const boatX = mix(81, 72, settle);
      readyFerry(boatX, boatY, portrait ? 0.65 : 0.58);
      path(`M -23 ${quayY + 44} Q -9 ${boatY + 18} ${boatX - 40} ${boatY + 1}`, null, '#ceb887', 1.8);
      supperSweep(123, towerY - 114 * 0.37, t);
    });
    finish(t);
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
      ferryWaterline = waterline + (portrait ? 23 * s : 0),
      boatX = W * (portrait ? 0.5 : 0.625) - glide * 19 * s,
      boatY = ferryWaterline - 43 * s + settle * 1.1,
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
          [mix(cleatX, boatX + 104 * s, 0.5), mix(cleatY, boatY - 27 * s, 0.5) + release * 12 * s],
          [boatX + 104 * s, boatY - 27 * s],
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
            [boatX + 118 * s + i * 8, ferryWaterline + i * 4],
            [boatX + 141 * s + i * 9, ferryWaterline + 1 + i * 4],
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
    drawHarborMemory(memory: 'lantern' | 'moss') {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      backdrop(5, 1);
      tower(W * 0.87, H * 0.53, 0.51);
      foregroundWater(H * 0.65, 5, { x: W * 0.87, strength: 0.55 });
      if (memory === 'moss') {
        boat(W * 0.49, H * 0.70, 1.45, 5, 1);
      } else {
        shore(W * 0.47, H * 0.73, W * 0.93);
        rabbit(W * 0.35, H * 0.76, 1.07, 'tan', { warmth: 0.65, restHand: 1 });
        rabbit(W * 0.51, H * 0.74, 0.89, 'cream', { head: -0.13 });
        sheep(W * 0.69, H * 0.75, 1.35);
        lantern(W * 0.22, H * 0.71, 1.4);
      }
      finish(5);
    },
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
        reeds: reedsShot,
        reef: reefShot,
        orchard: orchardShot,
        ternhaven: ternhavenShot,
        'drowned-orchard': drownedOrchardShot,
        'last-lights': lastLightsShot,
        'far-shore': farShoreShot,
        'last-ferry': lastFerryShot,
        supper: supperShot,
      })[illustration](t);
    },
  };
}
