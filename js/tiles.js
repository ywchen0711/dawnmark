// Map tiles, from ArMM1998's "Zelda-like tilesets and sprites" (CC0): the overworld, interior,
// cave and object sheets. Edges between ground kinds (shores, paths, cave pools) are built out of
// 8x8 quarters of the sheet's own edge pieces, like an RPG Maker autotile. Big things (houses,
// trees, fountains, furniture) are stamps several tiles big; their top rows can be drawn over the
// people walking behind them. Sand, snow, ice caves and lava caves are recoloured copies.
import { canvas, fromGrid } from './gfx.js';

async function img(src) { const i = new Image(); i.src = src; await i.decode(); return i; }
function keyed(im) {
  const c = canvas(im.width, im.height); c.x.drawImage(im, 0, 0);
  return c;
}
// recolour a whole sheet: hue turn (degrees), saturation and lightness scale
function shift(src, { hue = 0, sat = 1, lum = 1, add = 0 }) {
  const c = canvas(src.width, src.height); c.x.drawImage(src, 0, 0);
  const d = c.x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    let r = a[i] / 255, g = a[i + 1] / 255, b = a[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) { const dd = mx - mn; s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn); h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; }
    h += hue; s = Math.min(1, s * sat); l = Math.max(0, Math.min(1, l * lum + add));
    const hh = (((h % 360) + 360) % 360) / 360, f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    if (s === 0) { r = g = b = l; } else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, hh + 1 / 3); g = f(p, q, hh); b = f(p, q, hh - 1 / 3); }
    a[i] = r * 255; a[i + 1] = g * 255; a[i + 2] = b * 255;
  }
  c.x.putImageData(d, 0, 0);
  return c;
}

const O = keyed(await img('assets/tiles/overworld.png'));
const I = keyed(await img('assets/tiles/inner.png'));
const C = keyed(await img('assets/tiles/cave.png'));
const B = keyed(await img('assets/tiles/objects.png'));
const SH = {
  O, I, C, B,
  Os: shift(O, { hue: 6, sat: 0.62, lum: 1.55 }), // sand: the dirt, pale and warm
  Ow: shift(O, { hue: 95, sat: 0.18, lum: 1.0, add: 0.3 }), // snow
  Od: shift(O, { hue: 0, sat: 0.55, lum: 0.62 }), // the darkened world
  Ci: shift(C, { hue: 175, sat: 0.6, lum: 1.15 }), // ice cave
  Cl: shift(C, { hue: -18, sat: 1.5, lum: 0.85 }), // lava cave
  Cp: shift(C, { hue: 230, sat: 0.7, lum: 0.8 }), // the tower of threads
  Is: shift(I, { hue: 210, sat: 0.4, lum: 0.9 }), // grey-violet stone halls
};
SH.Lava = shift(O, { hue: 165, sat: 1.6, lum: 1.05 }); // the ripple tile turned to molten rock
SH.Ir = shift(I, { hue: -125, sat: 1.3, lum: 0.95 }); // the green rug, dyed red
SH.Oi = shift(O, { hue: 175, sat: 0.55, lum: 1.25 }); // ice-cave floors
SH.Ol = shift(O, { hue: -15, sat: 1.3, lum: 0.75 }); // lava-cave floors
SH.Op = shift(O, { hue: 230, sat: 0.6, lum: 0.9 }); // the tower's floors
export const SHEETS = SH;

