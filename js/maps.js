// Every map. Outdoor places are built with code (ground, then stamps for houses and trees, then
// people and doors); dungeons and rooms are rows of characters with a legend. The world map is
// generated, and turns dark after the fall of the Skyloom.
import { hash } from './gfx.js';
import { L } from './i18n.js';

// ---------- the builder ----------
function build(w, h, fill) {
  const g = Array.from({ length: h }, () => Array(w).fill(fill));
  const o = {
    w, h, g, stamps: [], ents: [],
    set(x, y, k) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = k; return o; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? g[y][x] : null; },
    rect(x0, y0, x1, y1, k) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.set(x, y, k); return o; },
    frame(x0, y0, x1, y1, k) { for (let x = x0; x <= x1; x++) { o.set(x, y0, k); o.set(x, y1, k); } for (let y = y0; y <= y1; y++) { o.set(x0, y, k); o.set(x1, y, k); } return o; },
    path(pts, k) { for (let i = 0; i < pts.length - 1; i++) { let [x, y] = pts[i]; const [x1, y1] = pts[i + 1]; while (x !== x1 || y !== y1) { o.set(x, y, k); if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); } o.set(x1, y1, k); } return o; },
    st(name, x, y, extra = {}) { o.stamps.push({ name, x, y, ...extra }); return o; },
    e(ent) { o.ents.push(ent); return o; },
    // a house with its door leading inside
    house(x, y, to, tx, ty, kind = 'house', need) { o.st(kind, x, y); o.e({ type: 'warp', x: x + 2, y: y + 4, to, tx, ty, dir: 'u', need }); return o; },
    trees(list) { for (const [x, y] of list) o.st('tree', x, y); return o; },
    npc(id, sprite, x, y, talk, extra = {}) { return o.e({ type: 'npc', id, sprite, x, y, talk, dir: 'd', ...extra }); },
    warp(x, y, to, tx, ty, dir = 'd', extra = {}) { return o.e({ type: 'warp', x, y, to, tx, ty, dir, ...extra }); },
    done(meta = {}) { return { w, h, kindAt: (x, y) => g[y][x], ents: o.ents, stamps: o.stamps, ...meta }; },
  };
  return o;
}
// rows of characters
const BASE = {
  ' ': 'void', '.': 'grass', ',': 'flowers', '=': 'dirt', '~': 'water', 's': 'sand', 'w': 'snow', 'g': 'dgrass', 'd': 'ddirt', 'P': 'plaza',
  '+': 'wood', '-': 'wood2', 'n': 'stone', 'h': 'hall', '#': 'wall', 'H': 'swall', '[': 'rug', ']': 'redrug',
  'o': 'cfloor', 'O': 'cwall', 'i': 'ifloor', 'I': 'iwall2', 'l': 'lfloor', 'L': 'lwall', 'y': 'pfloor', 'Y': 'pwall',
  'p': 'cpool', 'q': 'ipool', 'v': 'lpool', 'u': 'ppit', 'r': 'rock', 'R': 'crock', 'B': 'bush', 'F': 'fence', 'x': 'barrel', 'c': 'crate',
  'k': 'ctrw', 'K': 'ctrs', 'b': 'bridge', 'z': 'bones',
};
function grid(rows, legend = {}, meta = {}) {
  const Lg = { ...BASE, ...legend }, h = rows.length, w = Math.max(...rows.map((r) => r.length));
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`${meta.id} row ${i} is ${r.length} wide, not ${w}`); });
  const ents = [], kinds = [], stamps = [...(meta.stamps || [])];
  for (let y = 0; y < h; y++) {
    kinds.push([]);
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x], v = Lg[ch];
      if (v === undefined) throw new Error(`${meta.id}: no legend for '${ch}' at ${x},${y}`);
      if (typeof v === 'string') { kinds[y].push(v); continue; }
      kinds[y].push(v.k);
      if (v.st) stamps.push({ name: v.st, x, y });
      const e = typeof v.e === 'function' ? v.e(x, y) : v.e;
      if (e) for (const one of [].concat(e)) ents.push({ ...one, x: one.x ?? x + (one.dx || 0), y: one.y ?? y + (one.dy || 0) });
    }
  }
  return { w, h, kindAt: (x, y) => kinds[y][x], ents, ...meta, stamps };
}
// shorthands for legend entries
const npc = (k, id, sprite, talk, o = {}) => ({ k, e: { type: 'npc', id, sprite, talk, ...o } });
const warp = (k, to, tx, ty, dir = 'd', o = {}) => ({ k, e: { type: 'warp', to, tx, ty, dir, ...o } });
const chest = (k, id, item, n = 1, o = {}) => ({ k, e: { type: 'chest', id, item, n, ...o } });
const glint = (k, id, item, n = 1) => ({ k, e: { type: 'glint', id, item, n, walkable: true } });
const trig = (k, run, o = {}) => ({ k, e: { type: 'trigger', run, ...o } });
const save = (k) => ({ k, e: { type: 'save', walkable: true } });
const stamp = (k, st, e) => ({ k, st, e });

export const MAPS = {};
const def = (id, o) => { MAPS[id] = { id, ...o }; };
const nm = (zh, en) => () => L(zh, en);

