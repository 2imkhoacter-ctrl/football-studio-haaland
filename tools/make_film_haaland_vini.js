// Phim thử "Haaland suy nghĩ -> CẮT -> Vini ăn mừng SIUUU" (~8,8 giây, khổ dọc, câm). BẢN 3.
// Dùng: node tools/make_film_haaland_vini.js [file_ra.json]   (mặc định animations/phim-haaland-vini.json)
// Render: node tools/render_film.js animations/phim-haaland-vini.json ra/
// Ngôn ngữ dựng (xem docs/hoc-ky-thuat-short-bat-chuoc-1.md): mỗi lúc một thứ động, còn lại đứng im;
// chuyển động nhanh dứt khoát; cắt cảnh thẳng; cảm xúc bằng khuôn mặt.
// Bản 3 (theo chỉ dẫn của chủ dự án): tay sát lưng/mông; đi NHANH rồi CHẬM dần (chân còn lơ lửng) rồi DẬM chân xuống nhanh,
// xoay người đi tiếp (nhanh–chậm–nhanh); dáng suy nghĩ có hồn: ngẩng đầu, mắt lúc mở lúc híp, thở dài.
const fs = require('fs'), path = require('path');
const L = require('./film_lib.js');
const { S, clamp, mix, wrap, r2, wp, toSceneX, toSceneY, buildActor, cleanKeys } = L;
const root = path.resolve(__dirname, '..');
const R = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const H = R('data/characters/haaland-final.json'), V = R('data/characters/vini-final.json');
const FPS = 24, CUT = 5.95, DUR = 9.15, N = Math.round(DUR * FPS), o = { FPS, N };
const THETA_A = process.env.VIEW_THETA != null ? +process.env.VIEW_THETA : 0;   // chỉ để thử góc (xem tay sau lưng)

const VINI_FACE = process.env.VINI_FACE != null ? +process.env.VINI_FACE : 180;   // thân nhìn thẳng vào máy (tay giang cân đối)
const VINI_HYAW = process.env.VINI_HYAW != null ? +process.env.VINI_HYAW : -45;     // chỉ XOAY ĐẦU nghiêng để thấy môi chu nhô ra (dương/âm = hướng quay)   // 180 = nhìn thẳng vào máy; 135/225 = nghiêng 3/4 (225: mõm chỉa sang trái)
const HP = [0, +(process.env.HP_Z || 46.2)], VP = [0, 10];     // Haaland đứng gần khung thành (z=52.5) để khung thành đủ lớn so với sân             // chỗ đứng trên sân (mét). Hai người cách xa nhau để cảnh nào cũng không thấy người kia.
const ease = (t, a, b) => S(clamp((t - a) / (b - a), 0, 1));
const pulse = (t, t0, d) => (t < t0 || t > t0 + d) ? 0 : Math.pow(1 - (t - t0) / d, 2);

// ---- tay chắp sau lưng: bàn tay áp sát lưng dưới/mông, khuỷu gập ra sau ----
function handsBehind(t, key, c) {
  const k = c.ka, tgt = { hL: [26 * k, 122 * k, -40 * k], hR: [-26 * k, 122 * k, -40 * k] };
  for (const s of ['hL', 'hR']) key.limbs[s] = tgt[s].slice();
  key.poles.hL = [-0.45, 0, -1]; key.poles.hR = [0.45, 0, -1];             // khuỷu chỉ ra sau, ít ra ngoài
  key.ends.hL = [-18, 0, 0]; key.ends.hR = [-18, 0, 0];
}

// ---- lịch di chuyển: NHANH -> chậm dần (chân lơ lửng) -> DẬM -> dừng nghĩ -> xoay nhanh -> đi ... ----
const T1 = { a: 0.3, b: 2.1 }, TURN = { a: 3.1, b: 3.3 }, T2 = { a: 3.3, b: 4.6 }, X0 = -1.3, X1 = 1.3, X2 = -0.5;
const walkX = (t, a, b, xa, xb, p) => xa + (xb - xa) * (1 - Math.pow(1 - clamp((t - a) / (b - a), 0, 1), p));   // p lớn = đầu rất nhanh, cuối rất chậm
const posX = t => t < T1.b ? walkX(t, T1.a, T1.b, X0, X1, 2.2) : t < T2.a ? X1 : walkX(t, T2.a, T2.b, X1, X2, 2.0);
const posList = []; for (let i = 0; i <= N; i++) { const t = i / FPS; posList.push([t, posX(t), HP[1]]); }
const STOP = [T1.b, T2.b];                       // hai lần dừng: chân giơ lơ lửng rồi DẬM xuống

