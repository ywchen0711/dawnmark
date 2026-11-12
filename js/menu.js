// The field menu (items, spells, the skill board, equipment, status, tactics, party order,
// settings, saving) and shops.
import { ctx, W, H, text, textW, windowBox, HAND } from './gfx.js';
import { sprite, face } from './sprites.js';
import { ITEMS, EQUIP, SKILLS, HEROES, BOARDS, PASSIVES, expFor, nm, ds } from './data.js';
import { S, stats, spellsOf, skillsOf, mpCost, addItem, count, save, heroName, spriteOf, nodeOpen, MAXPARTY } from './party.js';
import { menu, panel, notice, ask, pressKey, custom } from './ui.js';
import { input } from './input.js';
import { sfx, vol, setVolumes, music, setMusic } from './audio.js';
import { settings as bset, tacticsMenu } from './battle.js';
import { L, LANG, isEn, setLang } from './i18n.js';

export const settings = { scan: true };
const fmtTime = (t) => { const s = Math.floor(t / 60), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return `${h}:${String(m).padStart(2, '0')}`; };
let hooks = { zoom: null, repel: null };
export function setMenuHooks(h) { hooks = h; }

function drawParty(x, y, w) {
  const all = S.members, rh = 44;
  windowBox(x, y, w, 10 + all.length * rh);
  all.forEach((m, i) => {
    const s = stats(m), yy = y + 6 + i * rh;
    ctx.drawImage(face(HEROES[m.id].face), 0, 0, 48, 48, x + 7, yy + 1, 36, 36);
    text(heroName(m), x + 48, yy, '#f8f8f8');
    text('Lv ' + m.lv, x + w - 8, yy, '#f8e070', { align: 'right' });
    text(`H ${m.hp}/${s.maxhp}`, x + 48, yy + 13, m.hp <= 0 ? '#f86060' : m.hp < s.maxhp / 4 ? '#f8c048' : '#f8f8f8');
    text(`M ${m.mp}/${s.maxmp}`, x + 48, yy + 26, '#c0d0f8');
    if (m.sp > 0 && (S.time >> 5) % 2) text('SP', x + w - 8, yy + 26, '#78f8a0', { align: 'right' });
  });
}
async function pickMember(title, filter = () => true, list = S.members) {
  const r = await menu(list.map((m) => ({ label: heroName(m), right: `${m.hp}/${stats(m).maxhp}`, disabled: !filter(m) })), { x: 96, y: 40, w: 156, title });
  return r < 0 ? null : list[r];
}

