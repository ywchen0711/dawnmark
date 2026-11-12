// Low-level pixel graphics: the 256x224 screen, colours, grid sprites, the pixel font and the
// black windows.
export const W = 256, H = 224, T = 16;

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.x = c.getContext('2d');
  c.x.imageSmoothingEnabled = false;
  return c;
}

// Everything draws into this 256x224 picture. present() copies it onto the visible canvas, whose
// size index.html sets to a whole number of real screen pixels per game pixel, so text stays sharp
// at any display scaling. The scanlines are drawn here too, lined up with those pixels.
export const screen = document.getElementById('screen');
const game = canvas(W, H);
export const ctx = game.x;
const sctx = screen.getContext('2d');
// Everything is drawn in game pixels, but the picture underneath has Z real pixels per game pixel,
// so a sprite drawn smaller than one game pixel per dot still lands on whole screen pixels.
let Z = 1;
export const fine = (s) => Math.max(1, Math.round(s * Z)) / Z;
let lines = null;
export function present(scan) {
  const k = Math.max(1, Math.round(screen.width / W));
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(game, 0, 0, W * k, H * k);
  if (Z !== k) { Z = k; game.width = W * k; game.height = H * k; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.imageSmoothingEnabled = false; }
  if (!scan || k < 2) return;
  if (!lines || lines.k !== k) {
    lines = canvas(W * k, H * k); lines.k = k;
    lines.x.fillStyle = k >= 3 ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.16)';
    for (let y = 0; y < H; y++) lines.x.fillRect(0, y * k + k - 1, W * k, 1);
  }
  sctx.drawImage(lines, 0, 0);
}

// ---------- colour helpers ----------
export function rgb(h) {
  if (Array.isArray(h)) return h;
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => { a = rgb(a); b = rgb(b); return hex(a.map((v, i) => v + (b[i] - v) * t)); };
// SNES colour is 15-bit: snap every channel to 5 bits so palettes look right
export const snes = (h) => hex(rgb(h).map((v) => Math.round(v / 255 * 31) * 255 / 31));

function toHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function fromHsl(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
// a pixel-art colour ramp: shadows drift towards blue-violet, lights towards warm yellow
export function ramp(base, n = 5, spread = 1) {
  const [h, s, l] = toHsl(rgb(base)), out = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1), d = (t - 0.55) * spread;
    const hh = h + (d < 0 ? d * 40 * (h > 60 && h < 250 ? 1 : -1) : d * 30 * (h > 60 && h < 250 ? -1 : 1));
    const ll = Math.max(0.04, Math.min(0.96, l + d * (d < 0 ? l * 1.25 : (1 - l) * 1.3)));
    const ss = Math.max(0, Math.min(1, s * (1 - Math.abs(d) * 0.35) + (d < 0 ? 0.08 : 0)));
    out.push(snes(hex(fromHsl(hh, ss, ll))));
  }
  return out;
}

// ---------- randomness ----------
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const hash = (x, y, k = 0) => { let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

// ---------- grid sprites ----------
// rows of characters, each character a key into pal ('.' and ' ' are clear)
export function fromGrid(rows, pal, into, ox = 0, oy = 0) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const c = into || canvas(w, h);
  const id = c.x.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < rows[y].length; x++) {
    const ch = rows[y][x];
    if (ch === '.' || ch === ' ') continue;
    const col = pal[ch];
    if (col === undefined) throw new Error('no colour for ' + ch);
    if (col === null) continue;
    const X = x + ox, Y = y + oy;
    if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue;
    const [r, g, b] = rgb(col), i = (Y * c.width + X) * 4;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
  }
  c.x.putImageData(id, 0, 0);
  return c;
}
export function flipX(src) {
  const c = canvas(src.width, src.height);
  c.x.translate(src.width, 0); c.x.scale(-1, 1); c.x.drawImage(src, 0, 0);
  return c;
}
// a solid-colour silhouette of a sprite (hit flashes, shadows)
export function tint(src, col, a = 1) {
  const c = canvas(src.width, src.height);
  c.x.drawImage(src, 0, 0);
  c.x.globalCompositeOperation = 'source-atop';
  c.x.globalAlpha = a; c.x.fillStyle = col; c.x.fillRect(0, 0, c.width, c.height);
  return c;
}
// 1px dark outline around everything opaque
export function outline(src, col = '#100818') {
  const w = src.width, h = src.height, c = canvas(w, h);
  const s = src.x.getImageData(0, 0, w, h).data, id = c.x.createImageData(w, h), d = id.data, [r, g, b] = rgb(col);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (s[i + 3]) { d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = 255; continue; }
    const on = (X, Y) => X >= 0 && Y >= 0 && X < w && Y < h && s[(Y * w + X) * 4 + 3];
    if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; }
  }
  c.x.putImageData(id, 0, 0);
  return c;
}