// =====================================================================================
// the world
// =====================================================================================
export const WORLD = {
  bright: [11, 9], crag: [7, 5], sol: [22, 22], under: [35, 30], dove: [40, 22], temple: [44, 11], gull: [53, 30],
  smolder: [62, 46], sand: [20, 52], ruins: [35, 57], snow: [67, 14], frost: [72, 7], loom: [47, 42],
};
// where Homeward and the feather take you: [world x, y]
export const ZOOM = {
  bright: { n: ['亮瀑村', 'Brightfall'], at: [11, 10] }, sol: { n: ['索爾海文', 'Solhaven'], at: [22, 23] }, dove: { n: ['鴿巢鎮', 'Dovecote'], at: [40, 23] },
  gull: { n: ['海鷗港', 'Gullport'], at: [53, 31] }, sand: { n: ['沙梅爾', 'Sandmere'], at: [20, 53] }, snow: { n: ['雪幕村', 'Snowveil'], at: [67, 15] },
};
function worldBuild(f) {
  const W = 80, Hh = 64, fall = !!f.fallen;
  const b = build(W, Hh, 'water');
  const { set, get, rect } = b;
  const land = (x0, y0, x1, y1, k) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const edge = Math.min(x - x0, x1 - x, y - y0, y1 - y);
      if (edge === 0 && hash(x, y, 3) < 0.45) continue;
      if (edge === 1 && hash(x, y, 4) < 0.12) continue;
      set(x, y, k);
    }
  };
  // the three lands and the islands
  land(3, 3, 57, 37, 'grass');
  land(6, 44, 46, 61, 'sand');
  land(61, 3, 77, 33, 'snow');
  land(58, 42, 67, 50, 'grass');
  land(44, 39, 50, 45, 'grass');
  // the river and the temple lake
  rect(31, 2, 32, 38, 'water');
  for (let y = 7; y <= 15; y++) for (let x = 39; x <= 49; x++) { const dx = (x - 44) / 5.4, dy = (y - 11) / 4.2; if (dx * dx + dy * dy < 1) set(x, y, 'water'); }
  rect(43, 10, 45, 12, 'grass');
  rect(44, 13, 44, 15, 'bridge');
  rect(31, 21, 32, 21, 'bridge');
  // mountains: the ring round Brightfall, with the pass to the south-east
  const mt = (x0, y0, x1, y1, k = 'mount') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (get(x, y) !== 'water') set(x, y, k); };
  mt(3, 3, 19, 3); mt(3, 3, 4, 16); mt(18, 3, 19, 13); mt(3, 15, 15, 16); mt(18, 13, 19, 14);
  set(8, 4, 'grass'); set(7, 4, 'grass');
  for (const [x, y] of [[24, 6], [25, 7], [12, 26], [13, 27], [20, 33], [36, 6], [37, 6], [52, 18], [53, 19], [55, 8], [27, 14], [10, 30], [11, 31]]) mt(x, y, x, y);
  // desert and snow mountains
  for (const [x, y] of [[12, 47], [13, 47], [26, 50], [27, 51], [40, 49], [14, 58], [30, 46], [9, 53]]) mt(x, y, x, y, 'smount');
  mt(69, 4, 71, 4, 'wmount'); mt(73, 4, 75, 5, 'wmount'); mt(68, 9, 76, 9, 'wmount'); set(72, 9, 'snow');
  for (const [x, y] of [[63, 20], [64, 21], [70, 24], [74, 18], [65, 28]]) mt(x, y, x, y, 'wmount');
  // the burning isle: a ring of peaks round the crater
  for (const [x, y] of [[61, 45], [62, 44], [63, 45], [61, 47], [63, 47], [60, 46], [64, 46]]) set(x, y, 'mount');
  // the Skyloom's island: cliffs all round but the landing
  for (let y = 39; y <= 45; y++) for (let x = 44; x <= 50; x++) if (get(x, y) === 'grass' && (x === 44 || x === 50 || y === 39)) set(x, y, 'mount');
  // woods
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const k = get(x, y), r = hash(x, y, 11), m = hash(x >> 2, y >> 2, 5);
    if (k === 'grass' && r < 0.2 && m < 0.5) set(x, y, 'forest');
    if (k === 'sand' && r < 0.06) set(x, y, 'sforest');
    if (k === 'snow' && r < 0.14 && m < 0.6) set(x, y, 'wforest');
  }
  // roads
  b.path([[11, 10], [11, 13], [16, 13], [17, 14], [17, 17], [22, 17], [22, 21]], 'dirt');
  b.path([[23, 22], [30, 22], [30, 21], [33, 21], [33, 22], [39, 22]], 'dirt');
  b.path([[41, 22], [44, 22], [44, 16]], 'dirt');
  b.path([[44, 22], [44, 26], [52, 26], [52, 29]], 'dirt');
  set(17, 14, 'dirt'); set(17, 13, 'dirt'); set(16, 14, 'dirt');
  // places
  const P = WORLD;
  const place = (key, k) => set(P[key][0], P[key][1], k);
  if (!fall) {
    place('bright', 'i_village'); place('crag', 'i_cave'); place('sol', 'i_castle'); place('under', 'i_cave'); place('dove', 'i_town'); place('temple', 'i_shrine');
    place('gull', 'i_port'); place('smolder', 'i_cave'); place('sand', 'i_stown'); place('ruins', 'i_scave'); place('snow', 'i_wtown'); place('frost', 'i_wcave'); place('loom', 'i_tower');
  } else {
    place('bright', 'i_dvillage'); place('crag', 'i_dcave'); place('sol', 'i_dcastle'); place('under', 'i_dcave'); place('dove', 'i_dtown'); place('temple', 'i_dshrine');
    place('gull', 'i_dport'); place('smolder', 'i_dcave'); place('sand', 'i_stown'); place('ruins', 'i_scave'); place('snow', 'i_wtown'); place('frost', 'i_wcave'); place('loom', 'i_dtower');
  }
  for (const [x, y] of Object.values(P)) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const k = get(x + dx, y + dy); if (k && k.endsWith('forest')) set(x + dx, y + dy, k === 'forest' ? 'grass' : k === 'sforest' ? 'sand' : 'snow'); }
  // the sea lane past the burning isle: a clear landing
  set(62, 48, 'grass'); set(62, 49, 'grass'); set(47, 43, 'grass'); set(47, 44, 'grass'); set(47, 45, 'grass');
  // darkness falls
  if (fall) {
    const DK = { grass: 'dgrass', forest: 'dforest', mount: 'dmount', dirt: 'ddirt', water: 'dwater', bridge: 'bridge' };
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const k = get(x, y); if (DK[k]) set(x, y, DK[k]); }
  }
  const wp = (key, to, tx, ty, dir = 'u', need, msg) => b.e({ type: 'warp', x: P[key][0], y: P[key][1], to, tx, ty, dir, need, msg });
  wp('bright', 'brightfall', 15, 24, 'u');
  wp('crag', 'crag1', 9, 22, 'u', (fl) => fl.ch1_rite, () => L('通往望星岩的山路。現在還不能去。', 'The path up Lookout Crag. Not yet.'));
  wp('sol', 'solhaven', 19, 29, 'u');
  wp('under', 'undercroft', 31, 21, 'u', (fl) => fl.escaped, () => L('河岸邊的排水口。鐵柵欄從裡面鎖住了。', 'A drain by the riverbank, barred from the inside.'));
  wp('dove', 'dovecote', 15, 22, 'u');
  wp('temple', 'temple1', 12, 20, 'u', (fl) => fl.has_mirela || fl.dove_done, () => L('神殿的大門緊閉著。鴿巢鎮的人也許知道些什麼。', 'The temple doors are shut. Someone in Dovecote may know why.'));
  wp('gull', 'gullport', 4, 12, 'r');
  wp('smolder', 'smolder1', 20, 22, 'u');
  wp('sand', 'sandmere', 15, 27, 'u');
  wp('ruins', 'ruins1', 11, 18, 'u');
  wp('snow', 'snowveil', 14, 23, 'u');
  wp('frost', 'frost1', 12, 22, 'u', (fl) => fl.cloak, () => L('暴風雪太猛烈了，沒辦法前進。', 'The blizzard is too fierce to go on.'));
  wp('loom', fall ? 'citadel1' : 'loom1', 14, 22, 'u', (fl) => (fall ? fl.drake && fl.dawnblade : fl.lanterns), () => (fall ? L('浮在空中的城堡，走不上去。', 'A castle floating in the sky. You cannot walk up to it.') : L('高塔的門被看不見的力量封住了。四盞燈……？', 'An unseen force seals the tower door. Four lanterns...?')));
  return b.done({
    world: true,
    zone(x, y, mode) {
      if (mode === 'boat') return fall ? 'dark2' : 'sea';
      if (fall) return x < 31 && y < 40 ? 'dark' : 'dark2';
      if (x <= 19 && y <= 16) return 'crag';
      if (x <= 26 && y <= 26) return 'road';
      if (y >= 42 && x >= 58) return 'volcano';
      if (y >= 39 && x >= 44 && x <= 50) return 'tower';
      if (y >= 42) return 'desert';
      if (x >= 60) return 'snow';
      if (x >= 48) return 'coast';
      if (x > 32) return 'river';
      return 'meadow';
    },
  });
}
def('world', { name: null, music: 'field', world: true, build: worldBuild });

