// Battles, seen from the front: the monsters stand over a painted backdrop, the party's windows
// run along the top, and commands and messages sit at the bottom. Everyone acts in order of speed
// each round. A friend who takes a beating may become fired up, and fired-up friends can join in
// link arts. Friends other than Rowan can be left to their own tactics.
import { ctx, W, H, canvas, text, textW, windowBox, HAND, HAND_D } from './gfx.js';
import { input } from './input.js';
import { sfx, playMusic } from './audio.js';
import { S, stats, heroName, spellsOf, skillsOf, passive, mpCost, gainExp, addItem, MAXPARTY } from './party.js';
import { HEROES, SKILLS, ARTS, MON, MACTS, ITEMS, EQUIP, ZONES, BG, nm, ds } from './data.js';
import { monArt, flash, sprite, loadBg, bgArt } from './sprites.js';
import { menu, custom, UI, statusTags, tagPages, drawTags } from './ui.js';
import { L, isEn } from './i18n.js';

export const settings = { speed: 3 };
export const _B = { auto: false, log: [], get B() { return B; } };
const MON_ATK_K = 1.5;
const rnd = (a, b) => a + Math.random() * (b - a);
const chance = (p) => Math.random() < p;
const pickW = (list) => { const t = list.reduce((s, [w]) => s + w, 0); let r = Math.random() * t; for (const [w, v] of list) { r -= w; if (r <= 0) return v; } return list[0][1]; };

let B = null;
export const battleState = () => B;

// ---------- small waits driven by the frame loop ----------
function frames(n) { return new Promise((res) => B.waits.push({ t: Math.max(1, Math.round(n)), res })); }
const msgWait = () => [70, 48, 34, 24, 16, 10][settings.speed - 1] * (_B.fast ? 0.1 : 1);
async function line(s, k = 1) { B.log.push(s); if (B.log.length > 4) B.log.shift(); if (_B.trace) _B.log.push(s); await frames(msgWait() * k); }
function clearLog() { B.log = []; }

// ---------- names ----------
const foeName = (f) => (isEn() ? nm(f.def) + (f.tag ? ' ' + f.tag : '') : nm(f.def) + (f.tag || ''));
const who = (u) => (u.hero ? heroName(u.h) : foeName(u));
const mname = (u) => (u.hero ? heroName(u.h) : foeName(u));

// ---------- set up ----------
export async function startBattle(troop, opts = {}) {
  const zone = opts.zone || 'meadow';
  const bgk = opts.bg || BG[zone] || BG.meadow;
  await loadBg(bgk[0]);
  const foes = troop.map((id) => makeFoe(id, opts));
  // tags A, B, C for monsters of the same kind
  const counts = {};
  for (const f of foes) counts[f.id] = (counts[f.id] || 0) + 1;
  const seen = {};
  for (const f of foes) if (counts[f.id] > 1) { seen[f.id] = (seen[f.id] || 0) + 1; f.tag = 'ABCDEFG'[seen[f.id] - 1]; }
  for (const h of S.members) { h.b = { buffs: {}, pepG: h.b && h.b.keepPep ? h.b.pepG : Math.floor(Math.random() * 30) + (passive(h, 'pepstart') ? 55 : 0), pepT: 0 }; if (passive(h, 'swift')) h.b.buffs.agiup = 3; }
  B = {
    foes, opts, bg: bgk, log: [], waits: [], fx: [], pops: [], t: 0, shake: 0, flashWin: {}, active: null, round: 0, result: null, gold: 0, exp: 0, drops: [],
    targetPick: null, intro: 20, firstTurn: true,
  };
  layout();
  if (!opts.noMusic) playMusic(opts.music || (opts.boss ? 'boss' : S.flags.fallen ? 'battle2' : 'battle'), { restart: true });
  return new Promise((res) => { B.done = res; run().catch((e) => { console.error(e); B.done('win'); }); });
}
function makeFoe(id, opts) {
  const def = MON[id];
  if (!def) throw new Error('no monster ' + id);
  const lk = def.look || (opts.dark && !def.boss ? { hue: 0, sat: 0.6, lum: 0.78 } : null);
  const k = opts.dark && !def.boss ? 1.25 : 1;
  const f = { id, def, hero: false, hp: Math.round(def.hp * k), maxhp: Math.round(def.hp * k), mp: def.mp || 0, atk: Math.round(def.atk * k), defn: Math.round(def.def * k), agi: def.agi, st: {}, buffs: {}, alive: true, blink: 0, fade: 0, look: lk,
    acts: def.acts, twice: def.twice || 0, weak: def.weak, resist: def.resist, phase: 0, charge: def.charge || null };
  f.art = def.art.startsWith('person:') ? personArt(def.art.slice(7)) : monArt(def.art, lk);
  if (!f.art) f.art = monArt('slime');
  f.w = f.art.width; f.h = f.art.height;
  return f;
}
// a person as a battler: their standing sprite, twice as big
function personArt(key) {
  const fr = sprite(key).d[0], c = canvas(48, 48);
  c.x.imageSmoothingEnabled = false; c.x.drawImage(fr, 0, 0, 24, 24, 0, 0, 48, 48);
  return c;
}
// spread the monsters across the backdrop
function layout() {
  const live = B.foes.filter((f) => f.alive || f.fade > 0);
  // small monsters are drawn twice their size, as long as everyone still fits
  const big = (f) => (f.h <= 50 && f.w <= 90 ? 2 : 1);
  let total = live.reduce((s, f) => s + f.w * big(f), 0) + (live.length - 1) * 6;
  const two = total <= 248;
  if (!two) total = live.reduce((s, f) => s + f.w, 0) + (live.length - 1) * 6;
  const shrink = total > 248 ? 248 / total : 1;
  let x = (W - total * shrink) / 2;
  for (const f of live) { f.sc = (two ? big(f) : 1) * shrink; f.tx = x; f.ty = 146 - f.h * f.sc; x += (f.w * f.sc) + 6 * shrink; if (f.x === undefined) { f.x = f.tx; f.y = f.ty; } }
}

// ---------- the round ----------
const heroesIn = () => S.members.map((h, i) => ({ hero: true, h, i }));
const liveHeroes = () => S.members.filter((h) => h.hp > 0);
const liveFoes = () => B.foes.filter((f) => f.alive);
async function run() {
  await frames(16);
  const names = groupNames();
  const ambush = !B.opts.boss && !B.opts.noAmbush && chance(0.05);
  const pre = !B.opts.boss && !ambush && chance(0.07 + (S.members.some((m) => passive(m, 'first')) ? 0.12 : 0));
  for (const n of names) await line(n, 0.8);
  if (B.opts.intro) for (const s of B.opts.intro) await line(s);
  if (pre) await line(L('趁魔物還沒察覺，先發制人！', 'You get the jump on them!'));
  if (ambush) await line(L('魔物突然襲擊過來！', 'The monsters attack before you can act!'));
  for (;;) {
    B.round++;
    const order = turnOrder(pre && B.round === 1 ? 'heroes' : ambush && B.round === 1 ? 'foes' : 'all');
    for (const u of order) {
      if (B.result) break;
      if (u.hero ? u.h.hp <= 0 : !u.alive) continue;
      if (u.hero && !S.members.includes(u.h)) continue;
      await takeTurn(u);
      const end = checkEnd();
      if (end) { B.result = end; break; }
    }
    if (!B.result) await endOfRound();
    if (!B.result) { const end = checkEnd(); if (end) B.result = end; }
    if (!B.result && B.opts.endAfter && B.round >= B.opts.endAfter) B.result = 'end';
    if (B.result) break;
  }
  await finish();
}
function groupNames() {
  const g = {};
  for (const f of B.foes) g[f.id] = (g[f.id] || 0) + 1;
  return Object.entries(g).map(([id, n]) => {
    const name = nm(MON[id]);
    if (n === 1) return L(`${name}出現了！`, `${/^[AEIOU]/i.test(name) ? 'An' : 'A'} ${name} appears!`);
    return L(`${name}出現了 ${n} 隻！`, `${n} ${name}s appear!`);
  });
}
function turnOrder(side) {
  const list = [];
  if (side !== 'foes') for (const u of heroesIn()) if (u.h.hp > 0) list.push({ ...u, speed: agiOf(u) * rnd(0.75, 1.25) });
  if (side !== 'heroes') for (const f of liveFoes()) { list.push({ ...f, ref: f, speed: agiOf(f) * rnd(0.75, 1.25) }); if (f.twice && chance(f.twice)) list.push({ ref: f, speed: agiOf(f) * rnd(0.3, 0.7) }); }
  list.sort((a, b) => b.speed - a.speed);
  return list.map((u) => (u.hero ? u : u.ref));
}
function agiOf(u) {
  if (u.hero) { const s = stats(u.h); return s.agi * (u.h.b.buffs.agiup ? 1.5 : 1) * (u.h.b.buffs.agidown ? 0.6 : 1) * (u.h.b.pepT ? 1.2 : 1); }
  return u.agi * (u.buffs.agiup ? 1.5 : 1) * (u.buffs.agidown ? 0.6 : 1);
}
function checkEnd() {
  if (!liveFoes().length) return 'win';
  if (!liveHeroes().length) return 'lose';
  if (B.fled) return 'flee';
  return null;
}

// ---------- a single turn ----------
async function takeTurn(u) {
  clearLog();
  const st = u.hero ? u.h.st : u.st;
  // ailments
  if (st.sleep) {
    if (chance(0.4) || st.sleep <= 1) { delete st.sleep; await line(L(`${mname(u)}醒過來了！`, `${mname(u)} wakes up!`)); }
    else { st.sleep--; await line(L(`${mname(u)}正在睡覺。`, `${mname(u)} is fast asleep.`)); return; }
  }
  if (st.numb) {
    if (chance(0.3) || st.numb <= 1) { delete st.numb; await line(L(`${mname(u)}的麻痺解除了！`, `${mname(u)} can move again!`)); }
    else { st.numb--; await line(L(`${mname(u)}全身麻痺，動不了！`, `${mname(u)} is paralysed!`)); return; }
  }
  if (u.hero) await heroTurn(u.h);
  else await foeTurn(u);
}

