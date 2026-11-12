// People, portraits and monsters.
// People and portraits are Charles Gabriel's 16x18 RPG characters and 48x48 faces (CC-BY 3.0), in
// Jorhlok's repack: every character is three rows (facing up, right, down) of ten 24x24 frames:
// walk, stand, walk, three punches and four casting frames. Facing left is the right row mirrored.
// Monsters are FF6-style battlers by Redshrike, JosephSeraph, Blarumyrran and others, packed into
// one sheet by the build script; CREDITS.md lists every one.
import { canvas, flipX } from './gfx.js';

async function img(src) { const i = new Image(); i.src = src; await i.decode(); return i; }
const META = await (await fetch('assets/meta.json')).json();
const CHARS = await img('assets/chars.png');
const FACES = await img('assets/faces.png');
const MONS = await img('assets/monsters.png');

// the characters on the sheet, in order
const NAMES = ['adult', 'child', 'warrior', 'magician', 'healer', 'ninja', 'ranger', 'man', 'warrior_f', 'magician_f', 'healer_f', 'ninja_f', 'ranger_f', 'woman',
  'monk', 'berserker', 'darkknight', 'soldier', 'youth', 'youth2', 'monk_f', 'berserker_f', 'darkknight_f', 'soldier_f', 'maiden', 'maiden2',
  'fire', 'water', 'wind', 'earth', 'light', 'dark', 'priest', 'nun', 'merchant', 'cultist', 'pirate', 'captain', 'samurai', 'samurai_f', 'boy', 'girl',
  'dancer', 'king', 'queen', 'oldman', 'oldwoman', 'vampire', 'bard', 'paladin', 'bunny', 'angel', 'angel_f'];
export const CHAR_INDEX = Object.fromEntries(NAMES.map((n, i) => [n, i]));

const cache = new Map();
function cell(k, row, f) { const c = canvas(24, 24); c.x.drawImage(CHARS, f * 24, (k * 3 + row) * 24, 24, 24, 0, 0, 24, 24); return c; }
// sprite(key) -> { d, l, r, u: [stand, step, stand, step], punch: [3], cast: [4] } ; frames are 24x24, feet on the bottom row
export function sprite(key) {
  if (cache.has(key)) return cache.get(key);
  const k = CHAR_INDEX[key] ?? 0;
  const out = {};
  for (const [dir, row] of [['u', 0], ['r', 1], ['d', 2]]) {
    const fr = [0, 1, 2].map((f) => cell(k, row, f));
    out[dir] = [fr[1], fr[0], fr[1], fr[2]];
    out['punch_' + dir] = [3, 4, 5].map((f) => cell(k, row, f));
    out['cast_' + dir] = [6, 7, 8, 9].map((f) => cell(k, row, f));
  }
  out.l = out.r.map(flipX);
  out.punch_l = out.punch_r.map(flipX);
  out.cast_l = out.cast_r.map(flipX);
  cache.set(key, out);
  return out;
}
export const hasSprite = (k) => k in CHAR_INDEX;

// 48x48 portraits, 8 to a row
export function face(i) {
  const id = 'f' + i;
  if (cache.has(id)) return cache.get(id);
  const c = canvas(48, 48);
  c.x.drawImage(FACES, (i % 8) * 48, Math.floor(i / 8) * 48, 48, 48, 0, 0, 48, 48);
  cache.set(id, c);
  return c;
}

// ---------- monsters ----------
export const monSize = (k) => (META.mon[k] ? [META.mon[k][2], META.mon[k][3]] : [32, 32]);
export const hasMon = (k) => !!META.mon[k];
// recolour by turning the hue (degrees) and scaling saturation and brightness, for stronger kin
function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function rgbOf(h, s, l) {
  h = (((h % 360) + 360) % 360) / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
export function recolor(src, { hue = 0, sat = 1, lum = 1 } = {}) {
  const c = canvas(src.width, src.height); c.x.drawImage(src, 0, 0);
  if (!hue && sat === 1 && lum === 1) return c;
  const d = c.x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const [h, s, l] = hsl(a[i], a[i + 1], a[i + 2]);
    if (s < 0.08 && (l < 0.1 || l > 0.9)) continue; // keep black outlines and white glints
    const o = rgbOf(h + hue, Math.min(1, s * sat), Math.min(1, l * lum));
    a[i] = o[0]; a[i + 1] = o[1]; a[i + 2] = o[2];
  }
  c.x.putImageData(d, 0, 0);
  return c;
}
// monArt(key, look, flip) -> the battler picture
export function monArt(k, look, flip) {
  const id = 'm' + k + JSON.stringify(look || {}) + (flip ? 'f' : '');
  if (cache.has(id)) return cache.get(id);
  const at = META.mon[k];
  if (!at) return null;
  let c = canvas(at[2], at[3]);
  c.x.drawImage(MONS, at[0], at[1], at[2], at[3], 0, 0, at[2], at[3]);
  if (look) c = recolor(c, look);
  if (flip) c = flipX(c);
  cache.set(id, c);
  return c;
}
// a solid-colour silhouette (hit flashes)
export function flash(src, col = '#ffffff') {
  const c = canvas(src.width, src.height); c.x.drawImage(src, 0, 0);
  c.x.globalCompositeOperation = 'source-atop'; c.x.fillStyle = col; c.x.fillRect(0, 0, c.width, c.height);
  return c;
}
// battle backgrounds
const bgImg = new Map();
export async function loadBg(k) { if (!bgImg.has(k)) { try { bgImg.set(k, await img('assets/bg/' + k + '.png')); } catch (e) { bgImg.set(k, null); } } return bgImg.get(k); }
export const bgArt = (k) => bgImg.get(k) || null;