// ---- Haaland ----
const hero = {
  pos: posList,
  head: [[0, -90], [TURN.a, -90], [TURN.b, 90], [4.7, 90], [4.95, 12], [15, 12]],
  runSpeed: 2.8, blink: 0.4, seed: 1,
  ges: [], faces: [{ t0: 0, t1: 15, e: 'think' }], jumps: [],
  mod: (t, key, c) => {
    handsBehind(t, key, c);
    const footX = H.body.hipW * 0.39, k = c.kl;
    // 1) bước chân CUỐI cùng vẫn là bước đi bình thường (cùng độ cao nhấc chân như các bước trước), chỉ CHẬM lại đúng lúc chân đang ở điểm giơ lên, rồi hạ xuống nhanh
    for (const tS of STOP) {
      const A2 = Math.max(c.A, 0.5), apex = [footX, c.footY - 28 * A2 * k * 1.6, 55 * A2 * k * 1.0], stance = [footX, c.footY, 0];
      if (t < tS) {
        const w = ease(t, tS - 0.34, tS - 0.2);                           // từ bước đi bình thường lên điểm giơ
        const hover = 0.5 + 0.5 * Math.sin((t - tS) * 4);                  // trôi rất chậm ở điểm giơ
        const ap = [apex[0], apex[1] - 2 * k * hover, apex[2] + 3 * k * hover];
        if (w > 0) key.limbs.fR = key.limbs.fR.map((v, j) => mix(v, ap[j], w));
      } else {
        const st = ease(t, tS, tS + 0.07);                                 // hạ xuống nhanh
        if (st < 1) key.limbs.fR = apex.map((v, j) => mix(v, stance[j], st));
      }
      key.hip[1] += 6 * pulse(t, tS, 0.12);                                // dập nhẹ: hông chùng chút
    }
    // 2) khuôn mặt suy nghĩ: ngẩng đầu, mắt lúc mở lúc híp, liếc lên
    const wob = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t - 0.3) / 1.5);
    let lookY = -50 * wob, lid = 28 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (t + 0.5) / 1.9)), hrot = -4 * wob;
    // 3) THỞ DÀI ở lần dừng thứ nhất: hít vào (ngẩng, nhắm dần, miệng o), thở ra (gục đầu, miệng a nhỏ)
    const sI = ease(t, 2.3, 2.62), sE = ease(t, 2.62, 3.0);
    if (t > 2.3 && t < 3.1) {
      lookY = mix(lookY, -90, sI) * (1 - sE) + 20 * sE * (t < 3.0 ? 1 : 0);
      lid = mix(lid, 70, sI) * (1 - sE) + 20 * sE;
      hrot = mix(hrot, -8, sI) * (1 - sE) + 5 * sE;
      key.face.mouthKind = t < 2.62 ? 'o' : 'a'; key.face.mouthOpen = t < 2.62 ? r2(30 * sI) : r2(34 * (1 - sE) + 4);
      key.hip[1] += -5 * sI * (1 - sE) + 6 * sE * (1 - ease(t, 3.0, 3.1));       // ngực nâng rồi chùng xuống
    }
    // 4) NHÌN LÊN dứt khoát ngay trước khi cắt
    const up = ease(t, 5.1, 5.22);
    lookY = mix(lookY, -100, up); lid = mix(lid, 0, up); hrot = mix(hrot, -9, up);
    if (up > 0.5) key.face.browKind = 'surprised';
    key.face.lookY = r2(lookY); if (!key.face.lidL) { key.face.lidL = r2(lid); key.face.lidR = r2(lid); }
    key.hrot = r2(key.hrot + hrot);
    key.rotFine = r2(key.rotFine - 4 * up);
  },
};

