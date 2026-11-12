// Walking around: maps, the party in a line behind the leader, people, chests, glints on the
// ground, save circles, doors, story triggers, random encounters, the boat and the sky drake.
import { ctx, W, H, canvas, text, textW, windowBox } from './gfx.js';
import { renderMap, solidKind, isWater, stampCells, SHEETS, TILES } from './tiles.js';
import { sprite, monArt } from './sprites.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { S, spriteOf } from './party.js';
import { UI } from './ui.js';
import { L } from './i18n.js';

const DIRS = { up: [0, -1, 'u'], down: [0, 1, 'd'], left: [-1, 0, 'l'], right: [1, 0, 'r'] };
const DV = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };

let MAPS = {};
export function setMaps(m) { MAPS = m; }
export const F = {
  map: null, def: null, gfx: null, ents: [], kinds: [], grid: null, block: null, counters: null,
  p: { x: 0, y: 0, px: 0, py: 0, dir: 'd', moving: false },
  trail: [], frame: 0, cam: { x: 0, y: 0 }, banner: 0, encCount: 20,
  busy: false, mode: 'walk', shake: 0,
  onStep: null, onEncounter: null, onWarp: null, onMenu: null, runScript: null,
};

export function loadMap(id, x, y, dir = 'd') {
  const def = MAPS[id];
  if (!def) throw new Error('no map ' + id);
  const built = def.build();
  F.def = def; F.map = built;
  const kinds = [], index = {};
  const grid = new Uint16Array(built.w * built.h);
  for (let yy = 0; yy < built.h; yy++) for (let xx = 0; xx < built.w; xx++) {
    const k = built.kindAt(xx, yy);
    if (index[k] === undefined) { index[k] = kinds.length; kinds.push(k); }
    grid[yy * built.w + xx] = index[k];
  }
  F.kinds = kinds; F.grid = grid;
  built.kinds = kinds; built.tile = (X, Y) => grid[Y * built.w + X];
  // stamps block the cells they cover
  F.block = new Uint8Array(built.w * built.h); F.counters = new Uint8Array(built.w * built.h);
  for (const s of built.stamps || []) for (const c of stampCells(s)) if (c.x >= 0 && c.y >= 0 && c.x < built.w && c.y < built.h) { if (c.solid) F.block[c.y * built.w + c.x] = 1; if (c.counter) F.counters[c.y * built.w + c.x] = 1; }
  F.gfx = renderMap(built);
  F.ents = built.ents.map((e) => ({ ...e }));
  for (const e of F.ents) {
    e.px = e.x * 16; e.py = e.y * 16;
    if ((e.type === 'chest' || e.type === 'glint') && S.flags['chest:' + e.id]) { if (e.type === 'glint') e.gone = true; else e.open = true; }
    if (e.type === 'npc') { e.dir = e.dir || 'd'; e.home = [e.x, e.y]; e.mt = 30 + Math.floor(Math.random() * 90); }
    if (e.cond && !e.cond(S.flags)) e.gone = true;
  }
  if (S.ride && S.ride.map === id && F.mode !== S.ride.kind) F.ents.push({ type: 'ride', kind: S.ride.kind, x: S.ride.x, y: S.ride.y, px: S.ride.x * 16, py: S.ride.y * 16 });
  if (!def.world) F.mode = 'walk';
  F.p = { x, y, px: x * 16, py: y * 16, dir, moving: false };
  F.trail = [];
  for (let i = 0; i < 48; i++) F.trail.push({ px: x * 16, py: y * 16, dir });
  F.banner = def.name ? 130 : 0;
  F.encCount = 14 + Math.floor(Math.random() * 16);
  S.map = id; S.x = x; S.y = y; S.dir = dir;
  updateCam();
}

// ---------- queries ----------
const inMap = (x, y) => x >= 0 && y >= 0 && x < F.map.w && y < F.map.h;
export const kindAt = (x, y) => (inMap(x, y) ? F.kinds[F.grid[y * F.map.w + x]] : 'void');
export function entAt(x, y, pred = () => true) { return F.ents.find((e) => !e.gone && e.x === x && e.y === y && pred(e)); }
const entsAt = (x, y) => F.ents.filter((e) => !e.gone && e.x === x && e.y === y);
function entSolid(e) { return ['npc', 'chest', 'sign', 'solid', 'boss', 'ride', 'fish'].includes(e.type) && !e.walkable; }
function blocked(x, y) {
  if (!inMap(x, y)) return true;
  if (F.block[y * F.map.w + x]) return true;
  if (solidKind(kindAt(x, y))) return true;
  for (const e of entsAt(x, y)) if (entSolid(e)) return true;
  return false;
}
const isCounter = (x, y) => inMap(x, y) && (F.counters[y * F.map.w + x] || !!(TILES[kindAt(x, y)] && TILES[kindAt(x, y)].counter));