// ---------- heroes ----------
const artUsable = (h, id) => {
  const a = ARTS[id];
  if (!h.b.pepT) return false;
  const pepped = S.members.filter((m) => m.hp > 0 && m.b && m.b.pepT);
  const named = a.need.filter((x) => x !== 'any');
  if (!named.every((id2) => pepped.some((m) => m.id === id2))) return false;
  return pepped.filter((m) => !named.includes(m.id)).length >= a.need.length - named.length;
};
const artsFor = (h) => Object.keys(ARTS).filter((id) => ARTS[id].need.includes(h.id) && artUsable(h, id));
async function heroTurn(h) {
  B.active = h;
  // the fire builds a little every turn
  h.b.pepG += 6 + (passive(h, 'pep') ? 6 : 0);
  if (!h.b.pepT && h.b.pepG >= 100 && !B.opts.noPep) {
    h.b.pepT = 4; h.b.pepG = 0; sfx('pep');
    B.fx.push({ kind: 'pep', win: S.members.indexOf(h), t: 0, n: 30 });
    await line(L(`${heroName(h)}燃起了鬥志！（燃心狀態）`, `${heroName(h)} is fired up!`));
  }
  let act;
  if (h.st.confuse) {
    if (chance(0.35)) { delete h.st.confuse; await line(L(`${heroName(h)}恢復了清醒！`, `${heroName(h)} comes to their senses!`)); }
    else { act = { type: 'attack', target: pickAny() }; await line(L(`${heroName(h)}陷入混亂了！`, `${heroName(h)} is confused!`)); }
  }
  const manual = !_B.auto && (h.id === 'rowan' || h.tactic === 'orders');
  if (!act) act = manual ? await chooseAction(h) : aiAction(h, _B.auto ? 'wisely' : h.tactic);
  B.active = null;
  if (!act) return;
  clearLog();
  await doHeroAct(h, act);
}
function pickAny() { const all = [...liveFoes(), ...liveHeroes().map((h) => ({ hero: true, h }))]; return all[Math.floor(Math.random() * all.length)]; }

// the command menu
const CMDS = () => [
  { id: 'attack', label: L('攻擊', 'Fight') }, { id: 'spell', label: L('咒文', 'Spells') }, { id: 'skill', label: L('特技', 'Skills') },
  { id: 'item', label: L('道具', 'Items') }, { id: 'defend', label: L('防禦', 'Defend') }, { id: 'more', label: L('其他', 'More') },
];
async function chooseAction(h) {
  for (;;) {
    const arts = artsFor(h);
    const list = CMDS().map((c) => ({ ...c, disabled: (c.id === 'spell' && (!battleSpells(h).length || h.st.hush)) || (c.id === 'skill' && !skillsOf(h).length) }));
    if (arts.length) list.splice(0, 0, { id: 'art', label: L('連攜技', 'Link Art'), color: '#f8c048' });
    const start = h.b.lastCmd ? Math.max(0, list.findIndex((c) => c.id === h.b.lastCmd)) : 0;
    B.cmdOpen = true;
    const r = await menu(list, { x: 2, y: 152, w: 124, cols: 2, cancel: false, start, rowH: 16, title: heroName(h) });
    B.cmdOpen = false;
    const c = list[r];
    if (!c) continue;
    h.b.lastCmd = c.id;
    if (c.id === 'attack') { const t = await pickFoe('foe'); if (t) return { type: 'attack', target: t }; continue; }
    if (c.id === 'defend') return { type: 'defend' };
    if (c.id === 'spell' || c.id === 'skill') {
      const ids = c.id === 'spell' ? battleSpells(h) : skillsOf(h);
      let desc = '';
      const k = await menu(ids.map((id) => ({ label: nm(SKILLS[id]), right: mpCost(h, id), disabled: mpCost(h, id) > h.mp || (SKILLS[id].fieldOnly) })), { x: 2, y: 50, w: 252, cols: 2, maxRows: 5, title: `${heroName(h)}  MP ${h.mp}`, onMove: (i) => { desc = ds(SKILLS[ids[i]]); }, drawExtra: () => { windowBox(2, 182, 252, 40); text(desc, 10, 194); } });
      if (k < 0) continue;
      const id = ids[k], sk = SKILLS[id];
      const t = await pickTarget(sk.tgt, sk.dead);
      if (t === null) continue;
      return { type: 'skill', id, target: t };
    }
    if (c.id === 'art') {
      const k = await menu(arts.map((id) => ({ label: nm(ARTS[id]) })), { x: 2, y: 60, w: 252, title: L('連攜技', 'Link Arts'), drawExtra: (i) => { windowBox(2, 182, 252, 40); text(ds(ARTS[arts[i]]), 10, 194); } });
      if (k < 0) continue;
      const a = ARTS[arts[k]];
      const t = await pickTarget(a.tgt);
      if (t === null) continue;
      return { type: 'art', id: arts[k], target: t };
    }
    if (c.id === 'item') {
      const ids = Object.keys(S.inv).filter((id) => ITEMS[id].use && !['zoom', 'repel', 'seed', 'book', 'tmap', 'whistle'].includes(ITEMS[id].use) && !ITEMS[id].key);
      if (!ids.length) { sfx('buzz'); continue; }
      const k = await menu(ids.map((id) => ({ label: nm(ITEMS[id]), right: S.inv[id] })), { x: 2, y: 50, w: 252, cols: 2, maxRows: 5, title: L('道具', 'Items'), drawExtra: (i) => { windowBox(2, 182, 252, 40); text(ds(ITEMS[ids[i]]), 10, 194); } });
      if (k < 0) continue;
      const it = ITEMS[ids[k]];
      const t = await pickTarget(['dmg', 'statusitem'].includes(it.use) ? 'foes' : ['healall', 'fullall'].includes(it.use) ? 'allies' : it.use === 'smoke' ? 'self' : 'ally', it.use === 'revive');
      if (t === null) continue;
      return { type: 'item', id: ids[k], target: t };
    }
    if (c.id === 'more') {
      const opts = [{ label: L('逃跑', 'Flee'), disabled: !!B.opts.boss || !!B.opts.noFlee }, { label: L('作戰', 'Tactics') }, { label: L('換人', 'Swap'), disabled: !S.reserve.some((m) => m.hp > 0) }];
      const k = await menu(opts, { x: 128, y: 120, w: 110 });
      if (k === 0) return { type: 'flee' };
      if (k === 1) { await tacticsMenu(); continue; }
      if (k === 2) { const done = await swapMenu(h); if (done) return null; continue; }
      continue;
    }
  }
}
const battleSpells = (h) => spellsOf(h).filter((id) => !SKILLS[id].fieldOnly);
export const TACTICS = () => [['orders', L('聽從命令', 'Follow Orders')], ['mercy', L('全力進攻', 'Show No Mercy')], ['wisely', L('見機行事', 'Fight Wisely')], ['heal', L('專心治療', 'Focus on Healing')], ['nomp', L('不用魔力', "Don't Use MP")]];
export async function tacticsMenu() {
  for (;;) {
    const others = S.members.filter((m) => m.id !== 'rowan');
    if (!others.length) return;
    const k = await menu(others.map((m) => ({ label: heroName(m), right: TACTICS().find(([id]) => id === m.tactic)[1] })), { x: 30, y: 60, w: 200, title: L('作戰', 'Tactics') });
    if (k < 0) return;
    const m = others[k];
    const t = await menu(TACTICS().map(([, n]) => n), { x: 80, y: 70, w: 160, start: TACTICS().findIndex(([id]) => id === m.tactic) });
    if (t >= 0) m.tactic = TACTICS()[t][0];
  }
}
async function swapMenu(h) {
  const out = S.reserve.filter((m) => m.hp > 0);
  const k = await menu(out.map((m) => ({ label: heroName(m), right: `${m.hp}` })), { x: 80, y: 70, w: 160, title: L(`和${heroName(h)}交換`, `Swap with ${heroName(h)}`) });
  if (k < 0) return false;
  const m = out[k], i = S.members.indexOf(h), j = S.reserve.indexOf(m);
  if (h.id === 'rowan') { sfx('buzz'); return false; }
  S.members[i] = m; S.reserve[j] = h;
  m.b = { buffs: {}, pepG: 0, pepT: 0 };
  sfx('ok');
  clearLog();
  await line(L(`${heroName(h)}和${heroName(m)}交換了！`, `${heroName(h)} swaps out for ${heroName(m)}!`));
  return true;
}

// picking targets: a hand over a monster, or over a friend's window
function pickFoe(tgt) { return pickTarget(tgt); }
function pickTarget(tgt, dead = false) {
  if (tgt === 'foes' || tgt === 'allies' || tgt === 'self' || tgt === 'rand') return Promise.resolve(tgt);
  if (tgt === 'foe' || tgt === 'group') {
    const list = liveFoes();
    let i = Math.max(0, list.indexOf(B.lastFoe));
    return custom({
      update() {
        if (input.repeat('right')) { i = (i + 1) % list.length; sfx('cursor'); }
        if (input.repeat('left')) { i = (i + list.length - 1) % list.length; sfx('cursor'); }
        B.targetPick = tgt === 'group' ? list.filter((f) => f.id === list[i].id) : [list[i]];
        if (input.pressed('a')) { sfx('ok'); B.lastFoe = list[i]; B.targetPick = null; this.done(tgt === 'group' ? { group: list[i].id } : list[i]); return; }
        if (input.pressed('b')) { sfx('cancel'); B.targetPick = null; this.done(null); }
      },
      draw() {
        const f = list[i];
        windowBox(2, 184, 252, 38);
        const n = tgt === 'group' ? L(`${nm(f.def)}（${list.filter((g) => g.id === f.id).length}）`, `${nm(f.def)} (${list.filter((g) => g.id === f.id).length})`) : foeName(f);
        text(n, 14, 196);
        // the monster's ailments and buffs
        const tags = tgt === 'group' ? [] : statusTags(f.st, f.buffs);
        if (tags.length) drawTags(tags, 14 + textW(n) + 8, 196, 240 - textW(n) - 8);
      },
    });
  }
  // a friend
  const list = S.members;
  let i = Math.max(0, list.findIndex((m) => (dead ? m.hp <= 0 : m.hp > 0)));
  return custom({
    update() {
      if (input.repeat('right')) { i = (i + 1) % list.length; sfx('cursor'); }
      if (input.repeat('left')) { i = (i + list.length - 1) % list.length; sfx('cursor'); }
      B.allyPick = i;
      if (input.pressed('a')) { const m = list[i]; if (dead ? m.hp > 0 : m.hp <= 0) { sfx('buzz'); return; } sfx('ok'); B.allyPick = null; this.done({ hero: true, h: m }); return; }
      if (input.pressed('b')) { sfx('cancel'); B.allyPick = null; this.done(null); }
    },
    draw() { windowBox(2, 184, 252, 38); text(heroName(list[i]), 14, 196); },
  });
}