// =====================================================================================
// Brightfall: the village under the falls
// =====================================================================================
def('brightfall', {
  name: nm('亮瀑村', 'Brightfall'), music: 'village', safe: true, town: 'bright',
  build: (f) => {
    const b = build(32, 26, 'grass');
    b.rect(0, 0, 31, 2, 'water'); b.rect(13, 3, 18, 4, 'water'); b.set(15, 5, 'water'); b.set(16, 5, 'water');
    // paths
    b.path([[15, 25], [15, 19], [8, 19], [8, 14]], 'dirt'); b.path([[15, 19], [23, 19], [23, 14]], 'dirt'); b.path([[15, 19], [15, 7]], 'dirt');
    b.rect(14, 7, 17, 8, 'dirt');
    // a fence round the edge, trees beyond
    for (let y = 3; y < 26; y++) { b.set(0, y, 'bush'); b.set(31, y, 'bush'); }
    for (let x = 0; x < 32; x++) if (x < 13 || x > 18) b.set(x, 25, 'bush');
    b.trees([[1, 3], [4, 3], [8, 3], [21, 3], [26, 3], [29, 3], [1, 22], [3, 22], [27, 22], [29, 22], [11, 22], [19, 22]]);
    // houses
    b.house(4, 9, 'bf_home', 7, 8, 'house2');
    b.house(19, 9, 'bf_chapel', 7, 8, 'house');
    b.house(25, 13, 'bf_inn', 7, 8, 'house');
    b.rect(5, 16, 8, 16, 'flowers'); b.rect(24, 20, 28, 20, 'flowers');
    // the market stall and the well
    b.set(10, 19, 'ctrg'); b.set(11, 19, 'ctrg'); b.npc('bf_shop', 'merchant', 10, 18, 'bf_shop', { fixed: true });
    b.set(18, 16, 'barrel'); b.set(19, 16, 'crate');
    // people
    if (!f.fallen) {
      if (!f.ch1_rite) b.npc('wren', 'maiden2', 16, 8, 'wren_bf', { dir: 'u' });
      b.npc('bf_man', 'man', 12, 14, 'bf_man', { wander: true });
      b.npc('bf_woman', 'woman', 21, 17, 'bf_woman', { wander: true });
      b.npc('bf_boy', 'boy', 6, 20, 'bf_boy', { wander: true });
      b.npc('bf_gate', 'youth', 14, 23, 'bf_gate', { cond: (fl) => !fl.ch1_rite });
      if (f.ch1_done && !f.left_home) b.npc('bf_soldier', 'soldier', 16, 22, 'bf_soldier');
    } else {
      b.npc('wren2', 'maiden2', 16, 8, 'wren_fallen', { dir: 'u' });
      b.npc('bf_man', 'man', 12, 14, 'bf_man2');
      b.npc('bf_woman', 'woman', 21, 17, 'bf_woman2');
      b.npc('smith', 'berserker', 13, 18, 'smith', { fixed: true });
    }
    b.warp(14, 25, 'world', 11, 10, 'd'); b.warp(15, 25, 'world', 11, 10, 'd'); b.warp(16, 25, 'world', 11, 10, 'd'); b.warp(17, 25, 'world', 11, 10, 'd');
    b.e({ type: 'trigger', x: 15, y: 7, run: 'falls', once: null, need: (fl) => fl.opened && !fl.ch1_rite });
    return b.done({ tint: f.fallen ? 'rgba(40,0,40,0.28)' : null });
  },
});
def('bf_home', {
  name: null, music: 'village', safe: true,
  build: (f) => grid([
    '###############',
    '###############',
    '#+++++++++++++#',
    '#+e+++++++++x+#',
    '#+++++++[[[+++#',
    '#+++t+++[[[+++#',
    '#+++++++[[[+++#',
    '#+++++++++++++#',
    '#+++++++++++++#',
    '#######dd######',
  ], {
    e: stamp('wood', 'bed'), t: stamp('wood', 'rtable'),
    x: { k: 'wood', st: 'shelf' },
    d: warp('wood', 'brightfall', 6, 14, 'd'),
  }, { id: 'bf_home' }),
});
// Tobin stands by the table
MAPS.bf_home.build = ((orig) => (f) => { const m = orig(f); if (!f.fallen) m.ents.push({ type: 'npc', id: 'tobin', sprite: 'oldman', x: 10, y: 6, dir: 'd', talk: 'tobin' }); else m.ents.push({ type: 'npc', id: 'wren3', sprite: 'maiden2', x: 10, y: 6, dir: 'd', talk: 'wren_home' }); return m; })(MAPS.bf_home.build);
def('bf_chapel', {
  name: null, music: 'peace', safe: true,
  build: () => grid([
    '###############',
    '###############',
    '#n]]]]]]]]]]]n#',
    '#n]]]]]1]]]]]n#',
    '#nnnnnnKnnnnnn#',
    '#n+++nnnnn+++n#',
    '#n+++nnnnn+++n#',
    '#nnnnnnnnnnnnn#',
    '#nnnnnnnnnnnnn#',
    '#######dd######',
  ], { '1': npc('redrug', 'bf_priest', 'priest', 'church'), d: warp('stone', 'brightfall', 21, 14, 'd') }, { id: 'bf_chapel' }),
});
def('bf_inn', {
  name: null, music: 'village', safe: true,
  build: () => grid([
    '###############',
    '###############',
    '#+e+e++++++++x#',
    '#+e+e+++++kk++#',
    '#++++++++++1++#',
    '#++[[[++++++++#',
    '#++[[[++++++++#',
    '#+++++++++++++#',
    '#+++++++++++++#',
    '#######dd######',
  ], { e: stamp('wood', 'bed'), x: stamp('wood', 'plant'), '1': npc('wood', 'bf_inn', 'woman', 'bf_innkeeper', { fixed: true }), d: warp('wood', 'brightfall', 27, 18, 'd') }, { id: 'bf_inn' }),
});

// =====================================================================================
// Lookout Crag: the mountain path above the village
// =====================================================================================
def('crag1', {
  name: nm('望星岩', 'Lookout Crag'), music: 'cave', zone: 'crag',
  build: () => grid([
    'OOOOOOOOOOOOOOOOOOOO',
    'OOOOOOOOO^OOOOOOOOOO',
    'OOOOOOOOOoOOOOOOOOOO',
    'OOOoooooooooooooOOOO',
    'OOOoOOOOOOOOOOOoOOOO',
    'OOOoOoooooooooOoOOOO',
    'OOOoOoOOOOOOOoOoooOO',
    'OOOoooOOcOOOOoOOOoOO',
    'OOOOOOOOooooooooooOO',
    'OOooooooooOOOOOOOOOO',
    'OOoOOOOOOoOOOOOOOOOO',
    'OOoORROOOoooooooooOO',
    'OOooooOOOOOOOOOOOoOO',
    'OOOOOoOOOOgOOOOOOoOO',
    'OOOOOooooooOOooooooO',
    'OOOOOOOOOOoOOoOOOOOO',
    'OOooooooooooooOOOOOO',
    'OOoOOOOOOOOOOOOOOOOO',
    'OOoooooooooOOOOOOOOO',
    'OOOOOOOOOoOOOOOOOOOO',
    'OOOOOOOOOoOOOOOOOOOO',
    'OOOOOOOOOoOOOOOOOOOO',
    'OOOOOOOOOoOOOOOOOOOO',
    'OOOOOOOOO<OOOOOOOOOO',
  ], {
    '^': warp('cfloor', 'crag2', 9, 14, 'u'), '<': warp('cfloor', 'world', 7, 6, 'd'),
    c: chest('cfloor', 'crag_c1', 'herb', 2), g: glint('cfloor', 'crag_g1', 'seedlife'),
  }, { id: 'crag1', zone: () => 'crag' }),
});
def('crag2', {
  name: nm('望星岩　山頂', 'Lookout Crag, Summit'), music: 'memory', zone: 'crag',
  build: (f) => {
    const b = build(20, 16, 'grass');
    b.rect(0, 0, 19, 1, 'cwall'); b.frame(0, 0, 19, 15, 'cwall'); b.rect(0, 0, 19, 2, 'cwall');
    b.rect(6, 4, 13, 8, 'dirt'); b.rect(7, 5, 12, 7, 'cfloor');
    b.set(3, 4, 'rock'); b.set(16, 6, 'rock'); b.set(4, 11, 'rock'); b.set(15, 12, 'bush'); b.set(2, 8, 'flowers'); b.set(17, 9, 'flowers');
    b.warp(9, 15, 'crag1', 9, 2, 'd'); b.set(9, 15, 'cfloor');
    if (!f.ch1_done) b.e({ type: 'trigger', x: 9, y: 12, run: 'summit', once: 'summit_seen' });
    if (f.forge_quest && !f.star_iron) b.e({ type: 'glint', id: 'star_iron', x: 9, y: 6, item: 'gem', story: 'star_iron', walkable: true });
    return b.done({ zone: () => null });
  },
});