// ---------- walking ----------
function tryMove(d) {
  const [dx, dy, dir] = DIRS[d], p = F.p;
  p.dir = dir;
  const nx = p.x + dx, ny = p.y + dy;
  if (F.mode === 'drake') { if (!inMap(nx, ny)) return false; p.x = nx; p.y = ny; p.moving = true; return true; }
  if (F.mode === 'boat') {
    if (!inMap(nx, ny)) return false;
    const k = kindAt(nx, ny);
    if (isWater(k) || (TILES[k] && TILES[k].bridge)) { p.x = nx; p.y = ny; p.moving = true; return true; }
    // stepping ashore leaves the boat at the water's edge
    if (!blocked(nx, ny)) { leaveBoat(); p.x = nx; p.y = ny; p.moving = true; return true; }
    if (F.frame % 16 === 0) sfx('bump');
    return false;
  }
  const ride = entAt(nx, ny, (e) => e.type === 'ride');
  if (ride) { board(ride); return false; }
  if (blocked(nx, ny)) { if (F.frame % 16 === 0) sfx('bump'); return false; }
  p.x = nx; p.y = ny; p.moving = true;
  return true;
}
function finishStep() {
  const p = F.p;
  p.moving = false;
  S.x = p.x; S.y = p.y; S.dir = p.dir;
  if (F.busy || F.mode === 'drake') return;
  S.steps++;
  if (S.repel > 0) S.repel--;
  if (F.onStep) F.onStep();
  const here = entsAt(p.x, p.y);
  for (const e of here) {
    if (e.type === 'warp') { F.onWarp && F.onWarp(e); return; }
    if (e.type === 'trigger' && !(e.once && S.flags[e.once]) && (!e.need || e.need(S.flags))) { if (e.once) S.flags[e.once] = true; F.runScript(e.run, e); return; }
    if (e.type === 'save') { F.runScript('save', e); return; }
  }
  // random encounters
  const zone = F.map.zone && F.map.zone(p.x, p.y, F.mode);
  if (zone && F.onEncounter && !S.flags.noenc) {
    const k = kindAt(p.x, p.y), T = TILES[k] || {};
    F.encCount -= T.slow ? 1.6 : k === 'dirt' || k === 'plaza' ? 0.6 : 1;
    if (F.encCount <= 0) { F.encCount = 14 + Math.floor(Math.random() * 18); F.onEncounter(zone); }
  }
}

// ---------- the boat and the sky drake ----------
function board(r) {
  r.gone = true;
  F.mode = r.kind;
  S.ride = null;
  sfx(r.kind === 'drake' ? 'warp' : 'door');
  const p = F.p; p.x = r.x; p.y = r.y; p.px = r.x * 16; p.py = r.y * 16;
  F.onBoard && F.onBoard(r.kind);
}
function leaveBoat() {
  const p = F.p;
  S.ride = { kind: 'boat', map: S.map, x: p.x, y: p.y };
  F.ents.push({ type: 'ride', kind: 'boat', x: p.x, y: p.y, px: p.x * 16, py: p.y * 16 });
  F.mode = 'walk';
  F.onLand && F.onLand();
}
function tryLand() {
  const p = F.p, k = kindAt(p.x, p.y);
  if (solidKind(k) || isWater(k) || blocked(p.x, p.y) || entAt(p.x, p.y)) { sfx('buzz'); return; }
  F.mode = 'walk';
  S.ride = { kind: 'drake', map: S.map, x: p.x, y: p.y };
  F.ents.push({ type: 'ride', kind: 'drake', x: p.x, y: p.y, px: p.x * 16, py: p.y * 16 });
  for (const [dx, dy, d] of [[0, 1, 'd'], [1, 0, 'r'], [-1, 0, 'l'], [0, -1, 'u']]) {
    if (!blocked(p.x + dx, p.y + dy)) { p.x += dx; p.y += dy; p.px = p.x * 16; p.py = p.y * 16; p.dir = d; break; }
  }
  for (const t of F.trail) { t.px = p.px; t.py = p.py; }
  S.x = p.x; S.y = p.y;
  sfx('door');
  F.onLand && F.onLand();
  const here = entsAt(p.x, p.y).find((e) => e.type === 'warp');
  if (here) F.onWarp(here);
}
// put a ride somewhere from a script
export function placeRide(kind, map, x, y) { S.ride = { kind, map, x, y }; if (S.map === map) F.ents.push({ type: 'ride', kind, x, y, px: x * 16, py: y * 16 }); }