// what a friend does on their own
function aiAction(h, mode) {
  const s = stats(h), foes = liveFoes(), friends = liveHeroes();
  const known = [...battleSpells(h), ...skillsOf(h)].filter((id) => mpCost(h, id) <= h.mp && !SKILLS[id].fieldOnly && !(h.st.hush && SKILLS[id].spell));
  const useMp = mode !== 'nomp';
  // link arts first when they would help
  const arts = artsFor(h);
  if (arts.length) {
    const hurt = friends.filter((m) => m.hp < stats(m).maxhp * 0.45).length;
    const a = arts.find((id) => ARTS[id].kind === 'heal' && hurt >= 2) || arts.find((id) => ARTS[id].kind !== 'heal' && ARTS[id].kind !== 'buff2' && ARTS[id].kind !== 'feast');
    if (a) return { type: 'art', id: a, target: ARTS[a].tgt === 'foe' ? strongest(foes) : ARTS[a].tgt };
  }
  // lift a death knell before it tolls
  const doomed = friends.find((m) => m.st.doom);
  if (doomed && useMp && known.includes('cleanse')) return { type: 'skill', id: 'cleanse', target: { hero: true, h: doomed } };
  if (doomed && _B.auto && S.inv.remedy) return { type: 'item', id: 'remedy', target: { hero: true, h: doomed } };
  // revive and heal
  if (useMp) {
    const down = S.members.find((m) => m.hp <= 0);
    const rev = known.filter((id) => SKILLS[id].kind === 'revive');
    if (down && rev.length && mode !== 'mercy') return { type: 'skill', id: rev[rev.length - 1], target: { hero: true, h: down } };
    const lim = mode === 'heal' ? 0.7 : mode === 'mercy' ? 0.3 : 0.5;
    const low = friends.filter((m) => m.hp < stats(m).maxhp * lim).sort((a, b) => a.hp / stats(a).maxhp - b.hp / stats(b).maxhp);
    const heals = known.filter((id) => SKILLS[id].kind === 'heal');
    if (low.length && heals.length) {
      const all = heals.find((id) => SKILLS[id].tgt === 'allies');
      if (low.length >= 2 && all) return { type: 'skill', id: all, target: 'allies' };
      const need = stats(low[0]).maxhp - low[0].hp;
      const one = heals.filter((id) => SKILLS[id].tgt === 'ally').sort((a, b) => SKILLS[a].power - SKILLS[b].power);
      const pick = one.find((id) => SKILLS[id].power * (1 + s.heal / 150) >= need * 0.7) || one[one.length - 1];
      if (pick) return { type: 'skill', id: pick, target: { hero: true, h: low[0] } };
    }
    if (mode === 'heal' && heals.length) return { type: 'defend' };
  }
  // the test player reaches for herbs when no one can heal
  if (_B.auto) {
    const low = friends.find((m) => m.hp < stats(m).maxhp * 0.35);
    const herb = ['elixir', 'strongherb', 'herb'].find((id) => S.inv[id]);
    if (low && herb && !known.some((id) => SKILLS[id].kind === 'heal')) return { type: 'item', id: herb, target: { hero: true, h: low } };
  }
  // otherwise attack
  const target = mode === 'mercy' ? strongest(foes) : weakest(foes);
  if (useMp && known.length) {
    const many = foes.length >= 3, k = mode === 'mercy' ? 0.85 : 0.5;
    const off = known.filter((id) => ['dmg', 'phys'].includes(SKILLS[id].kind) && !(target.buffs && target.buffs.reflect && SKILLS[id].spell));
    const multi = off.filter((id) => ['foes', 'group', 'rand'].includes(SKILLS[id].tgt));
    const single = off.filter((id) => SKILLS[id].tgt === 'foe');
    const best = (list) => list.sort((a, b) => estimate(h, SKILLS[b], target) - estimate(h, SKILLS[a], target))[0];
    if (many && multi.length && chance(k)) { const id = best(multi); return { type: 'skill', id, target: SKILLS[id].tgt === 'group' ? { group: target.id } : SKILLS[id].tgt }; }
    if (single.length && chance(k * (target.def.boss ? 1.2 : 0.6))) { const id = best(single); if (estimate(h, SKILLS[id], target) > estimate(h, { kind: 'phys', power: 1 }, target) * 1.15) return { type: 'skill', id, target }; }
  }
  return { type: 'attack', target };
}
const strongest = (foes) => [...foes].sort((a, b) => b.hp - a.hp)[0];
const weakest = (foes) => [...foes].sort((a, b) => a.hp - b.hp)[0];
function estimate(h, sk, f) {
  const s = stats(h);
  const elk = (el) => elMul(f, el);
  if (sk.kind === 'phys') return Math.max(1, s.atk / 2 - f.defn / 4) * sk.power * (sk.hits || 1) * elk(sk.el);
  if (sk.kind === 'dmg') return sk.power * (1 + s.mag / 200) * elk(sk.el);
  return 0;
}

// ---------- doing it ----------
async function doHeroAct(h, act) {
  const s = stats(h), b = h.b;
  b.guard = false;
  if (act.type === 'defend') { b.guard = true; await line(L(`${heroName(h)}擺出了防禦的姿勢。`, `${heroName(h)} is defending.`)); return; }
  if (act.type === 'flee') {
    await line(L(`${heroName(h)}帶著大家逃跑了！`, `${heroName(h)}'s party flees!`), 0.6);
    const myAgi = liveHeroes().reduce((a, m) => a + stats(m).agi, 0) / Math.max(1, liveHeroes().length), theirs = liveFoes().reduce((a, f) => Math.max(a, f.agi), 0);
    if (chance(0.45 + (myAgi - theirs) / 100 + B.round * 0.08)) { sfx('run'); B.fled = true; await line(L('成功逃走了！', 'You got away!')); return; }
    await line(L('可是，被魔物擋住了去路！', 'But the monsters block the way!'));
    return;
  }
  if (act.type === 'attack') {
    let t = act.target;
    if (!t || (t.hero ? t.h.hp <= 0 : !t.alive)) t = weakest(liveFoes());
    if (!t) return;
    if (t.hero) {
      // confused, and swinging at a friend
      const ts = stats(t.h), dmg = Math.max(0, Math.round((s.atk / 2 - ts.def / 4) * rnd(0.85, 1.15)));
      await line(L(`${heroName(h)}攻擊了${heroName(t.h)}！`, `${heroName(h)} attacks ${heroName(t.h)}!`), 0.5);
      await hurtHero(t.h, dmg, false, null);
      return;
    }
    if (s.all) {
      await line(L(`${heroName(h)}揮動長鞭！`, `${heroName(h)} cracks the whip!`), 0.5);
      for (const f of liveFoes()) await physHit(h, f, { power: 0.75 * (b.focus ? 2.2 : 1), el: s.el });
    } else {
      await line(L(`${heroName(h)}的攻擊！`, `${heroName(h)} attacks!`), 0.5);
      for (let i = 0; i < s.hits; i++) { if (t.hero ? t.h.hp <= 0 : !t.alive) break; await physHit(h, t, { power: (b.focus ? 2.2 : 1) * (s.hits > 1 ? 0.75 : 1), el: s.el, st: s.st, hit: 0.15 }); }
    }
    b.focus = false;
    return;
  }
  if (act.type === 'item') {
    const it = ITEMS[act.id];
    addItem(act.id, -1);
    await line(L(`${heroName(h)}使用了「${nm(it)}」！`, `${heroName(h)} uses ${nm(it)}!`), 0.6);
    if (it.use === 'dmg') { sfx('fire'); await fxOn(liveFoes(), 'boom'); for (const f of liveFoes()) await spellHit(h, f, { power: it.power, el: it.el, flat: true }, true); return; }
    if (it.use === 'statusitem') { sfx('sleep'); await fxOn(liveFoes(), 'dark'); for (const f of liveFoes()) { if (!chance(0.6 * (f.def.boss ? 0.2 : 1))) { await line(L(`對${foeName(f)}沒有效果！`, `${foeName(f)} is unaffected!`), 0.6); continue; } f.st[it.st] = 3; await line(statusText(foeName(f), it.st), 0.6); } return; }
    if (it.use === 'smoke') {
      if (B.opts.boss || B.opts.noFlee) { await line(L('可是逃不掉！', "But there's no escape!")); return; }
      sfx('run'); B.fled = true; await line(L('趁著煙霧逃走了！', 'You slip away in the smoke!')); return;
    }
    if (it.use === 'healall' || it.use === 'fullall') {
      sfx('heal'); await fxFriends(liveHeroes(), 'heal');
      for (const m of liveHeroes()) { const ms = stats(m), n = it.use === 'fullall' ? ms.maxhp - m.hp : Math.min(ms.maxhp - m.hp, Math.round(it.power * rnd(0.9, 1.1))); m.hp += n; if (it.use === 'fullall') m.mp = ms.maxmp; popOn({ hero: true, h: m }, n, '#68f8a0'); }
      await line(it.use === 'fullall' ? L('全體同伴的體力與魔力完全回復了！', "Everyone's HP and MP are fully restored!") : L('全體同伴的體力回復了！', "Everyone's HP is restored!"));
      return;
    }
    const m = act.target.h;
    await useOnFriend(h, m, it);
    return;
  }
  if (act.type === 'skill') {
    const sk = SKILLS[act.id], cost = mpCost(h, act.id);
    if (h.mp < cost) { await line(L(`可是魔力不夠！`, 'But there is not enough MP!')); return; }
    if (h.st.hush && sk.spell) { await line(L(`${heroName(h)}的咒文被封住了！`, `${heroName(h)}'s spells are sealed!`)); return; }
    h.mp -= cost;
    const verb = sk.spell ? L(`${heroName(h)}唸出了「${nm(sk)}」的咒文！`, `${heroName(h)} casts ${nm(sk)}!`) : L(`${heroName(h)}使出了「${nm(sk)}」！`, `${heroName(h)} uses ${nm(sk)}!`);
    await line(verb, 0.6);
    const twice = sk.spell && sk.kind === 'dmg' && passive(h, 'double') && chance(0.2);
    await resolveSkill(h, sk, act.target);
    if (twice && liveFoes().length) { await line(L('咒文連發！', 'The spell goes off again!'), 0.5); await resolveSkill(h, sk, act.target); }
    return;
  }
  if (act.type === 'art') {
    const a = ARTS[act.id];
    // use up the fire of everyone it needs
    const pepped = S.members.filter((m) => m.hp > 0 && m.b.pepT);
    const named = a.need.filter((x) => x !== 'any');
    const users = pepped.filter((m) => named.includes(m.id));
    for (const m of pepped) if (users.length < a.need.length && !users.includes(m)) users.push(m);
    for (const m of users) { m.b.pepT = 0; m.b.pepG = 0; }
    sfx('link');
    B.fx.push({ kind: 'artname', name: nm(a), t: 0, n: 70 });
    await frames(30);
    await line(L(`${users.map(heroName).join('與')}的連攜技「${nm(a)}」！`, `${users.map(heroName).join(' and ')}: ${nm(a)}!`), 0.8);
    await resolveSkill(h, { ...a, art: true }, act.target);
  }
}