// ---------- field menu ----------
export async function fieldMenu(info) {
  const close = panel(() => {
    drawParty(4, 4, 158);
    windowBox(166, 184, 86, 38);
    text(`${S.gold} G`, 244, 190, '#f8e070', { align: 'right' });
    text(fmtTime(S.time), 244, 205, '#f8f8f8', { align: 'right' });
  });
  let last = 0;
  for (;;) {
    const items = [
      ['item', L('道具', 'Items')], ['spell', L('咒文', 'Spells')], ['board', L('技能盤', 'Skills')], ['equip', L('裝備', 'Equip')], ['status', L('狀態', 'Status')], ['tactics', L('作戰', 'Tactics')], ['party', L('隊伍', 'Party')],
      ['journal', L('日誌', 'Journal')], ['book', L('圖鑑', 'Book'), !S.inv.monsterbook], ['config', L('設定', 'Config')], ['save', L('記錄', 'Save'), !info.canSave],
    ];
    const r = await menu(items.map(([, label, off]) => ({ label, disabled: !!off })), { x: 166, y: 4, w: 86, start: last, maxRows: 11, rowH: 15 });
    if (r < 0) break;
    last = r;
    const id = items[r][0];
    if (id === 'item') { const z = await itemMenu(); if (z) { close(); return z; } }
    if (id === 'spell') { const z = await spellMenu(); if (z) { close(); return z; } }
    if (id === 'board') await boardMenu();
    if (id === 'equip') await equipMenu();
    if (id === 'status') await statusMenu();
    if (id === 'tactics') await tacticsMenu();
    if (id === 'party') await partyMenu();
    if (id === 'journal' && hooks.journal) await hooks.journal();
    if (id === 'book' && hooks.book) await hooks.book();
    if (id === 'config') await settingsMenu();
    if (id === 'save') { const ok = save(0); sfx(ok ? 'save' : 'buzz'); await notice(ok ? L('冒險已記錄。', 'Your adventure has been saved.') : L('無法存檔（瀏覽器不允許）。', "Can't save (the browser blocked it).")); }
  }
  close();
  return null;
}
async function itemMenu() {
  for (;;) {
    const list = Object.keys(S.inv).sort((a, b) => (ITEMS[a].key ? 2 : ITEMS[a].equip ? 1 : 0) - (ITEMS[b].key ? 2 : ITEMS[b].equip ? 1 : 0));
    if (!list.length) { await notice(L('什麼都沒有。', 'Nothing here.')); return null; }
    let desc = '';
    const close = panel(() => { windowBox(4, 186, W - 8, 34); text(desc, 12, 196); });
    const r = await menu(list.map((id) => ({ label: nm(ITEMS[id]), right: ITEMS[id].key ? '' : S.inv[id], disabled: !ITEMS[id].use || ITEMS[id].battle, color: ITEMS[id].key ? '#f8e070' : undefined })), { x: 4, y: 4, w: W - 8, cols: 2, maxRows: 10, cancel: true, onMove: (i) => { const it = ITEMS[list[i]]; desc = ds(it) || (it.equip ? equipDesc(it) : ''); } });
    close();
    if (r < 0) return null;
    const id = list[r], it = ITEMS[id];
    if (it.use === 'zoom') { const z = hooks.zoom && (await hooks.zoom()); if (z) { addItem(id, -1); return z; } continue; }
    if (it.use === 'whistle') { if (hooks.whistle) await hooks.whistle(); return null; }
    if (it.use === 'repel') { addItem(id, -1); S.repel = 160; sfx('holy'); await notice(L('四周瀰漫著神聖的香氣。', 'A holy scent fills the air.')); continue; }
    if (it.use === 'book') { if (hooks.book) await hooks.book(); continue; }
    if (it.use === 'tmap') { if (hooks.tmap) await hooks.tmap(id); continue; }
    if (it.use === 'healall' || it.use === 'fullall') {
      addItem(id, -1); sfx('heal');
      for (const m of [...S.members, ...S.reserve]) if (m.hp > 0) { const s2 = stats(m); m.hp = it.use === 'fullall' ? s2.maxhp : Math.min(s2.maxhp, m.hp + it.power); if (it.use === 'fullall') m.mp = s2.maxmp; }
      await notice(L('全體同伴回復了！', 'Everyone recovers!'));
      continue;
    }
    const target = await pickMember(L('給誰使用？', 'Use on whom?'), (m) => (it.use === 'revive' ? m.hp <= 0 : m.hp > 0), [...S.members, ...S.reserve]);
    if (!target) continue;
    await useItemOn(id, target);
  }
}
export async function useItemOn(id, m) {
  const it = ITEMS[id], s = stats(m);
  if (it.use === 'heal') m.hp = Math.min(s.maxhp, m.hp + it.power);
  if (it.use === 'mp') m.mp = Math.min(s.maxmp, m.mp + it.power);
  if (it.use === 'cure') for (const k of it.st) delete m.st[k];
  if (it.use === 'revive') m.hp = Math.max(1, Math.round(s.maxhp * it.power));
  if (it.use === 'seed') {
    m.seeds = m.seeds || {}; m.seeds[it.stat] = (m.seeds[it.stat] || 0) + it.n2;
    addItem(id, -1); sfx('buff');
    await notice(L(`${heroName(m)}的${{ str: '力量', def: '防禦', agi: '速度', hp: '最大體力', mag: '魔力' }[it.stat]}提高了 ${it.n2} 點！`, `${heroName(m)}'s ${{ str: 'strength', def: 'defence', agi: 'agility', hp: 'max HP', mag: 'magic' }[it.stat]} rises by ${it.n2}!`));
    return;
  }
  addItem(id, -1); sfx('heal');
}
const STATN = { atk: ['攻擊', 'ATK'], def: ['防禦', 'DEF'], agi: ['速度', 'AGI'], mag: ['魔力', 'MAG'], heal: ['回復', 'HEAL'], str: ['力量', 'STR'] };
export const canEquip = (m, it) => {
  if (!it.equip) return false;
  if (it.only && it.only !== m.id) return false;
  const H0 = HEROES[m.id];
  if (it.slot === 'weapon') return H0.wpn.includes(it.cls);
  if (it.slot === 'armor') return H0.arm.includes(it.cls);
  if (it.slot === 'shield') return H0.shield;
  if (it.slot === 'head') return it.cls !== 'helm' || H0.arm.includes('heavy');
  return true;
};
function equipDesc(it) {
  const who = Object.keys(HEROES).filter((id) => canEquip({ id }, it)).map((id) => nm(HEROES[id])).join(L('、', ', '));
  const parts = Object.entries(STATN).filter(([k]) => it[k]).map(([k, n]) => `${L(n[0], n[1])}+${it[k]}`);
  if (it.pass && PASS_SHORT[it.pass]) parts.push(L(...PASS_SHORT[it.pass]));
  if (it.resist) parts.push(it.resist === 'all' ? L('抗性', 'Resist') : L('抗', 'Res.') + it.resist);
  return L(`${parts.join(' ')}　${who}`, `${parts.join(' ')}  ${who}`);
}
// spells usable outside battle
async function spellMenu() {
  const caster = await pickMember(L('誰要施法？', 'Who casts?'), (m) => m.hp > 0 && spellsOf(m).some((s) => SKILLS[s].field), S.members);
  if (!caster) return null;
  for (;;) {
    const list = spellsOf(caster).filter((s) => SKILLS[s].field);
    const r = await menu(list.map((id) => ({ label: nm(SKILLS[id]), right: mpCost(caster, id), disabled: mpCost(caster, id) > caster.mp })), { x: 96, y: 40, w: 156, maxRows: 8, title: `${heroName(caster)}　MP ${caster.mp}` });
    if (r < 0) return null;
    const id = list[r], sp = SKILLS[id], st = stats(caster);
    if (id === 'homeward') { const z = hooks.zoom && (await hooks.zoom()); if (z) { caster.mp -= mpCost(caster, id); return z; } continue; }
    if (id === 'holyward') { caster.mp -= mpCost(caster, id); S.repel = 200; sfx('holy'); await notice(L('神聖的光包圍著大家。', 'A holy light surrounds you.')); continue; }
    if (sp.tgt === 'allies') { caster.mp -= mpCost(caster, id); sfx('heal'); for (const m of [...S.members, ...S.reserve]) if (m.hp > 0) m.hp = Math.min(stats(m).maxhp, m.hp + Math.round(sp.power * (1 + st.heal / 150))); continue; }
    const t = await pickMember(L('對誰施放？', 'Cast on whom?'), (m) => (sp.kind === 'revive' ? m.hp <= 0 : m.hp > 0), [...S.members, ...S.reserve]);
    if (!t) continue;
    caster.mp -= mpCost(caster, id); sfx('heal');
    if (sp.kind === 'heal') t.hp = Math.min(stats(t).maxhp, t.hp + Math.round(sp.power * (1 + st.heal / 150)));
    if (sp.kind === 'cure') for (const k of sp.st) delete t.st[k];
    if (sp.kind === 'revive') t.hp = Math.max(1, Math.round(stats(t).maxhp * sp.power));
  }
}