// ---------- update ----------
export function updateField() {
  F.frame++;
  if (F.banner > 0) F.banner--;
  if (F.shake > 0) F.shake--;
  const p = F.p;
  if (p.moving) {
    const tx = p.x * 16, ty = p.y * 16, sp = F.mode === 'drake' ? 4 : input.held('b') && !F.busy ? 4 : 2;
    p.px += Math.sign(tx - p.px) * Math.min(sp, Math.abs(tx - p.px));
    p.py += Math.sign(ty - p.py) * Math.min(sp, Math.abs(ty - p.py));
    F.trail.unshift({ px: p.px, py: p.py, dir: p.dir });
    if (F.trail.length > 64) F.trail.pop();
    if (p.px === tx && p.py === ty) finishStep();
  }
  for (const e of F.ents) {
    if (e.gone) continue;
    const tx = e.x * 16, ty = e.y * 16;
    if (e.px !== tx || e.py !== ty) {
      const sp = e.speed || 1;
      e.px += Math.sign(tx - e.px) * Math.min(sp, Math.abs(tx - e.px));
      e.py += Math.sign(ty - e.py) * Math.min(sp, Math.abs(ty - e.py));
      e.walking = true;
      if (e.px === tx && e.py === ty) { e.walking = false; if (e.onArrive) { const f = e.onArrive; e.onArrive = null; f(); } }
    }
    if (e.type === 'npc' && e.wander && !F.busy && !UI.active && !e.walking) {
      if (--e.mt <= 0) {
        e.mt = 60 + Math.floor(Math.random() * 120);
        const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(Math.random() * 4)];
        const nx = e.x + dx, ny = e.y + dy;
        e.dir = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u';
        if (Math.abs(nx - e.home[0]) <= 2 && Math.abs(ny - e.home[1]) <= 2 && !blocked(nx, ny) && !(nx === p.x && ny === p.y) && !entsAt(nx, ny).length) { e.x = nx; e.y = ny; }
      }
    }
  }
  if (F.busy || UI.active) { updateCam(); return; }
  if (!p.moving) {
    const d = input.dir();
    if (d && tryMove(d)) { /* moving */ }
    else if (input.pressed('a')) { if (F.mode === 'drake') tryLand(); else interact(); }
    else if (input.pressed('menu')) F.onMenu && F.onMenu();
  }
  updateCam();
}
function interact() {
  const p = F.p, [dx, dy] = DV[p.dir];
  let tx = p.x + dx, ty = p.y + dy;
  // talk across a shop counter
  if (isCounter(tx, ty)) { tx += dx; ty += dy; }
  // glints can be picked up from where you stand too
  const g = entAt(p.x, p.y, (e) => e.type === 'glint');
  if (g) { F.runScript('glint', g); return; }
  const e = F.ents.find((o) => !o.gone && o.x === tx && o.y === ty && (o.talk || ['chest', 'save', 'sign', 'glint', 'fish'].includes(o.type)));
  if (!e) return;
  if (e.type === 'npc' && !e.fixed) e.dir = { u: 'd', d: 'u', l: 'r', r: 'l' }[p.dir];
  F.runScript(e.talk || e.type, e);
}
function updateCam() {
  const tx = F.p.px + 8 - W / 2, ty = F.p.py + 8 - H / 2;
  const mw = F.map.w * 16, mh = F.map.h * 16;
  F.cam.x = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, tx));
  F.cam.y = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, ty));
}