async function resolveSkill(h, sk, target) {
  const s = stats(h);
  const foes = liveFoes();
  const tl = target === 'foes' ? foes : target === 'allies' ? S.members.filter((m) => (sk.kind === 'revive' ? m.hp <= 0 : m.hp > 0)).map((m) => ({ hero: true, h: m }))
    : target === 'self' ? [{ hero: true, h }] : target && target.group ? foes.filter((f) => f.id === target.group) : target === 'rand' ? null : [target];
  switch (sk.kind) {
    case 'phys': {
      if (target === 'rand') {
        for (let i = 0; i < (sk.hits || 1); i++) { const fl = liveFoes(); if (!fl.length) break; await physHit(h, fl[Math.floor(Math.random() * fl.length)], sk, true); }
      } else {
        let list = tl;
        if (list.length === 1 && !list[0].alive && !list[0].hero) list = [weakest(liveFoes())];
        await fxOn(list.filter(Boolean), sk.fx || 'slash');
        for (const f of list) for (let i = 0; i < (sk.hits || 1); i++) if (f && f.alive) await physHit(h, f, sk, true);
      }
      if (sk.buff) for (const m of liveHeroes()) m.b.buffs[sk.buff] = 4;
      if (sk.buff) await line(L('全體同伴的防禦提高了！', "Everyone's defence goes up!"));
      h.b.focus = false;
      break;
    }
    case 'dmg': {
      let list = tl;
      if (list.length === 1 && !list[0].alive) list = [weakest(liveFoes())];
      list = list.filter(Boolean);
      sfx(sk.fx === 'ice' ? 'ice' : sk.fx === 'bolt' ? 'bolt' : sk.fx === 'heal' ? 'heal' : sk.fx === 'star' || sk.fx === 'holy' ? 'holy' : 'fire');
      await fxOn(list, sk.fx || 'fire');
      for (const f of list) await spellHit(h, f, sk, list.length > 1);
      break;
    }
    case 'heal': {
      sfx('heal');
      await fxFriends(tl.map((u) => u.h), 'heal');
      for (const u of tl) {
        const m = u.h, ms = stats(m);
        if (m.hp <= 0) continue;
        const n = Math.min(ms.maxhp - m.hp, Math.round(sk.power * (1 + s.heal / 150) * rnd(0.92, 1.08)));
        m.hp += n;
        if (sk.cure) m.st = {};
        popOn({ hero: true, h: m }, n, '#68f8a0');
        await line(n >= 999 || m.hp === ms.maxhp && n > 0 ? L(`${heroName(m)}的體力完全回復了！`, `${heroName(m)}'s HP is fully restored!`) : L(`${heroName(m)}回復了 ${n} 點體力！`, `${heroName(m)} recovers ${n} HP!`), tl.length > 2 ? 0.6 : 1);
      }
      break;
    }
    case 'feast': {
      sfx('heal');
      for (const u of tl) { const m = u.h, ms = stats(m); if (m.hp <= 0) continue; const n = Math.round(ms.maxhp * sk.power); m.hp = Math.min(ms.maxhp, m.hp + n); m.b.buffs.atkup = 4; popOn({ hero: true, h: m }, n, '#68f8a0'); }
      await fxFriends(liveHeroes(), 'heal');
      await line(L('大家吃得飽飽的！體力回復，攻擊力上升了！', 'Everyone eats their fill! HP restored and attack up!'));
      break;
    }
    case 'buff2': {
      sfx('buff');
      for (const m of liveHeroes()) { m.b.buffs.defup = 5; m.b.buffs.mwall = 5; }
      await fxFriends(liveHeroes(), 'buff');
      await line(L('全體同伴受到了守護！防禦與魔法防禦大幅提高！', 'Every friend is shielded! Defence and magic defence rise!'));
      break;
    }
    case 'revive': {
      for (const u of tl) {
        const m = u.h;
        if (m.hp > 0) { await line(L('可是什麼也沒發生。', 'But nothing happens.')); continue; }
        sfx('heal'); await fxFriends([m], 'heal');
        m.hp = Math.max(1, Math.round(stats(m).maxhp * sk.power)); m.st = {}; m.b = { buffs: {}, pepG: 0, pepT: 0 };
        await line(L(`${heroName(m)}復活了！`, `${heroName(m)} is revived!`));
      }
      break;
    }
    case 'cure': {
      sfx('heal');
      for (const u of tl) { const m = u.h; for (const k of sk.st) delete m.st[k]; await line(L(`${heroName(m)}的異常狀態解除了。`, `${heroName(m)} is cured.`)); }
      break;
    }
    case 'buff': {
      sfx('buff');
      await fxFriends(tl.map((u) => u.h), 'buff');
      for (const u of tl) {
        const m = u.h;
        if (sk.st === 'focus') { m.b.focus = true; await line(L(`${heroName(m)}凝聚了氣力！`, `${heroName(m)} is focusing!`)); continue; }
        if (sk.st === 'cover') { m.b.cover = true; await line(L(`${heroName(m)}擋在同伴的前面！`, `${heroName(m)} stands in front of the others!`)); continue; }
        if (sk.st === 'counter') { m.b.counter = true; await line(L(`${heroName(m)}擺出了反擊的架勢！`, `${heroName(m)} takes a counter stance!`)); continue; }
        if (sk.st === 'guardian') { m.b.cover = true; m.b.guardAll = true; m.b.buffs.defup = 2; await line(L(`${heroName(m)}舉起盾牌，擋在全體同伴的前面！`, `${heroName(m)} raises the shield before everyone!`)); continue; }
        m.b.buffs[sk.st] = sk.st === 'reraise' ? 99 : 4;
        await line(buffText(heroName(m), sk.st), tl.length > 2 ? 0.6 : 1);
      }
      break;
    }
    case 'healdmg': {
      // damage every foe, then heal every friend
      sfx('holy'); await fxOn(foes, sk.fx || 'holy');
      for (const f of foes) await spellHit(h, f, sk, true);
      sfx('heal'); await fxFriends(liveHeroes(), 'heal');
      for (const m of liveHeroes()) { const ms = stats(m), n = Math.min(ms.maxhp - m.hp, Math.round(sk.heal * (1 + s.heal / 150))); m.hp += n; popOn({ hero: true, h: m }, n, '#68f8a0'); }
      await line(L('光芒治癒了全體同伴！', 'The light heals every friend!'));
      break;
    }
    case 'dmgmp': {
      sfx('ice'); await fxOn(foes, sk.fx || 'ice');
      for (const f of foes) await spellHit(h, f, sk, true);
      for (const m of liveHeroes()) { const ms = stats(m); m.mp = Math.min(ms.maxmp, m.mp + Math.round(ms.maxmp * 0.2)); }
      sfx('heal'); await line(L('全體同伴的魔力回復了！', "Every friend's MP is restored!"));
      break;
    }
    case 'buffall': {
      sfx('buff'); await fxFriends(liveHeroes(), 'buff');
      for (const m of liveHeroes()) { m.b.buffs.atkup = 4; m.b.buffs.defup = 4; }
      await line(L('全體同伴的攻擊與防禦大幅提高了！', "Every friend's attack and defence rise!"));
      break;
    }
    case 'regenall': {
      sfx('heal'); await fxFriends(liveHeroes(), 'heal');
      for (const m of liveHeroes()) { const ms = stats(m), n = Math.min(ms.maxhp - m.hp, Math.round(ms.maxhp * sk.power)); m.hp += n; m.b.buffs.regen = 4; popOn({ hero: true, h: m }, n, '#68f8a0'); }
      await line(L('平靜的氣息包圍了全體同伴。', 'A calm breath surrounds every friend.'));
      break;
    }
    case 'goldtoss': {
      if (S.gold < 200) { await line(L('……可是金幣不夠！', '...But there is not enough gold!')); break; }
      S.gold -= 200; sfx('chest'); await fxOn(foes, 'star');
      for (const f of foes) await spellHit(h, f, { power: sk.power, flat: true }, true);
      break;
    }
    case 'mpself': {
      const n = Math.max(3, Math.round(stats(h).maxmp * sk.power));
      h.mp = Math.min(stats(h).maxmp, h.mp + n);
      sfx('heal');
      await line(L(`${heroName(h)}回復了 ${n} 點魔力！`, `${heroName(h)} recovers ${n} MP!`));
      break;
    }
    case 'status': case 'debuff': {
      await fxOn(tl, sk.fx || 'dark');
      sfx('sleep');
      for (const f of tl) {
        if (!f.alive) continue;
        const resist = f.def.boss ? 0.25 : 1;
        if (!chance((sk.hit || 0.7) * resist)) { await line(L(`對${foeName(f)}沒有效果！`, `${foeName(f)} is unaffected!`), 0.7); continue; }
        if (sk.kind === 'debuff') { f.buffs[sk.st] = 4; await line(debuffText(foeName(f), sk.st), 0.7); }
        else { f.st[sk.st] = 3; await line(statusText(foeName(f), sk.st), 0.7); }
      }
      break;
    }
    case 'steal': {
      const f = tl[0] && tl[0].alive ? tl[0] : weakest(liveFoes());
      if (!f) break;
      await physHit(h, f, sk, true);
      if (f.stolen) { await line(L(`${foeName(f)}身上已經沒有東西了。`, `${foeName(f)} has nothing left.`)); break; }
      if (chance(0.3 + (passive(h, 'steal') ? 0.25 : 0) + (sk.bonus || 0))) {
        const it = f.def.steal || (f.def.drop && f.def.drop[0]) || (f.def.drops && f.def.drops[0][0]) || (chance(0.15) ? 'gem' : 'herb');
        f.stolen = true; addItem(it); sfx('chest');
        await line(L(`${heroName(h)}偷到了「${nm(ITEMS[it])}」！`, `${heroName(h)} steals ${nm(ITEMS[it])}!`));
      } else await line(L('可是什麼也沒偷到。', "But couldn't steal anything."));
      break;
    }
    default: break;
  }
}
function debuffText(n, st) {
  return { defdown: L(`${n}的防禦降低了！`, `${n}'s defence falls!`), atkdown: L(`${n}的攻擊力降低了！`, `${n}'s attack falls!`), agidown: L(`${n}的動作變慢了！`, `${n} slows down!`) }[st] || n;
}
function buffText(n, st) {
  return {
    mwall: L(`${n}受到了魔障的守護！`, `${n} is shielded by a barrier!`), regen: L(`${n}被再生的光包圍了！`, `${n} is wrapped in renewing light!`), reraise: L(`${n}受到了再晨的祝福！`, `${n} is blessed with a Second Dawn!`),
    atkup: L(`${n}的攻擊力大幅提高了！`, `${n}'s attack rises sharply!`), defup: L(`${n}的防禦提高了！`, `${n}'s defence rises!`),
    agiup: L(`${n}的速度提高了！`, `${n}'s speed rises!`), magup: L(`${n}的魔力大幅提高了！`, `${n}'s magic rises sharply!`),
  }[st] || n;
}
function statusText(n, st) {
  return {
    sleep: L(`${n}睡著了！`, `${n} falls asleep!`), blind: L(`${n}看不清楚了！`, `${n} is blinded!`), hush: L(`${n}的咒文被封住了！`, `${n}'s spells are sealed!`),
    numb: L(`${n}麻痺了！`, `${n} is paralysed!`), confuse: L(`${n}陷入混亂了！`, `${n} is confused!`), poison: L(`${n}中毒了！`, `${n} is poisoned!`),
    doom: L(`${n}聽見了死亡的鐘聲！（三回合後倒下）`, `${n} hears the death knell! (Falls in three rounds)`),
  }[st] || n;
}
async function useOnFriend(h, m, it) {
  const ms = stats(m);
  if (it.use === 'revive') {
    if (m.hp > 0) { await line(L('可是什麼也沒發生。', 'But nothing happens.')); return; }
    m.hp = Math.max(1, Math.round(ms.maxhp * it.power)); m.st = {}; m.b = { buffs: {}, pepG: 0, pepT: 0 }; sfx('heal');
    await line(L(`${heroName(m)}復活了！`, `${heroName(m)} is revived!`)); return;
  }
  if (m.hp <= 0) { await line(L('可是什麼也沒發生。', 'But nothing happens.')); return; }
  if (it.use === 'heal') { const n = Math.min(ms.maxhp - m.hp, Math.round(it.power * rnd(0.9, 1.1))); m.hp += n; sfx('heal'); popOn({ hero: true, h: m }, n, '#68f8a0'); await line(L(`${heroName(m)}回復了 ${n} 點體力！`, `${heroName(m)} recovers ${n} HP!`)); }
  if (it.use === 'mp') { const n = Math.min(ms.maxmp - m.mp, it.power); m.mp += n; sfx('heal'); await line(L(`${heroName(m)}回復了 ${n} 點魔力！`, `${heroName(m)} recovers ${n} MP!`)); }
  if (it.use === 'cure') { for (const k of it.st) delete m.st[k]; sfx('heal'); await line(L(`${heroName(m)}的異常狀態解除了。`, `${heroName(m)} is cured.`)); }
  if (it.use === 'buffitem') { m.b.buffs[it.st] = 4; sfx('buff'); await fxFriends([m], 'buff'); await line(buffText(heroName(m), it.st)); }
}

