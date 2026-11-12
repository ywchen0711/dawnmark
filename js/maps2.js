// The expansion's maps: Luckhaven and the Crown Arena, Chimeholm and Galespire in the windswept
// east, Mossmere, Gloomfen and the Sunken Archive in the southern jungle, Gullwing Grotto, the
// places of each friend's own story, and the Starwell that appears after the end.
// Most dungeons are laid out by a seeded generator (rooms joined by corridors), so the same
// seed always gives the same map; towns are built by hand.
import { L } from './i18n.js';
import { MAPS, build, grid, npc, warp, trig, defMap as def, mapName as nm, room, ROOM, inn, chapel, shopRoom, home, shrineRoom } from './maps.js';

// ---------- a seeded random number ----------
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// wall, floor and pool letters for each look (see BASE in maps.js)
const THEMES = { cave: ['O', 'o', 'p'], ice: ['I', 'i', 'q'], lava: ['L', 'l', 'v'], tower: ['Y', 'y', 'u'], stone: ['H', 'n', 'p'] };

// rooms joined by corridors. The entrance is at the bottom; at the top either stairs up or a
// chamber reached by one corridor, so a boss there cannot be walked round.
function layoutDungeon(w, h, seed, top) {
  const R = rng(seed), ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const g = Array.from({ length: h }, () => Array(w).fill('#'));
  const cx = Math.floor(w / 2);
  const carve = (x, y) => { if (x > 0 && y > 1 && x < w - 1 && y < h - 1) g[y][x] = '.'; };
  const rect = (r) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y); };
  const entry = { x: cx - 2, y: h - 6, w: 5, h: 3 };
  const rooms = [entry];
  const minY = top === 'boss' ? 9 : 3;
  for (let tries = 0; tries < 160 && rooms.length < 9; tries++) {
    const rw = ri(3, 7), rh = ri(3, 5), rx = ri(2, w - rw - 2), ry = ri(minY, h - rh - 6);
    if (rooms.some((o) => rx < o.x + o.w + 2 && rx + rw + 2 > o.x && ry < o.y + o.h + 2 && ry + rh + 2 > o.y)) continue;
    rooms.push({ x: rx, y: ry, w: rw, h: rh });
  }
  for (const r of rooms) rect(r);
  const mid = (r) => [r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2)];
  const corridor = ([x0, y0], [x1, y1]) => {
    let x = x0, y = y0;
    const hv = R() < 0.5;
    if (hv) { while (x !== x1) { carve(x, y); x += Math.sign(x1 - x); } while (y !== y1) { carve(x, y); y += Math.sign(y1 - y); } }
    else { while (y !== y1) { carve(x, y); y += Math.sign(y1 - y); } while (x !== x1) { carve(x, y); x += Math.sign(x1 - x); } }
    carve(x1, y1);
  };
  // join every room to the nearest one already joined, then add a couple of loops
  const joined = [rooms[0]], rest = rooms.slice(1);
  while (rest.length) {
    let best = null;
    for (const r of rest) for (const j of joined) { const [a, b] = mid(r), [c, d] = mid(j), dd = Math.abs(a - c) + Math.abs(b - d); if (!best || dd < best[0]) best = [dd, r, j]; }
    corridor(mid(best[1]), mid(best[2]));
    joined.push(best[1]); rest.splice(rest.indexOf(best[1]), 1);
  }
  for (let k = 0; k < 2 && rooms.length > 3; k++) corridor(mid(rooms[ri(1, rooms.length - 1)]), mid(rooms[ri(1, rooms.length - 1)]));
  // the way in
  for (let y = entry.y + entry.h; y < h - 1; y++) carve(cx, y);
  const out = { g, rooms, entry: [cx, h - 1], cx };
  if (top === 'boss') {
    // the chamber, and the one corridor down from it
    const ch = { x: cx - 3, y: 2, w: 7, h: 4 };
    rect(ch);
    carve(cx, 6); carve(cx, 7);
    // join the corridor to the nearest room below
    let near = null;
    for (const r of rooms) { const [a, b] = mid(r), dd = Math.abs(a - cx) + Math.abs(b - 8); if (!near || dd < near[0]) near = [dd, r]; }
    corridor([cx, 8], mid(near[1]));
    out.chamber = ch; out.gate = [cx, 6];
  } else if (top === 'up') {
    // the stairs up in the top wall, joined to the highest room
    const hi = rooms.reduce((a, r) => (r.y < a.y ? r : a), rooms[0]);
    for (let y = 2; y <= hi.y; y++) carve(cx, y);
    corridor([cx, hi.y], mid(hi));
    out.up = [cx, 1];
  }
  return out;
}