// ---------- drawing ----------
const shadow = (() => { const c = canvas(14, 5); c.x.fillStyle = 'rgba(0,0,0,0.3)'; c.x.beginPath(); c.x.ellipse(7, 2.5, 7, 2.5, 0, 0, Math.PI * 2); c.x.fill(); return c; })();
const sheetTile = (sh, c, r) => { const t = canvas(16, 16); t.x.drawImage(SHEETS[sh], c * 16, r * 16, 16, 16, 0, 0, 16, 16); return t; };
const CHEST = [sheetTile('B', 0, 0), sheetTile('B', 1, 0)];
const GLINT = [sheetTile('B', 11, 3), sheetTile('B', 12, 3), sheetTile('B', 13, 3), sheetTile('B', 12, 3)];
const SAVE = Array.from({ length: 8 }, (_, i) => { const t = canvas(32, 32); t.x.drawImage(SHEETS.B, i * 32, 10 * 16, 32, 32, 0, 0, 32, 32); return t; });
// the boat, drawn here
const BOAT = (() => {
  const c = canvas(24, 20), g = c.x;
  g.fillStyle = '#2a1810'; g.fillRect(1, 11, 22, 7); g.fillRect(3, 18, 18, 1);
  g.fillStyle = '#9a6a3a'; g.fillRect(2, 12, 20, 5); g.fillStyle = '#c08a50'; g.fillRect(2, 12, 20, 1);
  g.fillStyle = '#5a3820'; g.fillRect(11, 1, 2, 11);
  g.fillStyle = '#f8f0e0'; g.beginPath(); g.moveTo(13, 2); g.lineTo(21, 10); g.lineTo(13, 10); g.fill();
  g.fillStyle = '#c84830'; g.fillRect(12, 1, 5, 2);
  return c;
})();
export function drakeArt() { const a = monArt('skydrake'); return a; }