// a weapon blow from a hero
async function physHit(h, f, sk, quiet) {
  const s = stats(h), b = h.b;
  if (!f.alive) return;
  const atk = s.atk * (b.buffs.atkup ? 1.5 : 1) * (b.pepT ? 1.25 : 1) * (b.buffs.atkdown ? 0.6 : 1);
  const def = f.defn * (f.buffs.defup ? 1.6 : 1) * (f.buffs.defdown ? 0.5 : 1) * (f.guard ? 1.5 : 1);
  const miss = (h.st.blind ? 0.45 : 0) + 1 / 64;
  if (!quiet) await fxOn([f], 'slash');
  if (chance(miss)) { sfx('miss'); await line(L(`${foeName(f)}閃開了！`, `${foeName(f)} dodges!`), 0.7); return; }
  const critP = 1 / 32 + (passive(h, 'crit') ? 0.05 : 0) + (sk.crit || 0) + (s.crit || 0);
  let dmg, crit = false;
  if (sk.pierce || chance(critP)) { crit = !sk.pierce; dmg = atk * rnd(0.95, 1.05) * (sk.power || 1); }
  else { const base = atk / 2 - def / 4; dmg = base <= 1 ? (chance(0.5) ? 1 : 0) : base * rnd(0.85, 1.15) * (sk.power || 1); }
  dmg *= elMul(f, sk.el);
  dmg = Math.max(0, Math.round(dmg));
  if (crit) { sfx('crit'); B.shake = 8; await line(L('會心一擊！', 'A critical hit!'), 0.5); }
  else sfx('hit');
  await damageFoe(f, dmg, h);
  if (sk.st && f.alive && chance(sk.hit || 0.5) && !(f.def.boss && sk.st !== 'defdown' && sk.st !== 'poison')) {
    if (sk.st === 'defdown') { f.buffs.defdown = 4; await line(L(`${foeName(f)}的防禦降低了！`, `${foeName(f)}'s defence falls!`), 0.7); }
    else if (!f.st[sk.st]) { f.st[sk.st] = 3; await line(statusText(foeName(f), sk.st), 0.7); }
  }
  if (sk.drain) { h.hp = Math.min(s.maxhp, h.hp + Math.round(dmg / 4)); }
}
const elMul = (f, el) => { const w = f.weak || f.def.weak, r = f.resist || f.def.resist; return el && w && w.includes(el) ? 1.5 : el && r && r.includes(el) ? 0.5 : 1; };
async function spellHit(h, f, sk, many) {
  if (!f.alive) return;
  const s = stats(h);
  const mk = sk.flat ? 1 : (1 + s.mag / 200) * (h.b.buffs.magup ? 1.6 : 1) * (h.b.pepT ? 1.25 : 1);
  let dmg = sk.power * mk * rnd(0.9, 1.1) * elMul(f, sk.el);
  dmg = Math.round(dmg);
  // a mirror mist throws spells back at the party
  if (f.buffs.reflect && sk.spell && !sk.flat) {
    const t = liveHeroes()[Math.floor(Math.random() * liveHeroes().length)];
    if (t) { sfx('miss'); await line(L(`咒文被${foeName(f)}彈了回來！`, `${foeName(f)} throws the spell back!`), 0.6); await hurtHero(t, Math.round(dmg * 0.6 * (stats(t).resist === 'all' ? 0.7 : 1)), many, f); return; }
  }
  sfx('monhit');
  await damageFoe(f, dmg, h, many);
}
async function damageFoe(f, dmg, h, many) {
  f.hp -= dmg; f.blink = 16;
  popOn(f, dmg, '#ffffff');
  if (f.st.sleep && dmg > 0 && chance(0.5)) delete f.st.sleep;
  await line(dmg > 0 ? L(`${foeName(f)}受到了 ${dmg} 點傷害！`, `${foeName(f)} takes ${dmg} damage!`) : L(`${foeName(f)}毫髮無傷！`, `${foeName(f)} takes no damage!`), many ? 0.55 : 0.8);
  if (f.hp <= 0) await killFoe(f);
  else await checkPhase(f);
}
// a boss changes when it is hurt enough: new moves, new weaknesses, new looks, friends
async function checkPhase(f) {
  const ph = f.def.phases && f.def.phases[f.phase];
  if (!ph || f.hp > f.maxhp * ph.hp) return;
  f.phase++;
  if (ph.acts) f.acts = ph.acts;
  if (ph.twice !== undefined) f.twice = ph.twice;
  if (ph.weak) f.weak = ph.weak;
  if (ph.resist) f.resist = ph.resist;
  if (ph.charge) f.charge = ph.charge;
  if (ph.look) { f.art = monArt(f.def.art, ph.look); f.look = ph.look; }
  B.shake = 12; sfx('abyss'); f.blink = 20;
  if (ph.msg) await line(L(ph.msg[0], ph.msg[1]), 1.2);
  for (const id of ph.summon || []) {
    if (liveFoes().length >= 5) break;
    const nf = makeFoe(id, B.opts), same = B.foes.filter((g) => g.id === id && g.alive);
    nf.tag = same.length ? 'ABCDEFG'[same.length] : '';
    B.foes.push(nf); layout(); sfx('encounter');
    await line(L(`${nm(nf.def)}出現了！`, `${nm(nf.def)} appears!`), 0.8);
  }
}
async function killFoe(f) {
  f.hp = 0; f.alive = false; f.fade = 24;
  sfx('die');
  B.exp += f.def.exp; B.gold += f.def.gold;
  S.book = S.book || {}; S.book[f.id] = (S.book[f.id] || 0) + 1;
  const luck = S.members.some((m) => m.hp > 0 && passive(m, 'lucky')) ? 1.6 : 1;
  if (f.def.drop && chance(f.def.drop[1] * luck)) B.drops.push(f.def.drop[0]);
  for (const [it, p] of f.def.drops || []) if (chance(p * luck)) B.drops.push(it);
  await line(L(`打倒了${foeName(f)}！`, `${foeName(f)} is defeated!`), 0.8);
}