// ---------- the skill board ----------
const PASS_SHORT = { crit: ['會心↑', 'Crit up'], pep: ['燃心↑', 'Fire up'], steal: ['偷竊↑', 'Steal up'], gold: ['金幣↑', 'Gold up'], first: ['先制↑', 'First up'], mpcut: ['省魔', 'MP saver'], regen: ['再生', 'Regen'], double: ['連發', 'Twin cast'], block: ['盾擋', 'Block'], lucky: ['幸運', 'Lucky'], mpregen: ['回魔', 'MP regen'], counter: ['反擊', 'Counter'], expup: ['經驗↑', 'EXP up'], swift: ['迅捷', 'Swift'], nopoison: ['防毒', 'No poison'], pepstart: ['鬥志', 'Spirit'] };
const STAT_SHORT = { hp: ['體力', 'HP'], mp: ['魔力', 'MP'], str: ['力量', 'STR'], def: ['防禦', 'DEF'], agi: ['速度', 'AGI'], mag: ['魔力', 'MAG'], heal: ['回復', 'HEAL'] };
function nodeLabel(eff) {
  if (eff.skill) return nm(SKILLS[eff.skill]);
  if (eff.spell) return nm(SKILLS[eff.spell]);
  if (eff.pass) return L(...PASS_SHORT[eff.pass]);
  const [k, v] = Object.entries(eff)[0];
  return `${L(...STAT_SHORT[k])}+${v}`;
}
function nodeDesc(eff) {
  if (eff.skill || eff.spell) return ds(SKILLS[eff.skill || eff.spell]);
  if (eff.pass) return L(...PASSIVES[eff.pass]);
  const [k, v] = Object.entries(eff)[0];
  return L(`${STAT_SHORT[k][0]}永久提高 ${v} 點。`, `${STAT_SHORT[k][1]} +${v} for good.`);
}
async function boardMenu() {
  const m = await pickMember(L('誰的技能盤？', "Whose skill board?"), () => true, [...S.members, ...S.reserve]);
  if (!m) return;
  const paths = BOARDS[m.id];
  let col = 0, row = 0, left = 0;
  const locked = (p) => paths[p].need && !S.flags[paths[p].need];
  const canOpen = (p, i) => !locked(p) && !nodeOpen(m, p, i) && (i === 0 || nodeOpen(m, p, i - 1));
  await custom({
    t: 0,
    update() {
      this.t++;
      if (this.confirm) return;
      const np = paths.length;
      if (input.repeat('left')) { col = (col + np - 1) % np; sfx('cursor'); }
      if (input.repeat('right')) { col = (col + 1) % np; sfx('cursor'); }
      if (col < left) left = col; if (col > left + 2) left = col - 2;
      if (input.repeat('up')) { row = (row + 5) % 6; sfx('cursor'); }
      if (input.repeat('down')) { row = (row + 1) % 6; sfx('cursor'); }
      if (input.pressed('b')) { sfx('cancel'); this.done(); return; }
      if (input.pressed('a')) {
        const [cost] = paths[col].nodes[row];
        if (!canOpen(col, row) || m.sp < cost) { sfx('buzz'); return; }
        this.confirm = true;
        ask(null, L(`用 ${cost} 點技能點數，學會「${nodeLabel(paths[col].nodes[row][1])}」嗎？`, `Spend ${cost} skill points on ${nodeLabel(paths[col].nodes[row][1])}?`), [L('學會', 'Learn'), L('算了', 'Not yet')]).then((r) => {
          this.confirm = false;
          if (r === 0) { m.sp -= cost; m.board[col + ':' + row] = true; sfx('level'); const s = stats(m); m.hp = Math.min(m.hp, s.maxhp); m.mp = Math.min(m.mp, s.maxmp); }
        });
      }
    },
    draw() {
      windowBox(0, 0, W, H);
      text(`${heroName(m)}　${L('技能點數', 'Skill points')} ${m.sp}`, 10, 7, '#f8e070');
      const cw = 82;
      if (paths.length > 3) { if (left > 0) text('◀', 2, 25, '#f8e070'); if (left + 3 < paths.length) text('▶', W - 10, 25, '#f8e070'); }
      paths.forEach((p, pi) => {
        if (pi < left || pi > left + 2) return;
        const x = 6 + (pi - left) * cw, lock = locked(pi);
        text(lock ? '？？？' : nm(p), x + cw / 2 - 2, 25, lock ? '#787888' : p.need ? '#f8c878' : '#a8c8f8', { align: 'center' });
        p.nodes.forEach(([cost, eff], i) => {
          const y = 42 + i * 22, open = nodeOpen(m, pi, i), ready = canOpen(pi, i);
          ctx.fillStyle = open ? '#305830' : ready ? '#283058' : '#181820';
          ctx.fillRect(x, y, cw - 6, 19);
          ctx.strokeStyle = pi === col && i === row ? '#f8d050' : open ? '#78c878' : '#585868'; ctx.strokeRect(x + 0.5, y + 0.5, cw - 7, 18);
          const lbl = lock ? '？？？' : nodeLabel(eff);
          text(lbl, x + 4, y + 3, open ? '#c8f8c8' : ready ? '#f8f8f8' : '#787888');
          if (!open) text(String(cost), x + cw - 10, y + 3, m.sp >= cost && ready ? '#f8e070' : '#787888', { align: 'right' });
          if (i < 5) { ctx.fillStyle = open ? '#78c878' : '#484858'; ctx.fillRect(x + cw / 2 - 4, y + 19, 2, 3); }
        });
      });
      const eff = paths[col].nodes[row][1];
      windowBox(4, 176, W - 8, 44);
      text(locked(col) ? L('這條路，要在同伴自己的故事之後才會打開。', "This path opens after the friend's own story.") : nodeDesc(eff), 12, 186);
      text(L('Z 學會　X 返回', 'Z: learn   X: back'), W - 12, 202, '#a0a0b8', { align: 'right' });
    },
  });
}