// a dungeon floor. o: { name, music, zone, theme, w, h, seed, down: [map, x, y], up: [map, x, y],
// upNeed, upMsg, boss: { run, once }, chests: [[item, n] | { gold }], glints: [item], save, tint, dark, extra(f, m) }
const DUNGEONS = {};
function dungeon(id, o) {
  const w = o.w || 28, h = o.h || 24, top = o.boss ? 'boss' : o.up ? 'up' : 'none';
  const lay = layoutDungeon(w, h, o.seed || id.length * 97, top);
  DUNGEONS[id] = lay;
  const [WL, FL, PL] = THEMES[o.theme || 'cave'];
  def(id, {
    name: o.name ? nm(o.name[0], o.name[1]) : null, music: o.music || 'cave', zone: o.zone, dark: o.dark,
    build: (f) => {
      const g = lay.g.map((r) => r.map((c) => (c === '#' ? WL : FL)));
      // a few pools in the corners of big rooms, for looks
      for (const r of lay.rooms.slice(1)) if (r.w >= 5 && r.h >= 4 && (r.x * 7 + r.y) % 3 === 0 && lay.g[r.y][r.x - 1] === '#' && lay.g[r.y - 1][r.x] === '#') g[r.y][r.x] = PL;
      if (lay.chamber) { const c = lay.chamber; g[c.y][c.x] = PL; g[c.y][c.x + c.w - 1] = PL; }
      g[lay.entry[1]][lay.entry[0]] = FL;
      if (lay.up) g[lay.up[1]][lay.up[0]] = FL;
      if (o.boss && o.boss.after) g[1][lay.cx] = FL;
      const m = grid(g.map((r) => r.join('')), {}, { id, zone: () => o.zone || null, tint: typeof o.tint === 'function' ? o.tint(f) : o.tint || null });
      const E = (e) => m.ents.push(e);
      E({ type: 'warp', x: lay.entry[0], y: lay.entry[1], to: o.down[0], tx: o.down[1], ty: o.down[2], dir: 'd' });
      if (lay.up) E({ type: 'warp', x: lay.up[0], y: lay.up[1], to: o.up[0], tx: o.up[1], ty: o.up[2], dir: 'u', need: o.upNeed, msg: o.upMsg });
      if (lay.gate && o.boss) {
        E({ type: 'trigger', x: lay.gate[0], y: lay.gate[1], run: o.boss.run, once: o.boss.once, need: o.boss.need });
        if (o.boss.after) E({ type: 'warp', x: lay.cx, y: 1, to: o.boss.after[0], tx: o.boss.after[1], ty: o.boss.after[2], dir: 'u', need: (fl) => fl[o.boss.once], msg: () => L('前面過不去。', "You can't go that way.") });
      }
      // floor cells by distance from the entrance, for treasure
      const q0 = [lay.entry[0], lay.entry[1] - 1];
      const dist = new Map(), q = [q0];
      dist.set(q[0].join(), 0);
      while (q.length) { const [x, y] = q.shift(), d = dist.get(x + ',' + y); for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (dist.has(k) || !lay.g[ny] || lay.g[ny][nx] !== '.' || g[ny][nx] === PL) continue; dist.set(k, d + 1); q.push([nx, ny]); } }
      const taken = new Set([lay.entry.join(), lay.gate && lay.gate.join(), lay.up && lay.up.join(), lay.gate && [lay.gate[0], lay.gate[1] + 1].join()]);
      const corner = (r) => [[r.x, r.y], [r.x + r.w - 1, r.y], [r.x, r.y + r.h - 1], [r.x + r.w - 1, r.y + r.h - 1]].filter(([x, y]) => dist.has(x + ',' + y) && !taken.has(x + ',' + y));
      const far = lay.rooms.slice(1).map((r) => corner(r).map((c) => [dist.get(c.join()), c])).filter((l) => l.length).map((l) => l.sort((a, b) => b[0] - a[0])[0]).sort((a, b) => b[0] - a[0]);
      // a chest must never cut the way through: everything else stays reachable without its cell
      const solidSet = new Set();
      const cuts = (at) => {
        const block = new Set([...solidSet, at.join()]), seen = new Set([q0.join()]), qq = [q0];
        while (qq.length) { const [x, y] = qq.shift(); for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const k = (x + dx) + ',' + (y + dy); if (seen.has(k) || block.has(k) || !dist.has(k)) continue; seen.add(k); qq.push([x + dx, y + dy]); } }
        return seen.size < dist.size - block.size;
      };
      (o.chests || []).forEach((c, i) => {
        const spot = far[i % Math.max(1, far.length)];
        let at = spot && !taken.has(spot[1].join()) && !cuts(spot[1]) ? spot[1] : null;
        if (!at) at = [...dist.keys()].map((k) => k.split(',').map(Number)).find((p) => !taken.has(p.join()) && dist.get(p.join()) > 6 && !cuts(p));
        if (at) solidSet.add(at.join());
        if (!at) return;
        taken.add(at.join());
        E({ type: 'chest', id: id + '_c' + (i + 1), x: at[0], y: at[1], ...(c.gold ? { gold: c.gold } : { item: c[0], n: c[1] || 1 }) });
      });
      const cells = [...dist.keys()].map((k) => k.split(',').map(Number)).filter((p) => !taken.has(p.join()));
      (o.glints || []).forEach((it, i) => { const at = cells[Math.floor(((i + 1) * 0.37 + 0.11) % 1 * cells.length)]; if (!at || taken.has(at.join())) return; taken.add(at.join()); E({ type: 'glint', id: id + '_g' + (i + 1), x: at[0], y: at[1], item: it, walkable: true }); });
      if (o.save && lay.gate) {
        // a save circle a few steps before the boss
        const at = cells.filter((p) => !taken.has(p.join()) && Math.abs(p[0] - lay.gate[0]) + Math.abs(p[1] - lay.gate[1]) >= 3).sort((a, b) => (Math.abs(a[0] - lay.gate[0]) + Math.abs(a[1] - lay.gate[1])) - (Math.abs(b[0] - lay.gate[0]) + Math.abs(b[1] - lay.gate[1])))[0];
        if (at) { taken.add(at.join()); E({ type: 'save', x: at[0], y: at[1], walkable: true }); }
      }
      if (o.extra) o.extra(f, m, lay, E);
      return m;
    },
  });
}
// the cell just inside a generated floor's entrance, and the top of its stairs or chamber
export const dIn = (id) => [DUNGEONS[id].entry[0], DUNGEONS[id].entry[1] - 1];
export const dTop = (id) => (DUNGEONS[id].up ? [DUNGEONS[id].up[0], 2] : DUNGEONS[id].gate ? [DUNGEONS[id].gate[0], 4] : null);