// ---------- world-map icons, drawn here in the sheets' colours ----------
const P = { o: '#20141c', k: '#4a3a3a', g: '#8a8a96', w: '#d8d8e0', W: '#fcfcfc', b: '#2c6cc8', B: '#64b4f0', r: '#a83c28', R: '#e86a3c', y: '#f0c040', n: '#6a4428', N: '#9a6a3a', e: '#3c8c3c', E: '#78c850', p: '#6a4ab0', P: '#a88ae8', d: '#3a2418', t: '#d8a868' };
const ICON = {
  castle: fromGrid([
    '.o.o.......o.o..',
    '.ooo.......ooo..',
    '.owo..o.o..owo..',
    '.owo..ooo..owo..',
    '.owooooBoooowo..',
    '.owwwwwowwwwwo..',
    '.owgwwwwwwwgwo..',
    '.owwwwoooowwwo..',
    '.owwwoddddowwo..',
    '.owgwoddddowgo..',
    '.oooooddddooooo.',
    '................',
  ].map((r) => r.padEnd(16, '.')).concat(['................', '................', '................', '................']), P),
  town: fromGrid([
    '................',
    '...oo...........',
    '..oRRo.....oo...',
    '.oRRRRo...oNNo..',
    'oRRRRRRo.oNNNNo.',
    '.otttto..otttto.',
    '.otdtto..ottdto.',
    '.otdtto..ottdto.',
    '.oooooo..oooooo.',
    '......oo........',
    '.....oRRo.......',
    '....oRRRRo......',
    '...oRRRRRRo.....',
    '....ottdto......',
    '....ottdto......',
    '....oooooo......',
  ], P),
  village: fromGrid([
    '................',
    '................',
    '......oo........',
    '.....oNNo.......',
    '....oNNNNo......',
    '...oNNNNNNo.....',
    '....otttto..oo..',
    '....otdtto.oEEo.',
    '....otdtto.oEEo.',
    '....oooooo..oo..',
    '..........oo....',
    '..oo.....oNNo...',
    '.oEEo...oNNNNo..',
    '.oEEo....ottdo..',
    '..nn.....oooo...',
    '................',
  ], P),
  tower: fromGrid([
    '.......oo.......',
    '......oPPo......',
    '.....oPPPPo.....',
    '.....owwwwo.....',
    '.....owgwwo.....',
    '.....owwwwo.....',
    '.....owwgwo.....',
    '.....owwwwo.....',
    '.....owgwwo.....',
    '....owwwwwwo....',
    '....owwggwwo....',
    '....owwoowwo....',
    '...owwwoowwwo...',
    '...oooooooooo...',
    '................',
    '................',
  ], P),
  shrine: fromGrid([
    '................',
    '.......oo.......',
    '......oyyo......',
    '.....oyyyyo.....',
    '....oyyyyyyo....',
    '...oooooooooo...',
    '...owowwowowo...',
    '...owowwowowo...',
    '...owowwowowo...',
    '...owowddowowo..'.slice(0, 16),
    '..oooooooooooo..',
    '................',
    '................',
    '................',
    '................',
    '................',
  ], P),
  cave: fromGrid([
    '................',
    '................',
    '.....oooooo.....',
    '...ookkkkkkoo...',
    '..okkNNNNNNkko..',
    '.okNNNNNNNNNNko.',
    '.okNNddddddNNko.',
    'okNNddddddddNNko',
    'okNNddddddddNNko',
    'okNNddddddddNNko',
    'oooooooooooooooo',
    '................',
    '................',
    '................',
    '................',
    '................',
  ], P),
  ruin: fromGrid([
    '................',
    '................',
    '..o.......o.....',
    '.ogo.....ogo....',
    '.ogo..o..ogo....',
    '.ogoooгo.ogoo...'.replace('г', 'g'),
    '.oggggggggggo...',
    '.ogggkggggkgo...',
    '.ogggkkgggggo...',
    '.oooooooooooo...',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ], P),
  port: fromGrid([
    '................',
    '.....oo.........',
    '....oRRo....o...',
    '...oRRRRo..oWo..',
    '..oRRRRRRooWWo..',
    '...otttto.oWWWo.',
    '...otdtto..oo...',
    '...oooooo.ono...',
    '.........onNNo..',
    '.bbbbbbbonNNNNo.',
    'bBbbbBbbbonnnnob',
    'bbbbbbbbbboooobb',
    'bbBbbbbbBbbbbbbb',
    'bbbbbbbbbbbbbbbb',
    '................',
    '................',
  ], P),
};
// mountains in the old style: a peak with a lit side and a shaded side
function peak(lit, mid, dark, cap) {
  const rows = [
    '................',
    '.......oo.......',
    '......occo......',
    '.....occcmo.....',
    '.....olcmmo.....',
    '....ollmmmdo....',
    '...ollllmmddo...',
    '...olllmmmddo...',
    '..olllmmmdddoo..',
    '..ollmmmmdddmmo.',
    '.ollllmmmddmmmdo',
    '.olllmmmmdmmmddo',
    'ollllmmmmmmmdddo',
    'oooooooooooooooo',
    '................',
    '................',
  ];
  return fromGrid(rows, { o: '#2a1c18', l: lit, m: mid, d: dark, c: cap });
}
ICON.mount = peak('#a88a5c', '#7c6040', '#56402c', '#c8b088');
ICON.smount = peak('#e0c088', '#b89058', '#8a6438', '#f0d8a8');
ICON.wmount = peak('#d8e0ec', '#a0aec4', '#707c98', '#ffffff');
ICON.dmount = peak('#6a5a60', '#4a3c44', '#30262c', '#8a7a80');
// the Starwell: a crater with a fallen star still glowing in it
ICON.crater = fromGrid([
  '................',
  '................',
  '.......WW.......',
  '......WyyW......',
  '....oooyyooo....',
  '..ookkkWWkkkoo..',
  '.okkNNNNNNNNkko.',
  'okNNddPPPPddNNko',
  'okNddPPWWPPddNko',
  'okNNddPPPPddNNko',
  '.okkNNddddNNkko.',
  '..oooooooooooo..',
  '................',
  '................',
  '................',
  '................',
], P);
ICON.hill = fromGrid([
  '................', '................', '................', '................', '................', '................',
  '.....oooo.......', '...oollllo......', '..olllllmmo.....', '.ollllmmmmmo.oo.', 'ollllmmmmmmmolmo', 'oooooooooooooooo',
  '................', '................', '................', '................',
], { o: '#2c5028', l: '#78c050', m: '#4c9038' });
// the ship and the sky drake are drawn by the field