// ---------- monsters ----------
async function foeTurn(f) {
  if (!f.alive) return;
  f.guard = false;
  let id, a;
  if (f.charging) { id = f.charging; a = MACTS[id]; f.charging = null; }
  else {
    id = pickW(f.acts || f.def.acts); a = MACTS[id];
    if ((a.kind === 'gather' && !f.charge) || (a.kind === 'reflect' && f.buffs.reflect)) { id = 'attack'; a = MACTS.attack; }
  }
  if (f.st.hush && (a.kind === 'spell' || a.mp)) { id = 'attack'; a = MACTS.attack; }
  if (a.mp && f.mp < a.mp) { id = 'attack'; a = MACTS.attack; }
  if (a.kind === 'healally' && !liveFoes().some((g) => g.hp < g.maxhp * 0.6)) { id = 'attack'; a = MACTS.attack; }
  if (a.kind === 'healself' && f.hp > f.maxhp * 0.7) { id = 'attack'; a = MACTS.attack; }
  if (a.kind === 'call' && liveFoes().length >= 5) { id = 'attack'; a = MACTS.attack; }
  if (a.mp) f.mp -= a.mp;
  if (f.st.confuse) {
    if (chance(0.35)) { delete f.st.confuse; await line(L(`${foeName(f)}恢復了清醒！`, `${foeName(f)} snaps out of it!`)); }
    else { await line(L(`${foeName(f)}混亂了，攻擊了同伴！`, `${foeName(f)} is confused and attacks an ally!`)); const g = liveFoes()[Math.floor(Math.random() * liveFoes().length)]; await damageFoe(g, Math.max(1, Math.round(f.atk * MON_ATK_K / 2 - g.defn / 4)), null); return; }
  }
  const msg = a.msg ? L(a.msg[0].replace('%s', foeName(f)), a.msg[1].replace('%s', foeName(f))) : L(`${foeName(f)}的攻擊！`, `${foeName(f)} attacks!`);
  B.flashFoe = f; f.lunge = 10;
  await line(msg, 0.6);
  switch (a.kind) {
    case 'phys': {
      const targets = a.tgt === 'foes' ? liveHeroes() : [pickHeroTarget()];
      for (const h of targets) for (let i = 0; i < (a.hits || 1); i++) if (h.hp > 0) await foeHits(f, h, a, targets.length > 1);
      break;
    }
    case 'breath': case 'spell': {
      const targets = a.tgt === 'foes' ? liveHeroes() : [pickHeroTarget()];
      sfx(a.el === 'ice' ? 'ice' : a.el === 'fire' ? 'fire' : a.el === 'dark' ? 'abyss' : a.el === 'light' ? 'bolt' : 'boom');
      B.fx.push({ kind: 'breath', el: a.el, t: 0, n: 26 });
      await frames(18);
      for (const h of targets) {
        if (h.hp <= 0) continue;
        const s = stats(h);
        let dmg = a.power * rnd(0.88, 1.12) * (1 + f.atk / 600);
        if (h.b.guard) dmg *= 0.5;
        if (s.resist === 'all' || s.resist === a.el) dmg *= 0.7;
        if (h.b.buffs.mwall) dmg *= 0.6;
        dmg = Math.round(dmg);
        await hurtHero(h, dmg, targets.length > 1, f);
        if (a.st && h.hp > 0 && chance(a.hit || 0.5) && !resists(h, a.st)) { h.st[a.st] = a.st === 'poison' ? 1 : 3; await line(statusText(heroName(h), a.st), 0.6); }
      }
      break;
    }
    case 'status': {
      const targets = a.tgt === 'foes' ? liveHeroes() : [pickHeroTarget()];
      sfx('sleep');
      for (const h of targets) {
        if (resists(h, a.st) || !chance(a.hit || 0.4) || h.st[a.st]) { await line(L(`${heroName(h)}沒有受到影響！`, `${heroName(h)} is unaffected!`), 0.6); continue; }
        h.st[a.st] = a.st === 'poison' ? 1 : 3;
        await line(statusText(heroName(h), a.st), 0.7);
      }
      break;
    }
    case 'selfbuff': f.buffs[a.st] = 4; sfx('buff'); break;
    case 'selfbuffall': for (const g of liveFoes()) g.buffs.defup = 4; sfx('buff'); await line(L('魔物們的防禦提高了！', "The monsters' defence rises!")); break;
    case 'guard': f.guard = true; break;
    case 'healally': {
      const g = liveFoes().sort((x, y) => x.hp / x.maxhp - y.hp / y.maxhp)[0];
      const n = Math.min(g.maxhp - g.hp, a.power); g.hp += n; sfx('heal');
      await line(L(`${foeName(g)}回復了 ${n} 點體力！`, `${foeName(g)} recovers ${n} HP!`));
      break;
    }
    case 'healself': { const n = Math.min(f.maxhp - f.hp, Math.round(f.maxhp * a.power)); f.hp += n; sfx('heal'); await line(L(`${foeName(f)}回復了 ${n} 點體力！`, `${foeName(f)} recovers ${n} HP!`)); break; }
    case 'call': {
      const kin = f.def.calls || (f.def.boss ? null : f.id);
      if (kin && chance(0.5)) {
        const nf = makeFoe(kin, B.opts);
        const same = B.foes.filter((g) => g.id === kin);
        nf.tag = 'ABCDEFG'[same.length] || '';
        if (same.length === 1 && !same[0].tag) { same[0].tag = 'A'; nf.tag = 'B'; } else if (!same.length) nf.tag = '';
        B.foes.push(nf); layout(); sfx('encounter');
        await line(L(`${nm(nf.def)}跑過來了！`, `Another ${nm(nf.def)} appears!`));
      } else await line(L('可是什麼也沒來。', 'But nothing comes.'));
      break;
    }
    case 'gather': f.charging = f.charge; sfx('pep'); B.shake = 6; break;
    case 'reflect': f.buffs.reflect = 3; sfx('buff'); break;
    case 'mpdrain': {
      const h = pickHeroTarget(), n = Math.min(h.mp, a.power);
      h.mp -= n; f.mp += n; sfx('abyss');
      await line(L(`${heroName(h)}的魔力被吸走了 ${n} 點！`, `${heroName(h)} loses ${n} MP!`));
      break;
    }
    case 'herodebuff': {
      sfx('curse');
      for (const h of liveHeroes()) {
        if (stats(h).immune || !chance(a.hit || 0.6)) { await line(L(`${heroName(h)}沒有受到影響！`, `${heroName(h)} is unaffected!`), 0.5); continue; }
        h.b.buffs[a.st] = 3; await line(debuffText(heroName(h), a.st), 0.5);
      }
      break;
    }
    case 'flee': {
      if (B.opts.boss || chance(0.5)) { await line(L('可是逃不掉！', "But it can't get away!")); break; }
      f.alive = false; f.fade = 24; sfx('run');
      await line(L(`${foeName(f)}逃走了！`, `${foeName(f)} runs away!`));
      break;
    }
    case 'dispel': {
      for (const h of liveHeroes()) h.b.buffs = {};
      for (const g of liveFoes()) g.buffs = {};
      sfx('abyss');
      break;
    }
    default: break;
  }
}
// who a monster goes for: the front of the line a little more often, and around anyone covering
const resists = (h, st) => stats(h).immune || (st === 'poison' && passive(h, 'nopoison'));
function pickHeroTarget() {
  const live = liveHeroes();
  const w = live.map((h, i) => [h.b.cover ? 0.2 : 1 + (live.length - i) * 0.15, h]);
  return pickW(w);
}
async function foeHits(f, h, a, many) {
  // a knight covering the others takes the blow
  const cov = !many && liveHeroes().find((m) => m.b.cover && m !== h);
  if (cov) { await line(L(`${heroName(cov)}挺身擋下了攻擊！`, `${heroName(cov)} takes the blow!`), 0.5); h = cov; }
  const s = stats(h);
  const atk = f.atk * MON_ATK_K * (f.buffs.atkup ? 1.5 : 1) * (f.buffs.atkdown ? 0.65 : 1);
  const def = s.def * (h.b.buffs.defup ? 1.5 : 1) * (h.b.buffs.defdown ? 0.6 : 1) * (h.b.pepT ? 1.2 : 1);
  if (chance((f.st.blind ? 0.45 : 0) + 1 / 48 + (h.b.buffs.agiup && h.id === 'pell' ? 0.12 : 0)) || (a.hitp && !chance(a.hitp))) { sfx('miss'); await line(L(`${heroName(h)}躲開了攻擊！`, `${heroName(h)} dodges!`), 0.6); return; }
  if (passive(h, 'block') && chance(0.1)) { sfx('miss'); await line(L(`${heroName(h)}用盾牌擋住了！`, `${heroName(h)} blocks with the shield!`), 0.6); return; }
  const base = atk / 2 - def / 4;
  let dmg = base <= 1 ? (chance(0.5) ? 1 : 0) : base * rnd(0.85, 1.15) * (a.power || 1);
  if (h.b.guard) dmg *= 0.5;
  dmg = Math.round(dmg);
  await hurtHero(h, dmg, many, f);
  if (a.drain) { f.hp = Math.min(f.maxhp, f.hp + Math.round(dmg / 2)); }
  if (a.st && h.hp > 0 && chance(a.hit || 0.3) && !resists(h, a.st) && !h.st[a.st]) { h.st[a.st] = a.st === 'poison' ? 1 : 3; await line(statusText(heroName(h), a.st), 0.6); }
  if (a.sunder && h.hp > 0) { h.b.buffs.defdown = 3; await line(debuffText(heroName(h), 'defdown'), 0.5); }
  // a counter stance answers; so, sometimes, does a fighter with the knack
  if (h.b.counter && h.hp > 0 && f.alive) { h.b.counter = false; await line(L(`${heroName(h)}反擊了！`, `${heroName(h)} strikes back!`), 0.5); await physHit(h, f, { power: 1.5 }, true); }
  else if (h.hp > 0 && f.alive && passive(h, 'counter') && chance(0.22)) { await line(L(`${heroName(h)}反擊了！`, `${heroName(h)} strikes back!`), 0.5); await physHit(h, f, { power: 1.0 }, true); }
}
async function hurtHero(h, dmg, many, f) {
  const s = stats(h);
  h.hp = Math.max(0, h.hp - dmg);
  const i = S.members.indexOf(h);
  B.flashWin[i] = 14; B.shake = Math.max(B.shake, dmg > s.maxhp * 0.2 ? 10 : 5);
  sfx(dmg > 0 ? 'hurt' : 'miss');
  popOn({ hero: true, h }, dmg, '#ff8080');
  h.b.pepG += (dmg / Math.max(1, s.maxhp)) * 70 * (passive(h, 'pep') ? 1.5 : 1);
  if (h.st.sleep && dmg > 0 && chance(0.5)) delete h.st.sleep;
  await line(dmg > 0 ? L(`${heroName(h)}受到了 ${dmg} 點傷害！`, `${heroName(h)} takes ${dmg} damage!`) : L(`${heroName(h)}沒有受到傷害！`, `${heroName(h)} takes no damage!`), many ? 0.55 : 0.8);
  if (h.hp <= 0) {
    const rise = h.b.buffs.reraise;
    h.st = {}; h.b.pepT = 0; h.b.buffs = {};
    sfx('die');
    await line(L(`${heroName(h)}倒下了……`, `${heroName(h)} has fallen...`), 0.9);
    if (rise) { h.hp = Math.max(1, Math.round(s.maxhp * 0.35)); sfx('heal'); await fxFriends([h], 'heal'); await line(L(`再晨之光！${heroName(h)}站了起來！`, `The Second Dawn! ${heroName(h)} rises again!`), 0.9); }
  }
  void f;
}