// ---------- towns ----------
// Luckhaven, the resort isle with the Crown Arena and the casino
def('luckhaven', {
  name: nm('幸運港', 'Luckhaven'), music: 'pub', safe: true, town: 'luck',
  build: (f) => {
    const fall = f.fallen;
    const b = build(32, 28, 'sand');
    b.rect(0, 0, 31, 2, 'water'); b.rect(26, 0, 31, 27, 'water');
    b.rect(3, 4, 24, 23, 'plaza');
    b.rect(24, 12, 30, 13, 'bridge');
    b.house(3, 4, 'lh_inn', 7, 8); b.house(9, 4, 'lh_casino', 7, 8, 'house2'); b.house(16, 3, 'lh_arena', 7, 8, 'house');
    b.house(3, 15, 'lh_shop', 7, 8, 'house2'); b.house(18, 15, 'lh_church', 7, 8); b.house(10, 17, 'lh_medal', 7, 8, 'house2');
    b.st('fountain', 13, 11);
    b.trees([[1, 8], [1, 14], [23, 22], [1, 21], [22, 9]]);
    for (const s of b.stamps) if (s.name === 'tree') s.sheet = 'Os';
    b.set(8, 12, 'ctr'); b.set(9, 12, 'ctr'); b.npc('lh_item', 'merchant', 8, 11, 'lh_item', { fixed: true });
    b.npc('lh_barker', 'samurai', 19, 9, 'lh_barker');
    b.npc('lh_tourist', 'maiden', 12, 21, 'lh_tourist', { wander: true });
    b.npc('lh_gambler', 'pirate', 7, 10, 'lh_gambler');
    b.npc('lh_kid', 'boy', 20, 21, 'lh_kid', { wander: true });
    b.npc('lh_old', 'oldman', 22, 13, 'lh_old');
    if (f.grotto_done) b.npc('lh_rena', 'ranger_f', 25, 11, 'lh_rena');
    b.e({ type: 'fish', id: 'fish_luck', x: 27, y: 14, spot: 'sea', walkable: false });
    for (const x of [14, 15, 16, 17]) { b.set(x, 27, 'sand'); b.warp(x, 27, 'world', 54, 56, 'd'); }
    return b.done({ tint: fall ? 'rgba(40,0,40,0.25)' : null });
  },
});
inn('lh_inn', ['luckhaven', 5, 9]);
chapel('lh_church', ['luckhaven', 20, 20]);
shopRoom('lh_shop', ['luckhaven', 5, 20], 'merchant', 'lh_gear');
room('lh_casino', ROOM(['#+x++x++x++x++#', '#+kkk+++++kkk+#', '#++1+++++++2++#', '#+++++++++++++#', '#+a+++3+++b+++#', '#+++++++++++++#', '#+++++++++++++#']),
  { x: { k: 'wood', st: 'shelf' }, '1': npc('wood', 'lh_slots', 'dancer', 'casino_slots', { fixed: true }), '2': npc('wood', 'lh_cards', 'bard', 'casino_poker', { fixed: true }), '3': npc('wood', 'lh_coins', 'merchant', 'casino_coins', { fixed: true }),
    a: npc('wood', 'lh_c1', 'man', 'lh_c1'), b: npc('wood', 'lh_c2', 'woman', 'lh_c2') }, ['luckhaven', 11, 9], { music: 'jovial' });
room('lh_arena', ROOM(['#nnnnnnnnnnnnn#', '#nkkkkkkkkkkkn#', '#nnnnnn1nnnnnn#', '#nnnnnnnnnnnnn#', '#n2nnnnnnnnn3n#', '#nnnnnnnnnnnnn#', '#nnnnnnnnnnnnn#']),
  { '1': npc('stone', 'arena_desk', 'soldier_f', 'arena_desk', { fixed: true }), '2': npc('stone', 'arena_fan', 'youth', 'arena_fan'), '3': npc('stone', 'arena_vet', 'berserker', 'arena_vet') }, ['luckhaven', 18, 8], { music: 'knights', floor: 'stone' });
