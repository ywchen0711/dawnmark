// The party, the skill boards, inventory, gold, story flags and saving.
import { HEROES, LEARN, BOARDS, SKILLS, ITEMS, EQUIP, expFor, spFor, nm } from './data.js';
import { L } from './i18n.js';

export const S = {
  members: [], reserve: [], inv: {}, gold: 0, flags: {}, map: 'brightfall', x: 0, y: 0, dir: 'd', time: 0, steps: 0,
  visited: [], church: null, repel: 0, ride: null, // ride: { kind: 'boat' | 'drake', map, x, y } where it is parked
};
export const MAXPARTY = 4;

export function makeHero(id, lv = 1) {
  // the first skill of the first path comes free
  const h = { id, lv, exp: expFor(lv), equip: { ...HEROES[id].equip }, st: {}, sp: 0, board: { '0:0': true }, seeds: {}, tactic: 'orders' };
  for (let l = 2; l <= lv; l++) h.sp += spFor(l);
  const s = stats(h);
  h.hp = s.maxhp; h.mp = s.maxmp;
  return h;
}
// opened nodes on the skill board: board['path:index'] = true
export const nodeOpen = (h, p, i) => !!h.board[p + ':' + i];
export function boardEffects(h) {
  const out = { stat: {}, skills: [], spells: [], pass: new Set() };
  (BOARDS[h.id] || []).forEach((path, p) => path.nodes.forEach(([, eff], i) => {
    if (!nodeOpen(h, p, i)) return;
    if (eff.skill) out.skills.push(eff.skill);
    else if (eff.spell) out.spells.push(eff.spell);
    else if (eff.pass) out.pass.add(eff.pass);
    else for (const [k, v] of Object.entries(eff)) out.stat[k] = (out.stat[k] || 0) + v;
  }));
  return out;
}
const curve = (base, grow, lv) => base + grow * (lv - 1) * (1 + (lv - 1) / 90);
export function stats(h) {
  const H = HEROES[h.id], b = boardEffects(h), sd = h.seeds || {};
  const s = {};
  for (const k of ['hp', 'mp', 'str', 'def', 'agi', 'mag', 'heal']) s[k] = Math.floor(curve(H.base[k], H.grow[k], h.lv)) + (b.stat[k] || 0) + (sd[k] || 0);
  s.maxhp = Math.min(999, s.hp); s.maxmp = Math.min(999, s.mp);
  s.atk = s.str; s.el = null; s.resist = null; s.immune = false; s.hits = 1; s.all = false; s.crit = 0; s.st = null;
  for (const slot of ['weapon', 'armor', 'shield', 'head', 'acc']) {
    const it = EQUIP[h.equip[slot]];
    if (!it) continue;
    s.atk += it.atk || 0; s.def += it.def || 0; s.agi += it.agi || 0; s.mag += it.mag || 0; s.heal += it.heal || 0; s.str += it.str || 0; s.atk += it.str || 0;
    if (it.el) s.el = it.el;
    if (it.resist) s.resist = it.resist;
    if (it.immune) s.immune = true;
    if (it.hits) s.hits = it.hits;
    if (it.all) s.all = true;
    if (it.crit) s.crit += it.crit;
    if (it.st) s.st = it.st;
  }
  s.pass = b.pass;
  return s;
}
export const heroName = (h) => nm(HEROES[h.id]);
export const spriteOf = (h) => HEROES[h.id].sprite;
// spells (level and board) and skills (board) a hero knows
export function spellsOf(h) {
  const list = (LEARN[h.id] || []).filter(([lv]) => h.lv >= lv).map(([, s]) => s);
  for (const s of boardEffects(h).spells) if (!list.includes(s)) list.push(s);
  return list;
}
export const skillsOf = (h) => boardEffects(h).skills;
export const passive = (h, p) => boardEffects(h).pass.has(p);
export const mpCost = (h, id) => { const c = SKILLS[id] ? SKILLS[id].mp : 0; return SKILLS[id] && SKILLS[id].spell && passive(h, 'mpcut') ? Math.ceil(c * 0.75) : c; };
export const alive = () => S.members.filter((m) => m.hp > 0);
export const member = (id) => S.members.find((m) => m.id === id) || S.reserve.find((m) => m.id === id);
export const has = (id) => !!member(id);