// ---------- end of the round: poison, regeneration, buffs wearing off ----------
async function endOfRound() {
  for (const h of liveHeroes()) {
    const s = stats(h);
    if (h.st.poison) { const n = Math.max(1, Math.round(s.maxhp / 12)); h.hp = Math.max(1, h.hp - n); B.flashWin[S.members.indexOf(h)] = 8; popOn({ hero: true, h }, n, '#c070f0'); }
    if (passive(h, 'regen')) h.hp = Math.min(s.maxhp, h.hp + Math.round(s.maxhp / 16));
    if (h.b.buffs.regen) { const n = Math.min(s.maxhp - h.hp, Math.round(s.maxhp / 10)); if (n > 0) { h.hp += n; popOn({ hero: true, h }, n, '#68f8a0'); } }
    if (passive(h, 'mpregen')) h.mp = Math.min(s.maxmp, h.mp + Math.max(2, Math.round(s.maxmp / 20)));
    if (h.st.doom && --h.st.doom <= 0) {
      delete h.st.doom; clearLog();
      await line(L(`死亡的鐘聲響起了……`, 'The death knell tolls...'), 0.6);
      await hurtHero(h, h.hp, false, null);
      continue;
    }
    for (const k of Object.keys(h.b.buffs)) if (--h.b.buffs[k] <= 0) delete h.b.buffs[k];
    if (h.b.pepT && --h.b.pepT <= 0) { h.b.pepT = 0; }
    h.b.cover = false;
    for (const k of ['blind', 'hush', 'confuse']) if (h.st[k] && --h.st[k] <= 0) delete h.st[k];
  }
  for (const f of liveFoes()) {
    if (f.st.poison) { const n = Math.max(1, Math.round(Math.min(f.maxhp / 12, 60))); f.hp -= n; popOn(f, n, '#c070f0'); if (f.hp <= 0) { clearLog(); await line(L(`${foeName(f)}受到了毒的傷害。`, `${foeName(f)} is hurt by poison.`), 0.5); await killFoe(f); } }
    for (const k of Object.keys(f.buffs)) if (--f.buffs[k] <= 0) delete f.buffs[k];
    for (const k of ['blind', 'hush', 'confuse']) if (f.st[k] && --f.st[k] <= 0) delete f.st[k];
  }
}

// ---------- the end ----------
async function finish() {
  clearLog();
  const r = B.result;
  for (const h of [...S.members, ...S.reserve]) { if (h.b) h.b = { keepPep: false }; for (const k of ['sleep', 'numb', 'confuse', 'blind', 'hush']) delete h.st[k]; }
  if (r === 'win') {
    playMusic(null);
    sfx('victory');
    await line(L('打倒了所有的魔物！', 'You have defeated the monsters!'), 1.2);
    const gold = Math.round(B.gold * (S.members.some((m) => passive(m, 'gold')) ? 1.25 : 1));
    if (B.exp > 0) await line(L(`大家各得到了 ${B.exp} 點經驗值。`, `Each of you earns ${B.exp} experience points.`), 1);
    if (gold > 0) { S.gold += gold; await line(L(`得到了 ${gold} 枚金幣。`, `You find ${gold} gold coins.`), 1); }
    for (const d of B.drops) { addItem(d); sfx('treasure'); await line(L(`魔物留下了「${nm(ITEMS[d])}」！`, `The monsters dropped ${nm(ITEMS[d])}!`), 1.2); }
    for (const h of [...S.members, ...S.reserve]) {
      if (h.hp <= 0 && !S.members.includes(h)) continue;
      const gain = h.hp > 0 || !S.members.includes(h) ? B.exp : Math.floor(B.exp / 2);
      const out = gainExp(h, Math.round(gain * (passive(h, 'expup') ? 1.5 : 1)));
      for (const o of out) {
        clearLog();
        if (o.lv) { sfx('fanfare'); await line(o.text, 1.2); if (o.ups) await line(o.ups, 1.2); } else await line(o.text, 1);
      }
    }
    if (!S.flags.sp_hint && [...S.members, ...S.reserve].some((m) => m.sp >= 3)) {
      S.flags.sp_hint = true; clearLog();
      await line(L('（得到了技能點數！在選單的「技能盤」裡，', '(You have skill points! Open "Skills" in the menu'), 0.4);
      await line(L('　可以學會新的特技，或讓能力變強。）', ' to learn new skills or raise your stats.)'), 2.2);
    }
    await frames(20);
  } else if (r === 'lose') {
    playMusic(null);
    sfx('curse');
    await line(L('全體隊員都倒下了……', 'Your party has been wiped out...'), 2);
  }
  const res = B.result;
  B.done(res);
}

// ---------- effects ----------
function popOn(u, n, col) {
  if (u.hero) { const i = S.members.indexOf(u.h); B.pops.push({ x: 4 + i * 63 + 31, y: 40, n, col, t: 0 }); }
  else B.pops.push({ x: u.x + (u.w * u.sc) / 2, y: u.y + (u.h * u.sc) / 2, n, col, t: 0 });
}
async function fxOn(list, kind) {
  for (const f of list) if (f) B.fx.push({ kind, x: f.x + (f.w * (f.sc || 1)) / 2, y: f.y + (f.h * (f.sc || 1)) / 2, w: f.w * (f.sc || 1), h: f.h * (f.sc || 1), t: 0, n: 22 });
  if (kind === 'slash' || kind === 'hit' || kind === 'fireslash') sfx('slash');
  await frames(_B.fast ? 2 : 16);
}
async function fxFriends(list, kind) {
  for (const m of list) B.fx.push({ kind, win: S.members.indexOf(m), t: 0, n: 24 });
  await frames(_B.fast ? 2 : 14);
}

// ---------- update and draw ----------
export function updateBattle() {
  if (!B) return;
  B.t++;
  if (B.shake > 0) B.shake--;
  for (const k of Object.keys(B.flashWin)) if (B.flashWin[k] > 0) B.flashWin[k]--;
  for (const f of B.foes) {
    if (f.blink > 0) f.blink--;
    if (f.fade > 0) f.fade--;
    if (f.lunge > 0) f.lunge--;
    if (f.tx !== undefined) { f.x += (f.tx - f.x) * 0.2; f.y += (f.ty - f.y) * 0.2; }
  }
  B.fx = B.fx.filter((e) => ++e.t < e.n);
  B.pops = B.pops.filter((p) => ++p.t < 40);
  const ws = B.waits; B.waits = [];
  for (const w of ws) { if (--w.t <= 0) w.res(); else B.waits.push(w); }
}