home('lh_medal', ['luckhaven', 12, 22], 'oldwoman', 'medal_lady');

// Chimeholm, the town of wind chimes on the eastern cliffs
def('chimeholm', {
  name: nm('風鈴鎮', 'Chimeholm'), music: 'cliffs', safe: true, town: 'chime',
  build: (f) => {
    const fall = f.fallen;
    const b = build(32, 27, fall ? 'dgrass' : 'grass');
    const dirt = fall ? 'ddirt' : 'dirt';
    b.rect(0, 0, 31, 1, 'water');
    b.path([[16, 26], [16, 13], [6, 13]], dirt); b.path([[16, 13], [26, 13]], dirt); b.path([[16, 13], [16, 8]], dirt);
    for (let y = 2; y < 27; y++) { b.set(0, y, fall ? 'dbush' : 'bush'); b.set(31, y, fall ? 'dbush' : 'bush'); }
    for (let x = 0; x < 32; x++) if (x < 14 || x > 18) b.set(x, 26, fall ? 'dbush' : 'bush');
    b.house(2, 3, 'ch_inn', 7, 8); b.house(8, 3, 'ch_church', 7, 8, 'house2'); b.house(20, 3, 'ch_bell', 7, 8); b.house(26, 3, 'ch_house', 7, 8, 'house2');
    b.house(3, 16, 'ch_shop', 7, 8, 'house2'); b.house(21, 16, 'ch_item', 7, 8);
    b.st('spire', 15, 3);
    b.trees([[11, 20], [9, 23], [24, 23], [27, 11], [4, 10]]);
    b.rect(13, 10, 19, 10, 'flowers');
    if (!fall) {
      b.npc('ch_girl', 'girl', 13, 15, 'ch_girl', { wander: true });
      b.npc('ch_old', 'oldman', 20, 12, 'ch_old');
      b.npc('ch_guard', 'soldier', 17, 22, 'ch_guard');
      b.npc('ch_weaver', 'woman', 9, 12, 'ch_weaverwife', { wander: true });
      b.npc('ch_boy', 'boy', 24, 20, 'ch_boy', { wander: true });
      if (!f.windbell) b.npc('lumi', 'maiden', 18, 9, 'lumi', { dir: 'd' });
    } else {
      b.npc('ch_old', 'oldman', 20, 12, 'ch_fallen1');
      b.npc('ch_girl', 'girl', 13, 15, 'ch_fallen2');
      b.npc('lumi2', 'maiden', 18, 9, 'lumi_fallen');
    }
    b.e({ type: 'fish', id: 'fish_chime', x: 20, y: 1, spot: 'cliff', walkable: false });
    for (const x of [14, 15, 16, 17, 18]) b.warp(x, 26, 'world', 90, 21, 'd');
    return b.done({ tint: fall ? 'rgba(40,0,40,0.28)' : null });
  },
});
inn('ch_inn', ['chimeholm', 4, 8]);
chapel('ch_church', ['chimeholm', 10, 8]);
shopRoom('ch_shop', ['chimeholm', 5, 21], 'berserker', 'ch_shop');
shopRoom('ch_item', ['chimeholm', 23, 21], 'merchant', 'ch_itemshop');
home('ch_bell', ['chimeholm', 22, 8], 'oldwoman', 'bellkeeper');
home('ch_house', ['chimeholm', 28, 8], 'man', 'lighthouse_son');

// Mossmere, the village in the jungle
def('mossmere', {
  name: nm('苔沼村', 'Mossmere'), music: 'waterfall', safe: true, town: 'moss',
  build: (f) => {
    const fall = f.fallen;
    const b = build(30, 27, fall ? 'dgrass' : 'grass');
    const dirt = fall ? 'ddirt' : 'dirt';
    b.rect(0, 11, 29, 12, 'water'); b.rect(14, 11, 16, 12, 'bridge');
    b.path([[15, 26], [15, 13]], dirt); b.path([[15, 10], [15, 6], [5, 6]], dirt); b.path([[15, 6], [25, 6]], dirt); b.path([[15, 20], [6, 20]], dirt); b.path([[15, 20], [24, 20]], dirt);
    for (let y = 0; y < 27; y++) { b.set(0, y, fall ? 'dbush' : 'bush'); b.set(29, y, fall ? 'dbush' : 'bush'); }
    for (let x = 0; x < 30; x++) { b.set(x, 0, fall ? 'dbush' : 'bush'); if (x < 13 || x > 17) b.set(x, 26, fall ? 'dbush' : 'bush'); }
    b.house(2, 1, 'mm_inn', 7, 8); b.house(9, 1, 'mm_elder', 7, 8, 'house2'); b.house(19, 1, 'mm_church', 7, 8);
    b.house(3, 15, 'mm_shop', 7, 8, 'house2'); b.house(20, 15, 'mm_item', 7, 8);
    const tt = [[25, 2], [26, 8], [2, 8], [11, 23], [20, 23], [26, 23], [3, 23], [8, 14], [25, 13]];
    for (const [x, y] of tt) b.st('ttree', x, y);
    if (!fall) {
      b.npc('mm_kid', 'child', 12, 18, 'mm_kid', { wander: true });
      b.npc('mm_hunter', 'ranger', 18, 8, 'mm_hunter');
      b.npc('mm_woman', 'woman', 9, 21, 'mm_woman', { wander: true });
      b.npc('mm_scholar', 'magician', 22, 9, 'mm_scholar');
    } else {
      b.npc('mm_hunter', 'ranger', 18, 8, 'mm_fallen1');
      b.npc('mm_woman', 'woman', 9, 21, 'mm_fallen2');
      b.npc('mm_scholar', 'magician', 22, 9, 'mm_scholar_fallen');
    }
    b.e({ type: 'fish', id: 'fish_moss', x: 8, y: 12, spot: 'river', walkable: false });
    for (const x of [13, 14, 15, 16, 17]) b.warp(x, 26, 'world', 80, 55, 'd');
    return b.done({ tint: fall ? 'rgba(40,0,40,0.28)' : null });
  },
});
inn('mm_inn', ['mossmere', 4, 6]);
chapel('mm_church', ['mossmere', 21, 6]);
shopRoom('mm_shop', ['mossmere', 5, 20], 'berserker_f', 'mm_shop');
shopRoom('mm_item', ['mossmere', 22, 20], 'merchant', 'mm_itemshop');
home('mm_elder', ['mossmere', 11, 6], 'oldwoman', 'mm_elder');