// ---------- pixel font ----------
const glyphCache = new Map();
export const FONT = '12px Cubic11';
export function textW(s) { ctx.font = FONT; return Math.round(ctx.measureText(s).width); }
// Crisp text. Cubic 11 sits on a 12-pixel grid (100 font units per pixel), but browsers smear
// thin strokes across neighbouring pixels in their own ways, so thresholding the 12px text breaks
// some characters. Instead each string is drawn 8 times larger, where every font pixel is an 8x8
// block, and the centre of each block decides whether that pixel is on.
const GS = 8, maskCache = new Map(), big = canvas(1, 1);
function glyphMask(s) {
  let m = maskCache.get(s);
  if (m) return m;
  const w = Math.max(1, textW(s) + 2), h = 14;
  if (big.width < w * GS) big.width = w * GS;
  if (big.height < h * GS) big.height = h * GS;
  const x = big.x;
  x.clearRect(0, 0, big.width, big.height);
  x.font = 12 * GS + 'px Cubic11'; x.textBaseline = 'alphabetic'; x.fillStyle = '#fff';
  x.fillText(s, 0, 11 * GS); // the font's ascent is 10 pixels; the old top-aligned text started 1 pixel down
  const d = x.getImageData(0, 0, w * GS, h * GS).data, bits = new Uint8Array(w * h);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) bits[yy * w + xx] = d[(((yy * GS + GS / 2) * w * GS) + xx * GS + GS / 2) * 4 + 3] > 127 ? 1 : 0;
  m = { w, h, bits };
  if (maskCache.size > 3000) maskCache.clear();
  maskCache.set(s, m);
  return m;
}
// the string as a canvas in one colour
export function glyphs(s, col) {
  const key = s + '|' + col;
  let c = glyphCache.get(key);
  if (c) return c;
  const m = glyphMask(s), [r, g, b] = rgb(col);
  c = canvas(m.w, m.h);
  const id = c.x.createImageData(m.w, m.h), d = id.data;
  for (let k = 0; k < m.bits.length; k++) if (m.bits[k]) { d[k * 4] = r; d[k * 4 + 1] = g; d[k * 4 + 2] = b; d[k * 4 + 3] = 255; }
  c.x.putImageData(id, 0, 0);
  if (glyphCache.size > 3000) glyphCache.clear();
  glyphCache.set(key, c);
  return c;
}
// text with the classic drop shadow
export function text(s, x, y, col = '#f8f8f8', { shadow = '#000000', align = 'left', g = ctx } = {}) {
  s = String(s);
  if (align !== 'left') { const w = textW(s); x -= align === 'center' ? Math.floor(w / 2) : w; }
  if (shadow) g.drawImage(glyphs(s, shadow), Math.round(x) + 1, Math.round(y) + 1);
  g.drawImage(glyphs(s, col), Math.round(x), Math.round(y));
}

// ---------- windows ----------
// the old-fashioned black window with a rounded white frame
const winCache = new Map();
export const WIN = { fill: 'rgba(0,0,8,0.9)', line: '#f8f8f8', shade: '#8890a8' };
export function windowBox(x, y, w, h, { g = ctx, alpha = 1, hot = false } = {}) {
  const key = w + 'x' + h + WIN.fill + WIN.line + hot;
  let c = winCache.get(key);
  if (!c) {
    c = canvas(w, h);
    const X = c.x;
    X.fillStyle = WIN.fill; X.fillRect(2, 1, w - 4, h - 2); X.fillRect(1, 2, w - 2, h - 4);
    const line = hot ? '#f8d050' : WIN.line;
    X.fillStyle = '#000'; X.fillRect(3, 0, w - 6, 1); X.fillRect(3, h - 1, w - 6, 1); X.fillRect(0, 3, 1, h - 6); X.fillRect(w - 1, 3, 1, h - 6);
    X.fillStyle = line;
    X.fillRect(3, 2, w - 6, 2); X.fillRect(3, h - 4, w - 6, 2); X.fillRect(2, 3, 2, h - 6); X.fillRect(w - 4, 3, 2, h - 6);
    X.fillStyle = WIN.shade; X.fillRect(4, h - 3, w - 8, 1); X.fillRect(w - 3, 4, 1, h - 8);
    if (winCache.size > 300) winCache.clear();
    winCache.set(key, c);
  }
  g.globalAlpha = alpha; g.drawImage(c, Math.round(x), Math.round(y)); g.globalAlpha = 1;
}

// the pointing-hand cursor
export const HAND = fromGrid([
  '..oooo......',
  '.owwwwo.....',
  'owwwwwwoooo.',
  'owwwwwwwwwwo',
  'owwwwwwoooo.',
  'owwwwwwwwo..',
  'owwwwwwoo...',
  'owwwwwwwwo..',
  '.owwwwoo....',
  '..oooo......',
], { o: '#101028', w: '#f8f0e0' });
export const HAND_D = fromGrid([
  '..oooooo..',
  '.owwwwwwo.',
  '.owwwwwwo.',
  '.owwwwwwo.',
  '..owwwwo..',
  '...owwo...',
  '....oo....',
], { o: '#101028', w: '#f8f0e0' });

export function bar(x, y, w, v, max, col = '#58e070', g = ctx) {
  g.fillStyle = '#080818'; g.fillRect(x, y, w, 3);
  const f = Math.max(0, Math.min(1, v / max));
  g.fillStyle = col; g.fillRect(x, y, Math.round(w * f), 3);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, y, Math.round(w * f), 1);
}
