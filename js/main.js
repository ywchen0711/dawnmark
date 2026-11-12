// Boot, the main loop, title, prologue, transitions, the story toolbox, being carried back to the
// church when the party falls, and the ending.
import { ctx, W, H, canvas, text, textW, windowBox, HAND, tint } from './gfx.js';
import * as gfx from './gfx.js';
import { input, pollInput, endInput, setupTouch } from './input.js';
import { initAudio, playMusic, stopMusic, sfx, currentSong } from './audio.js';
import { UI, uiTick, say, talk, ask, wait, menu, notice } from './ui.js';
import { S, reset, addMember, removeMember, addItem, fullHeal, save, load, hasSave, stats, member, spriteOf, heroName, has } from './party.js';
import { ZONES, BOSSES, BG, MON, nm, expFor } from './data.js';
import { TILES } from './tiles.js';
import { MAPS, WORLD, ZOOM } from './maps.js';
import { F, setMaps, loadMap, updateField, drawField, walkEnt, walkPlayer, findEnt, solidAt, placeRide } from './field.js';
import { startBattle, updateBattle, drawBattle, _B, settings as bset, battleState } from './battle.js';
import { fieldMenu, shop, loadSettings, setMenuHooks } from './menu.js';
import { SCRIPTS } from './story.js';
import './maps2.js';
import './story2.js';
import './episodes.js';
import { showBook, showJournal, useTreasureMap } from './games.js';
import { sprite, face, monArt } from './sprites.js';
import { L, LANG, isEn, setLang, onLang } from './i18n.js';

setMaps(MAPS);
function pageLang() {
  document.documentElement.lang = isEn() ? 'en' : 'zh-Hant';
  const mb = document.getElementById('menuBtn'); if (mb) mb.textContent = L('選單', 'MENU');
}
pageLang(); onLang(pageLang);
loadSettings();
for (const m of Object.values(MAPS)) { const b = m.build; m.build = () => b(S.flags); }

let scene = 'boot';
const G = (window.G = { S, F, get scene() { return scene; }, SCRIPTS, UI, _B, bset });