// ---------- dungeons ----------
dungeon('grotto1', { name: ['鷗翼洞窟', 'Gullwing Grotto'], music: 'cave', zone: 'grotto', theme: 'cave', w: 26, h: 24, seed: 4111, down: ['world', 56, 26], up: ['grotto2', 0, 0], chests: [['strongherb', 2], ['cutlass', 1], { gold: 300 }], glints: ['starshard', 'seedagi'], tint: 'rgba(0,30,60,0.18)' });
dungeon('grotto2', { name: ['鷗翼洞窟　海盜的巢穴', "Gullwing Grotto, the Pirates' Den"], music: 'trouble', zone: 'grotto', theme: 'cave', w: 26, h: 22, seed: 4123, down: ['grotto1', 0, 0], boss: { run: 'rena', once: 'rena_dead' }, chests: [['ether', 1], ['feathercap', 1]], glints: ['starshard'], save: true, tint: 'rgba(0,30,60,0.18)' });
dungeon('gale1', { name: ['風嘯塔　一層', 'Galespire, First Gust'], music: 'mist', zone: 'galespire', theme: 'tower', w: 28, h: 24, seed: 7301, down: ['world', 97, 10], up: ['gale2', 0, 0], chests: [['megaherb', 2], ['mythrilhelm', 1], ['tmap5', 1]], glints: ['starshard', 'seedmag'], tint: 'rgba(120,200,255,0.12)' });
dungeon('gale2', { name: ['風嘯塔　二層', 'Galespire, Second Gust'], music: 'mist', zone: 'galespire', theme: 'tower', w: 28, h: 24, seed: 7319, down: ['gale1', 0, 0], up: ['gale3', 0, 0], chests: [['icebrand', 1], ['remedy', 3], { gold: 1500 }], glints: ['seedlife'], tint: 'rgba(120,200,255,0.12)' });
dungeon('gale3', { name: ['風嘯塔　頂', 'Galespire, the Summit'], music: 'mist', zone: 'galespire', theme: 'tower', w: 26, h: 22, seed: 7331, down: ['gale2', 0, 0], boss: { run: 'zephyra', once: 'zephyra_dead' }, chests: [['swiftfeather', 1], ['stardew', 1]], glints: ['starshard'], save: true, tint: 'rgba(120,200,255,0.12)' });
dungeon('fen1', { name: ['幽沼', 'Gloomfen'], music: 'marsh', zone: 'fen', theme: 'cave', w: 30, h: 26, seed: 9001, down: ['world', 91, 49], boss: { run: 'mirehydra', once: 'hydra_dead' }, chests: [['crystalshield', 1], ['tmap6', 1], ['megaherb', 2], { gold: 2500 }, ['wardring', 1]], glints: ['starshard', 'seeddef'], save: true, tint: 'rgba(0,50,0,0.25)' });
dungeon('archive1', { name: ['沉沒書庫　入口', 'The Sunken Archive, Atrium'], music: 'cellars', zone: 'archive', theme: 'stone', w: 28, h: 24, seed: 5501, down: ['world', 95, 70], up: ['archive2', 0, 0], chests: [['holywater', 3], ['sagecirclet', 1]], glints: ['starshard', 'mpnut'], tint: 'rgba(0,30,80,0.25)', dark: 0.35 });
dungeon('archive2', { name: ['沉沒書庫　書架迷宮', 'The Sunken Archive, the Stacks'], music: 'cellars', zone: 'archive', theme: 'stone', w: 30, h: 24, seed: 5519, down: ['archive1', 0, 0], up: ['archive3', 0, 0], chests: [['mirrorrobe', 1], ['tmap4', 1], ['hiether', 1]], glints: ['seedmag'], tint: 'rgba(0,30,80,0.25)', dark: 0.35 });
dungeon('archive3', { name: ['沉沒書庫　最深處', 'The Sunken Archive, the Deep Reading Room'], music: 'cellars', zone: 'archive', theme: 'stone', w: 26, h: 22, seed: 5531, down: ['archive2', 0, 0], boss: { run: 'inkwyrm', once: 'inkwyrm_dead' }, chests: [['stormblade', 1], ['weaverstear', 1]], glints: ['starshard'], save: true, tint: 'rgba(0,30,80,0.25)', dark: 0.35 });
dungeon('mines1', { name: ['閃晶礦坑', 'The Glimmer Mines'], music: 'caves', zone: 'mines', theme: 'cave', w: 28, h: 24, seed: 3301, down: ['world', 6, 25], up: ['mines2', 0, 0], chests: [['mythrilvest', 1], ['ironore', 3], ['tmap1', 1]], glints: ['starshard', 'gem'], tint: 'rgba(60,30,0,0.2)', dark: 0.3 });
dungeon('mines2', { name: ['閃晶礦坑　最深處', 'The Glimmer Mines, the Deepest Seam'], music: 'caves', zone: 'mines', theme: 'cave', w: 26, h: 22, seed: 3319, down: ['mines1', 0, 0], boss: { run: 'colossus', once: 'colossus_dead' }, chests: [['crystal', 2], ['gem', 2]], glints: ['seedstr'], save: true, tint: 'rgba(60,30,0,0.2)', dark: 0.3 });
dungeon('choir1', { name: ['沉歌之井', 'The Choirwell'], music: 'veranda', zone: 'choir', theme: 'stone', w: 26, h: 24, seed: 6601, down: ['world', 38, 11], up: ['choir2', 0, 0], chests: [['tmap2', 1], ['remedy', 2], ['holywater', 2]], glints: ['starshard'], tint: 'rgba(0,40,70,0.25)' });
dungeon('choir2', { name: ['沉歌之井　水底聖堂', 'The Choirwell, the Drowned Chapel'], music: 'veranda', zone: 'choir', theme: 'stone', w: 26, h: 22, seed: 6619, down: ['choir1', 0, 0], boss: { run: 'cantor', once: 'cantor_dead' }, chests: [['crystalstaff', 1]], glints: ['seedlife'], save: true, tint: 'rgba(0,40,70,0.25)' });
dungeon('monastery1', { name: ['燼棚修道院', 'Cindershelf Monastery'], music: 'frost', zone: 'monastery', theme: 'ice', w: 26, h: 24, seed: 8801, down: ['world', 74, 29], up: ['monastery2', 0, 0], chests: [['tmap3', 1], ['steelfist', 1], ['frostshard', 2]], glints: ['starshard'] });
dungeon('monastery2', { name: ['燼棚修道院　廚房', 'Cindershelf Monastery, the Kitchen'], music: 'frost', zone: 'monastery', theme: 'ice', w: 26, h: 22, seed: 8819, down: ['monastery1', 0, 0], boss: { run: 'snowmaul', once: 'snowmaul_dead' }, chests: [['icecharm', 1], ['megaherb', 2]], glints: ['seedagi'], save: true });
dungeon('ashford1', { name: ['灰淺城', 'Ashford Keep'], music: 'himmendal', zone: 'keep', theme: 'stone', w: 28, h: 26, seed: 2201, down: ['world', 50, 7], up: ['ashford2', 0, 0], chests: [['mythrilmail', 1], ['coinpurse', 1], ['remedy', 2]], glints: ['starshard'], tint: 'rgba(40,0,30,0.25)' });
dungeon('ashford2', { name: ['灰淺城　大廳', 'Ashford Keep, the Great Hall'], music: 'himmendal', zone: 'keep', theme: 'stone', w: 26, h: 22, seed: 2219, down: ['ashford1', 0, 0], boss: { run: 'kestrel', once: 'kestrel_dead' }, chests: [['oathplate', 1]], glints: ['seeddef'], save: true, tint: 'rgba(40,0,30,0.25)' });
dungeon('garden1', { name: ['絲之庭園', 'The Thread Garden'], music: 'memory', zone: 'garden', theme: 'tower', w: 28, h: 24, seed: 1101, down: ['world', 86, 10], up: ['garden2', 0, 0], chests: [['silkveil', 1], ['hiether', 1], ['crystal', 2]], glints: ['starshard'], tint: 'rgba(80,40,120,0.2)' });
dungeon('garden2', { name: ['絲之庭園　記憶之心', 'The Thread Garden, the Heart of Memory'], music: 'memory', zone: 'garden', theme: 'tower', w: 26, h: 22, seed: 1119, down: ['garden1', 0, 0], boss: { run: 'forgetting', once: 'forgetting_dead' }, chests: [['sagebangle', 1]], glints: ['mpnut'], save: true, tint: 'rgba(80,40,120,0.2)' });
dungeon('starwell1', { name: ['星井　外殼', 'The Starwell, the Outer Shell'], music: 'crystal', zone: 'starwell', theme: 'cave', w: 30, h: 26, seed: 9901, down: ['world', 25, 70], up: ['starwell2', 0, 0], chests: [['starsand', 2], ['megaherb', 3], ['starshield', 1]], glints: ['starshard', 'seedlife'], tint: 'rgba(30,0,60,0.3)', dark: 0.3 });
dungeon('starwell2', { name: ['星井　旋轉之間', 'The Starwell, the Turning Hall'], music: 'crystal', zone: 'starwell', theme: 'tower', w: 28, h: 24, seed: 9919, down: ['starwell1', 0, 0], boss: { run: 'orbitaleye', once: 'eye_dead', after: ['starwell3', 0, 0] }, chests: [['dragonbone', 2], ['hiether', 2]], glints: ['seedmag'], save: true, tint: 'rgba(30,0,60,0.3)', dark: 0.3 });
dungeon('starwell3', { name: ['星井　龍之喉', "The Starwell, the Wyrm's Throat"], music: 'crystal', zone: 'starwell', theme: 'lava', w: 28, h: 24, seed: 9931, down: ['starwell2', 0, 0], boss: { run: 'vaelith', once: 'vaelith_dead', after: ['starwell4', 0, 0] }, chests: [['starcrown', 1], ['weaverstear', 1], ['starsand', 3]], glints: ['seedstr'], save: true, tint: 'rgba(60,0,20,0.25)', dark: 0.3 });
dungeon('starwell4', { name: ['星井　星之心', 'The Starwell, the Heart of the Star'], music: 'final', zone: 'starwell2', theme: 'tower', w: 26, h: 22, seed: 9949, down: ['starwell3', 0, 0], boss: { run: 'eclipse', once: 'eclipse_dead', after: ['hollow', 9, 15] }, chests: [['weaverstear', 1], ['darkshard', 2]], glints: ['seedlife'], save: true, tint: 'rgba(10,0,30,0.35)', dark: 0.35 });
// the stairs between generated floors meet in the right places
const LINK = [['grotto1', 'grotto2'], ['gale1', 'gale2'], ['gale2', 'gale3'], ['archive1', 'archive2'], ['archive2', 'archive3'], ['mines1', 'mines2'], ['choir1', 'choir2'], ['monastery1', 'monastery2'], ['ashford1', 'ashford2'], ['garden1', 'garden2'], ['starwell1', 'starwell2'], ['starwell2', 'starwell3'], ['starwell3', 'starwell4']];
for (const [lo, hi] of LINK) {
  const bl = MAPS[lo].build, bh = MAPS[hi].build;
  MAPS[lo].build = (f) => { const m = bl(f); for (const e of m.ents) if (e.type === 'warp' && e.to === hi) { const [x, y] = dIn(hi); e.tx = x; e.ty = y; } return m; };
  MAPS[hi].build = (f) => { const m = bh(f); for (const e of m.ents) if (e.type === 'warp' && e.to === lo) { const t = DUNGEONS[lo].up ? [DUNGEONS[lo].up[0], 2] : dTop(lo); e.tx = t[0]; e.ty = t[1]; } return m; };
}