export function drawField() {
  const cx = Math.round(F.cam.x) + (F.shake ? ((F.shake % 2) * 2 - 1) * 2 : 0), cy = Math.round(F.cam.y);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(F.gfx.frames[0], -cx, -cy);
  const list = [];
  for (const e of F.ents) {
    if (e.gone) continue;
    const x = Math.round(e.px) - cx, y = Math.round(e.py) - cy;
    if (x < -40 || y < -48 || x > W + 24 || y > H + 24) continue;
    if (e.type === 'save') { ctx.drawImage(SAVE[(F.frame >> 3) % 8], x - 8, y - 8); continue; }
    list.push(e);
  }
  const p = F.p;
  if (F.mode === 'walk') {
    const party = S.members.filter((m) => m.hp > 0).slice(0, F.def.single ? 1 : 4);
    if (!party.length && S.members.length) party.push(S.members[0]);
    party.forEach((m, i) => {
      const t = i === 0 ? { px: p.px, py: p.py, dir: p.dir } : F.trail[Math.min(F.trail.length - 1, i * 8)];
      list.push({ type: 'hero', sprite: spriteOf(m), px: t.px, py: t.py, dir: t.dir, walking: p.moving || p.walking, order: -i, hidden: F.hideParty && i > 0 });
    });
  }
  list.sort((a, b) => a.py - b.py || (a.order || 0) - (b.order || 0));
  for (const e of list) drawEnt(e, cx, cy);
  if (F.mode === 'boat') {
    const x = Math.round(p.px) - cx, y = Math.round(p.py) - cy;
    const lead = S.members[0];
    ctx.drawImage(sprite(spriteOf(lead))[p.dir][0], x - 4, y - 14);
    ctx.drawImage(BOAT, x - 4, y - 4 + ((F.frame >> 4) % 2));
  }
  ctx.drawImage(F.gfx.upper, -cx, -cy);
  if (F.mode === 'drake') {
    const x = Math.round(p.px) - cx, y = Math.round(p.py) - cy;
    ctx.drawImage(shadow, x + 1, y + 12);
    const d = drakeArt(), sc = 0.45, w = d.width * sc, h = d.height * sc;
    ctx.save();
    if (p.dir === 'r') { ctx.translate(x + 8 + w / 2, 0); ctx.scale(-1, 1); ctx.drawImage(d, 0, y - h + 4 + Math.sin(F.frame / 10) * 2, w, h); }
    else ctx.drawImage(d, x + 8 - w / 2, y - h + 4 + Math.sin(F.frame / 10) * 2, w, h);
    ctx.restore();
  }
  if (F.map.dark) {
    const g = ctx.createRadialGradient(p.px - cx + 8, p.py - cy + 8, 30, p.px - cx + 8, p.py - cy + 8, 150);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${F.map.dark})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (F.map.tint) { ctx.fillStyle = F.map.tint; ctx.fillRect(0, 0, W, H); }
  if (F.banner > 0 && F.def.name) {
    const name = typeof F.def.name === 'function' ? F.def.name() : F.def.name;
    const a = Math.min(1, F.banner / 20, (130 - F.banner) / 10 + 0.01);
    const w = textW(name) + 28;
    ctx.globalAlpha = Math.max(0, a);
    windowBox((W - w) / 2, 12, w, 24);
    text(name, W / 2, 18, '#f8f8f8', { align: 'center' });
    ctx.globalAlpha = 1;
  }
  if (F.mode === 'drake' && !F.busy && !UI.active) { windowBox(W - 98, H - 26, 94, 22); text(L('Z 降落', 'Z: Land'), W - 51, H - 21, '#f8f8f8', { align: 'center' }); }
}
function drawEnt(e, cx, cy) {
  const x = Math.round(e.px) - cx, y = Math.round(e.py) - cy;
  const anim = Math.floor(F.frame / 8) % 4;
  switch (e.type) {
    case 'hero': case 'npc': {
      if (e.hidden || !e.sprite) return;
      const sp = sprite(e.sprite);
      const fr = e.pose ? sp[e.pose + '_' + (e.dir || 'd')] : sp[e.dir || 'd'];
      const k = e.pose ? Math.min(fr.length - 1, Math.floor(F.frame / 8) % fr.length) : e.walking || e.walkAnim ? anim : 0;
      ctx.drawImage(shadow, x + 1, y + 12);
      if (e.ghost) ctx.globalAlpha = 0.55;
      if (e.lying) { ctx.save(); ctx.translate(x + 8, y + 10); ctx.rotate(-Math.PI / 2); ctx.drawImage(fr[0], -12, -18); ctx.restore(); }
      else ctx.drawImage(fr[k], x - 4, y - 9);
      ctx.globalAlpha = 1;
      if (e.bubble) { windowBox(x - 2, y - 30, 20, 18); text(e.bubble, x + 8, y - 26, '#f8e070', { align: 'center' }); }
      break;
    }
    case 'chest': ctx.drawImage(CHEST[e.open ? 1 : 0], x, y); break;
    case 'glint': ctx.drawImage(GLINT[(F.frame >> 3) % 4], x, y); break;
    case 'ride':
      if (e.kind === 'boat') ctx.drawImage(BOAT, x - 4, y - 4 + ((F.frame >> 4) % 2));
      else { const d = drakeArt(), sc = 0.45; ctx.drawImage(shadow, x + 1, y + 12); ctx.drawImage(d, x + 8 - (d.width * sc) / 2, y + 14 - d.height * sc, d.width * sc, d.height * sc); }
      break;
    case 'sprite': if (e.draw) e.draw(ctx, x, y, F.frame); break;
    case 'fish': {
      // rings spreading on the water where fish gather
      const k = (F.frame % 60) / 60;
      ctx.strokeStyle = e.spot === 'ice' ? 'rgba(40,60,90,0.9)' : 'rgba(255,255,255,0.75)';
      if (e.spot === 'ice') { ctx.fillStyle = '#284060'; ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 6, 4, 0, 0, 7); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 2 + k * 6, 1 + k * 3, 0, 0, 7); ctx.stroke();
      if (k > 0.5) { ctx.beginPath(); ctx.ellipse(x + 8, y + 9, 2 + (k - 0.5) * 6, 1 + (k - 0.5) * 3, 0, 0, 7); ctx.stroke(); }
      break;
    }
    default: break;
  }
}

// ---------- script helpers ----------
export function walkEnt(e, path, speed = 1) {
  return new Promise((res) => {
    const steps = path.split('');
    const next = () => {
      const d = steps.shift();
      if (!d) { e.walkAnim = false; res(); return; }
      const [dx, dy] = DV[d];
      e.dir = d; e.x += dx; e.y += dy; e.speed = speed; e.walkAnim = true;
      e.onArrive = next;
    };
    next();
  });
}
export function walkPlayer(path) {
  return new Promise((res) => {
    const steps = path.split('');
    const p = F.p;
    const tick = () => {
      if (p.moving) { setTimeout(tick, 16); return; }
      const d = steps.shift();
      if (!d) { p.walking = false; res(); return; }
      const [dx, dy] = DV[d];
      p.dir = d; p.walking = true; p.x += dx; p.y += dy; p.moving = true;
      setTimeout(tick, 16);
    };
    tick();
  });
}
export function findEnt(id) { return F.ents.find((e) => e.id === id && !e.gone); }
export const solidAt = (x, y) => blocked(x, y);