// ---------- transitions ----------
const T = { dark: 0, col: '#000', job: null };
function trans(kind, n = 16, col = '#000') { return new Promise((res) => { T.job = { kind, n, t: 0, res }; T.col = col; }); }
function updateTrans() {
  const j = T.job;
  if (!j) return;
  j.t++;
  const k = Math.min(1, j.t / j.n);
  if (j.kind === 'out') T.dark = Math.ceil(k * 8) / 8;
  if (j.kind === 'in') T.dark = Math.floor((1 - k) * 8) / 8;
  if (j.kind === 'battle') { T.swirl = k; T.dark = k > 0.7 ? (k - 0.7) / 0.3 : 0; }
  if (j.t >= j.n) { T.job = null; T.swirl = 0; if (j.kind === 'battle') T.dark = 1; j.res(); }
}
function drawTrans() {
  if (T.swirl) {
    // the screen folds in from the edges
    const snap = canvas(W, H); snap.x.drawImage(ctx.canvas, 0, 0, W, H);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const k = T.swirl, bands = 14;
    for (let i = 0; i < bands; i++) {
      const y = (i * H) / bands, h = H / bands, w = W * (1 - k) * (i % 2 ? 1 : 0.85);
      ctx.drawImage(snap, 0, y, W, h, (W - w) / 2, y, w, h);
    }
  }
  if (T.dark > 0) { ctx.globalAlpha = T.dark; ctx.fillStyle = T.col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (FX.flash > 0) { ctx.globalAlpha = Math.min(1, FX.flash / FX.flashN); ctx.fillStyle = FX.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
const FX = { flash: 0, flashN: 1, flashCol: '#fff' };

// ---------- the toolbox handed to story scripts ----------
const mapMusic = () => (F.mode === 'boat' ? 'sea' : F.mode === 'drake' ? 'anthem' : S.flags.fallen && F.def.world ? 'lament' : F.def.music);
const E = {
  say, talk, ask, wait, sfx,
  music: (n) => (n ? playMusic(n) : stopMusic(0.6)),
  ent: (id) => findEnt(id),
  walk: (e, path, sp) => walkEnt(e, path, sp),
  walkPlayer,
  join(id, lv) { const h = addMember(id, lv); S.flags['has_' + id] = true; sfx('comrade'); return h; },
  leave(id) { const h = removeMember(id); if (h) { E._stashed = E._stashed || {}; E._stashed[id] = h; } return h; },
  give(id, n = 1) { addItem(id, n); },
  heal: fullHeal,
  save: () => save(0),
  async rest(msg, name = null) {
    await trans('out', 20);
    stopMusic(); sfx('inn');
    fullHeal();
    await wait(130);
    playMusic(mapMusic());
    await trans('in', 20);
    if (msg) await say(name, msg);
  },
  shop,
  battle: (troop, opts) => runBattle(troop, opts),
  removeEnt(x) { const e = typeof x === 'string' ? findEnt(x) : x; if (e) e.gone = true; },
  spawn(e) { const o = { px: e.x * 16, py: e.y * 16, ...e }; F.ents.push(o); return o; },
  flash(col, n) { FX.flash = n; FX.flashN = n; FX.flashCol = col; return wait(Math.ceil(n / 2)); },
  shake(n) { F.shake = n; },
  async fadeOut(n = 30) { await trans('out', n); },
  async fadeIn(n = 30) { await trans('in', n); },
  async warp(to, x, y, dir, keepDark) { await warpTo(to, x, y, dir, keepDark); },
  refresh() { const p = F.p; loadMap(S.map, p.x, p.y, p.dir); F.banner = 0; },
  placeRide,
  placeRideNear(kind, x, y) { const at = nearWater(x, y); if (at) placeRide(kind, 'world', at[0], at[1]); },
  // friends scattered by the fall wait here until they are found again
  stash(ids) { S.stash = S.stash || {}; for (const id of ids) { const h = E._stashed && E._stashed[id]; if (h) S.stash[id] = h; } },
  unstash(id) {
    const h = S.stash && S.stash[id];
    if (!h) return;
    delete S.stash[id];
    const all = [...S.members, ...S.reserve], avg = Math.round(all.reduce((a, m) => a + m.lv, 0) / Math.max(1, all.length));
    // they kept fighting while apart
    while (h.lv < avg - 1) { h.lv++; h.sp += 4 + Math.floor(h.lv / 4); }
    h.exp = Math.max(h.exp, expFor(h.lv));
    h.hp = stats(h).maxhp; h.mp = stats(h).maxmp; h.st = {};
    if (S.members.length < 4) S.members.push(h); else S.reserve.push(h);
  },
  fullHealParty() { fullHeal(); },
  get p() { return F.p; },
  ending: () => ending(),
  zoom: () => zoomMenu(),
  church: (who) => church(who),
  inn: (price, who) => inn(price, who),
  get T() { return T; },
};
F.E = E;
G.E = E;
F.runScript = async (name, ent) => {
  const fn = SCRIPTS[name];
  if (!fn) { console.warn('no script', name); return; }
  F.busy = true;
  let res;
  try { res = await fn(E, ent); } catch (err) { console.error(err); }
  // a boss that won lets its trigger fire again
  if (res === false && ent && ent.once) S.flags[ent.once] = false;
  F.busy = false;
  if (T.dark > 0 && !T.job) await trans('in', 20);
};
F.onWarp = async (w) => {
  if (w.need && !w.need(S.flags)) { F.busy = true; await say(null, w.msg ? w.msg() : L('前面過不去。', "You can't go that way.")); F.busy = false; await stepBack(); return; }
  F.busy = true;
  sfx(MAPS[w.to] && MAPS[w.to].world ? 'door' : 'stairs');
  await warpTo(w.to, w.tx, w.ty, w.dir);
  F.busy = false;
};
// after bumping into a closed way, step back off it
async function stepBack() {
  const p = F.p, back = { u: 'd', d: 'u', l: 'r', r: 'l' }[p.dir];
  const [dx, dy] = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[back];
  if (!solidAt(p.x + dx, p.y + dy)) { F.busy = true; await walkPlayer(back); F.busy = false; p.dir = { u: 'd', d: 'u', l: 'r', r: 'l' }[back]; }
}
F.onMenu = async () => {
  F.busy = true; sfx('ok');
  const z = await fieldMenu({ canSave: !!(F.def.world && F.mode === 'walk') });
  if (z) await zoomTo(z);
  F.busy = false;
};
const ZONE_LV = { crag: 3, road: 4, meadow: 6, sewer: 7, river: 10, temple: 12, grotto: 13, coast: 14, sea: 15, luck: 16, volcano: 16, desert: 19, ruins: 20, mines: 21, snow: 23, frost: 24, east: 25, choir: 25, monastery: 25, galespire: 26, sea2: 26, tower: 27, jungle: 28, fen: 30, dark: 30, dark2: 32, keep: 32, garden: 33, archive: 34, dark3: 34, citadel: 36, starwell2: 44, starwell: 46 };
F.onEncounter = async (zone) => {
  const lv = S.members.reduce((a, m) => a + m.lv, 0) / Math.max(1, S.members.length);
  if (S.repel > 0 && lv >= (ZONE_LV[zone] || 0)) return;
  F.busy = true;
  const troop = pickTroop(zone);
  await runBattle(troop, { zone, dark: S.flags.fallen && !['dark', 'dark2', 'dark3', 'citadel', 'archive', 'keep', 'garden', 'starwell', 'starwell2'].includes(zone) });
  F.busy = false;
};
function pickTroop(zone) {
  const table = ZONES[zone], total = table.reduce((s, [w]) => s + w, 0);
  let r = Math.random() * total, troop = table[0][1];
  for (const [w, t] of table) { r -= w; if (r <= 0) { troop = t; break; } }
  return troop;
}
F.onStep = () => {
  if (S.steps % 4 === 0) for (const m of S.members) if (m.st.poison && m.hp > 1) { m.hp--; FX.flash = 3; FX.flashN = 6; FX.flashCol = '#a040c0'; }
};
F.onBoard = (kind) => playMusic(kind === 'drake' ? 'anthem' : 'sea');
F.onLand = () => playMusic(mapMusic());

async function warpTo(to, x, y, dir, keepDark) {
  if (!keepDark || T.dark < 1) await trans('out', 14);
  if (MAPS[to] && !MAPS[to].world) F.mode = 'walk';
  loadMap(to, x, y, dir);
  if (F.def.town && !S.visited.includes(F.def.town)) S.visited.push(F.def.town);
  playMusic(mapMusic());
  await trans('in', 14);
}
async function runBattle(troop, opts = {}) {
  let boss = false;
  if (typeof troop === 'string') { boss = true; troop = BOSSES[troop]; }
  sfx('encounter');
  stopMusic();
  await trans('battle', 30);
  scene = 'battle';
  T.dark = 0;
  const zone = opts.zone || (F.map.zone && F.map.zone(F.p.x, F.p.y, F.mode)) || 'meadow';
  if (!opts.music && !boss && !opts.boss && /^starwell/.test(zone)) opts = { ...opts, music: 'tides' };
  const r = await startBattle(troop, { zone, boss: boss || opts.boss, ...opts, bg: opts.bg || BG[opts.bgZone || zone] });
  if (r === 'lose' && !opts.canLose) { await carriedBack(); return 'lose'; }
  if (r === 'lose') fullHeal();
  scene = 'field';
  T.dark = 1;
  playMusic(mapMusic(), { restart: true });
  await trans('in', 16);
  return r;
}
// the party wakes in the last church they prayed at, with half their gold
async function carriedBack() {
  await trans('out', 30);
  scene = 'field';
  const c = S.church || { map: 'bf_chapel', x: 7, y: 6 };
  S.gold = Math.floor(S.gold / 2);
  fullHeal();
  F.mode = 'walk';
  loadMap(c.map, c.x, c.y, 'u');
  F.banner = 0;
  playMusic('peace', { restart: true });
  T.dark = 1;
  await trans('in', 40);
  F.busy = true;
  await say('神父', L('……醒過來了嗎。你們全都倒下了，是旅人把你們送來的。\n光還沒有放棄你們。再去吧。', '...You are awake. You had all fallen, and travellers carried you here.\nThe light has not given up on you. Go on.'));
  await say(null, L('（金幣少了一半。）', '(Half of your gold is gone.)'));
  F.busy = false;
}
async function church(who = '神父') {
  const r = await ask(who, L('迷途的孩子們啊，有什麼需要嗎？', 'Children of the light, what do you seek?'), [L('記錄冒險', 'Save'), L('復活同伴', 'Revive'), L('治療中毒', 'Cure poison'), L('沒事', 'Nothing')]);
  if (r === 0) {
    S.church = { map: S.map, x: F.p.x, y: F.p.y };
    const ok = save(0); sfx(ok ? 'church' : 'buzz');
    await say(who, ok ? L('你們的冒險，已經記錄在光之書中了。願光指引你們。', 'Your deeds are written in the Book of Light. May the light guide you.') : L('……書頁怎麼也寫不上去。（瀏覽器不允許存檔）', '...The page will not take the ink. (The browser blocked saving.)'));
  }
  if (r === 1) {
    const dead = [...S.members, ...S.reserve].filter((m) => m.hp <= 0);
    if (!dead.length) { await say(who, L('大家都好好的呢。', 'Everyone is well.')); return; }
    for (const m of dead) {
      const price = m.lv * 10;
      const k = await ask(who, L(`要讓${heroName(m)}復活，需要 ${price} 金幣的奉獻。`, `To revive ${heroName(m)} needs an offering of ${price} gold.`), [L('奉獻', 'Offer'), L('不了', 'No')]);
      if (k !== 0) continue;
      if (S.gold < price) { await say(who, L('……奉獻好像不夠呢。', '...The offering is not enough.')); continue; }
      S.gold -= price; m.hp = stats(m).maxhp; m.mp = Math.max(m.mp, 0); sfx('church');
      await say(who, L(`${heroName(m)}復活了！`, `${heroName(m)} lives again!`));
    }
  }
  if (r === 2) {
    const sick = [...S.members, ...S.reserve].filter((m) => m.st.poison);
    if (!sick.length) { await say(who, L('沒有人中毒呢。', 'No one is poisoned.')); return; }
    for (const m of sick) { delete m.st.poison; }
    sfx('heal'); await say(who, L('毒已經解除了。', 'The poison is gone.'));
  }
  if (r < 0 || r === 3) await say(who, L('願光指引你們。', 'May the light guide you.'));
}
async function inn(price, who = '旅店老闆') {
  const r = await ask(who, L(`歡迎光臨！住一晚 ${price} 金幣，要休息嗎？`, `Welcome! It's ${price} gold a night. Will you stay?`), [L('住宿', 'Stay'), L('不用了', 'No thanks')]);
  if (r !== 0) { await say(who, L('歡迎再來！', 'Come again!')); return; }
  if (S.gold < price) { await say(who, L('……錢好像不太夠呢。', "...You don't seem to have enough.")); return; }
  S.gold -= price;
  await E.rest(L('早安！昨晚睡得好嗎？路上小心喔。', 'Good morning! Did you sleep well? Take care out there.'), who);
}
// the nearest water to a world-map spot (for the boat), or land (for the drake)
function nearWater(x0, y0, land = false) {
  const m = MAPS.world.build();
  const ok = (x, y) => { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false; const k = m.kindAt(x, y); return land ? !TILES[k] || (!TILES[k].solid && !TILES[k].water) : !!(TILES[k] && TILES[k].water); };
  for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && ok(x0 + dx, y0 + dy)) return [x0 + dx, y0 + dy];
  return null;
}
// the drake whistle
async function whistle() {
  if (!F.def.world || F.mode !== 'walk') { await notice(L('在這裡吹笛子，也什麼都不會來。', 'Nothing will come if you blow it here.')); return; }
  sfx('chime');
  if (S.ride && S.ride.kind === 'drake' && S.ride.map === 'world') for (const e of F.ents) if (e.type === 'ride' && e.kind === 'drake') e.gone = true;
  const p = F.p;
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) if (!solidAt(p.x + dx, p.y + dy)) { placeRide('drake', 'world', p.x + dx, p.y + dy); break; }
  await notice(L('天龍從雲間飛了下來！', 'The sky drake swoops down from the clouds!'));
}
// Homeward and the feather
async function zoomMenu() {
  if (!F.def.world && !F.def.town && !F.def.safe) { await notice(L('在這裡沒辦法飛。', "You can't fly from here.")); return null; }
  const list = Object.keys(ZOOM).filter((k) => S.visited.includes(k));
  if (!list.length) { await notice(L('還沒有去過任何城鎮。', "You haven't been to any towns yet.")); return null; }
  const r = await menu(list.map((k) => L(ZOOM[k].n[0], ZOOM[k].n[1])), { x: 80, y: 40, w: 150, title: L('要飛去哪裡？', 'Fly where?') });
  return r < 0 ? null : list[r];
}
setMenuHooks({ zoom: zoomMenu, whistle, book: showBook, journal: showJournal, tmap: (id) => useTreasureMap(E, id, { world: !!F.def.world, x: F.p.x, y: F.p.y }) });
async function zoomTo(k) {
  F.busy = true;
  sfx('zoom');
  await trans('out', 20, '#ffffff');
  F.mode = 'walk';
  const [x, y] = ZOOM[k].at;
  loadMap('world', x, y, 'd');
  playMusic(mapMusic());
  T.col = '#ffffff';
  await trans('in', 20, '#ffffff');
  T.col = '#000';
  F.busy = false;
}

// ---------- title ----------
const title = { t: 0, sel: 0, ready: false };
function updateTitle() {
  title.t++;
  if (!title.ready) { if (input.anyPressed()) { title.ready = true; sfx('ok'); } return; }
  if (UI.active || T.job) return;
  const opts = titleOpts();
  if (input.repeat('down')) { title.sel = (title.sel + 1) % opts.length; sfx('cursor'); }
  if (input.repeat('up')) { title.sel = (title.sel + opts.length - 1) % opts.length; sfx('cursor'); }
  if (input.pressed('a')) {
    if (opts[title.sel].disabled) { sfx('buzz'); return; }
    sfx('ok');
    const id = opts[title.sel].id;
    if (id === 'new') newGame();
    else if (id === 'lang') setLang(LANG === 'en' ? 'zh' : 'en');
    else continueGame();
  }
  if (input.pressed('b')) title.ready = false;
}
const titleOpts = () => [{ id: 'new', label: L('新的冒險', 'New Adventure') }, { id: 'cont', label: L('繼續冒險', 'Continue'), disabled: !hasSave(0) }, { id: 'lang', label: LANG === 'en' ? 'Language: English' : '語言：中文' }];
function bigText(s, x, y, top, bot, scale = 2) {
  const w = textW(s) + 4, c = canvas(w, 16);
  c.x.drawImage(gfx.glyphs(s, '#ffffff'), 1, 0);
  const id = c.x.getImageData(0, 0, w, 16), d = id.data;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < w; xx++) {
    const i = (yy * w + xx) * 4;
    if (d[i + 3] > 110) { const t = Math.floor((yy / 13) * 3) / 3; d[i] = top[0] + (bot[0] - top[0]) * t; d[i + 1] = top[1] + (bot[1] - top[1]) * t; d[i + 2] = top[2] + (bot[2] - top[2]) * t; d[i + 3] = 255; } else d[i + 3] = 0;
  }
  c.x.putImageData(id, 0, 0);
  const o = canvas(w + 2, 18);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2], [2, 2]]) o.x.drawImage(tint(c, '#000000'), dx, dy);
  o.x.drawImage(c, 1, 1);
  ctx.drawImage(o, Math.round(x - (o.width * scale) / 2), y, o.width * scale, o.height * scale);
}
// a dawn sky over the mountains, the tower of light in the middle, a star falling
function drawSky(t, dark = false) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (dark) { g.addColorStop(0, '#080010'); g.addColorStop(1, '#301028'); }
  else { g.addColorStop(0, '#101848'); g.addColorStop(0.5, '#583880'); g.addColorStop(0.8, '#e07858'); g.addColorStop(1, '#f8c070'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { const x = (i * 97 + 13) % W, y = (i * 61) % 110; if ((t + i * 11) % 140 < 120) { ctx.fillStyle = i % 7 ? '#a0a0d8' : '#ffffff'; ctx.fillRect(x, y, 1, 1); } }
  // the tower of light
  const tx = 128;
  ctx.fillStyle = dark ? '#1a0a20' : '#2a2048';
  ctx.fillRect(tx - 5, 40, 10, 150); ctx.fillRect(tx - 8, 120, 16, 70); ctx.fillRect(tx - 3, 26, 6, 14);
  if (!dark) { ctx.globalAlpha = 0.3 + Math.sin(t / 25) * 0.1; ctx.fillStyle = '#fff8d0'; ctx.fillRect(tx - 1, 0, 2, 40); ctx.globalAlpha = 1; }
  // mountains
  ctx.fillStyle = dark ? '#0a0410' : '#20183a';
  ctx.beginPath(); ctx.moveTo(0, 190);
  const peaks = [[0, 170], [30, 150], [62, 172], [90, 140], [118, 176], [150, 158], [180, 132], [214, 168], [240, 150], [256, 164]];
  for (const [x, y] of peaks) ctx.lineTo(x, y);
  ctx.lineTo(256, 224); ctx.lineTo(0, 224); ctx.fill();
  ctx.fillStyle = dark ? '#050208' : '#140e26'; ctx.fillRect(0, 196, W, 28);
  // the falling star
  const k = (t % 300) / 300;
  if (!dark && k < 0.5) {
    const sx = 220 - k * 260, sy = 10 + k * 140;
    ctx.fillStyle = '#fff8e0'; ctx.fillRect(sx, sy, 3, 3);
    for (let i = 1; i < 8; i++) { ctx.globalAlpha = 1 - i / 8; ctx.fillRect(sx + i * 3, sy - i * 1.6, 2, 2); }
    ctx.globalAlpha = 1;
  }
}
function drawTitle() {
  const t = title.t;
  drawSky(t);
  if (isEn()) { bigText('THE DAWNMARK', W / 2, 56, [255, 248, 220], [248, 176, 88], 2); text('晨星之印', W / 2, 94, '#f8e0b0', { align: 'center' }); }
  else { bigText('晨星之印', W / 2, 50, [255, 248, 220], [248, 176, 88], 3); text('THE DAWNMARK', W / 2, 102, '#f8e0b0', { align: 'center' }); }
  if (!title.ready) {
    if ((t >> 5) % 2) text('PRESS START', W / 2, 150, '#ffffff', { align: 'center' });
    text(L('Z 決定　X 取消　C 選單', 'Z: OK   X: Cancel   C: Menu'), W / 2, 200, '#d0c8e8', { align: 'center' });
  } else {
    const opts = titleOpts();
    windowBox(60, 130, 136, 64);
    opts.forEach((o, i) => text(o.label, 84, 138 + i * 17, o.disabled ? '#787890' : '#f8f8f8'));
    ctx.drawImage(HAND, 68 + ((t >> 3) % 2), 139 + title.sel * 17);
  }
  text(L('© 2026 原創作品', '© 2026 An original game'), W / 2, H - 13, '#a090c0', { align: 'center', shadow: null });
}

// ---------- prologue ----------
const PRO = () => (isEn() ? [
  'At the heart of the world stands',
  'a tower that reaches the sky:',
  'the Skyloom.',
  '',
  'At its top, the Weaver spins every',
  'life in the world from threads of light.',
  '',
  'It is said that when darkness comes',
  'to unpick those threads, a child with',
  'the Dawnmark will fall from the sky.',
  '',
  'Sixteen years ago, a star fell on',
  'the mountain above Brightfall...',
] : [
  '在世界的正中央，',
  '矗立著一座直通天際的高塔——',
  '天織塔。',
  '',
  '塔頂的「織母」，用光之絲線，',
  '編織著世上每一個生命。',
  '',
  '傳說，當黑暗想要拆散這些絲線時，',
  '一個手上帶著「晨星之印」的孩子，',
  '就會從天而降。',
  '',
  '十六年前的一個夜晚，',
  '一顆星星落在亮瀑村的山上……',
]);
const intro = { t: 0 };
async function newGame() {
  await trans('out', 30);
  reset();
  addMember('rowan', 1);
  scene = 'intro'; intro.t = 0; intro.leaving = false;
  playMusic('theme', { restart: true });
  T.dark = 0;
}
function updateIntro() {
  intro.t++;
  const done = intro.t > PRO().length * 40 + 240;
  if ((input.pressed('a') || done) && !T.job && !intro.leaving) {
    intro.leaving = true;
    (async () => {
      await trans('out', 30);
      scene = 'field';
      loadMap('bf_home', 3, 4, 'd');
      F.banner = 0;
      S.visited = ['bright'];
      playMusic('village');
      await trans('in', 30);
      F.runScript('opening');
    })();
  }
}
function drawIntro() {
  drawSky(intro.t);
  ctx.fillStyle = 'rgba(0,0,16,0.55)'; ctx.fillRect(0, 0, W, H);
  PRO().forEach((l, i) => {
    const a = Math.max(0, Math.min(1, (intro.t - i * 40) / 36));
    if (a <= 0) return;
    ctx.globalAlpha = a;
    text(l, W / 2, 6 + i * 16, '#f0e8f8', { align: 'center' });
  });
  ctx.globalAlpha = 1;
}

// ---------- continue ----------
async function continueGame() {
  await trans('out', 20);
  if (!load(0)) { await trans('in', 10); return; }
  scene = 'field';
  F.mode = 'walk';
  loadMap(S.map, S.x, S.y, S.dir);
  playMusic(mapMusic());
  await trans('in', 20);
}

// ---------- ending ----------
async function ending() {
  await SCRIPTS.ending_scenes(E);
  await trans('out', 60);
  scene = 'credits'; credits.t = 0; credits.leaving = false;
  playMusic('hymn', { restart: true });
  T.dark = 0;
  S.flags.cleared = true;
  save(1);
}
const CREDITS = () => (isEn() ? [
  ['THE DAWNMARK', 'big'], ['晨星之印'], [''], [''],
  ['- CAST -', 'y'], ['Rowan, the Dawnbearer'], ['Pell, thief of Solhaven'], ['Mirela, priestess of Riverlight'], ['Odo, the wandering monk'], ['Sera, the Weaver\'s apprentice'], ['Brannoc, knight of Solhaven'], [''],
  ['Wren   Grandpa Tobin   King Aurel'], ['Rena   Lumi   Corin   Varro'], ['Ysolde   Cordelia   Master Ennick'], ['Kestrel   the Queen of Sandmere'], ['High Seer Morrow (Mattias)'], ['and the Unweaver'], [''], [''],
  ['- ART -', 'y'], ['Characters and portraits:'], ['Charles Gabriel (repack by Jorhlok)'], ['Monsters: Stephen "Redshrike" Challener,'], ['JosephSeraph, Blarumyrran, Balmer,'], ['Charles Gabriel (Antifarea),'], ['troutsneeze (Monster RPG 2)'], ['Tiles: ArMM1998'], ['Battle backgrounds: troutsneeze'], [''],
  ['- MUSIC -', 'y'], ['Juhani Junkala (SubspaceAudio)'], ['Hydrogene'], [''], ['Font: Cubic 11'], ['Hosted by OpenGameArt.org'], [''], [''],
  ['THANK YOU FOR PLAYING!', 'y'], [''], [''], ['THE END', 'big'],
] : [
  ['晨星之印', 'big'], ['THE DAWNMARK'], [''], [''],
  ['— 登場人物 —', 'y'], ['洛恩　晨星之子'], ['佩兒　索爾海文的盜賊'], ['米蕾拉　河光神殿的神官'], ['歐多　流浪的武僧'], ['瑟菈　織母的弟子'], ['布藍諾　索爾海文的騎士'], [''],
  ['小雀　托賓爺爺　歐瑞爾王'], ['蕾娜　露米　柯林　瓦羅'], ['伊索德　柯黛莉亞修女　恩尼克師父'], ['凱斯卓　沙梅爾女王'], ['大祭司莫洛（馬提亞斯）'], ['以及　解織者'], [''], [''],
  ['— 美術 —', 'y'], ['人物與肖像：Charles Gabriel'], ['（Jorhlok 整理）'], ['怪物：Stephen "Redshrike" Challener、'], ['JosephSeraph、Blarumyrran、Balmer、'], ['Charles Gabriel (Antifarea)、'], ['troutsneeze (Monster RPG 2)'], ['地圖：ArMM1998'], ['戰鬥背景：troutsneeze'], [''],
  ['— 音樂 —', 'y'], ['Juhani Junkala (SubspaceAudio)'], ['Hydrogene'], [''], ['字型：俐方體11號 (Cubic 11)'], ['素材來自 OpenGameArt.org'], [''], [''],
  ['感謝你的遊玩！', 'y'], [''], [''], ['—— 完 ——', 'big'],
]);
const credits = { t: 0 };
function updateCredits() {
  credits.t++;
  const end = CREDITS().length * 18 * 2 + H * 2;
  if (credits.t > end && input.pressed('a') && !T.job && !credits.leaving) {
    credits.leaving = true;
    (async () => {
      await trans('out', 40);
      if (S.flags.postgame) { scene = 'title'; title.ready = false; playMusic('title'); await trans('in', 40); return; }
      // a few months later, back in Brightfall: the world after the end
      scene = 'field'; F.mode = 'walk';
      loadMap('brightfall', 15, 9, 'u'); F.banner = 0;
      S.church = { map: 'bf_chapel', x: 7, y: 6 };
      playMusic('village');
      await trans('in', 40);
      await F.runScript('postgame_start');
      F.busy = true;
      const r = await ask(null, L('要記錄冒險嗎？（之後可以從「繼續冒險」接著玩）', 'Save your adventure? (You can carry on later from "Continue".)'), [L('記錄', 'Save'), L('不用', 'No')]);
      if (r === 0) { const ok = save(0); sfx(ok ? 'save' : 'buzz'); }
      F.busy = false;
    })();
  }
}
function drawCredits() {
  drawSky(credits.t);
  ctx.fillStyle = 'rgba(0,0,16,0.55)'; ctx.fillRect(0, 0, W, H);
  const y0 = H - credits.t / 2, list = CREDITS();
  list.forEach(([s, k], i) => {
    let y = y0 + i * 18;
    if (k === 'big' && i === list.length - 1) y = Math.max(y, 90);
    if (y < -20 || y > H) return;
    if (k === 'big') bigText(s, W / 2, y - 6, [255, 248, 220], [248, 176, 88], 2);
    else text(s, W / 2, y, k === 'y' ? '#f8e070' : '#f0e8f8', { align: 'center' });
  });
  [...S.members, ...S.reserve].forEach((m, i) => { const fr = sprite(spriteOf(m)).r[Math.floor(credits.t / 8) % 4]; ctx.drawImage(fr, ((credits.t * 0.5 + 40 - i * 22) % (W + 120)) - 40, H - 32); });
}

// ---------- the loop ----------
let acc = 0, last = performance.now();
function step() {
  pollInput();
  uiTick();
  updateTrans();
  if (FX.flash > 0) FX.flash--;
  if (scene === 'field' || scene === 'battle') S.time++;
  if (UI.active) UI.update();
  switch (scene) {
    case 'title': updateTitle(); break;
    case 'intro': updateIntro(); break;
    case 'field': if (!T.job) updateField(); else F.frame++; break;
    case 'battle': updateBattle(); break;
    case 'credits': updateCredits(); break;
  }
  endInput();
}
function draw() {
  switch (scene) {
    case 'boot': ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); text('Loading…', W / 2, H / 2 - 6, '#fff', { align: 'center' }); break;
    case 'title': drawTitle(); break;
    case 'intro': drawIntro(); break;
    case 'field': drawField(); break;
    case 'battle': drawBattle(); break;
    case 'credits': drawCredits(); break;
  }
  UI.draw();
  drawTrans();
}
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  let n = 0;
  const steps = G.turbo || 1;
  while (acc >= 1000 / 60 && n < 4 * steps) { for (let k = 0; k < steps; k++) step(); acc -= 1000 / 60; n += steps; }
  if (n) { draw(); gfx.present(!document.body.classList.contains('noscan')); }
  requestAnimationFrame(frame);
}
const unlock = () => initAudio();
addEventListener('keydown', unlock); addEventListener('pointerdown', unlock); addEventListener('touchstart', unlock);

