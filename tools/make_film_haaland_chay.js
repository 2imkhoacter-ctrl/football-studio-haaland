// Phim: HAALAND (bản biếm họa chủ dự án tự chỉnh) chạy chúi về cuối sân, dắt bóng xoay. Camera giữ ĐÚNG góc nhìn dáng chạy (yaw 68°).
// Dùng: node tools/make_film_haaland_chay.js [file_ra.json]
// Nguồn nhân vật: file JSON chủ dự án lưu (biến môi trường HAALAND_JSON, mặc định D:\Download\haaland-final.json): thân, đầu, mặt, áo.
// Dáng chạy: dáng A = đúng thế chủ dự án đã chỉnh; dáng B = lật gương tay/chân (bước kia); chạy = pha trộn qua lại A<->B.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const SRC = process.env.HAALAND_JSON || 'D:/Download/haaland-final.json';
const U = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const FPS = 24, DUR = +(process.env.DUR || 7), N = Math.round(DUR * FPS), o = { FPS, N };
const ease = (t, a, b) => S(clamp((t - a) / (b - a), 0, 1));
const deg = a => a * 180 / Math.PI;

// ---- đường chạy: từ giữa sân tới gần vạch gôn (mét), hướng +Z ----
const Z0 = -4, Z1 = 49, START = 0.6, END = DUR - 0.8, XCOL = 0;
const zAt = t => mix(Z0, Z1, ease(t, START, END) * 0.25 + clamp((t - START) / (END - START), 0, 1) * 0.75);   // tăng tốc nhẹ rồi chạy đều
const PHI = 180;                                              // quay mặt về +Z (xa máy) = 180 theo film_lib
const THETA = wrap(PHI + (U.pose.yaw || 68));                 // camera đặt sao cho yaw nhìn thấy = yaw dáng chạy (68°)

// ---- hai dáng chạy từ thế chủ dự án ----
const A = { limbs: U.pose.limbs, poles: U.pose.poles, ends: U.pose.ends };
const mirrorV = v => [-v[0], v[1], v[2]];
const B = { limbs: { hL: mirrorV(A.limbs.hR), hR: mirrorV(A.limbs.hL), fL: mirrorV(A.limbs.fR), fR: mirrorV(A.limbs.fL) },
  poles: { hL: mirrorV(A.poles.hR), hR: mirrorV(A.poles.hL), fL: mirrorV(A.poles.fR), fR: mirrorV(A.poles.fL) },
  ends: { hL: A.ends.hR.slice(), hR: A.ends.hL.slice(), fL: A.ends.fR.slice(), fR: A.ends.fL.slice() } };
const mixV = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const CAD = +(process.env.CAD || 2.0);                         // chu kỳ chạy (hai bước) mỗi giây

const hero = {
  pos: Array.from({ length: N + 1 }, (_, i) => { const t = i / FPS; return [t, XCOL, zAt(t)]; }),
  head: [[0, PHI], [DUR + 1, PHI]], stance: 1, runSpeed: 3, blink: 0.4, seed: 1, ges: [], jumps: [],
  faces: [{ t0: 0, t1: DUR + 1, e: 'focus' }],
  mod: (t, key, c) => {
    const ph = 2 * Math.PI * CAD * Math.max(0, t - START * 0.5), u = 0.5 - 0.5 * Math.cos(ph);   // 0 = dáng A, 1 = dáng B
    for (const k of ['hL', 'hR', 'fL', 'fR']) { key.limbs[k] = mixV(A.limbs[k], B.limbs[k], u); key.poles[k] = mixV(A.poles[k], B.poles[k], u); }
    for (const k of ['hL', 'hR', 'fL', 'fR']) key.ends[k] = mixV(A.ends[k], B.ends[k], u);
    for (const k of ['hL', 'hR']) key.ends[k] = [6, 0, 0, 50];   // bàn tay KHÉP 50% (độ nắm 50), lòng bàn tay luôn hướng vào thân (lật = 0, mặc định của tool)
    key.rotFine = U.pose.rotFine; key.type = U.pose.type || 0;
    key.hip = [300, U.pose.hip[1] - 7 * (0.5 - 0.5 * Math.cos(2 * ph))];                  // nảy người theo nhịp bước
    key.hrot = r2(3 * Math.sin(ph));
    key.side = JSON.parse(JSON.stringify(U.pose.armSide || { hL: 'auto', hR: 'auto' }));
  },
};

// ---- camera giữ góc dáng chạy, bám theo người ----
const CAM = { size: +(process.env.CSIZE || 88), tilt: 8, waist: +(process.env.CWAIST || 236) };
const CAM_LEAD = +(process.env.CAM_LEAD || 1.55);
const camAt = t => { const kz = 100 / CAM.size; return { cx: XCOL, cz: zAt(t) + CAM_LEAD, theta: THETA, size: CAM.size, tilt: CAM.tilt, ty: CAM.waist - (645 - 273 * kz), dof: 0 }; };
// ---- bóng: lăn phía trước, XOAY liên tục ----
const BALL_AHEAD = +(process.env.BALL_AHEAD || 2.4);
const ballAt = t => { const z = zAt(t) + BALL_AHEAD, spin = (t - 0) * 720; return { x: XCOL + 0.35, z, h: 0.11 + 0.06 * Math.abs(Math.sin(2 * Math.PI * CAD * t)), spin }; };

const keys = buildActor(hero, U.body, U.face, true, o);
const base = { show: true, layer: 'back', attach: 'free', style: 'night360', free: 1 };
keys.forEach(k => {
  const t = k.t, c = camAt(t), b = ballAt(t);
  k.yaw = r2(wrap(c.theta - k._wh));
  k.props = {
    scene: Object.assign({}, base, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: c.tilt, size: c.size, dof: 0, camX: r2(toSceneX(c.cx)), camY: r2(toSceneY(c.cz)), ty: r2(c.ty), camH: 0 }),
    ball: { show: true, layer: 'front', attach: 'pitch', x: r2(b.x), y: r2(b.z), h: r2(b.h), size: 100, rot: r2(b.spin), style: 'png', fire: 0, vx: 0, vz: 0 },
  };
});
const film = JSON.parse(JSON.stringify(U));
film.keys = cleanKeys(keys); film.dur = DUR; film.loop = false; film.idle = false; film.cast = [];
const k0 = film.keys[0];
film.pose = { type: U.pose.type || 0, rotFine: U.pose.rotFine, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: U.pose.armSide || { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
const out = path.resolve(process.argv[2] || path.join(root, 'animations', 'phim-haaland-chay.json'));
fs.writeFileSync(out, JSON.stringify(film));
console.log('ok', film.keys.length, 'khoa, camera theta', THETA, '->', out);