// ---------- tile kinds ----------
// f: plain fill [sheet, col, row] (a list picks one per position); o: an overlay drawn on top of
// the base kind; edge: autotile spec; wall: cave wall; solid: blocks walking.
const T = {
  void: { fill: ['O', 39, 35], solid: true, black: true },
  // ground
  grass: { fill: [['O', 0, 10], ['O', 0, 10], ['O', 1, 10], ['O', 0, 9]], ring: 'path' },
  dirt: { fill: [['O', 1, 35], ['O', 2, 32]], group: 'path' },
  flowers: { base: 'grass', o: [['B', 0, 0, 'flower']], fl: true },
  plaza: { fill: ['O', 23, 1] },
  sand: { fill: [['Os', 1, 35], ['Os', 2, 32], ['Os', 1, 35]] },
  snow: { fill: [['Ow', 0, 10], ['Ow', 1, 10]], ring: 'wpath', sheet: 'Ow' },
  snowpath: { fill: [['Ow', 1, 35], ['Ow', 2, 32]], group: 'wpath', sheet: 'Ow' },
  dgrass: { fill: [['Od', 0, 10], ['Od', 1, 10]], ring: 'dpath', sheet: 'Od' },
  ddirt: { fill: [['Od', 1, 35], ['Od', 2, 32]], group: 'dpath', sheet: 'Od' },
  water: { water: 'O', solid: true, swim: true },
  dwater: { water: 'Od', solid: true, swim: true },
  // interiors
  wood: { fill: ['I', 0, 4] },
  wood2: { fill: ['I', 2, 4] },
  stone: { fill: ['O', 23, 1] },
  hall: { fill: ['I', 0, 0] },
  wall: { iwall: ['I', 0, 2], solid: true },
  swall: { iwall: ['I', 6, 7], solid: true },
  bwall: { iwall: ['I', 0, 1], solid: true },
  cellwall: { iwall: ['I', 6, 7], solid: true, counter: true },
  rug: { nine: ['I', 0, 7], base: 'wood' },
  redrug: { nine: ['Ir', 0, 7], base: 'hall' },
  // caves (c = plain, i = ice, l = lava, p = tower)
  cfloor: { fill: [['O', 1, 35], ['O', 2, 32]] },
  ifloor: { fill: [['Oi', 1, 35], ['Oi', 2, 32]] },
  lfloor: { fill: [['Ol', 1, 35], ['Ol', 2, 32]] },
  pfloor: { fill: [['Op', 1, 35], ['Op', 2, 32]] },
  cwall: { cwall: 'C', solid: true }, iwall2: { cwall: 'Ci', solid: true }, lwall: { cwall: 'Cl', solid: true }, pwall: { cwall: 'Cp', solid: true },
  cpool: { water: 'O', solid: true, swim: true }, ipool: { water: 'O', solid: true, swim: true }, lpool: { water: 'Lava', solid: true }, ppool: { water: 'Od', solid: true },
  cpit: { nine: ['C', 11, 4], solid: true, base: 'cfloor' }, ppit: { nine: ['Cp', 11, 4], solid: true, base: 'pfloor' },
  // small things on ground
  rock: { base: 'grass', o: [['C', 5, 3]], solid: true },
  crock: { base: 'cfloor', o: [['C', 5, 3]], solid: true },
  bush: { base: 'grass', o: [['O', 0, 14]], solid: true },
  sbush: { base: 'sand', o: [['Os', 0, 14]], solid: true },
  wbush: { base: 'snow', o: [['Ow', 0, 14]], solid: true },
  dbush: { base: 'dgrass', o: [['Od', 0, 14]], solid: true },
  stump: { base: 'grass', o: [['O', 4, 2]], solid: true },
  fence: { base: 'grass', fence: true, solid: true },
  sign: { base: 'grass', o: [['O', 28, 2]], solid: true },
  pot: { base: 'wood', o: [['B', 13, 0]], solid: true },
  // taller than a tile: drawn standing on the cell, the part above it over people
  barrel: { under: 'grass', px: ['O', 528, 5, 16, 23], solid: true },
  crate: { under: 'grass', px: ['O', 480, 3, 16, 28], solid: true },
  ctr: { base: 'plaza', o: [['O', 30, 0]], solid: true, counter: true },
  ctrg: { base: 'grass', o: [['O', 30, 0]], solid: true, counter: true },
  ctrw: { base: 'wood', o: [['I', 11, 8]], solid: true, counter: true },
  ctrs: { base: 'stone', o: [['I', 11, 8]], solid: true, counter: true },
  bars: { base: 'stone', o: [['O', 25, 1]], solid: true },
  lamp: { base: 'plaza', o: [['O', 36, 0]], solid: true },
  grave: { base: 'grass', o: [['O', 24, 0]], solid: true },
  bones: { base: 'cfloor', o: [['O', 28, 2]] },
  // world map
  forest: { base: 'grass', o: [['O', 0, 14]], wtree: true, slow: true },
  sforest: { base: 'sand', o: [['Os', 0, 14]], slow: true },
  wforest: { base: 'snow', o: [['Ow', 0, 14]], slow: true },
  dforest: { base: 'dgrass', o: [['Od', 0, 14]], slow: true },
  hill: { base: 'grass', o: [['C', 7, 9]] },
  mount: { base: 'grass', icon: 'mount', solid: true },
  smount: { base: 'sand', icon: 'smount', solid: true },
  wmount: { base: 'snow', icon: 'wmount', solid: true },
  dmount: { base: 'dgrass', icon: 'dmount', solid: true },
  hills: { base: 'grass', icon: 'hill' },
  bridge: { base: 'water', o: [['I', 0, 4]], bridge: true },
  i_castle: { base: 'grass', icon: 'castle' }, i_town: { base: 'grass', icon: 'town' }, i_village: { base: 'grass', icon: 'village' },
  i_tower: { base: 'grass', icon: 'tower' }, i_shrine: { base: 'grass', icon: 'shrine' }, i_cave: { base: 'grass', icon: 'cave' },
  i_port: { base: 'grass', icon: 'port' }, i_ruin: { base: 'grass', icon: 'ruin' },
  i_stown: { base: 'sand', icon: 'town' }, i_scave: { base: 'sand', icon: 'cave' }, i_scastle: { base: 'sand', icon: 'castle' },
  i_lport: { base: 'sand', icon: 'port' }, i_crater: { base: 'sand', icon: 'crater' },
  i_wtown: { base: 'snow', icon: 'village' }, i_wcave: { base: 'snow', icon: 'cave' }, i_dtower: { base: 'dgrass', icon: 'tower' },
  i_dcastle: { base: 'dgrass', icon: 'castle' }, i_dvillage: { base: 'dgrass', icon: 'village' }, i_dtown: { base: 'dgrass', icon: 'town' }, i_dport: { base: 'dgrass', icon: 'port' },
  i_dcave: { base: 'dgrass', icon: 'cave' }, i_dshrine: { base: 'dgrass', icon: 'shrine' }, i_druin: { base: 'dgrass', icon: 'ruin' },
};
export const TILES = T;
export const solidKind = (k) => !!(T[k] && T[k].solid);
export const isWater = (k) => !!(T[k] && T[k].water);