const ELC = { fire: ['#f86818', '#f8c048'], ice: ['#78c8f8', '#e8f8ff'], light: ['#f8f0a0', '#ffffff'], dark: ['#7838a8', '#d080f8'], earth: ['#a87838', '#e8c078'], water: ['#3878f8', '#98d8f8'], wind: ['#58d870', '#c8f8c8'], blast: ['#f8a038', '#ffffff'] };
export function drawBattle() {
  if (!B) return;
  const sx = B.shake ? ((B.shake % 2) * 2 - 1) * Math.min(3, B.shake / 2) : 0;
  ctx.save(); ctx.translate(Math.round(sx), 0);
  // the sky and the painted ground
  const [bgk, top, bot] = B.bg;
  const g = ctx.createLinearGradient(0, 0, 0, 96);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-4, 0, W + 8, 160);
  const art = bgArt(bgk);
  if (art) ctx.drawImage(art, 0, 0, art.width, art.height, -4, 150 - 104, W + 8, 104);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-4, 146, W + 8, 14);
  // monsters
  for (const f of B.foes) {
    if (!f.alive && f.fade <= 0) continue;
    const pick = B.targetPick && B.targetPick.includes(f);
    let img = f.art;
    if (f.blink && (f.blink >> 1) % 2) continue;
    if (pick && (B.t >> 3) % 2) img = flash(f.art, '#ffffff');
    const x = Math.round(f.x), y = Math.round(f.y + (f.lunge ? Math.sin((f.lunge / 10) * Math.PI) * -4 : 0));
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + (f.w * f.sc) / 2, 147, (f.w * f.sc) / 2.6, 3, 0, 0, 7); ctx.fill();
    if (!f.alive) {
      // melting away
      const k = f.fade / 24;
      ctx.globalAlpha = k;
      const hh = f.h * k;
      ctx.drawImage(flash(f.art, '#ffffff'), 0, f.h - hh, f.w, hh, x, y + (f.h * f.sc) - hh * f.sc, f.w * f.sc, hh * f.sc);
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.drawImage(img, x, y, Math.round(f.w * f.sc), Math.round(f.h * f.sc));
    if (pick) ctx.drawImage(HAND_D, Math.round(x + (f.w * f.sc) / 2 - 5), Math.max(48, y - 10 + ((B.t >> 3) % 2)));
    if (f.st.sleep && (B.t >> 4) % 2) text('Z', x + f.w * f.sc - 6, y - 2, '#a0c8f8');
  }
  // effects over the monsters
  for (const e of B.fx) drawFx(e);
  ctx.restore();
  // the party windows
  drawParty();
  // damage numbers
  for (const p of B.pops) {
    const y = p.y - Math.min(10, p.t) + (p.t > 30 ? (p.t - 30) : 0);
    ctx.globalAlpha = p.t > 32 ? (40 - p.t) / 8 : 1;
    text(String(p.n), p.x, y, p.col, { align: 'center' });
    ctx.globalAlpha = 1;
  }
  // the message window
  if (B.log.length && !UI.active) {
    windowBox(2, 152, W - 4, 70);
    B.log.slice(-4).forEach((l, i) => text(l, 12, 160 + i * 15));
  } else if (!UI.active) {
    windowBox(2, 152, W - 4, 70);
  }
  if (UI.active) drawFoeList();
  const art2 = B.fx.find((e) => e.kind === 'artname');
  if (art2) { const w = textW(art2.name) + 30; windowBox((W - w) / 2, 60, w, 24, { hot: true }); text(art2.name, W / 2, 66, '#f8d050', { align: 'center' }); }
}
function drawFoeList() {
  // which monsters are left, beside the command menu
  const g = {};
  for (const f of liveFoes()) g[f.id] = (g[f.id] || 0) + 1;
  const rows = Object.entries(g);
  if (!B.cmdOpen) return;
  windowBox(128, 152, 126, 70);
  rows.slice(0, 4).forEach(([id, n], i) => { text(nm(MON[id]), 136, 160 + i * 15); text(`${n}`, 246, 160 + i * 15, '#f8f8f8', { align: 'right' }); });
}
function drawParty() {
  const n = S.members.length;
  S.members.forEach((h, i) => {
    const s = stats(h), x = 2 + i * 63, act = B.active === h;
    const y = act ? 0 : 2;
    const dead = h.hp <= 0, low = !dead && h.hp < s.maxhp / 4;
    const col = dead ? '#f86060' : low ? '#f8c048' : '#f8f8f8';
    const fl = B.flashWin[i] && (B.flashWin[i] >> 1) % 2;
    windowBox(x, y, 62, 46, { hot: act || (B.allyPick === i && (B.t >> 3) % 2) });
    if (h.b && h.b.pepT) { ctx.globalAlpha = 0.35 + Math.sin(B.t / 6) * 0.15; ctx.fillStyle = '#f8a028'; ctx.fillRect(x + 4, y + 4, 54, 38); ctx.globalAlpha = 1; }
    if (fl) { ctx.fillStyle = 'rgba(248,64,64,0.45)'; ctx.fillRect(x + 4, y + 4, 54, 38); }
    const nmn = heroName(h);
    // statuses and buffs take turns with the name, about a second each
    const tags = dead ? [] : statusTags(h.st, h.b && h.b.buffs), pages = tags.length ? tagPages(tags, 49) : [];
    const ph = Math.floor(B.t / 60) % (pages.length + 1);
    if (ph === 0) text(isEn() ? nmn.slice(0, 7) : nmn, x + 7, y + 4, col); else drawTags(pages[ph - 1], x + 7, y + 4, 49);
    text('H', x + 7, y + 17, '#a8b0c8'); text(String(h.hp), x + 56, y + 17, col, { align: 'right' });
    text('M', x + 7, y + 29, '#a8b0c8'); text(String(h.mp), x + 56, y + 29, col, { align: 'right' });
    void n;
  });
  for (const e of B.fx) if (e.win !== undefined && e.win >= 0) drawWinFx(e);
}
function drawWinFx(e) {
  const x = 2 + e.win * 63, k = e.t / e.n;
  if (e.kind === 'heal') { for (let i = 0; i < 6; i++) { const px = x + 8 + ((i * 37 + e.t * 3) % 46), py = 40 - ((e.t * 2 + i * 9) % 36); ctx.fillStyle = i % 2 ? '#a8f8c8' : '#ffffff'; ctx.fillRect(px, py, 2, 2); } }
  if (e.kind === 'buff') { ctx.globalAlpha = 1 - k; ctx.fillStyle = '#88c8f8'; for (let i = 0; i < 3; i++) { const px = x + 14 + i * 16, py = 38 - e.t * 1.5; ctx.fillRect(px, py, 3, 6); ctx.fillRect(px - 2, py + 2, 7, 2); } ctx.globalAlpha = 1; }
  if (e.kind === 'pep') { ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#f8b030'; ctx.lineWidth = 2; ctx.strokeRect(x + 1 - k * 4, 1 - k * 4, 60 + k * 8, 44 + k * 8); ctx.globalAlpha = 1; }
}
function drawFx(e) {
  const k = e.t / e.n;
  switch (e.kind) {
    case 'slash': case 'fireslash': {
      ctx.strokeStyle = e.kind === 'fireslash' ? '#f8a030' : '#ffffff'; ctx.lineWidth = 2;
      const L2 = Math.min(1, k * 2.2) * 30;
      ctx.beginPath(); ctx.moveTo(e.x + 15, e.y - 15); ctx.lineTo(e.x + 15 - L2, e.y - 15 + L2); ctx.stroke();
      if (k > 0.3) { ctx.beginPath(); ctx.moveTo(e.x + 8, e.y - 18); ctx.lineTo(e.x + 8 - L2 * 0.8, e.y - 18 + L2 * 0.8); ctx.stroke(); }
      ctx.lineWidth = 1;
      break;
    }
    case 'hit': { ctx.fillStyle = '#ffffff'; const r = 4 + k * 10; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.fillRect(e.x + Math.cos(a) * r - 1, e.y + Math.sin(a) * r - 1, 3, 3); } break; }
    case 'fire': { for (let i = 0; i < 10; i++) { const px = e.x - e.w / 3 + ((i * 29) % Math.max(8, e.w * 0.66)), py = e.y + e.h / 3 - ((e.t * 3 + i * 7) % Math.max(10, e.h * 0.8)); ctx.fillStyle = i % 3 ? '#f86818' : '#f8d048'; ctx.fillRect(px, py, 4, 6); } break; }
    case 'ice': { for (let i = 0; i < 8; i++) { const px = e.x - e.w / 3 + ((i * 23) % Math.max(8, e.w * 0.66)), py = e.y - e.h / 2 + k * e.h * 0.7 + (i % 3) * 6; ctx.fillStyle = i % 2 ? '#c8f0ff' : '#78c8f8'; ctx.fillRect(px, py, 3, 7); } break; }
    case 'bolt': { if ((e.t >> 1) % 2) { ctx.strokeStyle = '#fff8a0'; ctx.lineWidth = 2; ctx.beginPath(); let x = e.x, y = 46; ctx.moveTo(x, y); while (y < e.y + e.h / 3) { x += (Math.random() - 0.5) * 14; y += 10; ctx.lineTo(x, y); } ctx.stroke(); ctx.lineWidth = 1; } break; }
    case 'wind': { ctx.strokeStyle = '#c8f8d0'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(e.x, e.y, 6 + i * 6 + k * 8, k * 8 + i, k * 8 + i + 2.2); ctx.stroke(); } break; }
    case 'holy': { ctx.globalAlpha = 0.6 * (1 - Math.abs(k - 0.5) * 2); ctx.fillStyle = '#fff8d0'; ctx.fillRect(e.x - 8, 46, 16, e.y - 46 + e.h / 2); ctx.globalAlpha = 1; break; }
    case 'dark': { ctx.fillStyle = '#b060f0'; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + k * 4, r = 18 * (1 - k); ctx.fillRect(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r, 3, 3); } break; }
    case 'heal': break;
    case 'boom': { ctx.globalAlpha = 1 - k; ctx.fillStyle = k < 0.3 ? '#ffffff' : '#f8a038'; ctx.beginPath(); ctx.arc(e.x, e.y, 6 + k * 20, 0, 7); ctx.fill(); ctx.globalAlpha = 1; break; }
    case 'star': { for (let i = 0; i < 6; i++) { const px = e.x - 20 + i * 8, py = 46 + ((e.t * 6 + i * 13) % Math.max(20, e.y - 30)); ctx.fillStyle = i % 2 ? '#f8f0a0' : '#ffffff'; ctx.fillRect(px, py, 3, 3); ctx.fillRect(px - 1, py + 1, 5, 1); } break; }
    case 'breath': {
      const [c1, c2] = ELC[e.el] || ['#ffffff', '#c0c0c0'];
      ctx.globalAlpha = 0.45 * (1 - Math.abs(k - 0.5) * 2);
      ctx.fillStyle = c1; ctx.fillRect(0, 0, W, 50);
      ctx.fillStyle = c2; for (let i = 0; i < 16; i++) ctx.fillRect((i * 37 + e.t * 9) % W, (i * 13) % 48, 4, 4);
      ctx.globalAlpha = 1;
      break;
    }
    default: break;
  }
}
void MAXPARTY; void HEROES; void ZONES; void EQUIP; void canvas; void HAND;