export function addMember(id, lv) {
  if (member(id)) return member(id);
  const all = [...S.members, ...S.reserve];
  const avg = all.length ? Math.round(all.reduce((a, m) => a + m.lv, 0) / all.length) : 1;
  const h = makeHero(id, Math.max(lv || 1, avg));
  if (S.members.length < MAXPARTY) S.members.push(h); else S.reserve.push(h);
  return h;
}
export function removeMember(id) {
  let i = S.members.findIndex((m) => m.id === id);
  if (i >= 0) { const [m] = S.members.splice(i, 1); fillParty(); return m; }
  i = S.reserve.findIndex((m) => m.id === id);
  if (i >= 0) return S.reserve.splice(i, 1)[0];
  return null;
}
export function fillParty() { while (S.members.length < MAXPARTY && S.reserve.length) S.members.push(S.reserve.shift()); }

// returns lines describing level ups
export function gainExp(h, n) {
  const out = [];
  h.exp += n;
  while (h.exp >= expFor(h.lv + 1) && h.lv < 60) {
    const before = stats(h), hadS = spellsOf(h);
    h.lv++;
    const after = stats(h), gain = spFor(h.lv);
    h.sp += gain;
    if (h.hp > 0) { h.hp += after.maxhp - before.maxhp; h.mp += after.maxmp - before.maxmp; }
    const ups = [['str', '力量', 'Strength'], ['def', '防禦', 'Defence'], ['agi', '速度', 'Agility'], ['mag', '魔力', 'Magic'], ['maxhp', '最大體力', 'Max HP'], ['maxmp', '最大魔力', 'Max MP']]
      .filter(([k]) => after[k] > before[k]).map(([k, zh, en]) => L(`${zh}+${after[k] - before[k]}`, `${en} +${after[k] - before[k]}`));
    out.push({ lv: true, text: L(`${heroName(h)}升到了 ${h.lv} 級！`, `${heroName(h)} has reached level ${h.lv}!`), ups: ups.join(L('　', '  ')) });
    out.push({ text: L(`得到了 ${gain} 點技能點數。`, `${heroName(h)} earns ${gain} skill points.`) });
    for (const sp of spellsOf(h)) if (!hadS.includes(sp)) out.push({ text: L(`${heroName(h)}學會了「${nm(SKILLS[sp])}」！`, `${heroName(h)} has learned ${nm(SKILLS[sp])}!`) });
  }
  return out;
}

export function addItem(id, n = 1) { if (!ITEMS[id]) { console.warn('no item', id); return; } S.inv[id] = (S.inv[id] || 0) + n; if (S.inv[id] <= 0) delete S.inv[id]; }
export const count = (id) => S.inv[id] || 0;
export function fullHeal(revive = true) { for (const m of [...S.members, ...S.reserve]) { if (m.hp <= 0 && !revive) continue; const s = stats(m); m.hp = s.maxhp; m.mp = s.maxmp; m.st = {}; } }

// ---------- save ----------
const KEY = 'dawnmark-save';
export function save(slot = 0) {
  try { localStorage.setItem(KEY + slot, JSON.stringify({ ...S, savedAt: Date.now() })); return true; } catch (e) { return false; }
}
export function hasSave(slot = 0) { try { return !!localStorage.getItem(KEY + slot); } catch (e) { return false; } }
export function saveInfo(slot = 0) { try { return JSON.parse(localStorage.getItem(KEY + slot)); } catch (e) { return null; } }
export function load(slot = 0) {
  try {
    const d = JSON.parse(localStorage.getItem(KEY + slot));
    if (!d) return false;
    Object.assign(S, { members: [], reserve: [], inv: {}, flags: {}, visited: [], church: null, repel: 0, ride: null, stash: {} }, d);
    return true;
  } catch (e) { return false; }
}
export function reset() {
  Object.assign(S, { members: [], reserve: [], inv: { herb: 3 }, gold: 50, flags: {}, map: 'brightfall', x: 0, y: 0, dir: 'd', time: 0, steps: 0, visited: [], church: null, repel: 0, ride: null, stash: {} });
}