// ---------- stamps: big pieces placed by the map ----------
// sheet, col, row, width and height in tiles; rows: one string per row, '#' solid, '.' walkable,
// 'u' walkable and drawn above people (roofs, tree tops), 'U' solid and drawn above people.
export const STAMPS = {
  house: { s: ['O', 6, 0, 5, 5], rows: ['UUUUU', 'U###U', '#####', '#####', '##.##'], door: [2, 4] },
  // the chimney roof, on the same walls and door as the plain house
  house2: { s: ['O', 11, 0, 5, 5], rowsrc: { 3: [6, 3], 4: [6, 4] }, rows: ['UUUUU', 'U###U', '#####', '#####', '##.##'], door: [2, 4] },
  hut: { s: ['O', 13, 6, 2, 2], rows: ['UU', '##'] },
  tree: { s: ['O', 5, 16, 2, 2], rows: ['uu', '##'] },
  ttree: { s: ['B', 16, 12, 2, 2], rows: ['uu', '##'] },
  fountain: { s: ['O', 22, 9, 3, 3], rows: ['###', '###', '###'] },
  well: { s: ['O', 1, 0, 1, 1], rows: ['#'] },
  stall: { s: ['O', 18, 22, 2, 5], rows: ['uu', 'uu', 'uu', '##', '##'] },
  stall2: { s: ['O', 20, 22, 3, 6], rows: ['uuu', 'uuu', 'uuu', '###', '###', '###'] },
  tower: { s: ['O', 0, 21, 3, 6], rows: ['UUU', 'UUU', '###', '###', '###', '###'] },
  spire: { s: ['O', 3, 22, 3, 5], rows: ['UUU', 'UUU', '###', '###', '###'] },
  gate: { s: ['O', 4, 31, 4, 3], rows: ['####', '####', '#..#'] },
  statue: { s: ['O', 8, 31, 2, 2], rows: ['UU', '##'] },
  cavemouth: { s: ['O', 11, 32, 3, 2], rows: ['###', '#.#'] },
  banner: { s: ['O', 5, 27, 1, 2], rows: ['U', '#'] },
  boulder: { s: ['O', 11, 9, 2, 2], rows: ['##', '##'] },
  cliffrock: { s: ['O', 11, 11, 3, 3], rows: ['###', '###', '###'] },
  // indoors
  bed: { s: ['I', 16, 1, 1, 2], rows: ['#', '#'] },
  bed2: { s: ['I', 19, 1, 1, 2], rows: ['#', '#'] },
  table: { s: ['I', 10, 1, 3, 2], rows: ['###', '###'] },
  rtable: { s: ['I', 13, 1, 3, 3], rows: ['###', '###', '###'] },
  shelf: { s: ['I', 3, 12, 3, 2], rows: ['###', '###'] },
  dresser: { s: ['I', 6, 9, 3, 2], rows: ['###', '###'] },
  counter: { s: ['I', 10, 7, 3, 2], rows: ['###', '###'], counter: true },
  hearth: { s: ['I', 12, 10, 2, 3], rows: ['##', '##', '##'] },
  plant: { s: ['I', 8, 12, 1, 2], rows: ['U', '#'] },
  chair: { s: ['I', 12, 4, 1, 2], rows: ['.', '.'] },
  stairsdown: { s: ['I', 0, 15, 2, 2], rows: ['..', '..'] },
  stairsup: { s: ['I', 2, 15, 2, 3], rows: ['..', '..', '..'] },
  idoor: { s: ['I', 7, 4, 2, 2], rows: ['##', '..'] },
  window: { s: ['I', 9, 4, 2, 2], rows: ['##', '##'] },
  idol: { s: ['C', 6, 0, 1, 3], rows: ['U', '#', '#'] },
  idol2: { s: ['C', 8, 0, 1, 3], rows: ['U', '#', '#'] },
  bigrock: { s: ['C', 7, 5, 2, 2], rows: ['##', '##'] },
  cstatue: { s: ['Ci', 6, 0, 1, 3], rows: ['U', '#', '#'] },
};