async function equipMenu() {
  const m = await pickMember(L('誰要換裝備？', 'Equip whom?'), () => true, [...S.members, ...S.reserve]);
  if (!m) return;
  const SLOT = [['weapon', L('武器', 'Weapon')], ['armor', L('鎧甲', 'Armour')], ['shield', L('盾', 'Shield')], ['head', L('頭', 'Head')], ['acc', L('飾品', 'Accessory')]];
  for (;;) {
    const st = stats(m);
    const close = panel(() => { windowBox(4, 120, W - 8, 40); text(L(`攻擊 ${st.atk}　防禦 ${st.def}　速度 ${st.agi}`, `ATK ${st.atk}  DEF ${st.def}  AGI ${st.agi}`), 12, 128); text(L(`魔力 ${st.mag}　回復 ${st.heal}`, `MAG ${st.mag}  HEAL ${st.heal}`), 12, 144, '#c0d0f8'); });
    const r = await menu(SLOT.map(([k, n]) => ({ label: n, right: m.equip[k] ? nm(EQUIP[m.equip[k]]) : '──', disabled: k === 'shield' && !HEROES[m.id].shield })), { x: 4, y: 4, w: 248, title: L(`${heroName(m)}的裝備`, `${heroName(m)}'s gear`) });
    close();
    if (r < 0) return;
    const slot = SLOT[r][0];
    const opts = Object.keys(S.inv).filter((id) => EQUIP[id] && EQUIP[id].slot === slot && canEquip(m, EQUIP[id]));
    const cur = m.equip[slot];
    let preview;
    const close2 = panel(() => {
      windowBox(4, 160, W - 8, 44);
      const a = stats(m);
      let b = a;
      if (preview !== undefined) { const keep = m.equip[slot]; m.equip[slot] = preview; b = stats(m); m.equip[slot] = keep; }
      const rows = [['atk', a.atk, b.atk], ['def', a.def, b.def], ['agi', a.agi, b.agi], ['mag', a.mag, b.mag]];
      rows.forEach(([k, x, y], i) => { const X = 12 + (i % 2) * 120, Y = 166 + Math.floor(i / 2) * 16; const lbl = `${L(STATN[k][0], STATN[k][1])} ${x} → `; text(lbl, X, Y); text(String(y), X + textW(lbl), Y, y > x ? '#78f878' : y < x ? '#f87878' : '#f8f8f8'); });
    });
    const labels = [{ label: L('（卸下）', '(Remove)') }, ...opts.map((id) => ({ label: nm(EQUIP[id]), right: S.inv[id] }))];
    const k = await menu(labels, { x: 60, y: 24, w: 180, title: SLOT[r][1], maxRows: 7, onMove: (i) => { preview = i === 0 ? null : opts[i - 1]; } });
    close2();
    if (k < 0) continue;
    if (k === 0 && slot === 'weapon') { sfx('buzz'); continue; }
    if (cur) addItem(cur, 1);
    if (k === 0) m.equip[slot] = null;
    else { m.equip[slot] = opts[k - 1]; addItem(opts[k - 1], -1); }
    const s2 = stats(m); m.hp = Math.min(m.hp, s2.maxhp); m.mp = Math.min(m.mp, s2.maxmp);
    sfx('ok');
  }
}
async function statusMenu() {
  const m = await pickMember(L('查看誰的狀態？', 'Whose status?'), () => true, [...S.members, ...S.reserve]);
  if (!m) return;
  const st = stats(m), H0 = HEROES[m.id];
  const close = panel(() => {
    windowBox(4, 4, W - 8, H - 8);
    ctx.drawImage(face(H0.face), 12, 12);
    text(`${heroName(m)}`, 68, 12, '#f8e070');
    text(L(H0.job[0], H0.job[1]), 68, 28);
    text(`Lv ${m.lv}`, 200, 12);
    text(`${L('經驗', 'EXP')} ${m.exp}`, 68, 44); text(`${L('下一級', 'Next')} ${Math.max(0, expFor(m.lv + 1) - m.exp)}`, 160, 44);
    const rows = [[`${L('體力', 'HP')} ${m.hp}/${st.maxhp}`, `${L('魔力', 'MP')} ${m.mp}/${st.maxmp}`], [`${L('攻擊', 'ATK')} ${st.atk}`, `${L('防禦', 'DEF')} ${st.def}`], [`${L('力量', 'STR')} ${st.str}`, `${L('速度', 'AGI')} ${st.agi}`], [`${L('魔力', 'MAG')} ${st.mag}`, `${L('回復', 'HEAL')} ${st.heal}`]];
    rows.forEach(([a, b], i) => { text(a, 14, 66 + i * 15); text(b, 130, 66 + i * 15); });
    const eq = ['weapon', 'armor', 'shield', 'head', 'acc'].map((k) => (m.equip[k] ? nm(EQUIP[m.equip[k]]) : '──'));
    eq.forEach((e, i) => text(e, 14 + (i % 2) * 120, 130 + Math.floor(i / 2) * 14, '#c0d0f8'));
    const sp = [...spellsOf(m), ...skillsOf(m)].map((s) => nm(SKILLS[s])), cols = isEn() ? 3 : 4, cw = isEn() ? 78 : 58;
    for (let i = 0; i < Math.min(sp.length, 8); i++) text(sp[i], 14 + (i % cols) * cw, 176 + Math.floor(i / cols) * 14, '#a8e8b8');
  });
  await pressKey();
  close();
}
// change the order, and who fights and who waits
async function partyMenu() {
  for (;;) {
    const all = [...S.members, ...S.reserve];
    const items = all.map((m, i) => ({ label: `${heroName(m)}`, right: i < S.members.length ? L('出戰', 'Active') : L('待命', 'Reserve'), color: i < S.members.length ? undefined : '#a0a8c0' }));
    const r = await menu(items, { x: 60, y: 30, w: 170, title: L('要和誰交換位置？', 'Move whom?') });
    if (r < 0) return;
    const m = all[r];
    const r2 = await menu(all.map((o) => ({ label: heroName(o), disabled: o === m })), { x: 60, y: 30, w: 170, title: L('和誰交換？', 'Swap with?') });
    if (r2 < 0) continue;
    const a = [...all];
    [a[r], a[r2]] = [a[r2], a[r]];
    const n = Math.min(MAXPARTY, a.length);
    S.members = a.slice(0, n); S.reserve = a.slice(n);
    if (!S.members.some((x) => x.hp > 0)) { S.members = all.slice(0, n); S.reserve = all.slice(n); sfx('buzz'); continue; }
    sfx('ok');
  }
}
async function settingsMenu() {
  for (;;) {
    const lv = (v) => '■'.repeat(Math.round(v * 5)) + '□'.repeat(5 - Math.round(v * 5));
    const r = await menu([
      { label: L('訊息速度', 'Message speed'), right: '■'.repeat(bset.speed) + '□'.repeat(6 - bset.speed) },
      { label: L('音樂', 'Music'), right: music.on ? lv(vol.music) : L('關', 'Off') }, { label: L('音效', 'Sound'), right: lv(vol.sfx) },
      { label: L('掃描線', 'Scanlines'), right: settings.scan ? L('開', 'On') : L('關', 'Off') }, { label: L('語言', 'Language'), right: LANG === 'en' ? 'English' : '中文' },
    ], { x: 30, y: 50, w: 210, title: L('設定', 'Config') });
    if (r < 0) return;
    if (r === 0) bset.speed = bset.speed % 6 + 1;
    if (r === 1) { if (!music.on) setMusic(true); else if (vol.music >= 1) setMusic(false); else vol.music = Math.min(1, (Math.round(vol.music * 5) + 1) / 5); }
    if (r === 2) vol.sfx = (Math.round(vol.sfx * 5) + 1) % 6 / 5;
    if (r === 3) { settings.scan = !settings.scan; document.body.classList.toggle('noscan', !settings.scan); }
    if (r === 4) setLang(LANG === 'en' ? 'zh' : 'en');
    setVolumes();
    try { localStorage.setItem('dawnmark-settings', JSON.stringify({ music: vol.music, sfx: vol.sfx, scan: settings.scan, speed: bset.speed })); } catch (e) { /* private mode */ }
  }
}
export function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('dawnmark-settings'));
    if (s) { vol.music = s.music; vol.sfx = s.sfx; settings.scan = s.scan; bset.speed = s.speed || 3; document.body.classList.toggle('noscan', !s.scan); }
  } catch (e) { /* none */ }
}