// the Hollow: where the Thousand-Year Shade waits, below the heart of the star
shrineRoom('hollow', nm('虛空之底', 'The Bottom of the Hollow'), 'dread', 'Y', 'y', {
  pool: 'u', lg: (f) => ({ floorKind: 'pfloor', tint: 'rgba(0,0,0,0.4)', '1': { k: 'pfloor', e: { type: 'npc', id: 'shade_echo', sprite: 'dark', dir: 'd', talk: 'shade_talk', cond: () => !f.shade_dead, ghost: true } }, '2': trig('pfloor', 'shade', { once: 'shade_begun' }) }),
}, ['starwell4', 13, 2]);
MAPS.hollow.build = ((orig) => (f) => { const m = orig(f); for (const e of m.ents) if (e.type === 'warp' && e.to === 'starwell4') { const t = dTop('starwell4'); e.tx = t[0]; e.ty = t[1] + 3; } return m; })(MAPS.hollow.build);

// Wren's little shrine behind the falls (after the end)
def('fallsshrine', {
  name: nm('瀑布後的祠堂', 'The Shrine Behind the Falls'), music: 'memory', safe: true,
  build: (f) => grid([
    'OOOOOOOOOOOOOOO',
    'OOOOOOOOOOOOOOO',
    'OOpppoooooopppO',
    'OOpoooo1ooooopO',
    'OOooooooooooooO',
    'OOooooooooooooO',
    'OOooooo2ooooooO',
    'OOooooooooooooO',
    'OOOOOOOdOOOOOOO',
  ], { '1': { k: 'cfloor', e: { type: 'npc', id: 'falls_altar', sprite: 'light', dir: 'd', talk: 'falls_altar' } }, '2': { k: 'cfloor', e: { type: 'npc', id: 'wren_shrine', sprite: 'maiden2', dir: 'u', talk: 'wren_shrine', cond: (fl) => !fl.wren_shrine_done } }, d: warp('cfloor', 'brightfall', 15, 6, 'd') }, { id: 'fallsshrine', zone: () => null }),
});