// ---- Vini: nhảy xoay (tay còn ở thấp), đáp xuống quay mặt vào máy rồi MỞ TAY "bụp", hét SIUUU, ưỡn ngực ----
const ARMS = {
  down: k => ({ hL: [-58 * k, 118 * k, -34 * k], hR: [58 * k, 118 * k, -34 * k] }),
  open: k => ({ hL: [-92 * k, 98 * k, -52 * k], hR: [92 * k, 98 * k, -52 * k] }),
  pump: k => ({ hL: [-94 * k, 74 * k, -56 * k], hR: [94 * k, 74 * k, -56 * k] }),
};
const T_LAND = CUT + 0.46, T_PUMP = CUT + 1.7;
const vini = {
  pos: [[0, VP[0], VP[1]], [15, VP[0], VP[1]]],
  head: [[0, 0], [CUT, 0], [CUT + 0.34, VINI_FACE], [15, VINI_FACE]],   // đáp xuống quay NGHIÊNG 3/4 để thấy môi chu nhô ra
  stance: 2.0, runSpeed: 1.6, blink: 1.1, seed: 7,
  ges: [], faces: [{ t0: 0, t1: T_LAND, e: 'grin' }, { t0: T_LAND, t1: 15, e: 'scream' }],
  jumps: [[CUT - 0.1, 95, 0.56]],
  mod: (t, key, c) => {
    const down = ARMS.down(c.ka), open = ARMS.open(c.ka), pump = ARMS.pump(c.ka);
    const wOpen = ease(t, T_LAND - 0.04, T_LAND + 0.1), wPump = ease(t, T_PUMP, T_PUMP + 0.1);
    for (const s of ['hL', 'hR']) {
      const a = down[s].map((v, j) => mix(v, open[s][j], wOpen));
      key.limbs[s] = a.map((v, j) => mix(v, pump[s][j], wPump));
    }
    key.hyaw = r2(VINI_HYAW * ease(t, T_LAND - 0.05, T_LAND + 0.12));
    if (t >= T_LAND) {
      key.face.lidL = 18; key.face.lidR = 18; key.face.browKind = 'angry'; key.face.mouthKind = 'siu';   // mặt SIUUU: mày dữ, mắt nheo, môi CHU ra
      key.face.mouthOpen = r2(t > T_PUMP ? 80 : 50); key.face.lookY = r2(-30 * wPump);
    }
    key.hrot = r2(5 * wPump);
    key.rotFine = r2(-3 * wOpen - 3 * wPump);
  },
};

// ---- camera: 2 cảnh, CẮT thẳng. Cảnh A đi theo Haaland (nhẹ), cảnh B đứng yên ----
const shots = [
  [0, CUT, t => ({ cx: 0.85 * posX(t), cz: HP[1], theta: THETA_A, size: 80, tilt: 8, waist: 330, dof: 0 })],
  [CUT, DUR + 1, t => ({ cx: VP[0], cz: VP[1], theta: 180, size: +(process.env.VS || 60), tilt: 8, waist: +(process.env.VW || 200), dof: 0 })],
];
const TILT_UP = { a: 5.3, b: 5.75, ty: +(process.env.TILT_TY || 780) };      // camera NGẨNG LÊN trời theo mắt Haaland (dịch khung dọc)
const camAt = t => { const s = shots.find(x => t >= x[0] && t < x[1]) || shots[shots.length - 1], c = s[2](t), kz = 100 / c.size, up = t < CUT ? ease(t, TILT_UP.a, TILT_UP.b) : 0; return Object.assign({}, c, { ty: c.waist - (645 - 273 * kz) + TILT_UP.ty * up }); };

const heroKeys = buildActor(hero, H.body, H.face, true, o), viniKeys = buildActor(vini, V.body, Object.assign({}, V.face, { browColor: '#1b1716' }), true, o);   // lông mày đen như tóc Vini
const base = { show: true, layer: 'back', attach: 'free', style: 'night360', free: 1 };
const sceneAt = (k, c, tilt) => Object.assign({}, base, { x: r2(toSceneX(k._X)), y: r2(toSceneY(k._Z)), rot: r2(k._wh), tilt: r2(tilt), size: r2(c.size), dof: r2(c.dof), camX: r2(toSceneX(c.cx)), camY: r2(toSceneY(c.cz)), ty: r2(c.ty), camH: 0 });
heroKeys.forEach(k => { const c = camAt(k.t); k.yaw = r2(wrap(c.theta - k._wh)); k.props = { scene: sceneAt(k, c, c.tilt) }; });
viniKeys.forEach(k => { const c = camAt(k.t); k.yaw = 0; k.props = { scene: sceneAt(k, c, 10) }; });

const film = JSON.parse(JSON.stringify(H));
film.keys = cleanKeys(heroKeys); film.dur = DUR; film.loop = false; film.idle = false;
const k0 = film.keys[0];
film.pose = { type: 0, rotFine: 0, yaw: k0.yaw, hip: k0.hip, limbs: k0.limbs, poles: k0.poles, ends: k0.ends, armSide: { hL: 'auto', hR: 'auto' } };
film.props = Object.assign({}, film.props || {}, k0.props);
film.face = Object.assign({}, H.face, { on: true });
film.cast = [{ meta: { wx: toSceneX(VP[0]), wy: toSceneY(VP[1]), wh: 0 }, pose: JSON.parse(JSON.stringify(V.pose)), body: V.body, look: Object.assign({}, V.look, { hair: '#1b1716' }), head: V.head, decals: V.decals, face: V.face, keys: cleanKeys(viniKeys) }];
const out = path.resolve(process.argv[2] || path.join(root, 'animations', 'phim-haaland-vini.json'));
fs.writeFileSync(out, JSON.stringify(film));
console.log('ok', film.keys.length, 'khoa,', film.cast.length, 'dien vien phu,', (fs.statSync(out).size / 1e6).toFixed(1), 'MB ->', out);