// =====================================================================================
// Solhaven, the royal city
// =====================================================================================
def('solhaven', {
  name: nm('王都索爾海文', 'Solhaven, the Royal City'), music: 'town', safe: true, town: 'sol',
  build: (f) => {
    const b = build(40, 32, 'plaza');
    // grass round the walls, the castle gate at the top
    b.rect(0, 0, 39, 31, 'grass');
    b.rect(2, 6, 37, 29, 'plaza');
    b.frame(1, 5, 38, 30, 'swall');
    b.rect(17, 0, 22, 5, 'plaza'); b.frame(16, -1, 23, 5, 'swall'); b.set(16, 5, 'swall'); b.set(23, 5, 'swall');
    b.rect(17, 5, 22, 5, 'plaza');
    b.st('gate', 18, 0);
    const gateNeed = { need: (fl) => fl.ch1_done && (!fl.escaped || fl.fallen), msg: () => L('衛兵：「沒有正事的人不准進城。」', 'Guard: "No entry without business at the castle."') };
    b.warp(19, 2, 'sol_castle', 15, 20, 'u', gateNeed); b.warp(20, 2, 'sol_castle', 16, 20, 'u', gateNeed);
    b.set(19, 30, 'plaza'); b.set(20, 30, 'plaza');
    b.warp(19, 31, 'world', 22, 23, 'd'); b.warp(20, 31, 'world', 22, 23, 'd'); b.set(19, 31, 'plaza'); b.set(20, 31, 'plaza');
    b.st('fountain', 18, 15);
    b.rect(3, 7, 15, 13, 'grass'); b.rect(24, 7, 36, 13, 'grass'); b.rect(3, 20, 15, 28, 'grass'); b.rect(24, 20, 36, 28, 'grass');
    b.house(4, 7, 'sol_inn', 7, 8); b.house(10, 7, 'sol_church', 7, 8, 'house2');
    b.house(25, 7, 'sol_weapon', 7, 8); b.house(31, 7, 'sol_armor', 7, 8, 'house2');
    b.house(4, 21, 'sol_house', 7, 8, 'house2'); b.house(31, 21, 'sol_bar', 7, 8);
    b.trees([[12, 22], [13, 25], [25, 22], [27, 25], [8, 14], [29, 14]]);
    // the market
    b.set(10, 17, 'ctr'); b.set(11, 17, 'ctr'); b.npc('sol_item', 'merchant', 10, 16, 'sol_item', { fixed: true });
    b.st('stall', 6, 16); b.st('stall2', 27, 16);
    const fall = f.fallen;
    if (!fall) {
      b.npc('sol_guard1', 'soldier', 18, 6, 'sol_gate', { cond: (fl) => !fl.escaped || fl.pardoned });
      b.npc('sol_guard2', 'soldier', 21, 6, 'sol_gate');
      b.npc('sol_w1', 'maiden', 22, 19, 'sol_w1', { wander: true });
      b.npc('sol_m1', 'youth2', 14, 24, 'sol_m1', { wander: true });
      b.npc('sol_bard', 'bard', 24, 15, 'sol_bard');
      b.npc('sol_kid', 'girl', 29, 25, 'sol_kid', { wander: true });
      b.npc('sol_old', 'oldwoman', 9, 25, 'sol_old', { wander: true });
      if (f.escaped && !f.pardoned) { b.npc('sol_wanted', 'soldier', 20, 27, 'sol_wanted'); }
    } else {
      b.npc('sol_occ1', 'cultist', 18, 6, 'sol_occupied'); b.npc('sol_occ2', 'cultist', 21, 6, 'sol_occupied');
      b.npc('sol_w1', 'maiden', 22, 19, 'sol_fallen1');
      b.npc('sol_old', 'oldwoman', 9, 25, 'sol_fallen2');
    }
    return b.done({ tint: fall ? 'rgba(40,0,40,0.3)' : null });
  },
});
const room = (id, rows, legend, out, extra = {}) => def(id, { name: null, music: extra.music || 'town', safe: true, build: (f) => grid(rows, { d: warp(extra.floor || 'wood', ...out, 'd'), ...legend }, { id, ...(extra.meta || {}) }), ...extra });
const ROOM = (inside) => ['###############', '###############', ...inside, '#######dd######'];
room('sol_inn', ROOM(['#+e+e+e+++++x+#', '#+e+e+e+++kk++#', '#++++++++++1++#', '#++[[[++++++++#', '#++[[[++a+++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { e: stamp('wood', 'bed'), x: stamp('wood', 'plant'), '1': npc('wood', 'sol_inn', 'woman', 'sol_innkeeper', { fixed: true }), a: npc('wood', 'sol_traveler', 'samurai', 'sol_traveler') }, ['solhaven', 6, 12]);
room('sol_church', ROOM(['#n]]]]]]]]]]]n#', '#n]]]]]1]]]]]n#', '#nnnnnnKnnnnnn#', '#n+++nnnnn+++n#', '#n+++nnnnn+++n#', '#nnnnnnnnnnnnn#', '#nnnnn2nnnnnnn#']),
  { '1': npc('redrug', 'sol_priest', 'priest', 'church'), '2': npc('stone', 'sol_nun', 'nun', 'sol_nun') }, ['solhaven', 12, 12], { music: 'peace', floor: 'stone' });
room('sol_weapon', ROOM(['#+x++++++++x++#', '#+kkkkkkkkkkk+#', '#+++++1+++++++#', '#+++++++++++++#', '#++++++++a++++#', '#+++++++++++++#', '#+++++++++++++#']).map((r, i) => (i === 3 ? r : r)),
  { x: stamp('wood', 'shelf'), '1': npc('wood', 'sol_smith', 'berserker', 'sol_weapon', { fixed: true }), a: npc('wood', 'sol_wcust', 'samurai_f', 'sol_wcust') }, ['solhaven', 27, 12]);
room('sol_armor', ROOM(['#+x++++++++x++#', '#+kkkkkkkkkkk+#', '#++++++1++++++#', '#+++++++++++++#', '#+++++++++++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { x: stamp('wood', 'shelf'), '1': npc('wood', 'sol_armorer', 'man', 'sol_armor', { fixed: true }) }, ['solhaven', 33, 12]);
room('sol_house', ROOM(['#+e+++++++++x+#', '#+++++++++++++#', '#+++++t+++++++#', '#+++++++++++++#', '#+1+++++++++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { e: stamp('wood', 'bed'), x: stamp('wood', 'dresser'), t: stamp('wood', 'table'), '1': npc('wood', 'sol_mom', 'woman', 'sol_mom') }, ['solhaven', 6, 26]);
room('sol_bar', ROOM(['#+x++++x++++x+#', '#+kkkkkkk+++++#', '#++++1++++a+a+#', '#+++++++++ttt+#', '#++b++++++ttt+#', '#+++++++++++++#', '#+++++++++++++#']),
  { x: stamp('wood', 'shelf'), t: { k: 'wood' }, '1': npc('wood', 'sol_barkeep', 'man', 'sol_barkeep', { fixed: true }), a: npc('wood', 'sol_drinker', 'pirate', 'sol_drinker'), b: npc('wood', 'sol_dancer', 'dancer', 'sol_dancer') }, ['solhaven', 33, 26]);

// the castle
def('sol_castle', {
  name: nm('索爾海文城', 'Solhaven Castle'), music: 'castle', safe: true,
  build: (f) => grid([
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HhhhhhhHHhhhhhhhhhhhhhHHhhhhhhH',
    'Hhhh1hhHHh]]]]]2]]]]]hHHhhhhhhH',
    'HhhhhhhHHh]]]]]]]]]]]hHHhhhchhH',
    'HhhhhhhHHh]]]]]]]]]]]hHHhhhhhhH',
    'HhhhhhhHHhhhh]]]]]hhhhHHhhhhhhH',
    'HHHhHHHHHhhhh]]]]]hhhhHHHHhHHHH',
    'Hhhhhhhhhhhhh]]]]]hhhhhhhhhhhhH',
    'Hhh3hhhhhhhhh]]]]]hhhhhhhhh4hhH',
    'HhhhhhhhhhhHH]]]]]HHhhhhhhhhhhH',
    'HHHHHHHHHHHHH]]]]]HHHHHHHHHHHHH',
    'HhhhhhhhhhhhH]]]]]HhhhhhhhhhhhH',
    'HhhhhhhhhhhhH]]]]]HhhhhhhhhhhhH',
    'HhhhhhhhhhhhH]]]]]HhhhhhhhhhhhH',
    'HHHHHHHHHHHHH]]]]]HHHHHHHHHHHHH',
    'Hhhhhhh5hhhhhhhhhhhhhhhh6hhhhhH',
    'HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH',
    'HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH',
    'HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH',
    'HhhhhhhhhhhhhhhhhhhhhhhhhhhhhhH',
    'HHHHHHHHHHHHHHH<<HHHHHHHHHHHHHH',
  ], {
    '1': npc('hall', 'sol_queen', 'queen', 'sol_queen'),
    '2': { k: 'redrug', e: (x, y) => [{ type: 'npc', id: 'king', sprite: 'king', x, y, dir: 'd', talk: 'king', cond: (fl) => !fl.fallen }, { type: 'npc', id: 'morrow', sprite: 'priest', x: x + 2, y: y + 1, dir: 'd', talk: 'morrow_hall', cond: (fl) => !fl.ch2_throne || fl.escaped && !fl.ch7_done }] },
    '3': npc('hall', 'sol_cg1', 'soldier', 'sol_cg1'), '4': npc('hall', 'sol_cg2', 'soldier_f', 'sol_cg2'),
    '5': npc('hall', 'sol_cg3', 'soldier', 'sol_cg3'), '6': npc('hall', 'sol_cg4', 'soldier', 'sol_cg4'),
    c: chest('hall', 'sol_c1', 'strongherb', 2),
    '<': warp('hall', 'solhaven', 19, 3, 'd'),
  }, { id: 'sol_castle' }),
});

// the prison under the castle, and the old drains out to the river
def('undercroft', {
  name: nm('地下牢獄', 'The Undercroft'), music: 'sneak', dark: 0.55, zone: 'sewer',
  build: (f) => grid([
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OHHHHHHHHHHHOOOOOOOOOOOOOOOOOOOOOO',
    'OHnnHnnHnnnHOoooooooooooooooooooOO',
    'OHn1W2nHnnnHOoOOOOOOOOOOOOOOOOOoOO',
    'OHnnHnnHnnnHOoOoooooooooooooooOoOO',
    'OHFFHFFHnnnHOoOoOOOOOOOOOOOOOoOoOO',
    'OHnnnnnnnnnHOoOoOppppppppppOOoOoOO',
    'OHnnnnnnnn3HOoOoOpOOOOOOOOpOOoOoOO',
    'OHHHHHHHnHHHOoOoOpOooooooOpOOoOoOO',
    'OOOOOOOOoOOOOoOoOpOoOOOOoOpOOoOoOO',
    'OoooooooooooooOoOpOoOcOOoOpOOoOoOO',
    'OoOOOOOOOOOOOOOoOpOoOoOOoOpOOoOoOO',
    'OoOgoooooooooooooooooooOoOpOOoOoOO',
    'OoOOOOOOOOOOOOOOOpOOOOOOoOpOOoOoOO',
    'OooooooooooooOOOOpOOoooooOpOOoOoOO',
    'OOOOOOOOOOOOoOOOOpOOoOOOOOpOOoOoOO',
    'OoooooooooooooooOpOOoOOOOOpOOoOoOO',
    'OoOOOOOOOOOOOOOoOpppppppbppOOoOoOO',
    'OoOcOOOOOOOOOOOoOOOOOOOOoOOOOoOoOO',
    'OoOoOOOOOOOOOOOoooooooooooooooOoOO',
    'OoooooooooooooOOOOOOOOOOOOOOOOOoOO',
    'OOOOOOOOOOOOOoooooooooooooooo5ooOO',
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO>OO',
  ], {
    '1': trig('stone', 'cell_wake', { once: 'cell_woke' }), W: 'cellwall',
    '2': npc('stone', 'pell_cell', 'ranger_f', 'pell_cell', { cond: (fl) => !fl.has_pell }),
    '3': npc('stone', 'jailer', 'soldier', 'jailer', { cond: (fl) => !fl.cell_open }),
    F: f.cell_open ? 'stone' : 'bars',
    c: chest('cfloor', 'uc_c' + 1, 'herb', 3), g: glint('cfloor', 'uc_g1', 'seedstr'),
    b: { k: 'bridge' },
    '5': f.fallen ? trig('cfloor', 'alphawolf', { once: 'alpha_dead' }) : trig('cfloor', 'warden', { once: 'warden_dead' }),
    '>': warp('cfloor', 'world', 35, 31, 'd', { need: (fl) => fl.warden_dead, msg: () => L('看守擋住了出口。', 'The Warden blocks the way out.') }),
  }, { id: 'undercroft', zone: () => 'sewer' }),
});
// chest ids must be unique
MAPS.undercroft.build = ((orig) => (f) => { const m = orig(f); let n = 0; for (const e of m.ents) if (e.type === 'chest') e.id = 'uc_c' + ++n; return m; })(MAPS.undercroft.build);

// =====================================================================================
// Dovecote, the river town (a refugee camp after the fall)
// =====================================================================================
def('dovecote', {
  name: nm('鴿巢鎮', 'Dovecote'), music: 'town', safe: true, town: 'dove',
  build: (f) => {
    const fall = f.fallen;
    const b = build(34, 26, fall ? 'dgrass' : 'grass');
    const dirt = fall ? 'ddirt' : 'dirt';
    b.rect(0, 0, 33, 3, 'water'); b.rect(26, 0, 33, 25, 'water');
    b.rect(26, 11, 33, 12, 'bridge');
    b.path([[15, 25], [15, 14], [5, 14]], dirt); b.path([[15, 14], [25, 14], [25, 12], [26, 12]], dirt); b.path([[15, 14], [15, 9]], dirt);
    for (let y = 4; y < 26; y++) b.set(0, y, fall ? 'dbush' : 'bush');
    for (let x = 0; x < 26; x++) if (x < 13 || x > 17) b.set(x, 25, fall ? 'dbush' : 'bush');
    b.house(2, 4, 'dove_inn', 7, 8); b.house(9, 4, 'dove_church', 7, 8, 'house2'); b.house(18, 4, 'dove_house', 7, 8);
    b.house(3, 16, 'dove_shop', 7, 8, 'house2'); b.house(19, 16, 'dove_mayor', 7, 8);
    b.trees([[12, 19], [10, 21], [23, 22], [6, 10]]);
    b.set(15, 10, 'flowers'); b.set(14, 10, 'flowers'); b.set(16, 10, 'flowers');
    // the pier
    b.rect(23, 7, 25, 7, 'bridge');
    if (!fall) {
      b.npc('dv_fisher', 'man', 22, 8, 'dv_fisher');
      b.npc('dv_girl', 'girl', 13, 15, 'dv_girl', { wander: true });
      b.npc('dv_old', 'oldman', 7, 13, 'dv_old', { wander: true });
      b.npc('dv_guard', 'soldier_f', 24, 13, 'dv_guard');
    } else {
      b.npc('dv_ref1', 'woman', 12, 15, 'dv_ref1'); b.npc('dv_ref2', 'oldman', 7, 13, 'dv_ref2'); b.npc('dv_ref3', 'child', 18, 13, 'dv_ref3');
      b.npc('dv_guard', 'soldier_f', 24, 13, 'dv_camp');
    }
    for (const x of [13, 14, 15, 16, 17]) b.warp(x, 25, 'world', 40, 23, 'd');
    b.warp(33, 11, 'world', 41, 22, 'r'); b.warp(33, 12, 'world', 41, 22, 'r');
    return b.done({ tint: fall ? 'rgba(40,0,40,0.28)' : null });
  },
});
const inn = (id, back, keeper = 'woman') => room(id, ROOM(['#+e+e+e+++++x+#', '#+e+e+e+++kk++#', '#++++++++++1++#', '#++[[[++++++++#', '#++[[[++++++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { e: stamp('wood', 'bed'), x: stamp('wood', 'plant'), '1': npc('wood', id + '_keeper', keeper, id + '_keeper', { fixed: true }) }, back);
const chapel = (id, back, extra = {}) => room(id, ROOM(['#n]]]]]]]]]]]n#', '#n]]]]]1]]]]]n#', '#nnnnnnKnnnnnn#', '#n+++nnnnn+++n#', '#n+++nn2nn+++n#', '#nnnnnnnnnnnnn#', '#nnnnnnnnnnnnn#']),
  { '1': npc('redrug', id + '_priest', 'priest', 'church'), '2': extra.two || 'stone' }, back, { music: 'peace', floor: 'stone' });
const shopRoom = (id, back, sprite, talk) => room(id, ROOM(['#+x++++++++x++#', '#+kkkkkkkkkkk+#', '#++++++1++++++#', '#+++++++++++++#', '#+++++++++++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { x: stamp('wood', 'shelf'), '1': npc('wood', id + '_npc', sprite, talk, { fixed: true }) }, back);
const home = (id, back, sprite, talk) => room(id, ROOM(['#+e+++++++++x+#', '#+++++++++++++#', '#+++++t+++++++#', '#+++++++++++++#', '#+1+++++++++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { e: stamp('wood', 'bed'), x: stamp('wood', 'dresser'), t: stamp('wood', 'table'), '1': npc('wood', id + '_npc', sprite, talk) }, back);
inn('dove_inn', ['dovecote', 4, 9]);
chapel('dove_church', ['dovecote', 11, 9], { two: { k: 'stone', e: { type: 'npc', id: 'mirela_ch', sprite: 'healer_f', dir: 'u', talk: 'mirela_meet', cond: (fl) => !fl.has_mirela && !fl.fallen } } });
home('dove_house', ['dovecote', 20, 9], 'woman', 'dove_wife');
shopRoom('dove_shop', ['dovecote', 5, 21], 'merchant', 'dove_shop');
home('dove_mayor', ['dovecote', 21, 21], 'man', 'dove_mayor');

// the Riverlight Temple, half under water
def('temple1', {
  name: nm('河光神殿', 'Riverlight Temple'), music: 'crypt', zone: 'temple',
  build: (f) => grid([
    'HHHHHHHHHHHHHHHHHHHHHHHHHH',
    'HHHHHHHHHHHH^HHHHHHHHHHHHH',
    'HnnnnnnnHnnnnnnnHnnnnnnnnH',
    'HnppppnnHnnnnnnnHnnnnpppnH',
    'HnppppnnHnHHHHHnHnnnnpppnH',
    'HnnnnnnnHnnnnnHnHnnnnnnnnH',
    'HHHHnHHHHHHHHnHnHHHHHHnHHH',
    'HnnnnnnnnnnnnnHnnnnnnnnnnH',
    'HnHHHHHHHHHHHHHHHHHHHHHHnH',
    'HnHnnnnnnnnnnnnnnnnnnnnHnH',
    'HnHnpppppppbppppppppppnHnH',
    'HnHnpnnnnnnnnnnnnnnnnpnHnH',
    'HnHnpnHHHHHHHHHHHHHHnpnHnH',
    'HnHnpnHnnnnnnnnnnnnHnpnHnH',
    'HnHnpnHnHHHHHHHcHHnHnpnHnH',
    'HnHnpnnnHgnnnnnnnnnHnpnHnH',
    'HnHnppppHHHHHHHHHHHHnpnHnH',
    'HnHnnnnnnnnnnnnnnnnnnpnHnH',
    'HnHHHHHHHHHHHnHHHHHHHHHHnH',
    'HnnnnnnnnnnnnnnnnnnnnnnnnH',
    'HHHHHHHHHHHHn<HHHHHHHHHHHH',
  ], {
    '^': warp('stone', 'temple2', 9, 15, 'u', { need: (fl) => fl.has_mirela, msg: () => L('奧殿的門封著。需要神官的祈禱才能打開。', "The inner door is sealed. It needs a priestess's prayer.") }),
    '<': warp('stone', 'world', 44, 16, 'd'),
    c: chest('stone', 'tp_c1', 'ether', 1), g: glint('stone', 'tp_g1', 'seeddef'),
  }, { id: 'temple1', zone: () => 'temple', tint: f.fallen ? 'rgba(40,40,0,0.25)' : null }),
});
const shrineRoom = (id, name, music, sheetWall, floor, legend, back, zone) => def(id, {
  name, music, zone: null,
  build: (f) => {
    const W2 = 19, H2 = 17, wl = sheetWall, fl = floor;
    const rows = [];
    for (let y = 0; y < H2; y++) {
      let r = '';
      for (let x = 0; x < W2; x++) {
        if (y < 2 || x === 0 || x === W2 - 1 || y === H2 - 1) r += x === 9 && y === H2 - 1 ? '<' : wl;
        else if (y === 3 && x === 9) r += '1';
        else if (y === 6 && x === 9) r += '2';
        else if ((x <= 2 || x >= W2 - 3) && (y === 3 || y === 9 || y === 10)) r += legend.pool || fl;
        else r += fl;
      }
      rows.push(r);
    }
    const lg = legend.lg(f);
    return grid(rows, { '<': warp(lg.floorKind, ...back, 'd'), ...lg }, { id, zone: () => zone || null, tint: lg.tint || null });
  },
});
shrineRoom('temple2', nm('河光神殿　奧殿', 'Riverlight Temple, Sanctum'), 'crypt', 'H', 'n', {
  pool: 'p', lg: (f) => ({
    floorKind: 'stone',
    '1': { k: 'stone', e: { type: 'sprite', id: 'lantern_w', draw: null } },
    '2': f.fallen ? trig('stone', 'abbot', { once: 'abbot_dead' }) : trig('stone', 'mirequeen', { once: 'mire_dead' }),
    tint: f.fallen ? 'rgba(40,40,0,0.25)' : null,
  }),
}, ['temple1', 12, 2]);

// =====================================================================================
// Gullport, and the burning isle
// =====================================================================================
def('gullport', {
  name: nm('海鷗港', 'Gullport'), music: 'port', safe: true, town: 'gull',
  build: (f) => {
    const fall = f.fallen;
    const b = build(36, 26, fall ? 'dgrass' : 'grass');
    b.rect(26, 0, 35, 25, 'water');
    b.rect(5, 6, 25, 20, 'plaza');
    b.rect(24, 9, 31, 10, 'bridge'); b.rect(24, 16, 31, 17, 'bridge'); b.rect(30, 9, 31, 17, 'bridge');
    b.path([[0, 12], [5, 12]], 'dirt'); b.path([[0, 13], [5, 13]], 'dirt');
    b.house(6, 1, 'gull_inn', 7, 8); b.house(13, 1, 'gull_tavern', 7, 8, 'house2'); b.house(20, 1, 'gull_church', 7, 8);
    b.house(6, 20, 'gull_shop', 7, 8, 'house2'); b.house(14, 20, 'gull_house', 7, 8);
    b.st('fountain', 14, 11);
    b.set(9, 12, 'barrel'); b.set(10, 12, 'crate'); b.set(9, 13, 'crate'); b.set(22, 18, 'barrel'); b.set(23, 18, 'barrel');
    for (let y = 0; y < 26; y++) if (y < 11 || y > 14) b.set(0, y, fall ? 'dbush' : 'bush');
    if (!fall) {
      b.npc('gl_sailor', 'pirate', 27, 10, 'gl_sailor');
      b.npc('gl_captain', 'captain', 30, 13, 'gl_captain');
      b.npc('gl_w', 'maiden', 12, 15, 'gl_w', { wander: true });
      b.npc('gl_m', 'youth', 20, 8, 'gl_m', { wander: true });
      b.npc('gl_fish', 'man', 24, 15, 'gl_fish');
      if (f.has_odo && !f.brannoc_duel) b.e({ type: 'trigger', x: 25, y: 12, run: 'brannoc_duel', once: 'brannoc_duel' });
    } else {
      b.npc('gl_sailor', 'pirate', 27, 10, 'gl_fallen1');
      b.npc('gl_w', 'maiden', 12, 15, 'gl_fallen2');
      if (!f.kraken_dead) b.e({ type: 'trigger', x: 25, y: 12, run: 'deepkraken', need: (fl) => fl.odo_back && !fl.kraken_dead });
    }
    b.warp(0, 12, 'world', 52, 30, 'l'); b.warp(0, 13, 'world', 52, 30, 'l');
    return b.done({ tint: fall ? 'rgba(40,0,40,0.28)' : null });
  },
});
inn('gull_inn', ['gullport', 8, 6]);
room('gull_tavern', ROOM(['#+x++++x++++x+#', '#+kkkkkkk+++++#', '#++++1++++a+a+#', '#+++++++++++++#', '#++b++++++++++#', '#+++++++++++++#', '#+++++++++++++#']),
  { x: stamp('wood', 'shelf'), '1': { k: 'wood', e: { type: 'npc', id: 'odo_t', sprite: 'monk', dir: 'd', talk: 'odo_meet', cond: (fl) => (!fl.has_odo && !fl.fallen) || (fl.fallen && !fl.odo_back) } }, a: npc('wood', 'gl_drinker', 'pirate', 'gl_drinker'), b: npc('wood', 'gl_dancer', 'dancer', 'gl_dancer') }, ['gullport', 15, 6]);
chapel('gull_church', ['gullport', 22, 6]);
shopRoom('gull_shop', ['gullport', 8, 25], 'merchant', 'gull_shop');
home('gull_house', ['gullport', 16, 25], 'oldwoman', 'gull_old');

def('smolder1', {
  name: nm('燼島　火口', 'Smolder Isle, the Crater'), music: 'danger', zone: 'volcano',
  build: () => grid([
    'LLLLLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLL^LLLLLLLLLLLL',
    'LLLLLLLLLLLlLLLLLLLLLLLL',
    'LLlllllllllllllllllllLLL',
    'LLlvvvvvvLLLLLLvvvvvlLLL',
    'LLlvLLLLvLlllLLvLLLvlLLL',
    'LLlvLclLvLlLlLLvLgLvlLLL',
    'LLlvLLlLvLlLlllvLlLvlLLL',
    'LLllllllllllLLlllllllLLL',
    'LLLLLLLLLLLlLLLLLLLLLLLL',
    'LLlllllllllllllllllllLLL',
    'LLlLLLLLLLLLLLLLLLLLlLLL',
    'LLlLvvvvvvvvvvvvvvvLlLLL',
    'LLlLvLLLLLLLLLLLLLvLlLLL',
    'LLlllllllllllllllllllLLL',
    'LLLLLLLLLlLLLLLLLLLLLLLL',
    'LLLLLLLLLlLLLLLLLLLLLLLL',
    'LLllllllllllllllLLLLLLLL',
    'LLlLLLLLLLLLLLLlLLLLLLLL',
    'LLlllllllLLLLLLlllllLLLL',
    'LLLLLLLLlLLLLLLLLLLlLLLL',
    'LLLLLLLLlllllllllllllLLL',
    'LLLLLLLLLLLLLLLLLLLLlLLL',
    'LLLLLLLLLLLLLLLLLLLL<LLL',
  ], {
    '^': warp('lfloor', 'smolder2', 9, 15, 'u'), '<': warp('lfloor', 'world', 62, 48, 'd'),
    c: chest('lfloor', 'sm_c1', 'firewand', 1), g: glint('lfloor', 'sm_g1', 'seedstr'),
  }, { id: 'smolder1', zone: () => 'volcano' }),
});
shrineRoom('smolder2', nm('燼島　火之祭壇', 'Smolder Isle, Altar of Fire'), 'danger', 'L', 'l', {
  pool: 'v', lg: () => ({ floorKind: 'lfloor', '1': { k: 'lfloor', e: { type: 'sprite', id: 'lantern_f', draw: null } }, '2': trig('lfloor', 'emberwraith', { once: 'ember_dead' }) }),
}, ['smolder1', 11, 2]);

// =====================================================================================
// Sandmere, the desert kingdom, and the Dune Ruins
// =====================================================================================
def('sandmere', {
  name: nm('沙漠王國沙梅爾', 'Sandmere, the Desert Kingdom'), music: 'bazaar', safe: true, town: 'sand',
  build: (f) => {
    const b = build(32, 30, 'sand');
    b.frame(1, 1, 30, 28, 'swall');
    b.rect(8, 2, 23, 9, 'plaza'); b.frame(7, 1, 24, 10, 'swall'); b.set(15, 10, 'plaza'); b.set(16, 10, 'plaza');
    b.rect(13, 13, 18, 17, 'water');
    b.trees([[10, 12], [20, 12], [10, 17], [20, 17]]);
    for (const s of b.stamps) s.sheet = 'Os';
    b.house(3, 12, 'sand_inn', 7, 8); b.house(3, 20, 'sand_church', 7, 8, 'house2'); b.house(24, 12, 'sand_shop', 7, 8, 'house2');
    b.set(20, 22, 'ctr'); b.set(21, 22, 'ctr');
    b.npc('sd_shop2', 'merchant', 20, 21, 'sand_item', { fixed: true });
    b.npc('sd_guard1', 'samurai', 14, 11, 'sd_guard'); b.npc('sd_guard2', 'samurai_f', 17, 11, 'sd_guard');
    b.npc('sd_queen', 'queen', 15, 4, 'sand_queen');
    if (!f.has_sera && !f.fallen) b.npc('sera_p', 'magician_f', 18, 5, 'sera_meet');
    b.npc('sd_dancer', 'dancer', 9, 23, 'sd_dancer', { wander: true });
    b.npc('sd_kid', 'boy', 20, 25, 'sd_kid', { wander: true });
    if (f.fallen && !f.leo_dead) b.e({ type: 'trigger', x: 15, y: 12, run: 'leocephas', need: (fl) => !fl.leo_dead });
    b.rect(14, 28, 17, 29, 'sand');
    for (const x of [14, 15, 16, 17]) b.warp(x, 29, 'world', 20, 53, 'd');
    return b.done();
  },
});
inn('sand_inn', ['sandmere', 5, 17]);
chapel('sand_church', ['sandmere', 5, 25]);
shopRoom('sand_shop', ['sandmere', 26, 17], 'berserker_f', 'sand_shop');
def('ruins1', {
  name: nm('沙中遺跡', 'The Dune Ruins'), music: 'lair', zone: 'ruins',
  build: () => grid([
    'OOOOOOOOOOOOOOOOOOOOOOOO',
    'OOOOOOOOOOO^OOOOOOOOOOOO',
    'OOOOOOOOOOOoOOOOOOOOOOOO',
    'OoooooooooooooooooooooOO',
    'OoOOOOOOOOOOOOOOOOOOOoOO',
    'OoOcoooooOOOOOoooooOOoOO',
    'OoOOOOOOoOOOOOoOOOoOOoOO',
    'OoooooooooooOOoOgOoooooO',
    'OOOOOOOOOOOoOOoOoOOOOOoO',
    'OoooooooOOOoOOoooOOOOOoO',
    'OoOOOOOoOOOoOOOOOOOoooOO',
    'OoOzoOOoooooooooooooOOOO',
    'OoOooOOOOOOOOOOOOOOoOOOO',
    'OoooooooooooooooooooOOOO',
    'OOOOOOOOOOOoOOOOOOOOOOOO',
    'OOOOOOOOOOOoOOOOOOOOOOOO',
    'OOOOOOOOOOOoOOOOOOOOOOOO',
    'OOOOOOOOOOOoOOOOOOOOOOOO',
    'OOOOOOOOOOOoOOOOOOOOOOOO',
    'OOOOOOOOOOO<OOOOOOOOOOOO',
  ], {
    '^': warp('cfloor', 'ruins2', 9, 15, 'u', { need: (fl) => fl.basilisk_dead, msg: () => L('通道被一隻巨大的蜥蜴擋住了。牠在西邊的小房間裡……', 'A giant lizard blocks the passage. It lairs in the little room to the west...') }),
    '<': warp('cfloor', 'world', 35, 58, 'd'),
    c: chest('cfloor', 'rn_c1', 'tigerfang', 1), g: glint('cfloor', 'rn_g1', 'seedagi'),
    z: trig('cfloor', 'basilisk', { once: 'basilisk_dead' }),
  }, { id: 'ruins1', zone: () => 'ruins' }),
});
shrineRoom('ruins2', nm('沙中遺跡　大地之間', 'The Dune Ruins, Hall of Earth'), 'lair', 'O', 'o', {
  pool: 'R', lg: () => ({ floorKind: 'cfloor', '1': { k: 'cfloor', e: { type: 'sprite', id: 'lantern_e', draw: null } }, '2': trig('cfloor', 'clayborn', { once: 'clay_dead' }) }),
}, ['ruins1', 11, 2]);

// =====================================================================================
// Snowveil and the Frostcrown
// =====================================================================================
def('snowveil', {
  name: nm('雪幕村', 'Snowveil'), music: 'frost', safe: true, town: 'snow',
  build: (f) => {
    const b = build(30, 26, 'snow');
    for (let y = 0; y < 26; y++) { b.set(0, y, 'wbush'); b.set(29, y, 'wbush'); }
    for (let x = 0; x < 30; x++) { b.set(x, 0, 'wbush'); if (x < 12 || x > 16) b.set(x, 25, 'wbush'); }
    b.house(3, 3, 'snow_inn', 7, 8); b.house(11, 2, 'snow_elder', 7, 8, 'house2'); b.house(21, 3, 'snow_church', 7, 8);
    b.house(4, 13, 'snow_shop', 7, 8, 'house2'); b.house(20, 13, 'snow_item', 7, 8);
    b.trees([[13, 16], [2, 21], [25, 21], [9, 19]]);
    b.st('statue', 14, 9);
    for (const s of b.stamps) s.sheet = 'Ow';
    b.npc('sn_kid', 'girl', 12, 21, 'sn_kid', { wander: true });
    b.npc('sn_hunter', 'ranger', 18, 11, 'sn_hunter');
    b.npc('sn_old', 'oldwoman', 8, 10, 'sn_old', { wander: true });
    if (f.has_sera && !f.has_brannoc && !f.fallen) b.e({ type: 'trigger', x: 14, y: 22, run: 'brannoc_join', once: 'brannoc_joined' });
    if (f.fallen && !f.sera_back) b.npc('sera_w', 'magician_f', 15, 12, 'sera_waits');
    for (const x of [12, 13, 14, 15, 16]) b.warp(x, 25, 'world', 67, 15, 'd');
    return b.done();
  },
});
inn('snow_inn', ['snowveil', 5, 8]);
home('snow_elder', ['snowveil', 13, 7], 'oldman', 'snow_elder');
chapel('snow_church', ['snowveil', 23, 8]);
shopRoom('snow_shop', ['snowveil', 6, 18], 'berserker', 'snow_shop');
shopRoom('snow_item', ['snowveil', 22, 18], 'merchant', 'snow_itemshop');
def('frost1', {
  name: nm('霜冠洞窟', 'The Frostcrown'), music: 'frost', zone: 'frost',
  build: () => grid([
    'IIIIIIIIIIIIIIIIIIIIIIIIII',
    'IIIIIIIIIIII^IIIIIIIIIIIII',
    'IIIIIIIIIIIIiIIIIIIIIIIIII',
    'IiiiiiiiiiiiiiiiiiiiiiiiII',
    'IiIIIIIIIIIIIIIIIIIIIIIiII',
    'IiIiiiiiiiiqqqqiiiiiiIIiII',
    'IiIiIIIIIIIqqqqIIIIIiIIiII',
    'IiIiIciiiIIqqqqIigiIiIIiII',
    'IiIiIIIIiIIIIIIIIIiIiIIiII',
    'IiiiiiiiiiiiiiiiiiiiiiiiII',
    'IIIIIIIIIIIIiIIIIIIIIIIIII',
    'IiiiiiiiiiiiiiiiiiiiiiiiiI',
    'IiIIIIIIIIIIIIIIIIIIIIIIiI',
    'IiIqqqqqqqqqqqqqqqqqqqIIiI',
    'IiIiiiiiiiiiiiiiiiiiiqIIiI',
    'IiIIIIIIIIIIIIIIIIIIiqIIiI',
    'IiiiiiiiiiiiiiiiiiiiiqIIiI',
    'IIIIIIIIIIIIiIIIIIIIIIIIiI',
    'IiiiiiiiiiiiiiiiiiiiiiiiiI',
    'IiIIIIIIIIIIIIIIIIIIIIIIII',
    'IiiiiiiiiiiiiIIIIIIIIIIIII',
    'IIIIIIIIIIIIiIIIIIIIIIIIII',
    'IIIIIIIIIIIIiIIIIIIIIIIIII',
    'IIIIIIIIIIII<IIIIIIIIIIIII',
  ], {
    '^': warp('ifloor', 'frost2', 9, 15, 'u'), '<': warp('ifloor', 'world', 72, 8, 'd'),
    c: chest('ifloor', 'fr_c1', 'mythril', 1), g: glint('ifloor', 'fr_g1', 'seedmag'),
  }, { id: 'frost1', zone: () => 'frost' }),
});
shrineRoom('frost2', nm('霜冠洞窟　冰之心', 'The Frostcrown, Ice Heart'), 'frost', 'I', 'i', {
  pool: 'q', lg: (f) => ({ floorKind: 'ifloor', '1': { k: 'ifloor', e: { type: 'sprite', id: 'lantern_i', draw: null } }, '2': f.fallen ? trig('ifloor', 'archfiend', { once: 'fiend_dead' }) : trig('ifloor', 'rimewyrm', { once: 'rime_dead' }) }),
}, ['frost1', 12, 2]);

// =====================================================================================
// The Skyloom, and the Unspun Citadel that takes its place
// =====================================================================================
const tower = (id, name, music, zone, rows, legend, down, up, extra = {}) => def(id, {
  name, music, zone, dark: extra.dark,
  build: () => grid(rows, { '<': warp('pfloor', ...down, 'd'), '^': warp('pfloor', ...up, 'u'), u: 'ppit', ...legend }, { id, zone: () => zone, tint: extra.tint || null }),
});
const FLOOR_A = [
  'YYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYY^YYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYYyYYYYYYYYYYYYYY',
  'YyyyyyyyyyyyyyyyyyyyyyyyyyyyY',
  'YyYYYYYYYYYYYYYYYYYYYYYYYYYyY',
  'YyYyyyyyyyyyYYYyyyyyyyyyyYYyY',
  'YyYyYYYYYYYyYYYyYYYYYYYYyYYyY',
  'YyYyYcyyyYYyyyyyYYYgyyyYyYYyY',
  'YyYyYYYYyYYYYYYYYYYYYYyYyYYyY',
  'YyYyyyyyyyyyyyyyyyyyyyyYyYYyY',
  'YyYYYYYYYYYYYyYYYYYYYYYYyYYyY',
  'YyyyyyyyyyyyyyyyyyyyyyyyyyyyY',
  'YYYYYYYYYYYYYyYYYYYYYYYYYYYYY',
  'YuuuuuyyyyyyyyyyyyyyyyuuuuuuY',
  'YuuuuuyYYYYYYYYYYYYYYYyuuuuuY',
  'YuuuuuyYyyyyyyyyyyyyyYyuuuuuY',
  'YuuuuuyYyYYYYYYYYYYYyYyuuuuuY',
  'YyyyyyyyyyyyyysyyyyyyyyyyyyyY',
  'YyYYYYYYYYYYYYYYYYYYYYYYYYYyY',
  'YyyyyyyyyyyyyyyyyyyyyyyyyyyyY',
  'YYYYYYYYYYYYYYyYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYYyYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYYyYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYY<YYYYYYYYYYYYYY',
];
const FLOOR_B = [
  'YYYYYYYYYYYYYYYYYYYYYYYYYYY',
  'YYYYYYYYYYYYY^YYYYYYYYYYYYY',
  'YYYYYYYYYYYYYyYYYYYYYYYYYYY',
  'YyyyyyyyyyyyyyyyyyyyyyyyyyY',
  'YyYYYYYYYYYYYYYYYYYYYYYYYyY',
  'YyYuuuuuuuuuuuuuuuuuuuuYYyY',
  'YyYuyyyyyyyyyyyyyyyyyyuYYyY',
  'YyYuyYYYYYYYYYYYYYYYYyuYYyY',
  'YyYuyYcyyyyyyyyyyyyyYyuYYyY',
  'YyYuyYYYYYYYYYYYYYYyYyuYYyY',
  'YyYuyyyyyyyyyyyyyyyyYyuYYyY',
  'YyYuuuuuuuuuuuuuuuuyYyuYYyY',
  'YyYYYYYYYYYYYYYYYYYyyyYYYyY',
  'YyyyyyyyyyyyyyyyyyyyYyyyyyY',
  'YYYYYYYYYYYYYyYYYYYYYYYYYYY',
  'YyyyyyyyyyyyyyyyyyyyyyyyyyY',
  'YyYYYYYYYYYYYYYYYYYYYYYYYyY',
  'YyYgyyyyyyyyy2yyyyyyyyyYYyY',
  'YyYYYYYYYYYYYyYYYYYYYYyYYyY',
  'YyyyyyyyyyyyysyyyyyyyyyyyyY',
  'YYYYYYYYYYYYYyYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYyYYYYYYYYYYYYY',
  'YYYYYYYYYYYYYyYYYYYYYYYYYYY',
  'YYYYYYYYYYYYY<YYYYYYYYYYYYY',
];
tower('loom1', nm('天織塔　一層', 'The Skyloom, First Weave'), 'hymn', 'tower', FLOOR_A,
  { c: chest('pfloor', 'lm_c1', 'elixir', 1), g: glint('pfloor', 'lm_g1', 'seedlife'), s: save('pfloor') }, ['world', 47, 43], ['loom2', 13, 21]);
tower('loom2', nm('天織塔　二層', 'The Skyloom, Second Weave'), 'hymn', 'tower', FLOOR_B,
  { c: chest('pfloor', 'lm_c2', 'starwand', 1), g: glint('pfloor', 'lm_g2', 'seedmag'), s: 'pfloor', '2': 'pfloor' }, ['loom1', 14, 2], ['loom3', 9, 15]);
shrineRoom('loom3', nm('天織塔　織母之間', 'The Skyloom, Chamber of the Weaver'), 'hymn', 'Y', 'y', {
  pool: 'u', lg: () => ({ floorKind: 'pfloor', '1': { k: 'pfloor', e: { type: 'npc', id: 'weaver', sprite: 'angel_f', dir: 'd', talk: 'weaver', cond: (fl) => !fl.ch7_done } }, '2': trig('pfloor', 'loomwarden', { once: 'warden2_dead' }) }),
}, ['loom2', 13, 2]);
tower('citadel1', nm('解織城　外郭', 'The Unspun Citadel, Outer Ward'), 'dread', 'citadel', FLOOR_A,
  { c: chest('pfloor', 'ct_c1', 'dragonclaw', 1), g: glint('pfloor', 'ct_g1', 'dawnleaf'), s: save('pfloor') }, ['world', 47, 43], ['citadel2', 13, 21], { tint: 'rgba(60,0,40,0.28)', dark: 0.3 });
tower('citadel2', nm('解織城　龍之回廊', 'The Unspun Citadel, Wyrm Gallery'), 'dread', 'citadel', FLOOR_B,
  { c: chest('pfloor', 'ct_c2', 'dawnarmor', 1), g: glint('pfloor', 'ct_g2', 'seedstr'), s: save('pfloor'), '2': trig('pfloor', 'gloomwyrm', { once: 'wyrm_dead' }) }, ['citadel1', 14, 2], ['citadel3', 9, 15], { tint: 'rgba(60,0,40,0.28)', dark: 0.3 });
shrineRoom('citadel3', nm('解織城　王座', 'The Unspun Citadel, the Throne'), 'dread', 'Y', 'y', {
  pool: 'u', lg: (f) => ({ floorKind: 'pfloor', tint: 'rgba(60,0,40,0.3)', '1': { k: 'pfloor', e: { type: 'npc', id: 'morrow_t', sprite: 'priest', dir: 'd', talk: 'morrow_final', cond: () => !f.morrow_dead } }, '2': trig('pfloor', 'morrow_final', { once: 'final_begun' }) }),
}, ['citadel2', 13, 2]);