// ---------- small changes to the old maps ----------
const wrap = (id, fn) => { const o = MAPS[id].build; MAPS[id].build = (f) => { const m = o(f); fn(m, f); return m; }; };
const add = (m, e) => m.ents.push(e);
// world warps into generated dungeons land just inside their entrance
wrap('world', (m) => { for (const e of m.ents) if (e.type === 'warp' && DUNGEONS[e.to]) [e.tx, e.ty] = dIn(e.to); });
// Brightfall: the way behind the falls opens after the end; a fishing spot on the stream
wrap('brightfall', (m, f) => {
  if (f.cleared) add(m, { type: 'warp', x: 14, y: 5, to: 'fallsshrine', tx: 7, ty: 7, dir: 'u' });
  add(m, { type: 'fish', id: 'fish_bright', x: 16, y: 5, spot: 'river', walkable: false });
  if (!f.fallen) add(m, { type: 'npc', id: 'bf_bard', sprite: 'bard', x: 22, y: 21, dir: 'd', talk: 'verse_bright' });
  if (f.cleared) add(m, { type: 'npc', id: 'bf_starshop', sprite: 'merchant', x: 9, y: 21, dir: 'd', talk: 'star_shop', fixed: true });
  if (f.cleared) add(m, { type: 'npc', id: 'bf_staritems', sprite: 'merchant', x: 13, y: 21, dir: 'd', talk: 'star_items', fixed: true });
});
// Solhaven: the scholar of monsters, a fence who knew Pell's mother, a boy and his cat
wrap('solhaven', (m, f) => {
  add(m, { type: 'npc', id: 'sol_scholar', sprite: 'magician', x: 28, y: 19, dir: 'd', talk: 'book_scholar' });
  if (!f.fallen) {
    add(m, { type: 'npc', id: 'sol_bard2', sprite: 'bard', x: 13, y: 15, dir: 'd', talk: 'verse_sol' });
    add(m, { type: 'npc', id: 'sol_fence', sprite: 'ninja', x: 34, y: 28, dir: 'l', talk: 'pell_fence' });
  } else add(m, { type: 'npc', id: 'sol_fence', sprite: 'ninja', x: 34, y: 28, dir: 'l', talk: 'pell_fence' });
});
// Dovecote: the fisher and the old sister who remembers the flood
wrap('dovecote', (m, f) => {
  add(m, { type: 'npc', id: 'dv_rodfisher', sprite: 'oldman', x: 24, y: 6, dir: 'd', talk: 'fisher_quest' });
  add(m, { type: 'fish', id: 'fish_dove', x: 26, y: 7, spot: 'river', walkable: false });
  if (!f.fallen) add(m, { type: 'npc', id: 'dv_bard', sprite: 'bard', x: 10, y: 19, dir: 'd', talk: 'verse_dove' });
});
wrap('dove_church', (m) => add(m, { type: 'npc', id: 'dv_oldnun', sprite: 'nun', x: 3, y: 7, dir: 'r', talk: 'mirela_ep_start' }));
// Gullport: the lighthouse keeper, the treasure hunter, the way to the grotto
wrap('gullport', (m, f) => {
  add(m, { type: 'npc', id: 'gl_keeper', sprite: 'oldman', x: 25, y: 7, dir: 'd', talk: 'lighthouse' });
  add(m, { type: 'npc', id: 'gl_digger', sprite: 'pirate', x: 8, y: 16, dir: 'r', talk: 'digger' });
  add(m, { type: 'fish', id: 'fish_gull', x: 28, y: 18, spot: 'sea', walkable: false });
  if (!f.fallen) add(m, { type: 'npc', id: 'gl_bard', sprite: 'bard', x: 18, y: 15, dir: 'd', talk: 'verse_gull' });
});
// Sandmere: a bard; Snowveil: Odo's old friend, the forge, a hole in the ice
wrap('sandmere', (m, f) => { if (!f.fallen) add(m, { type: 'npc', id: 'sd_bard', sprite: 'bard', x: 24, y: 25, dir: 'd', talk: 'verse_sand' }); add(m, { type: 'npc', id: 'sd_oath', sprite: 'soldier', x: 11, y: 24, dir: 'd', talk: 'brannoc_ep_start' }); });
wrap('snowveil', (m, f) => {
  add(m, { type: 'npc', id: 'sn_monk', sprite: 'monk_f', x: 6, y: 21, dir: 'r', talk: 'odo_ep_start' });
  add(m, { type: 'npc', id: 'sn_smith', sprite: 'berserker', x: 24, y: 11, dir: 'd', talk: 'forge' });
  add(m, { type: 'fish', id: 'fish_snow', x: 21, y: 22, spot: 'ice', walkable: false });
  if (!f.fallen) add(m, { type: 'npc', id: 'sn_bard', sprite: 'bard', x: 9, y: 16, dir: 'd', talk: 'verse_snow' });
});
// Sera's garden is found through Chimeholm after the fall
wrap('chimeholm', (m, f) => { if (f.fallen && f.sera_back) add(m, { type: 'npc', id: 'ch_sera', sprite: 'magician_f', x: 13, y: 9, dir: 'd', talk: 'sera_ep_start' }); });