async function boot() {
  try { await document.fonts.load('12px Cubic11'); } catch (e) { /* fall back */ }
  await new Promise((r) => setTimeout(r, 30));
  setupTouch();
  scene = 'title';
  playMusic('title');
  window.READY = 1;
}
requestAnimationFrame(frame);
boot();

// hooks for automated checks
Object.assign(G, {
  solidAt, T, newGame, continueGame, loadMap, trans, runBattle, addMember, stats, fullHeal, WORLD, MAPS, MON, battleState,
  go(map, x, y, dir = 'd') { scene = 'field'; T.dark = 0; F.mode = 'walk'; loadMap(map, x, y, dir); playMusic(MAPS[map].music); },
  setScene(s) { scene = s; },
  async sim(troop, opts = {}) { if (typeof troop === 'string') troop = BOSSES[troop] || [troop]; scene = 'battle'; T.dark = 0; const r = await startBattle(troop, { boss: true, noMusic: true, ...opts }); scene = 'field'; return r; },
  uiActive: () => UI.active,
  route(tx, ty) {
    const { w, h } = F.map, sx = F.p.x, sy = F.p.y, prev = new Map(), q = [[sx, sy]];
    const solid = (x, y) => x < 0 || y < 0 || x >= w || y >= h || (G.solidAt && G.solidAt(x, y)) || F.ents.some((e) => !e.gone && (e.type === 'warp' || e.type === 'trigger') && e.x === x && e.y === y);
    prev.set(sx + ',' + sy, null);
    while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break; for (const [dx, dy, d] of [[0, -1, 'u'], [0, 1, 'd'], [-1, 0, 'l'], [1, 0, 'r']]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (prev.has(k) || (solid(nx, ny) && !(nx === tx && ny === ty))) continue; prev.set(k, [x, y, d]); q.push([nx, ny]); } }
    let k = tx + ',' + ty, out = '';
    if (!prev.has(k)) return null;
    while (prev.get(k)) { const [x, y, d] = prev.get(k); out = d + out; k = x + ',' + y; }
    return out;
  },
  idle: () => scene === 'field' && !F.busy && !UI.active && !T.job,
});
void menu; void notice; void currentSong; void talk; void heroName; void stats; void member; void has; void face; void monArt; void nm; void WORLD; void battleState;