// a 16x16 piece of a sheet
const blit = (g, sh, c, r, dx = 0, dy = 0, w = 16, h = 16, sx = 0, sy = 0) => g.drawImage(SH[sh], c * 16 + sx, r * 16 + sy, w, h, dx, dy, w, h);
const q8 = (g, sh, c, r, qx, qy, tx, ty) => g.drawImage(SH[sh], c * 16 + qx * 8, r * 16 + qy * 8, 8, 8, tx * 8, ty * 8, 8, 8);
const pick = (list, x, y) => (Array.isArray(list[0]) ? list[(((x * 73856093) ^ (y * 19349663)) >>> 0) % list.length] : list);

// Open water is the sheet's ripple tile. The shore is painted here: the land's own texture reaches a
// few pixels into the water with rounded corners, then a dark rim, a line of white foam and a band
// of light water, the same layers the sheet's ponds use.
const shoreCache = new Map();
function waterTile(g, sh, x, y, same, landFill) {
  const key = sh + [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].map(([dx, dy]) => (same(dx, dy) ? 1 : 0)).join('') + landFill.join() + ((x + y) & 1);
  let c = shoreCache.get(key);
  if (!c) {
    c = canvas(16, 16);
    c.x.drawImage(SH[sh], ((x + y) & 1 ? 4 : 3) * 16, 4 * 16, 16, 16, 0, 0, 16, 16);
    const land = canvas(16, 16); land.x.drawImage(SH[landFill[0]], landFill[1] * 16, landFill[2] * 16, 16, 16, 0, 0, 16, 16);
    const ld = land.x.getImageData(0, 0, 16, 16).data, id = c.x.getImageData(0, 0, 16, 16), d = id.data;
    const boxes = [];
    for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) if (!same(dx, dy)) boxes.push([dx * 16, dy * 16]);
    const ls = landFill[0];
    const foam = sh === 'Lava' ? [255, 200, 90] : [248, 252, 252];
    const rim = ls === 'Os' ? [150, 110, 60] : ls === 'Ow' ? [130, 150, 176] : ls === 'Od' ? [40, 56, 40] : ls[0] === 'C' ? [52, 34, 26] : [44, 100, 52];
    for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
      let dmin = 99;
      for (const [bx, by] of boxes) {
        const cx = Math.max(bx, Math.min(px + 0.5, bx + 16)), cy = Math.max(by, Math.min(py + 0.5, by + 16));
        dmin = Math.min(dmin, Math.hypot(px + 0.5 - cx, py + 0.5 - cy));
      }
      const i = (py * 16 + px) * 4;
      let col = null;
      if (dmin < 2.2) col = [ld[i], ld[i + 1], ld[i + 2]];
      else if (dmin < 3.2) col = rim;
      else if (dmin < 4.4) col = foam;
      else if (dmin < 5.6) col = sh === 'Lava' ? [255, 150, 60] : [d[i] * 0.6 + 100 * 0.4, d[i + 1] * 0.6 + 190 * 0.4, d[i + 2] * 0.6 + 240 * 0.4];
      if (col) { d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; }
    }
    c.x.putImageData(id, 0, 0);
    shoreCache.set(key, c);
  }
  g.drawImage(c, 0, 0);
}
// Path edges, drawn on the grass tiles next to a path: the 3x3 ring round the dirt at (0,29) and the
// 2x2 grass island on dirt at (0,32).
function ringEdges(g, sh, same) {
  for (const [qx, qy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const v = same(0, qy ? 1 : -1), h = same(qx ? 1 : -1, 0), dg = same(qx ? 1 : -1, qy ? 1 : -1);
    if (v && !h) q8(g, sh, 1, qy ? 29 : 31, qx, qy, qx, qy);
    else if (h && !v) q8(g, sh, qx ? 0 : 2, 30, qx, qy, qx, qy);
    else if (v && h) q8(g, sh, 0 + qx, 32 + qy, qx, qy, qx, qy);
    else if (dg) q8(g, sh, qx ? 0 : 2, qy ? 29 : 31, qx, qy, qx, qy);
  }
}
// a 3x3 frame (rugs, pits, pools): the middle tile repeats
function nineTile(g, sh, c, r, same) {
  for (const [qx, qy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const v = same(0, qy ? 1 : -1), h = same(qx ? 1 : -1, 0), dg = same(qx ? 1 : -1, qy ? 1 : -1);
    const cx = h ? 1 : qx ? 2 : 0, cy = v ? 1 : qy ? 2 : 0;
    // an inner corner: use the middle, then nick the corner with the diagonal frame piece
    q8(g, sh, c + cx, r + cy, qx, qy, qx, qy);
    if (v && h && !dg) q8(g, sh, c + (qx ? 0 : 2), r + (qy ? 0 : 2), qx ? 0 : 1, qy ? 0 : 1, qx, qy);
  }
}
// cave pools: 3x3 at (0,7) with the island at (3,7) for inner corners
function poolTile(g, sh, same) {
  for (const [qx, qy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const v = same(0, qy ? 1 : -1), h = same(qx ? 1 : -1, 0), dg = same(qx ? 1 : -1, qy ? 1 : -1);
    const cx = h ? 1 : qx ? 2 : 0, cy = v ? 1 : qy ? 2 : 0;
    if (v && h && !dg) q8(g, sh, 3 + (qx ? 0 : 1), 7 + (qy ? 0 : 2), qx, qy, qx, qy);
    else q8(g, sh, 0 + cx, 7 + cy, qx, qy, qx, qy);
  }
}

function landFillOf(k) {
  let d = T[k];
  for (let i = 0; i < 4 && d; i++) { if (d.fill && !d.black) { const f = d.fill; return Array.isArray(f[0]) ? f[0] : f; } d = T[d.base]; }
  return ['O', 0, 10];
}
export function drawTile(g, k, x, y, nb, f) {
  const d = T[k];
  if (!d) throw new Error('tile ' + k);
  if (d.base) drawTile(g, d.base, x, y, nb, f);
  if (d.under) {
    // stand on whatever floor is next to it
    let u = d.under;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) { const o = nb(dx, dy); if (T[o] && !T[o].solid && !T[o].water && !T[o].under) { u = o; break; } }
    drawTile(g, u, x, y, (dx, dy) => (dx || dy ? nb(dx, dy) : u), f);
  }
  if (d.black) { g.fillStyle = '#000'; g.fillRect(0, 0, 16, 16); return; }
  if (d.fill) { const [sh, c, r] = pick(d.fill, x, y); blit(g, sh, c, r); }
  if (d.ring) ringEdges(g, d.sheet || 'O', (dx, dy) => (T[nb(dx, dy)] || {}).group === d.ring);
  if (d.water) {
    const wet = (o) => o === undefined || o === 'void' || !!(T[o] && (T[o].water || T[o].bridge));
    // the land that shows at the shore: the first neighbour that is not water
    let lk = null;
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) { const o = nb(dx, dy); if (!wet(o)) { lk = o; break; } }
    waterTile(g, d.water, x, y, (dx, dy) => wet(nb(dx, dy)), landFillOf(lk));
  }
  if (d.nine) nineTile(g, d.nine[0], d.nine[1], d.nine[2], (dx, dy) => { const o = nb(dx, dy); return o === k || o === undefined; });
  if (d.pool) poolTile(g, d.pool, (dx, dy) => { const o = nb(dx, dy); return o === k || o === undefined; });
  if (d.iwall) {
    // interior wall: brick face where the floor is below, dark top elsewhere
    const below = nb(0, 1), open = below !== undefined && !(T[below] && T[below].iwall);
    const [ws, wc, wr] = d.iwall;
    if (open) blit(g, ws, wc, wr);
    else { g.fillStyle = '#2a1e22'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#4a3a3a'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 15, 16, 1); }
  }
  if (d.cwall) {
    // a cliff two tiles tall where the floor is below it; dark rock everywhere else
    const isW = (o) => o === undefined || !!(T[o] && T[o].cwall);
    const b1 = nb(0, 1), b2 = nb(0, 2);
    if (!isW(b1)) blit(g, d.cwall, 2, 5);
    else if (b1 !== undefined && !isW(b2)) blit(g, d.cwall, 2, 4);
    else {
      g.fillStyle = '#1c1218'; g.fillRect(0, 0, 16, 16);
      g.fillStyle = '#281a22'; for (let i = 0; i < 5; i++) g.fillRect(((x * 7 + i * 5) % 14), ((y * 3 + i * 7) % 14), 2, 1);
    }
  }
  if (d.fence) {
    const l = nb(-1, 0) === k, r = nb(1, 0) === k, u = nb(0, -1) === k, dn = nb(0, 1) === k;
    if ((u || dn) && !(l || r)) blit(g, 'O', 2, 18); else blit(g, 'O', l && r ? 1 : l ? 2 : 0, 17);
  }
  if (d.o) for (const [sh, c, r, special] of d.o) {
    if (special === 'flower') { const fl = (x * 7 + y * 3) % 3; if (fl === 0) blit(g, 'O', 0, 8); else if (fl === 1) blit(g, 'O', 1, 8); else blit(g, 'O', 3, 12); continue; }
    blit(g, sh, c, r);
  }
  if (d.icon) g.drawImage(ICON[d.icon], 0, 0);
  void f;
}

// ---------- whole maps ----------
// returns { frames: [canvas], upper: canvas } ; stamps: [{ name, x, y }]
export function renderMap(map) {
  const { w, h } = map;
  const kindAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? undefined : map.kinds[map.tile(x, y)]);
  const t = canvas(16, 16);
  const c = canvas(w * 16, h * 16), up = canvas(w * 16, h * 16);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = kindAt(x, y);
    t.x.clearRect(0, 0, 16, 16);
    drawTile(t.x, k, x, y, (dx, dy) => kindAt(x + dx, y + dy), 0);
    c.x.drawImage(t, x * 16, y * 16);
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const d = T[kindAt(x, y)];
    if (!d || !d.px) continue;
    const [sh, sx, sy, pw, ph] = d.px, low = Math.min(ph, 16), top = ph - low;
    c.x.drawImage(SH[sh], sx, sy + top, pw, low, x * 16 + (16 - pw) / 2, y * 16 + 16 - low, pw, low);
    if (top) up.x.drawImage(SH[sh], sx, sy, pw, top, x * 16 + (16 - pw) / 2, y * 16 - top, pw, top);
  }
  // stamps: sorted top to bottom so nearer ones overlap
  const st = [...(map.stamps || [])].sort((a, b) => a.y - b.y);
  for (const s of st) {
    const S = STAMPS[s.name];
    if (!S) throw new Error('stamp ' + s.name);
    const [sh, c0, r0, sw, shh] = S.s;
    for (let yy = 0; yy < shh; yy++) for (let xx = 0; xx < sw; xx++) {
      const ch = S.rows[yy][xx];
      const dst = ch === 'u' || ch === 'U' ? up : c;
      const [sc, sr] = (S.rowsrc && S.rowsrc[yy]) || [c0, r0 + yy];
      dst.x.drawImage(SH[s.sheet || sh], (sc + xx) * 16, sr * 16, 16, 16, (s.x + xx) * 16, (s.y + yy) * 16, 16, 16);
    }
  }
  return { frames: [c], upper: up };
}
// which cells a stamp blocks
export function stampCells(s) {
  const S = STAMPS[s.name], out = [];
  S.rows.forEach((row, yy) => [...row].forEach((ch, xx) => out.push({ x: s.x + xx, y: s.y + yy, solid: ch === '#' || ch === 'U', counter: !!S.counter })));
  return out;
}
export function tileCanvas(k, nb = () => k) { const c = canvas(16, 16); drawTile(c.x, k, 0, 0, nb, 0); return c; }