// ---------- shop ----------
export async function shop(stock, who = '商人') {
  const close = panel(() => { windowBox(170, 4, 82, 24); text(`${S.gold} G`, 244, 10, '#f8e070', { align: 'right' }); });
  let greeting = L('歡迎光臨！要買什麼嗎？', 'Welcome! What can I get you?');
  for (;;) {
    const r = await ask(who, greeting, [L('購買', 'Buy'), L('出售', 'Sell'), L('離開', 'Leave')], { cancel: true });
    if (r === 0) await buy(stock, who);
    else if (r === 1) await sell();
    else break;
    greeting = L('還需要什麼嗎？', 'Anything else?');
  }
  close();
  void HAND; void sprite; void spriteOf; void count;
}
async function buy(stock, who) {
  let info = '';
  for (;;) {
    const close = panel(() => { windowBox(4, 162, W - 8, 58); if (info) info.split('\n').forEach((l, i) => text(l, 12, 168 + i * 15)); });
    const r = await menu(stock.map((id) => ({ label: nm(ITEMS[id]), right: ITEMS[id].price, disabled: ITEMS[id].price > S.gold })), {
      x: 4, y: 30, w: 170, maxRows: 7, title: L('要買什麼？', 'Buy what?'),
      onMove: (i) => {
        const it = ITEMS[stock[i]];
        if (!it.equip) { info = `${ds(it)}\n${L('持有', 'Owned')} ${count(stock[i])}`; return; }
        const team = [...S.members, ...S.reserve];
        const parts = team.map((m) => {
          if (!canEquip(m, it)) return null;
          const a = stats(m), keep = m.equip[it.slot]; m.equip[it.slot] = stock[i]; const b = stats(m); m.equip[it.slot] = keep;
          const d = it.slot === 'weapon' ? b.atk - a.atk : (b.def - a.def) + (b.mag - a.mag) + (b.agi - a.agi) + (b.str - a.str);
          return `${heroName(m)} ${d > 0 ? '▲' + d : d < 0 ? '▼' + -d : '＝'}`;
        }).filter(Boolean);
        info = (parts.length ? parts.slice(0, 3).join('　') + (parts.length > 3 ? '\n' + parts.slice(3).join('　') : '') : L('沒有人能裝備', 'No one can use it')) + `\n${L('持有', 'Owned')} ${count(stock[i])}`;
      },
    });
    close();
    if (r < 0) return;
    const id = stock[r], it = ITEMS[id];
    if (it.price > S.gold) { sfx('buzz'); continue; }
    S.gold -= it.price; addItem(id); sfx('chest');
    if (it.equip) {
      const who2 = [...S.members, ...S.reserve].filter((m) => canEquip(m, it));
      if (who2.length) {
        const k = await ask(who, L(`要現在裝備「${nm(it)}」嗎？`, `Equip the ${nm(it)} now?`), [L('不用', 'No'), ...who2.map((m) => heroName(m))]);
        if (k > 0) { const m = who2[k - 1], old = m.equip[it.slot]; if (old) addItem(old); m.equip[it.slot] = id; addItem(id, -1); sfx('ok'); }
      }
    }
  }
}
async function sell() {
  for (;;) {
    const list = Object.keys(S.inv).filter((id) => !ITEMS[id].key && ITEMS[id].price > 0);
    if (!list.length) { await notice(L('沒有可以賣的東西。', 'Nothing to sell.')); return; }
    const r = await menu(list.map((id) => ({ label: `${nm(ITEMS[id])}×${S.inv[id]}`, right: Math.floor(ITEMS[id].price / 2) })), { x: 4, y: 30, w: 220, maxRows: 9, title: L('要賣什麼？', 'Sell what?') });
    if (r < 0) return;
    addItem(list[r], -1); S.gold += Math.floor(ITEMS[list[r]].price / 2); sfx('ok');
  }
}
