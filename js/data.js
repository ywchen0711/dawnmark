// Heroes, spells and skills, link arts, skill boards, items, equipment, monsters and troops.
// Names are [Chinese, English]; nm() picks the current language.
import { L } from './i18n.js';
export const nm = (o) => (o ? (Array.isArray(o.n) ? L(o.n[0], o.n[1]) : o.n) : '');
export const ds = (o) => (o && o.d ? L(o.d[0], o.d[1]) : '');

// ---------- heroes ----------
// stats at level 1 and growth per level: hp, mp, str (attack), def, agi, mag (spell power), heal
export const HEROES = {
  rowan: {
    n: ['洛恩', 'Rowan'], job: ['晨星之子', 'Dawnbearer'], sprite: 'warrior', face: 8,
    base: { hp: 40, mp: 6, str: 12, def: 8, agi: 8, mag: 8, heal: 8 }, grow: { hp: 9.2, mp: 2.6, str: 3.3, def: 1.8, agi: 1.7, mag: 2.1, heal: 2.0 },
    wpn: ['sword'], arm: ['heavy', 'light'], shield: true,
    equip: { weapon: 'oaksword', armor: 'tunic', shield: null, head: null, acc: null },
  },
  pell: {
    n: ['佩兒', 'Pell'], job: ['盜賊', 'Thief'], sprite: 'ranger_f', face: 18,
    base: { hp: 30, mp: 4, str: 11, def: 7, agi: 14, mag: 6, heal: 4 }, grow: { hp: 8.0, mp: 1.6, str: 2.9, def: 1.6, agi: 2.4, mag: 1.2, heal: 0.8 },
    wpn: ['knife', 'whip'], arm: ['light'], shield: false,
    equip: { weapon: 'dagger', armor: 'tunic', shield: null, head: null, acc: null },
  },
  mirela: {
    n: ['米蕾拉', 'Mirela'], job: ['神官', 'Priestess'], sprite: 'healer_f', face: 16,
    base: { hp: 34, mp: 18, str: 9, def: 8, agi: 9, mag: 8, heal: 16 }, grow: { hp: 8.2, mp: 4.0, str: 2.3, def: 1.8, agi: 1.6, mag: 1.5, heal: 3.6 },
    wpn: ['staff', 'spear'], arm: ['robe', 'light'], shield: true,
    equip: { weapon: 'oakstaff', armor: 'habit', shield: null, head: null, acc: null },
  },
  odo: {
    n: ['歐多', 'Odo'], job: ['武僧', 'Monk'], sprite: 'monk', face: 20,
    base: { hp: 46, mp: 8, str: 15, def: 9, agi: 10, mag: 4, heal: 8 }, grow: { hp: 11.0, mp: 1.8, str: 3.6, def: 2.0, agi: 1.8, mag: 0.8, heal: 1.6 },
    wpn: ['claw', 'fist'], arm: ['light'], shield: false,
    equip: { weapon: 'wraps', armor: 'gi', shield: null, head: null, acc: null },
  },
  sera: {
    n: ['瑟菈', 'Sera'], job: ['魔法使', 'Witch'], sprite: 'magician_f', face: 15,
    base: { hp: 28, mp: 22, str: 7, def: 6, agi: 11, mag: 18, heal: 6 }, grow: { hp: 7.0, mp: 4.6, str: 1.6, def: 1.4, agi: 2.0, mag: 3.8, heal: 1.2 },
    wpn: ['wand', 'whip'], arm: ['robe'], shield: false,
    equip: { weapon: 'wand', armor: 'robe', shield: null, head: null, acc: null },
  },
  brannoc: {
    n: ['布藍諾', 'Brannoc'], job: ['騎士', 'Knight'], sprite: 'darkknight', face: 22,
    base: { hp: 52, mp: 6, str: 16, def: 13, agi: 6, mag: 5, heal: 9 }, grow: { hp: 11.8, mp: 1.8, str: 3.4, def: 2.6, agi: 1.2, mag: 1.0, heal: 1.8 },
    wpn: ['sword', 'axe'], arm: ['heavy'], shield: true,
    equip: { weapon: 'longsword', armor: 'mail', shield: 'kiteshield', head: 'helm', acc: null },
  },
};
export const HERO_ORDER = ['rowan', 'pell', 'mirela', 'odo', 'sera', 'brannoc'];
// experience needed to reach a level
export const expFor = (lv) => (lv <= 1 ? 0 : Math.floor(10 * Math.pow(lv - 1, 2.25)));
// skill points earned on reaching a level
export const spFor = (lv) => 4 + Math.floor(lv / 4);

// ---------- spells and skills ----------
// kind: dmg (spell) | phys (weapon) | heal | revive | buff | debuff | status | cure | steal | special
// tgt: foe | group | foes | ally | allies | self ; power: spell base / physical multiplier ; hits: strikes
const S = (n, o) => ({ n, ...o });
export const SKILLS = {
  // light (Rowan)
  glint: S(['星閃', 'Glint'], { mp: 3, kind: 'dmg', tgt: 'foe', power: 14, el: 'light', fx: 'bolt', spell: true, d: ['以星光打擊一名敵人。', 'Strikes one foe with starlight.'] }),
  dawnbolt: S(['曙雷', 'Dawnbolt'], { mp: 9, kind: 'dmg', tgt: 'foes', power: 34, el: 'light', fx: 'bolt', spell: true, d: ['降下晨光之雷，攻擊全部敵人。', 'Brings down dawn lightning on every foe.'] }),
  daybreak: S(['晨光', 'Daybreak'], { mp: 26, kind: 'dmg', tgt: 'foes', power: 120, el: 'light', fx: 'holy', spell: true, d: ['晨星之印的真正力量。光吞沒所有敵人。', "The Dawnmark's true power. Light swallows every foe."] }),
  // fire, ice, wind, blast (Sera)
  flameshot: S(['焰矢', 'Flameshot'], { mp: 2, kind: 'dmg', tgt: 'foe', power: 12, el: 'fire', fx: 'fire', spell: true, d: ['射出火焰之箭。', 'Shoots an arrow of flame at one foe.'] }),
  blaze: S(['熾焰', 'Blaze'], { mp: 6, kind: 'dmg', tgt: 'foe', power: 40, el: 'fire', fx: 'fire', spell: true, d: ['以猛烈的火焰燒灼一名敵人。', 'Scorches one foe with fierce fire.'] }),
  inferno: S(['燎原', 'Inferno'], { mp: 16, kind: 'dmg', tgt: 'foe', power: 110, el: 'fire', fx: 'fire', spell: true, d: ['捲起燎原的業火。', 'Raises a wildfire against one foe.'] }),
  frostpin: S(['霜針', 'Frostpin'], { mp: 4, kind: 'dmg', tgt: 'group', power: 14, el: 'ice', fx: 'ice', spell: true, d: ['冰針刺向一群敵人。', 'Needles of ice pierce a group of foes.'] }),
  icewind: S(['冰風', 'Icewind'], { mp: 10, kind: 'dmg', tgt: 'foes', power: 34, el: 'ice', fx: 'ice', spell: true, d: ['刺骨的冰風吹襲全部敵人。', 'A biting wind of ice sweeps every foe.'] }),
  deepfrost: S(['凍天', 'Deepfrost'], { mp: 24, kind: 'dmg', tgt: 'foes', power: 92, el: 'ice', fx: 'ice', spell: true, d: ['連天空都凍結的寒氣。', 'A cold that freezes even the sky.'] }),
  galecut: S(['風刃', 'Galecut'], { mp: 5, kind: 'dmg', tgt: 'group', power: 22, el: 'wind', fx: 'wind', spell: true, d: ['風之刃切裂一群敵人。', 'Blades of wind cut a group of foes.'] }),
  tempest: S(['颶風', 'Tempest'], { mp: 14, kind: 'dmg', tgt: 'group', power: 70, el: 'wind', fx: 'wind', spell: true, d: ['捲起颶風吞沒一群敵人。', 'A tempest swallows a group of foes.'] }),
  burst: S(['爆裂', 'Burst'], { mp: 18, kind: 'dmg', tgt: 'foes', power: 62, el: 'blast', fx: 'boom', spell: true, d: ['在敵陣正中引起大爆炸。', 'A great explosion in the midst of the foes.'] }),
  starfall: S(['星墜', 'Starfall'], { mp: 40, kind: 'dmg', tgt: 'foes', power: 170, el: 'blast', fx: 'star', spell: true, d: ['讓星辰墜落在敵陣之上。', 'Brings the stars down upon the foes.'] }),
  // healing (Mirela, Rowan)
  mend: S(['療傷', 'Mend'], { mp: 3, kind: 'heal', tgt: 'ally', power: 30, fx: 'heal', spell: true, field: true, d: ['回復一名同伴約 30 點體力。', 'Restores about 30 HP to one friend.'] }),
  restore: S(['癒合', 'Restore'], { mp: 5, kind: 'heal', tgt: 'ally', power: 85, fx: 'heal', spell: true, field: true, d: ['回復一名同伴約 85 點體力。', 'Restores about 85 HP to one friend.'] }),
  renew: S(['全癒', 'Renew'], { mp: 7, kind: 'heal', tgt: 'ally', power: 9999, fx: 'heal', spell: true, field: true, d: ['完全回復一名同伴的體力。', "Fully restores one friend's HP."] }),
  mendall: S(['群癒', 'Mend All'], { mp: 12, kind: 'heal', tgt: 'allies', power: 70, fx: 'heal', spell: true, field: true, d: ['回復全體同伴約 70 點體力。', 'Restores about 70 HP to every friend.'] }),
  renewall: S(['大群癒', 'Renew All'], { mp: 32, kind: 'heal', tgt: 'allies', power: 9999, fx: 'heal', spell: true, field: true, d: ['完全回復全體同伴的體力。', "Fully restores every friend's HP."] }),
  revive: S(['復甦', 'Revive'], { mp: 10, kind: 'revive', tgt: 'ally', power: 0.5, fx: 'heal', spell: true, field: true, dead: true, d: ['讓倒下的同伴以一半體力復活。', 'Brings a fallen friend back with half HP.'] }),
  rebirth: S(['回生', 'Rebirth'], { mp: 20, kind: 'revive', tgt: 'ally', power: 1, fx: 'heal', spell: true, field: true, dead: true, d: ['讓倒下的同伴完全復活。', 'Brings a fallen friend back at full HP.'] }),
  purge: S(['解毒', 'Purge'], { mp: 2, kind: 'cure', tgt: 'ally', st: ['poison'], fx: 'heal', spell: true, field: true, d: ['解除一名同伴的中毒。', 'Cures poison.'] }),
  cleanse: S(['清心', 'Cleanse'], { mp: 4, kind: 'cure', tgt: 'ally', st: ['poison', 'sleep', 'numb', 'confuse', 'blind', 'hush'], fx: 'heal', spell: true, field: true, d: ['解除一名同伴的所有異常狀態。', 'Cures every ailment of one friend.'] }),
  // buffs and hexes
  ward: S(['護盾', 'Ward'], { mp: 2, kind: 'buff', tgt: 'ally', st: 'defup', fx: 'buff', spell: true, d: ['提高一名同伴的防禦。', "Raises one friend's defence."] }),
  warding: S(['群護', 'Warding'], { mp: 3, kind: 'buff', tgt: 'allies', st: 'defup', fx: 'buff', spell: true, d: ['提高全體同伴的防禦。', "Raises every friend's defence."] }),
  swift: S(['迅足', 'Swift'], { mp: 3, kind: 'buff', tgt: 'allies', st: 'agiup', fx: 'buff', spell: true, d: ['提高全體同伴的速度。', "Raises every friend's speed."] }),
  rally: S(['激勵', 'Rally'], { mp: 6, kind: 'buff', tgt: 'ally', st: 'atkup', fx: 'buff', spell: true, d: ['讓一名同伴的攻擊力大幅提高。', "Greatly raises one friend's attack."] }),
  surge: S(['魔湧', 'Surge'], { mp: 6, kind: 'buff', tgt: 'ally', st: 'magup', fx: 'buff', spell: true, d: ['讓一名同伴的魔力大幅提高。', "Greatly raises one friend's magic."] }),
  doze: S(['睡魔', 'Doze'], { mp: 3, kind: 'status', tgt: 'group', st: 'sleep', hit: 0.7, fx: 'dark', spell: true, d: ['讓一群敵人陷入沉睡。', 'Puts a group of foes to sleep.'] }),
  dazzle: S(['眩光', 'Dazzle'], { mp: 5, kind: 'status', tgt: 'group', st: 'blind', hit: 0.75, fx: 'holy', spell: true, d: ['以幻光迷惑一群敵人，讓攻擊容易落空。', 'Dazzles a group of foes so their blows go astray.'] }),
  sunder: S(['剝甲', 'Sunder'], { mp: 4, kind: 'debuff', tgt: 'group', st: 'defdown', hit: 0.85, fx: 'dark', spell: true, d: ['降低一群敵人的防禦。', "Lowers a group of foes' defence."] }),
  hush: S(['靜默', 'Hush'], { mp: 3, kind: 'status', tgt: 'group', st: 'hush', hit: 0.7, fx: 'dark', spell: true, d: ['封住一群敵人的咒文。', "Seals a group of foes' spells."] }),
  homeward: S(['歸途', 'Homeward'], { mp: 1, kind: 'special', tgt: 'self', field: true, fieldOnly: true, spell: true, d: ['飛回去過的城鎮。', 'Flies back to a town you have visited.'] }),
  holyward: S(['驅邪', 'Ward Evil'], { mp: 2, kind: 'special', tgt: 'self', field: true, fieldOnly: true, spell: true, d: ['一段時間內，弱小的魔物不會靠近。', 'Keeps weak monsters away for a while.'] }),
  // weapon skills
  flameslash: S(['焰斬', 'Flame Slash'], { mp: 3, kind: 'phys', tgt: 'foe', power: 1.4, el: 'fire', fx: 'fireslash', d: ['帶著火焰的一劍。', 'A sword stroke wreathed in flame.'] }),
  galeslash: S(['疾風斬', 'Gale Slash'], { mp: 4, kind: 'phys', tgt: 'group', power: 0.85, el: 'wind', fx: 'wind', d: ['以疾風之劍斬向一群敵人。', 'A gale of steel cuts a group of foes.'] }),
  sunderslash: S(['破甲斬', 'Armour Breaker'], { mp: 4, kind: 'phys', tgt: 'foe', power: 1.1, st: 'defdown', hit: 0.9, fx: 'slash', d: ['斬裂敵人的盔甲，降低防禦。', "Cuts through a foe's armour, lowering its defence."] }),
  wheel: S(['迴天斬', 'Wheel of Dawn'], { mp: 9, kind: 'phys', tgt: 'foes', power: 1.15, el: 'light', fx: 'slash', d: ['迴旋一圈，斬向所有敵人。', 'A full turn of the blade through every foe.'] }),
  starstrike: S(['星痕一擊', 'Starmark Strike'], { mp: 12, kind: 'phys', tgt: 'foe', power: 3.0, el: 'light', fx: 'holy', d: ['把晨星之印的光注入劍中。', 'Pours the light of the Dawnmark into the blade.'] }),
  pilfer: S(['竊取', 'Pilfer'], { mp: 0, kind: 'steal', tgt: 'foe', power: 0.6, fx: 'slash', d: ['攻擊的同時偷走敵人的東西。', 'Strikes and steals from a foe.'] }),
  venomedge: S(['毒刃', 'Venom Edge'], { mp: 2, kind: 'phys', tgt: 'foe', power: 1.0, st: 'poison', hit: 0.8, fx: 'slash', d: ['塗了毒的一刀。', 'A poisoned blade.'] }),
  twincut: S(['雙刃', 'Twin Cut'], { mp: 4, kind: 'phys', tgt: 'foe', power: 0.85, hits: 2, fx: 'slash', d: ['迅速地連砍兩刀。', 'Two quick cuts.'] }),
  lash: S(['蛇鞭', 'Serpent Lash'], { mp: 4, kind: 'phys', tgt: 'foes', power: 0.75, fx: 'slash', d: ['甩動長鞭攻擊全部敵人。', 'A whip lashes every foe.'] }),
  powder: S(['眩目粉', 'Blinding Powder'], { mp: 3, kind: 'status', tgt: 'foes', st: 'blind', hit: 0.65, fx: 'dark', d: ['撒出眩目粉，讓敵人看不清楚。', 'Throws a powder that blinds the foes.'] }),
  shadowstep: S(['影步', 'Shadowstep'], { mp: 4, kind: 'buff', tgt: 'self', st: 'agiup', fx: 'buff', d: ['化身暗影，提高自己的速度與閃避。', 'Becomes a shadow, raising speed and evasion.'] }),
  assassin: S(['影刺', 'Shadow Fang'], { mp: 10, kind: 'phys', tgt: 'foe', power: 2.4, crit: 0.35, fx: 'slash', d: ['從影中刺出的致命一擊，容易造成會心一擊。', 'A deadly thrust from the shadows. Often critical.'] }),
  holylance: S(['聖槍', 'Holy Lance'], { mp: 3, kind: 'phys', tgt: 'foe', power: 1.3, el: 'light', fx: 'holy', d: ['帶著神聖之光的一擊。', 'A strike of holy light.'] }),
  prayer: S(['祈禱', 'Prayer'], { mp: 0, kind: 'mpself', tgt: 'self', power: 0.12, fx: 'heal', d: ['靜靜祈禱，回復自己的魔力。', 'A quiet prayer that restores her own MP.'] }),
  flurry: S(['連拳', 'Flurry'], { mp: 4, kind: 'phys', tgt: 'rand', power: 0.55, hits: 4, fx: 'hit', d: ['向敵人隨機打出四拳。', 'Four punches at random foes.'] }),
  tigerclaw: S(['虎爪', 'Tiger Claw'], { mp: 4, kind: 'phys', tgt: 'foe', power: 1.6, crit: 0.25, fx: 'slash', d: ['猛虎般的一爪，容易造成會心一擊。', "A tiger's swipe. Often critical."] }),
  focus: S(['蓄氣', 'Focus'], { mp: 0, kind: 'buff', tgt: 'self', st: 'focus', fx: 'buff', d: ['凝聚氣力，下次攻擊的威力加倍。', 'Gathers strength: the next blow is twice as strong.'] }),
  whirlkick: S(['迴旋踢', 'Whirlwind Kick'], { mp: 6, kind: 'phys', tgt: 'foes', power: 0.9, fx: 'hit', d: ['迴旋飛踢所有敵人。', 'A spinning kick through every foe.'] }),
  stew: S(['家常燉菜', 'Hearty Stew'], { mp: 8, kind: 'heal', tgt: 'allies', power: 45, fx: 'heal', d: ['掏出熱騰騰的燉菜，回復全體同伴的體力。', 'Hands round a hot stew, restoring every friend.'] }),
  ironstance: S(['鐵架勢', 'Iron Stance'], { mp: 3, kind: 'buff', tgt: 'self', st: 'counter', fx: 'buff', d: ['擺出架勢，反擊下一次攻擊。', 'Takes a stance that answers the next blow.'] }),
  shieldbash: S(['盾擊', 'Shield Bash'], { mp: 2, kind: 'phys', tgt: 'foe', power: 1.0, st: 'numb', hit: 0.3, fx: 'hit', d: ['以盾牌重擊，有時讓敵人麻痺。', 'A shield blow that may stun.'] }),
  cover: S(['掩護', 'Cover'], { mp: 0, kind: 'buff', tgt: 'self', st: 'cover', fx: 'buff', d: ['這一回合，替同伴挨下攻擊。', 'Takes the blows meant for friends this round.'] }),
  cleave: S(['橫掃', 'Cleave'], { mp: 6, kind: 'phys', tgt: 'foes', power: 0.95, fx: 'slash', d: ['大劍一揮，橫掃全部敵人。', 'A great sweep through every foe.'] }),
  bulwark: S(['堅守', 'Bulwark'], { mp: 6, kind: 'buff', tgt: 'allies', st: 'defup', fx: 'buff', d: ['高聲號令，提高全體同伴的防禦。', "A shout that raises every friend's defence."] }),
  oathblade: S(['誓約之劍', 'Oathblade'], { mp: 12, kind: 'phys', tgt: 'foe', power: 2.8, fx: 'holy', d: ['以騎士的誓言揮出的一劍。', "A stroke sworn on a knight's oath."] }),
  meditate: S(['冥想', 'Meditate'], { mp: 0, kind: 'mpself', tgt: 'self', power: 0.15, fx: 'heal', d: ['冥想，回復自己的魔力。', 'Meditates to restore her own MP.'] }),
};
export const SPELL_IDS = new Set(Object.keys(SKILLS).filter((k) => SKILLS[k].spell));

// spells learned by level
export const LEARN = {
  rowan: [[3, 'glint'], [5, 'mend'], [8, 'homeward'], [12, 'restore'], [16, 'dawnbolt'], [22, 'holyward'], [27, 'renew']],
  pell: [[6, 'dazzle'], [11, 'swift'], [17, 'doze']],
  mirela: [[1, 'mend'], [1, 'purge'], [4, 'ward'], [7, 'doze'], [10, 'revive'], [12, 'restore'], [14, 'cleanse'], [17, 'hush'], [19, 'mendall'], [24, 'renew'], [30, 'rebirth'], [34, 'renewall']],
  odo: [[9, 'rally'], [18, 'warding']],
  sera: [[1, 'flameshot'], [1, 'frostpin'], [6, 'sunder'], [9, 'galecut'], [12, 'blaze'], [15, 'icewind'], [18, 'surge'], [21, 'burst'], [24, 'tempest'], [27, 'inferno'], [30, 'deepfrost'], [35, 'starfall']],
  brannoc: [[1, 'mend'], [1, 'ward'], [20, 'restore'], [26, 'warding']],
};

// ---------- link arts: when friends are fired up together ----------
// need: heroes who must be fired up (and fighting); 'any' means one more fired-up friend
export const ARTS = {
  dawnstrike: { n: ['曙光一閃', 'Dawnstrike'], need: ['rowan'], kind: 'phys', tgt: 'foe', power: 3.6, el: 'light', pierce: true, fx: 'holy', d: ['晨星之印燃燒，斬出貫穿防禦的一劍。', 'The Dawnmark blazes; a stroke no armour stops.'] },
  twinfang: { n: ['雙牙', 'Twin Fangs'], need: ['rowan', 'pell'], kind: 'phys', tgt: 'rand', power: 1.05, hits: 6, fx: 'slash', d: ['兩人交錯，連續六次斬擊。', 'Crossing paths, the two strike six times.'] },
  sanctum: { n: ['聖域', 'Sanctum'], need: ['mirela', 'any'], kind: 'heal', tgt: 'allies', power: 9999, cure: true, fx: 'heal', d: ['張開聖域，完全回復全體同伴並治好異常。', 'A sanctuary that fully heals every friend.'] },
  feast: { n: ['豐盛宴席', 'Grand Feast'], need: ['odo', 'pell'], kind: 'feast', tgt: 'allies', power: 0.5, fx: 'heal', d: ['偷來的食材做成大餐。回復一半體力，攻擊力上升。', 'A feast of stolen goods. Heals half and raises attack.'] },
  starfire: { n: ['星火', 'Starfire'], need: ['sera', 'rowan'], kind: 'dmg', tgt: 'foes', power: 240, el: 'light', fx: 'star', d: ['星光與火焰交織，降在全部敵人身上。', 'Starlight and flame fall together on every foe.'] },
  ironoath: { n: ['鐵之誓', 'Iron Oath'], need: ['brannoc', 'rowan'], kind: 'phys', tgt: 'foes', power: 1.9, buff: 'defup', fx: 'slash', d: ['騎士與晨星之子並肩衝鋒，全體防禦上升。', 'Knight and Dawnbearer charge side by side.'] },
  tempestfist: { n: ['狂嵐拳', 'Tempest Fist'], need: ['odo', 'sera'], kind: 'phys', tgt: 'foes', power: 1.7, el: 'wind', fx: 'wind', d: ['把颶風捲進拳頭裡。', 'A fist with a storm inside it.'] },
  aegis: { n: ['不落之盾', 'Unfallen Shield'], need: ['brannoc', 'mirela'], kind: 'buff2', tgt: 'allies', fx: 'buff', d: ['兩道守護之光，全體防禦與魔防大幅上升。', 'Two lights of protection: every friend is warded.'] },
  chorus: { n: ['晨星合唱', 'Dawn Chorus'], need: ['rowan', 'any', 'any', 'any'], kind: 'dmg', tgt: 'foes', power: 520, el: 'light', pierce: true, fx: 'star', d: ['四顆心一起燃燒時的最終奧義。', 'The final art, when four hearts burn as one.'] },
};

// ---------- skill boards ----------
// three paths each; a node opens when the node above it (or the top of its path) is open.
// node: [cost, effect]; effect: { skill } | { stat: amount } | { pass: id }
export const BOARDS = {
  rowan: [
    { n: ['劍', 'Sword'], nodes: [[3, { skill: 'flameslash' }], [4, { str: 6 }], [6, { skill: 'galeslash' }], [8, { pass: 'crit' }], [12, { skill: 'sunderslash' }], [16, { str: 14 }]] },
    { n: ['勇氣', 'Courage'], nodes: [[3, { hp: 20 }], [5, { def: 6 }], [7, { agi: 8 }], [10, { hp: 40 }], [14, { skill: 'wheel' }], [18, { def: 12 }]] },
    { n: ['晨星', 'Dawnmark'], nodes: [[4, { mp: 12 }], [6, { mag: 10 }], [9, { pass: 'pep' }], [12, { heal: 12 }], [18, { skill: 'starstrike' }], [24, { spell: 'daybreak' }]] },
  ],
  pell: [
    { n: ['短刀', 'Knives'], nodes: [[3, { skill: 'venomedge' }], [4, { str: 6 }], [6, { skill: 'twincut' }], [9, { pass: 'crit' }], [14, { skill: 'assassin' }], [18, { str: 14 }]] },
    { n: ['長鞭', 'Whips'], nodes: [[3, { skill: 'lash' }], [5, { agi: 8 }], [8, { skill: 'powder' }], [12, { str: 10 }], [16, { agi: 14 }], [20, { hp: 50 }]] },
    { n: ['盜技', 'Thievery'], nodes: [[2, { pass: 'steal' }], [4, { skill: 'shadowstep' }], [6, { hp: 24 }], [9, { pass: 'gold' }], [12, { def: 10 }], [16, { pass: 'first' }]] },
  ],
  mirela: [
    { n: ['杖', 'Staff'], nodes: [[3, { mp: 10 }], [5, { heal: 8 }], [7, { pass: 'mpcut' }], [10, { heal: 14 }], [14, { mp: 24 }], [18, { heal: 20 }]] },
    { n: ['槍', 'Spear'], nodes: [[3, { skill: 'holylance' }], [5, { str: 8 }], [8, { agi: 8 }], [12, { str: 12 }], [16, { def: 12 }], [20, { hp: 40 }]] },
    { n: ['信仰', 'Faith'], nodes: [[3, { skill: 'prayer' }], [5, { hp: 20 }], [8, { def: 8 }], [11, { spell: 'swift' }], [15, { pass: 'regen' }], [20, { mp: 30 }]] },
  ],
  odo: [
    { n: ['拳', 'Fists'], nodes: [[3, { skill: 'flurry' }], [4, { str: 8 }], [7, { skill: 'whirlkick' }], [10, { pass: 'crit' }], [14, { str: 14 }], [18, { agi: 12 }]] },
    { n: ['爪', 'Claws'], nodes: [[3, { skill: 'tigerclaw' }], [5, { str: 6 }], [7, { skill: 'focus' }], [11, { hp: 40 }], [15, { str: 12 }], [20, { def: 14 }]] },
    { n: ['廚藝', 'Cooking'], nodes: [[2, { skill: 'stew' }], [4, { hp: 30 }], [6, { pass: 'pep' }], [9, { skill: 'ironstance' }], [12, { mp: 16 }], [16, { hp: 60 }]] },
  ],
  sera: [
    { n: ['魔杖', 'Wands'], nodes: [[3, { mag: 6 }], [4, { mp: 10 }], [7, { pass: 'mpcut' }], [10, { mag: 12 }], [14, { mp: 24 }], [18, { mag: 18 }]] },
    { n: ['長鞭', 'Whips'], nodes: [[3, { str: 6 }], [5, { agi: 8 }], [8, { skill: 'lash' }], [12, { hp: 30 }], [16, { agi: 12 }], [20, { def: 10 }]] },
    { n: ['秘術', 'Arcana'], nodes: [[3, { skill: 'meditate' }], [5, { hp: 16 }], [8, { pass: 'double' }], [12, { def: 8 }], [16, { mag: 16 }], [22, { pass: 'pep' }]] },
  ],
  brannoc: [
    { n: ['劍', 'Sword'], nodes: [[3, { skill: 'cleave' }], [5, { str: 8 }], [8, { pass: 'crit' }], [12, { str: 12 }], [16, { skill: 'oathblade' }], [20, { str: 16 }]] },
    { n: ['盾', 'Shield'], nodes: [[3, { skill: 'shieldbash' }], [4, { def: 6 }], [7, { skill: 'cover' }], [10, { def: 10 }], [14, { pass: 'block' }], [18, { def: 16 }]] },
    { n: ['騎士道', 'Chivalry'], nodes: [[3, { hp: 30 }], [5, { skill: 'bulwark' }], [8, { hp: 40 }], [11, { pass: 'pep' }], [14, { agi: 10 }], [18, { hp: 70 }]] },
  ],
};
export const PASSIVES = {
  crit: ['會心一擊的機率上升', 'Critical hits more often'], pep: ['更容易進入「燃心」狀態', 'Fired up more easily'], steal: ['偷竊更容易成功', 'Steals more easily'],
  gold: ['戰鬥後得到的金幣增加', 'More gold after battles'], first: ['更容易先發制人', 'Strikes first more often'], mpcut: ['咒文的魔力消耗減少', 'Spells cost less MP'],
  regen: ['每回合回復少許體力', 'Restores some HP every round'], double: ['咒文有時會連發兩次', 'Spells sometimes cast twice'], block: ['有時以盾牌擋下攻擊', 'Sometimes blocks with the shield'],
};

// ---------- items ----------
// use: heal | healall | mp | cure | revive | full | zoom | repel | seed | dmg ; key: story item
const I = (n, o) => ({ n, ...o });
export const ITEMS = {
  herb: I(['藥草', 'Medicinal Herb'], { price: 8, use: 'heal', power: 32, d: ['回復約 30 點體力。', 'Restores about 30 HP.'] }),
  strongherb: I(['特製藥草', 'Strong Herb'], { price: 40, use: 'heal', power: 90, d: ['回復約 90 點體力。', 'Restores about 90 HP.'] }),
  elixir: I(['萬靈藥', 'Elixir'], { price: 260, use: 'heal', power: 9999, d: ['完全回復一名同伴的體力。', "Fully restores one friend's HP."] }),
  antidote: I(['解毒草', 'Antidote'], { price: 10, use: 'cure', st: ['poison'], d: ['解除中毒。', 'Cures poison.'] }),
  moonwort: I(['月光草', 'Moonwort'], { price: 30, use: 'cure', st: ['numb', 'sleep', 'confuse', 'blind'], d: ['解除麻痺、睡眠、混亂與失明。', 'Cures numbness, sleep, confusion and blindness.'] }),
  ether: I(['魔法之水', 'Magic Water'], { price: 200, use: 'mp', power: 30, d: ['回復約 30 點魔力。', 'Restores about 30 MP.'] }),
  dawnleaf: I(['晨露之葉', 'Dawnleaf'], { price: 0, use: 'revive', power: 1, d: ['讓倒下的同伴完全復活。很稀有。', 'Brings a fallen friend back at full HP. Rare.'] }),
  feather: I(['歸巢之羽', 'Homing Feather'], { price: 25, use: 'zoom', d: ['飛回去過的城鎮。', 'Flies you back to a town you have visited.'] }),
  incense: I(['驅魔香', 'Holy Incense'], { price: 20, use: 'repel', d: ['一段時間內，弱小的魔物不會靠近。', 'Keeps weak monsters away for a while.'] }),
  bomb: I(['火藥瓶', 'Fire Flask'], { price: 50, use: 'dmg', power: 45, el: 'fire', battle: true, d: ['在敵陣中爆炸，傷害全部敵人。', 'Bursts among the foes, hurting them all.'] }),
  seedstr: I(['力量之種', 'Seed of Strength'], { price: 0, use: 'seed', stat: 'str', n2: 2, d: ['力量永久提高 2 點。', 'Raises strength by 2 for good.'] }),
  seeddef: I(['守護之種', 'Seed of Defence'], { price: 0, use: 'seed', stat: 'def', n2: 2, d: ['防禦永久提高 2 點。', 'Raises defence by 2 for good.'] }),
  seedagi: I(['疾風之種', 'Seed of Agility'], { price: 0, use: 'seed', stat: 'agi', n2: 2, d: ['速度永久提高 2 點。', 'Raises agility by 2 for good.'] }),
  seedlife: I(['生命之果', 'Seed of Life'], { price: 0, use: 'seed', stat: 'hp', n2: 5, d: ['最大體力永久提高 5 點。', 'Raises max HP by 5 for good.'] }),
  seedmag: I(['魔法之果', 'Seed of Magic'], { price: 0, use: 'seed', stat: 'mag', n2: 2, d: ['魔力永久提高 2 點。', 'Raises magic by 2 for good.'] }),
  // things to sell
  gem: I(['小寶石', 'Small Gem'], { price: 200, sell: true, d: ['可以賣個好價錢。', 'Sells well.'] }),
  fur: I(['柔軟毛皮', 'Soft Fur'], { price: 40, sell: true, d: ['可以賣錢。', 'Can be sold.'] }),
  // key items
  letter: I(['托賓的信', "Tobin's Letter"], { key: true, d: ['寫給歐瑞爾王的信。', 'A letter to King Aurel.'] }),
  lantern_w: I(['水之燈', 'Water Lantern'], { key: true, d: ['在藍光中搖曳的燈。', 'A lantern flickering in blue light.'] }),
  lantern_f: I(['火之燈', 'Fire Lantern'], { key: true, d: ['在紅光中搖曳的燈。', 'A lantern flickering in red light.'] }),
  lantern_e: I(['地之燈', 'Earth Lantern'], { key: true, d: ['在金光中搖曳的燈。', 'A lantern flickering in golden light.'] }),
  lantern_i: I(['霜之燈', 'Frost Lantern'], { key: true, d: ['在白光中搖曳的燈。', 'A lantern flickering in white light.'] }),
  pass: I(['港口通行證', 'Harbour Pass'], { key: true, d: ['可以搭乘海鷗港的船。', 'Lets you sail from Gullport.'] }),
  rimecloak: I(['禦寒斗篷', 'Rime Cloak'], { key: true, d: ['可以走進北方的暴風雪。', 'Lets you walk into the northern blizzard.'] }),
  whistle: I(['龍笛', 'Drake Whistle'], { key: true, use: 'whistle', d: ['吹響它，天龍就會飛來。', 'Blow it and the sky drake comes.'] }),
};

// ---------- equipment ----------
// slot: weapon | armor | shield | head | acc ; cls: what kind (who can use it)
const EQ = (n, slot, cls, price, o = {}) => ({ n, slot, cls, price, equip: true, ...o });
export const EQUIP = {
  // swords
  oaksword: EQ(['橡木劍', 'Oak Sword'], 'weapon', 'sword', 40, { atk: 6 }),
  copper: EQ(['銅劍', 'Copper Sword'], 'weapon', 'sword', 120, { atk: 12 }),
  bronze: EQ(['青銅劍', 'Bronze Sword'], 'weapon', 'sword', 330, { atk: 19 }),
  longsword: EQ(['長劍', 'Long Sword'], 'weapon', 'sword', 300, { atk: 18 }),
  steel: EQ(['鋼鐵劍', 'Steel Sword'], 'weapon', 'sword', 900, { atk: 30 }),
  flamberge: EQ(['焰形劍', 'Flamberge'], 'weapon', 'sword', 2200, { atk: 42, el: 'fire' }),
  mythril: EQ(['祕銀劍', 'Mythril Sword'], 'weapon', 'sword', 4800, { atk: 58 }),
  dawnblade: EQ(['晨星之劍', 'Dawnblade'], 'weapon', 'sword', 0, { atk: 92, el: 'light', only: 'rowan' }),
  knightsword: EQ(['騎士劍', 'Knightly Blade'], 'weapon', 'sword', 0, { atk: 76, only: 'brannoc' }),
  // axes
  handaxe: EQ(['手斧', 'Hand Axe'], 'weapon', 'axe', 700, { atk: 28 }),
  battleaxe: EQ(['戰斧', 'Battle Axe'], 'weapon', 'axe', 3400, { atk: 54 }),
  // knives and whips
  dagger: EQ(['短刀', 'Dagger'], 'weapon', 'knife', 30, { atk: 5 }),
  dirk: EQ(['匕首', 'Dirk'], 'weapon', 'knife', 220, { atk: 14 }),
  poisondagger: EQ(['毒蛇匕首', 'Viper Fang'], 'weapon', 'knife', 900, { atk: 24, st: 'poison' }),
  falcon: EQ(['隼刀', 'Falcon Knife'], 'weapon', 'knife', 3600, { atk: 38, hits: 2 }),
  assassinblade: EQ(['影之刃', 'Shadow Blade'], 'weapon', 'knife', 0, { atk: 60, crit: 0.12 }),
  leatherwhip: EQ(['皮鞭', 'Leather Whip'], 'weapon', 'whip', 150, { atk: 9, all: true }),
  chainwhip: EQ(['鎖鞭', 'Chain Whip'], 'weapon', 'whip', 1500, { atk: 26, all: true }),
  // staves and spears
  oakstaff: EQ(['橡木杖', 'Oak Staff'], 'weapon', 'staff', 30, { atk: 4, heal: 4 }),
  prayerstaff: EQ(['祈禱之杖', 'Staff of Prayer'], 'weapon', 'staff', 600, { atk: 12, heal: 12 }),
  sagestaff: EQ(['賢者之杖', "Sage's Staff"], 'weapon', 'staff', 3000, { atk: 22, heal: 26 }),
  spear: EQ(['長槍', 'Spear'], 'weapon', 'spear', 260, { atk: 16 }),
  holyspear: EQ(['聖槍', 'Holy Spear'], 'weapon', 'spear', 2600, { atk: 40, el: 'light' }),
  // fists and claws
  wraps: EQ(['纏手布', 'Hand Wraps'], 'weapon', 'fist', 30, { atk: 7 }),
  ironknuckle: EQ(['鐵拳套', 'Iron Knuckles'], 'weapon', 'fist', 500, { atk: 20 }),
  catclaw: EQ(['貓爪', 'Cat Claws'], 'weapon', 'claw', 300, { atk: 16 }),
  tigerfang: EQ(['虎牙爪', 'Tiger Fangs'], 'weapon', 'claw', 2400, { atk: 44 }),
  dragonclaw: EQ(['龍爪', 'Dragon Claws'], 'weapon', 'claw', 0, { atk: 70 }),
  // wands
  wand: EQ(['魔法杖', 'Wand'], 'weapon', 'wand', 40, { atk: 3, mag: 4 }),
  firewand: EQ(['焰之杖', 'Flame Wand'], 'weapon', 'wand', 700, { atk: 8, mag: 12 }),
  starwand: EQ(['星辰杖', 'Star Wand'], 'weapon', 'wand', 3800, { atk: 14, mag: 28 }),
  // armour
  tunic: EQ(['旅人上衣', "Traveller's Tunic"], 'armor', 'light', 20, { def: 4 }),
  leather: EQ(['皮甲', 'Leather Armour'], 'armor', 'light', 140, { def: 10 }),
  chainmail: EQ(['鎖子甲', 'Chain Mail'], 'armor', 'heavy', 450, { def: 18 }),
  mail: EQ(['騎士鎧', "Knight's Mail"], 'armor', 'heavy', 600, { def: 22 }),
  ironarmor: EQ(['鐵之鎧', 'Iron Armour'], 'armor', 'heavy', 1300, { def: 30 }),
  dragonmail: EQ(['龍鱗鎧', 'Dragon Mail'], 'armor', 'heavy', 4400, { def: 46, resist: 'fire' }),
  dawnarmor: EQ(['晨星之鎧', 'Dawn Armour'], 'armor', 'heavy', 0, { def: 64, resist: 'all' }),
  habit: EQ(['修道服', 'Habit'], 'armor', 'robe', 30, { def: 4 }),
  robe: EQ(['魔法長袍', 'Robe'], 'armor', 'robe', 40, { def: 4 }),
  silkrobe: EQ(['絲之長袍', 'Silk Robe'], 'armor', 'robe', 600, { def: 14 }),
  sagerobe: EQ(['賢者長袍', "Sage's Robe"], 'armor', 'robe', 3000, { def: 30, resist: 'all' }),
  gi: EQ(['武道服', 'Martial Gi'], 'armor', 'light', 40, { def: 6 }),
  scalearmor: EQ(['鱗甲', 'Scale Armour'], 'armor', 'light', 700, { def: 20 }),
  shadowsuit: EQ(['暗影衣', 'Shadow Suit'], 'armor', 'light', 2800, { def: 34, agi: 10 }),
  // shields
  potlid: EQ(['鍋蓋', 'Pot Lid'], 'shield', 'shield', 20, { def: 2 }),
  leathershield: EQ(['皮盾', 'Leather Shield'], 'shield', 'shield', 100, { def: 5 }),
  kiteshield: EQ(['鳶盾', 'Kite Shield'], 'shield', 'shield', 400, { def: 10 }),
  ironshield: EQ(['鐵盾', 'Iron Shield'], 'shield', 'shield', 1100, { def: 16 }),
  mirrorshield: EQ(['魔鏡之盾', 'Mirror Shield'], 'shield', 'shield', 3800, { def: 26, resist: 'all' }),
  // heads
  bandana: EQ(['頭巾', 'Bandana'], 'head', 'head', 30, { def: 2 }),
  hat: EQ(['尖帽', 'Pointy Hat'], 'head', 'head', 80, { def: 3, mag: 3 }),
  helm: EQ(['鐵盔', 'Iron Helm'], 'head', 'helm', 300, { def: 7 }),
  circlet: EQ(['銀之額環', 'Silver Circlet'], 'head', 'head', 900, { def: 8, mag: 6 }),
  greathelm: EQ(['大盔', 'Great Helm'], 'head', 'helm', 2000, { def: 15 }),
  // accessories
  ring: EQ(['力量戒指', 'Strength Ring'], 'acc', 'acc', 500, { str: 8 }),
  boots: EQ(['疾風長靴', 'Swift Boots'], 'acc', 'acc', 700, { agi: 15 }),
  charm: EQ(['護身符', 'Safety Charm'], 'acc', 'acc', 400, { def: 8 }),
  goldring: EQ(['黃金戒指', 'Gold Ring'], 'acc', 'acc', 800, { def: 4, mag: 6, heal: 6 }),
  starpendant: EQ(['星墜項鍊', 'Star Pendant'], 'acc', 'acc', 0, { mag: 20, heal: 20 }),
  wardring: EQ(['守護戒指', 'Ward Ring'], 'acc', 'acc', 0, { def: 12, immune: true }),
};
for (const [k, v] of Object.entries(EQUIP)) ITEMS[k] = v;

// ---------- monsters ----------
// art: picture; look: recolour; hp, mp, atk, def, agi, exp, gold; acts: [[weight, action]] ;
// weak/resist: elements ; drop: [item, chance] ; flying/boss etc.
const M = (n, art, o) => ({ n, art, ...o });
export const MON = {
  // the mountain path (lv 1-4)
  slime: M(['史萊姆', 'Slime'], 'slime', { hp: 8, atk: 8, def: 3, agi: 4, exp: 3, gold: 2, acts: [[1, 'attack']], drop: ['herb', 0.12] }),
  dartfly: M(['飛刺蜻蜓', 'Dartfly'], 'dartfly', { hp: 10, atk: 10, def: 4, agi: 12, exp: 4, gold: 3, acts: [[3, 'attack'], [1, 'dive']], weak: ['wind'] }),
  vinesnake: M(['藤蛇', 'Vinesnake'], 'vinesnake', { hp: 14, atk: 11, def: 5, agi: 7, exp: 5, gold: 4, acts: [[3, 'attack'], [1, 'poisonbite']], drop: ['antidote', 0.1] }),
  skitter: M(['岩蛛', 'Skitter'], 'skitter', { hp: 16, atk: 12, def: 8, agi: 6, exp: 6, gold: 5, acts: [[3, 'attack'], [1, 'web']] }),
  drakeling: M(['幼龍', 'Drakeling'], 'drakeling', { hp: 80, atk: 13, def: 6, agi: 6, exp: 40, gold: 30, acts: [[3, 'attack'], [2, 'ember'], [1, 'roar']], weak: ['ice', 'light'], boss: true }),
  // around the capital (lv 4-8)
  goblin: M(['哥布林', 'Goblin'], 'goblin', { hp: 24, atk: 18, def: 8, agi: 8, exp: 12, gold: 8, acts: [[1, 'attack']], drop: ['herb', 0.1] }),
  eyeball: M(['浮眼', 'Floating Eye'], 'eyeball', { hp: 18, mp: 10, atk: 15, def: 6, agi: 10, exp: 11, gold: 7, acts: [[2, 'attack'], [1, 'stare']], weak: ['light'] }),
  mantid: M(['刃螳螂', 'Blade Mantis'], 'mantid', { hp: 28, atk: 21, def: 9, agi: 11, exp: 15, gold: 9, acts: [[2, 'attack'], [1, 'double']], weak: ['fire'] }),
  shelltoad: M(['甲殼蛙', 'Shelltoad'], 'shelltoad', { hp: 34, atk: 18, def: 18, agi: 4, exp: 16, gold: 10, acts: [[3, 'attack'], [1, 'harden']] }),
  hexer: M(['咒術師', 'Hexer'], 'hexer', { hp: 26, mp: 30, atk: 16, def: 8, agi: 9, exp: 18, gold: 14, acts: [[1, 'attack'], [2, 'flameshot'], [1, 'doze']], drop: ['ether', 0.04] }),
  bonesman: M(['骷髏兵', 'Bonesman'], 'bonesman', { hp: 36, atk: 22, def: 12, agi: 7, exp: 19, gold: 12, acts: [[1, 'attack']], weak: ['light', 'fire'] }),
  rat: M(['暗渠鼠', 'Sewer Rat'], 'wolf', { look: { hue: 180, sat: 0.4, lum: 0.7 }, hp: 30, atk: 20, def: 9, agi: 12, exp: 16, gold: 8, acts: [[3, 'attack'], [1, 'poisonbite']] }),
  warden: M(['地下牢獄的看守', 'Undercroft Warden'], 'stonetroll', { hp: 520, atk: 34, def: 16, agi: 5, exp: 200, gold: 150, acts: [[3, 'attack'], [2, 'smash'], [1, 'harden']], boss: true, weak: ['wind'] }),
  // the river (lv 8-12)
  helmfish: M(['鐵盔魚', 'Helmfish'], 'helmfish', { hp: 44, atk: 28, def: 16, agi: 9, exp: 20, gold: 16, acts: [[1, 'attack']], weak: ['bolt', 'light'] }),
  helmeel: M(['鐵盔鰻', 'Helmeel'], 'helmeel', { hp: 50, atk: 30, def: 14, agi: 12, exp: 22, gold: 18, acts: [[2, 'attack'], [1, 'squeeze']], weak: ['light'] }),
  helmstar: M(['鐵盔星', 'Helmstar'], 'helmstar', { hp: 38, mp: 30, atk: 22, def: 20, agi: 8, exp: 20, gold: 18, acts: [[1, 'attack'], [1, 'healally']], weak: ['light'] }),
  wolf: M(['原野狼', 'Plains Wolf'], 'wolf', { hp: 52, atk: 32, def: 12, agi: 16, exp: 24, gold: 14, acts: [[3, 'attack'], [1, 'howl']], drop: ['fur', 0.2] }),
  toadman: M(['蛙人', 'Toadman'], 'toadman', { hp: 60, atk: 30, def: 16, agi: 8, exp: 26, gold: 20, acts: [[2, 'attack'], [1, 'poisonbite']] }),
  gobguard: M(['哥布林盾兵', 'Goblin Guard'], 'gobguard', { hp: 56, atk: 31, def: 22, agi: 9, exp: 25, gold: 24, acts: [[3, 'attack'], [1, 'guard']] }),
  mirequeen: M(['泥沼女王', 'Mire Queen'], 'kraken', { hp: 1400, mp: 99, atk: 46, def: 22, agi: 10, exp: 600, gold: 400, acts: [[3, 'attack'], [2, 'tidal'], [1, 'squeeze'], [1, 'inkcloud']], boss: true, weak: ['bolt', 'light'], resist: ['ice'], twice: 0.3 }),
  // the coast and the burning isle (lv 12-16)
  gobblade: M(['哥布林雙刀', 'Goblin Twinblade'], 'gobblade', { hp: 70, atk: 42, def: 20, agi: 14, exp: 38, gold: 28, acts: [[2, 'attack'], [1, 'double']] }),
  goblancer: M(['哥布林槍兵', 'Goblin Lancer'], 'goblancer', { hp: 74, atk: 45, def: 22, agi: 11, exp: 40, gold: 30, acts: [[2, 'attack'], [1, 'charge']] }),
  gobheavy: M(['哥布林錨手', 'Anchor Goblin'], 'gobheavy', { hp: 96, atk: 48, def: 28, agi: 6, exp: 44, gold: 34, acts: [[3, 'attack'], [1, 'smash']] }),
  jacko: M(['南瓜燈', 'Jack-o-Flame'], 'jacko', { hp: 50, mp: 40, atk: 30, def: 18, agi: 13, exp: 36, gold: 30, acts: [[1, 'attack'], [2, 'blaze']], resist: ['fire'], weak: ['ice'] }),
  salamander: M(['火蜥', 'Salamander'], 'salamander', { hp: 88, atk: 44, def: 24, agi: 10, exp: 46, gold: 32, acts: [[2, 'attack'], [1, 'firebreath']], resist: ['fire'], weak: ['ice'] }),
  emberwraith: M(['餘燼之靈', 'Emberwraith'], 'emberwraith', { hp: 3600, mp: 255, atk: 72, def: 30, agi: 14, exp: 1200, gold: 700, acts: [[2, 'attack'], [2, 'firestorm'], [1, 'blaze'], [1, 'focusfire']], boss: true, resist: ['fire'], weak: ['ice'], twice: 0.6}),
  brannocfoe: M(['布藍諾', 'Brannoc'], 'person:darkknight', { hp: 2600, atk: 66, def: 34, agi: 9, exp: 500, gold: 0, acts: [[3, 'attack'], [1, 'cleave'], [1, 'guard']], boss: true }),
  // the desert (lv 16-20)
  fossilrex: M(['化石暴龍', 'Fossil Rex'], 'fossilrex', { hp: 130, atk: 60, def: 30, agi: 10, exp: 70, gold: 40, acts: [[3, 'attack'], [1, 'smash']], weak: ['light'] }),
  bonecroc: M(['骨鱷', 'Bonecroc'], 'bonecroc', { hp: 110, atk: 58, def: 34, agi: 9, exp: 66, gold: 38, acts: [[2, 'attack'], [1, 'squeeze']], weak: ['light'] }),
  bonewing: M(['骨翼龍', 'Bonewing'], 'bonewing', { hp: 92, atk: 54, def: 24, agi: 18, exp: 64, gold: 36, acts: [[2, 'attack'], [1, 'dive']], weak: ['light', 'wind'] }),
  naga: M(['沙蛇人', 'Sand Naga'], 'naga', { hp: 100, mp: 40, atk: 52, def: 26, agi: 14, exp: 66, gold: 44, acts: [[2, 'attack'], [1, 'galecut'], [1, 'poisonbite']] }),
  gnawer: M(['啃食者', 'Gnawer'], 'gnawer', { hp: 120, atk: 62, def: 22, agi: 12, exp: 70, gold: 46, acts: [[2, 'attack'], [1, 'devour']] }),
  trilobite: M(['沙蟲', 'Sandmite'], 'trilobite', { hp: 60, atk: 48, def: 60, agi: 8, exp: 80, gold: 60, acts: [[2, 'attack'], [1, 'harden']], drop: ['gem', 0.1] }),
  basilisk: M(['石化蜥', 'Basilisk'], 'basilisk', { hp: 4200, atk: 90, def: 40, agi: 14, exp: 1200, gold: 600, acts: [[2, 'attack'], [1, 'stare'], [1, 'poisonbite']], boss: true, twice: 0.4 }),
  clayborn: M(['大地之子', 'Clayborn'], 'clayborn', { hp: 4800, mp: 255, atk: 92, def: 44, agi: 12, exp: 2200, gold: 1000, acts: [[2, 'attack'], [2, 'quake'], [1, 'harden'], [1, 'healself']], boss: true, weak: ['wind'], resist: ['fire'], twice: 0.6 }),
  // the north (lv 20-24)
  icegolem: M(['冰魔像', 'Ice Golem'], 'icegolem', { hp: 180, atk: 74, def: 44, agi: 6, exp: 110, gold: 60, acts: [[3, 'attack'], [1, 'icebreath']], resist: ['ice'], weak: ['fire'] }),
  blightwolf: M(['雪原狼', 'Frost Wolf'], 'blightwolf', { look: { hue: 120, sat: 0.4, lum: 1.3 }, hp: 150, atk: 76, def: 30, agi: 22, exp: 100, gold: 50, acts: [[3, 'attack'], [1, 'howl']], weak: ['fire'], drop: ['fur', 0.25] }),
  shadowsnake: M(['影蛇', 'Shadow Serpent'], 'shadowsnake', { hp: 160, mp: 50, atk: 72, def: 34, agi: 16, exp: 110, gold: 58, acts: [[2, 'attack'], [1, 'poisonbite'], [1, 'doze']] }),
  nightwyvern: M(['霜翼龍', 'Frost Wyvern'], 'nightwyvern', { look: { hue: -40, sat: 0.6, lum: 1.25 }, hp: 190, atk: 80, def: 36, agi: 20, exp: 130, gold: 70, acts: [[2, 'attack'], [1, 'icebreath']], weak: ['fire'] }),
  mothkin: M(['銀蛾', 'Silver Moth'], 'mothkin', { hp: 130, mp: 60, atk: 64, def: 28, agi: 24, exp: 105, gold: 66, acts: [[1, 'attack'], [1, 'icewind'], [1, 'doze']], weak: ['fire'] }),
  rimewyrm: M(['霜冠龍', 'Rimewyrm'], 'rimewyrm', { hp: 8000, mp: 255, atk: 112, def: 46, agi: 18, exp: 3000, gold: 1400, acts: [[2, 'attack'], [2, 'icebreath'], [1, 'deepfrost'], [1, 'tailsweep']], boss: true, weak: ['fire'], resist: ['ice'], twice: 0.7 }),
  // the tower (lv 24-27)
  sylph: M(['風精', 'Sylph'], 'sylph', { hp: 170, mp: 80, atk: 70, def: 34, agi: 28, exp: 150, gold: 80, acts: [[1, 'attack'], [1, 'tempest'], [1, 'healally']] }),
  nymph: M(['水精', 'Nymph'], 'nymph', { hp: 170, mp: 80, atk: 68, def: 34, agi: 26, exp: 150, gold: 80, acts: [[1, 'attack'], [1, 'icewind'], [1, 'doze']] }),
  rockling: M(['岩人', 'Rockling'], 'rockling', { hp: 260, atk: 90, def: 60, agi: 8, exp: 170, gold: 90, acts: [[3, 'attack'], [1, 'smash']], weak: ['wind'] }),
  steamgolem: M(['蒸汽魔像', 'Steam Golem'], 'steamgolem', { hp: 300, atk: 96, def: 64, agi: 10, exp: 190, gold: 110, acts: [[2, 'attack'], [1, 'steam']], weak: ['bolt', 'light'] }),
  loomwarden: M(['天織的守衛', 'Loomwarden'], 'sunwisp', { hp: 8000, mp: 255, atk: 116, def: 40, agi: 24, exp: 3500, gold: 1800, acts: [[3, 'attack'], [2, 'dawnbolt'], [1, 'healself']], boss: true, resist: ['light'], twice: 0.8 }),
  morrow1: M(['大祭司莫洛', 'High Seer Morrow'], 'wizard', { hp: 99999, mp: 999, atk: 120, def: 80, agi: 30, exp: 0, gold: 0, acts: [[1, 'darkfire']], boss: true, scripted: true }),
  // the dark world (lv 27-33)
  shade: M(['怨影', 'Shade'], 'shade', { hp: 240, mp: 80, atk: 92, def: 40, agi: 22, exp: 220, gold: 90, acts: [[2, 'attack'], [1, 'drain']], weak: ['light'] }),
  cultist: M(['解織教徒', 'Unweaver Cultist'], 'cultist', { hp: 250, mp: 120, atk: 88, def: 40, agi: 18, exp: 230, gold: 120, acts: [[1, 'attack'], [2, 'darkfire'], [1, 'healally']], weak: ['light'] }),
  orc: M(['獸人戰士', 'Orc Warrior'], 'orc', { hp: 380, atk: 110, def: 52, agi: 12, exp: 260, gold: 110, acts: [[3, 'attack'], [1, 'smash']] }),
  goblinrider: M(['哥布林騎兵', 'Goblin Rider'], 'goblinrider', { hp: 340, atk: 112, def: 48, agi: 20, exp: 270, gold: 120, acts: [[2, 'attack'], [1, 'charge'], [1, 'double']] }),
  medusoid: M(['蛇髮妖', 'Medusoid'], 'medusoid', { hp: 300, mp: 80, atk: 100, def: 46, agi: 16, exp: 260, gold: 130, acts: [[2, 'attack'], [1, 'stare'], [1, 'poisonbite']] }),
  veilwraith: M(['帷幕幽靈', 'Veilwraith'], 'veilwraith', { hp: 280, mp: 120, atk: 96, def: 44, agi: 24, exp: 270, gold: 120, acts: [[1, 'attack'], [1, 'deepfrost'], [1, 'drain']], weak: ['light'] }),
  bullgore: M(['牛頭魔', 'Bullgore'], 'bullgore', { hp: 460, atk: 126, def: 56, agi: 12, exp: 320, gold: 140, acts: [[2, 'attack'], [1, 'charge'], [1, 'roar']] }),
  dryadroot: M(['腐根樹精', 'Rotroot'], 'dryadroot', { hp: 420, mp: 80, atk: 104, def: 54, agi: 10, exp: 300, gold: 130, acts: [[2, 'attack'], [1, 'poisonbite'], [1, 'healself']], weak: ['fire'] }),
  bloodfiend: M(['血魔', 'Bloodfiend'], 'bloodfiend', { hp: 440, mp: 120, atk: 120, def: 54, agi: 20, exp: 340, gold: 160, acts: [[2, 'attack'], [1, 'drain'], [1, 'firestorm']], weak: ['light'] }),
  reaper: M(['收割者', 'Reaper'], 'reaper', { hp: 520, mp: 120, atk: 134, def: 60, agi: 22, exp: 400, gold: 180, acts: [[2, 'attack'], [1, 'reap'], [1, 'darkfire']], weak: ['light'] }),
  tentacle: M(['深淵觸手', 'Abyss Tendril'], 'tentacle', { hp: 360, atk: 116, def: 50, agi: 18, exp: 300, gold: 140, acts: [[2, 'attack'], [1, 'squeeze'], [1, 'poisonbite']] }),
  gobseer: M(['哥布林巫師', 'Goblin Seer'], 'gobseer', { hp: 300, mp: 200, atk: 90, def: 46, agi: 18, exp: 290, gold: 150, acts: [[1, 'attack'], [2, 'blaze'], [1, 'healally']] }),
  // reunion bosses
  alphawolf: M(['影狼王', 'Shadow Alpha'], 'blightwolf', { look: { hue: 200, sat: 0.6, lum: 0.6 }, calls: 'wolf', hp: 4600, atk: 104, def: 52, agi: 30, exp: 2200, gold: 1500, acts: [[2, 'attack'], [1, 'howl'], [1, 'double'], [1, 'darkfire']], boss: true, twice: 0.6, weak: ['light'] }),
  plagueabbot: M(['疫病院長', 'Plague Abbot'], 'disciple', { look: { hue: 100, sat: 1.2, lum: 0.9 }, hp: 6200, mp: 999, atk: 124, def: 56, agi: 20, exp: 2200, gold: 1500, acts: [[1, 'attack'], [2, 'plague'], [1, 'drain'], [1, 'healself']], boss: true, twice: 0.8, weak: ['light', 'fire'] }),
  deepkraken: M(['深淵海妖', 'Abyss Kraken'], 'kraken', { look: { hue: 160, sat: 1.1, lum: 0.75 }, hp: 8000, atk: 140, def: 58, agi: 18, exp: 2200, gold: 1600, acts: [[2, 'attack'], [2, 'tidal'], [1, 'squeeze'], [1, 'inkcloud']], boss: true, twice: 0.8, weak: ['bolt', 'light'] }),
  leocephas: M(['獅首將軍', 'General Leocephas'], 'leocephas', { hp: 9000, atk: 150, def: 62, agi: 26, exp: 2200, gold: 1600, acts: [[3, 'attack'], [1, 'double'], [1, 'roar'], [1, 'cleave']], boss: true, twice: 0.9 }),
  archfiend: M(['記憶的惡魔', 'Memory Fiend'], 'archfiend', { hp: 9500, mp: 999, atk: 140, def: 58, agi: 24, exp: 2200, gold: 1600, acts: [[1, 'attack'], [2, 'darkfire'], [1, 'deepfrost'], [1, 'hush']], boss: true, twice: 0.9, weak: ['light'] }),
  // the citadel (lv 33-38)
  gloomwyrm: M(['幽暗雙頭龍', 'Gloomwyrm'], 'gloomwyrm', { hp: 16000, mp: 999, atk: 160, def: 70, agi: 22, exp: 4000, gold: 3000, acts: [[2, 'attack'], [2, 'firestorm'], [1, 'icebreath'], [1, 'tailsweep']], boss: true, twice: 1, weak: ['light'] }),
  morrow2: M(['大祭司莫洛', 'High Seer Morrow'], 'wizard', { hp: 14000, mp: 999, atk: 140, def: 66, agi: 32, exp: 4000, gold: 3000, acts: [[1, 'attack'], [2, 'darkfire'], [1, 'deepfrost'], [1, 'sunderall'], [1, 'healself']], boss: true, twice: 1, weak: ['light'] }),
  unweaver1: M(['解織者', 'The Unweaver'], 'unweaver1', { hp: 9000, mp: 999, atk: 160, def: 70, agi: 30, exp: 0, gold: 0, acts: [[2, 'attack'], [2, 'darkfire'], [1, 'unravel']], boss: true, twice: 1, weak: ['light'] }),
  unweaver2: M(['解織者', 'The Unweaver'], 'unweaver2', { hp: 15000, mp: 999, atk: 176, def: 74, agi: 32, exp: 0, gold: 0, acts: [[2, 'attack'], [1, 'firestorm'], [1, 'deepfrost'], [1, 'unravel'], [1, 'sunderall']], boss: true, twice: 1, weak: ['light'] }),
  unweaver3: M(['解織者・終焉', 'The Unweaver, Unmade'], 'unweaver3', { hp: 16000, mp: 999, atk: 190, def: 80, agi: 34, exp: 0, gold: 0, acts: [[3, 'attack'], [2, 'unravel'], [1, 'firestorm'], [1, 'reap']], boss: true, twice: 1, weak: ['light'] }),
};
// dark-world kin of earlier monsters: tougher, darker
export const DARKEN = { look: { hue: 0, sat: 0.6, lum: 0.75 } };

// ---------- monster actions ----------
// kind as in SKILLS; power: multiplier of attack (phys) or base damage (spell); msg: [zh, en] with %s for the user
const A = (n, o) => ({ n, ...o });
export const MACTS = {
  attack: A(['攻擊', 'Attack'], { kind: 'phys', tgt: 'foe', power: 1 }),
  dive: A(['俯衝', 'Dive'], { kind: 'phys', tgt: 'foe', power: 1.4, msg: ['%s俯衝下來！', '%s dives!'] }),
  poisonbite: A(['毒咬', 'Venom Bite'], { kind: 'phys', tgt: 'foe', power: 1, st: 'poison', hit: 0.5, msg: ['%s咬了下去！', '%s bites!'] }),
  web: A(['吐絲', 'Web'], { kind: 'status', tgt: 'foe', st: 'numb', hit: 0.3, msg: ['%s吐出了黏黏的絲！', '%s spits a sticky web!'] }),
  ember: A(['火花', 'Sparks'], { kind: 'breath', tgt: 'foes', power: 10, el: 'fire', msg: ['%s吐出了火花！', '%s spits sparks!'] }),
  roar: A(['咆哮', 'Roar'], { kind: 'status', tgt: 'foes', st: 'numb', hit: 0.15, msg: ['%s發出震耳的咆哮！', '%s lets out a deafening roar!'] }),
  stare: A(['凝視', 'Stare'], { kind: 'status', tgt: 'foe', st: 'confuse', hit: 0.35, msg: ['%s直直地盯著看！', '%s stares!'] }),
  double: A(['連擊', 'Double Strike'], { kind: 'phys', tgt: 'foe', power: 0.8, hits: 2, msg: ['%s連續攻擊！', '%s strikes twice!'] }),
  harden: A(['硬化', 'Harden'], { kind: 'selfbuff', st: 'defup', msg: ['%s的身體變硬了！', "%s's body hardens!"] }),
  guard: A(['防禦', 'Guard'], { kind: 'guard', msg: ['%s擺出防禦的姿勢。', '%s is guarding.'] }),
  smash: A(['重擊', 'Smash'], { kind: 'phys', tgt: 'foe', power: 1.6, hitp: 0.75, msg: ['%s使出全力一擊！', '%s puts its whole weight into a blow!'] }),
  squeeze: A(['纏繞', 'Squeeze'], { kind: 'phys', tgt: 'foe', power: 1.2, st: 'numb', hit: 0.15, msg: ['%s纏了上來！', '%s squeezes!'] }),
  howl: A(['嚎叫', 'Howl'], { kind: 'call', msg: ['%s發出嚎叫，呼喚同伴！', '%s howls for help!'] }),
  healally: A(['療傷', 'Mend'], { kind: 'healally', power: 50, mp: 4, msg: ['%s唸出了療傷的咒文！', '%s casts Mend!'] }),
  healself: A(['自我修復', 'Regenerate'], { kind: 'healself', power: 0.08, msg: ['%s的傷口正在癒合！', "%s's wounds close!"] }),
  tidal: A(['大浪', 'Tidal Wave'], { kind: 'breath', tgt: 'foes', power: 34, el: 'water', msg: ['%s捲起了大浪！', '%s raises a great wave!'] }),
  inkcloud: A(['墨霧', 'Ink Cloud'], { kind: 'status', tgt: 'foes', st: 'blind', hit: 0.4, msg: ['%s噴出了漆黑的墨！', '%s sprays black ink!'] }),
  charge: A(['衝鋒', 'Charge'], { kind: 'phys', tgt: 'foe', power: 1.5, msg: ['%s猛衝過來！', '%s charges!'] }),
  firebreath: A(['火焰吐息', 'Fire Breath'], { kind: 'breath', tgt: 'foes', power: 30, el: 'fire', msg: ['%s噴出了火焰！', '%s breathes fire!'] }),
  firestorm: A(['焚風', 'Firestorm'], { kind: 'breath', tgt: 'foes', power: 70, el: 'fire', msg: ['%s捲起了灼熱的焚風！', '%s raises a firestorm!'] }),
  focusfire: A(['聚火', 'Gather Flame'], { kind: 'selfbuff', st: 'magup', msg: ['%s的火焰變得更加熾烈！', "%s's flames burn hotter!"] }),
  cleave: A(['橫掃', 'Cleave'], { kind: 'phys', tgt: 'foes', power: 0.8, msg: ['%s橫掃一劍！', '%s sweeps the blade!'] }),
  devour: A(['吞噬', 'Devour'], { kind: 'phys', tgt: 'foe', power: 1.3, drain: true, msg: ['%s張開大嘴咬了下去！', '%s opens wide and bites!'] }),
  quake: A(['地震', 'Earthquake'], { kind: 'breath', tgt: 'foes', power: 60, el: 'earth', msg: ['%s讓大地劇烈搖晃！', '%s shakes the earth!'] }),
  icebreath: A(['寒冰吐息', 'Frost Breath'], { kind: 'breath', tgt: 'foes', power: 52, el: 'ice', msg: ['%s吐出了凍人的寒氣！', '%s breathes frost!'] }),
  tailsweep: A(['甩尾', 'Tail Sweep'], { kind: 'phys', tgt: 'foes', power: 0.85, msg: ['%s甩動巨大的尾巴！', '%s sweeps its huge tail!'] }),
  steam: A(['噴蒸氣', 'Steam'], { kind: 'breath', tgt: 'foes', power: 44, el: 'fire', msg: ['%s噴出滾燙的蒸氣！', '%s vents scalding steam!'] }),
  darkfire: A(['冥炎', 'Darkfire'], { kind: 'spell', tgt: 'foe', power: 95, el: 'dark', mp: 8, msg: ['%s放出漆黑的火焰！', '%s casts Darkfire!'] }),
  drain: A(['吸取', 'Drain'], { kind: 'phys', tgt: 'foe', power: 1.1, drain: true, msg: ['%s吸取了生命！', '%s drains life!'] }),
  reap: A(['收割', 'Reap'], { kind: 'phys', tgt: 'foes', power: 1.0, msg: ['%s揮動巨大的鐮刀！', '%s swings its great scythe!'] }),
  plague: A(['疫病之霧', 'Plague Mist'], { kind: 'breath', tgt: 'foes', power: 40, st: 'poison', hit: 0.6, msg: ['%s散布疫病之霧！', '%s spreads a plague mist!'] }),
  sunderall: A(['破魔之光', 'Unwarding'], { kind: 'dispel', msg: ['%s放出了奇異的光！所有的增益都消失了！', '%s sheds a strange light! Every blessing fades!'] }),
  unravel: A(['解織', 'Unravel'], { kind: 'breath', tgt: 'foes', power: 120, el: 'dark', msg: ['%s拉扯生命之線！', '%s tugs at the threads of life!'] }),
};
// spells monsters cast borrow the heroes' tables
for (const id of ['flameshot', 'blaze', 'icewind', 'deepfrost', 'galecut', 'tempest', 'dawnbolt', 'doze', 'hush', 'warding']) MACTS[id] = { ...SKILLS[id], kind: SKILLS[id].kind === 'dmg' ? 'spell' : SKILLS[id].kind === 'buff' ? 'selfbuffall' : SKILLS[id].kind, msg: ['%s唸出了「' + SKILLS[id].n[0] + '」的咒文！', '%s casts ' + SKILLS[id].n[1] + '!'] };

// ---------- encounters ----------
// zone: [[weight, [monster ids...]]]
export const ZONES = {
  crag: [[4, ['slime', 'slime']], [3, ['dartfly']], [3, ['vinesnake']], [2, ['slime', 'dartfly']], [2, ['skitter']], [1, ['slime', 'slime', 'slime']]],
  road: [[4, ['slime', 'slime']], [3, ['goblin']], [3, ['dartfly', 'slime']], [2, ['eyeball']], [2, ['vinesnake']], [1, ['skitter', 'slime']]],
  meadow: [[3, ['goblin']], [3, ['slime', 'slime', 'goblin']], [3, ['eyeball', 'eyeball']], [2, ['mantid']], [2, ['vinesnake', 'skitter']], [2, ['shelltoad']], [1, ['hexer', 'goblin']]],
  sewer: [[3, ['rat', 'rat']], [3, ['bonesman']], [2, ['eyeball', 'rat']], [2, ['hexer', 'bonesman']], [2, ['slime', 'slime', 'rat']]],
  river: [[3, ['wolf', 'wolf']], [3, ['toadman']], [2, ['gobguard', 'goblin']], [2, ['mantid', 'wolf']], [2, ['shelltoad', 'toadman']], [1, ['hexer', 'hexer']]],
  temple: [[3, ['helmfish', 'helmfish']], [3, ['helmeel']], [2, ['helmstar', 'helmfish']], [2, ['toadman', 'helmeel']], [1, ['helmstar', 'helmeel', 'helmstar']]],
  coast: [[3, ['gobblade']], [3, ['goblancer', 'gobguard']], [2, ['gobheavy']], [2, ['wolf', 'wolf', 'wolf']], [2, ['jacko', 'gobblade']]],
  sea: [[3, ['helmfish', 'helmfish', 'helmeel']], [3, ['helmstar', 'helmeel']], [2, ['toadman', 'toadman']]],
  volcano: [[3, ['salamander']], [3, ['jacko', 'jacko']], [2, ['gobheavy', 'salamander']], [2, ['goblancer', 'jacko']]],
  desert: [[3, ['fossilrex']], [3, ['bonewing', 'bonewing']], [2, ['naga', 'bonecroc']], [2, ['gnawer']], [1, ['trilobite']], [2, ['naga', 'naga']]],
  ruins: [[3, ['bonecroc', 'bonewing']], [3, ['gnawer', 'naga']], [2, ['fossilrex', 'bonewing']], [1, ['trilobite', 'trilobite']]],
  snow: [[3, ['blightwolf', 'blightwolf']], [3, ['icegolem']], [2, ['nightwyvern']], [2, ['mothkin', 'mothkin']], [2, ['shadowsnake', 'blightwolf']]],
  frost: [[3, ['icegolem', 'mothkin']], [3, ['shadowsnake']], [2, ['nightwyvern', 'mothkin']], [2, ['blightwolf', 'blightwolf', 'blightwolf']]],
  tower: [[3, ['sylph', 'nymph']], [3, ['rockling']], [2, ['steamgolem']], [2, ['nymph', 'nymph']], [2, ['sylph', 'rockling']]],
  dark: [[3, ['shade', 'shade']], [3, ['orc']], [2, ['cultist', 'shade']], [2, ['goblinrider']], [2, ['medusoid']], [1, ['gobseer', 'orc']]],
  dark2: [[3, ['bullgore']], [3, ['veilwraith', 'shade']], [2, ['dryadroot']], [2, ['tentacle', 'tentacle']], [2, ['bloodfiend']], [1, ['cultist', 'cultist', 'gobseer']]],
  citadel: [[3, ['reaper']], [3, ['bloodfiend', 'veilwraith']], [2, ['bullgore', 'gobseer']], [2, ['tentacle', 'reaper']], [1, ['medusoid', 'medusoid']]],
};
export const BOSSES = {
  drakeling: ['drakeling'], warden: ['warden'], mirequeen: ['helmstar', 'mirequeen', 'helmstar'], brannoc: ['brannocfoe'], emberwraith: ['emberwraith'],
  basilisk: ['basilisk'], clayborn: ['clayborn'], rimewyrm: ['rimewyrm'], loomwarden: ['loomwarden'], morrow1: ['morrow1'],
  alphawolf: ['alphawolf'], plagueabbot: ['plagueabbot'], deepkraken: ['deepkraken'], leocephas: ['leocephas'], archfiend: ['archfiend'],
  gloomwyrm: ['gloomwyrm'], morrow2: ['morrow2'], unweaver: ['unweaver1'],
};
// battle backgrounds and the sky above them
export const BG = {
  crag: ['mountains', '#5888d8', '#a8d0f8'], road: ['grass', '#4878d0', '#a8d8f8'], meadow: ['grass', '#4878d0', '#a8d8f8'], sewer: ['underground', '#101018', '#283038'], river: ['grass', '#4878d0', '#a8d8f8'],
  temple: ['water', '#102838', '#285868'], coast: ['sand', '#4890e0', '#b8e0f8'], sea: ['water', '#3878d8', '#98c8f0'], volcano: ['volcano', '#200808', '#682010'],
  desert: ['sand', '#d08848', '#f8d898'], ruins: ['keep', '#281810', '#584030'], snow: ['moon', '#8098c0', '#d8e0f0'], frost: ['moon', '#183048', '#4878a0'],
  tower: ['foo', '#382868', '#8878c8'], dark: ['jungle', '#180818', '#402040'], dark2: ['mountains', '#180818', '#482040'], citadel: ['keep_outer', '#100010', '#381038'],
  castle: ['fort', '#202030', '#404058'], crypt: ['underground', '#100810', '#281828'],
};

// ---------- shops ----------
export const SHOPS = {
  bright: ['herb', 'antidote', 'feather', 'oaksword', 'dagger', 'potlid', 'bandana', 'tunic'],
  solweapon: ['copper', 'dirk', 'leatherwhip', 'spear', 'catclaw', 'firewand'],
  solarmor: ['leather', 'chainmail', 'silkrobe', 'leathershield', 'hat', 'helm'],
  solitem: ['herb', 'strongherb', 'antidote', 'moonwort', 'feather', 'incense'],
  dove: ['bronze', 'spear', 'ironknuckle', 'leather', 'scalearmor', 'kiteshield', 'herb', 'strongherb', 'moonwort', 'feather'],
  gull: ['steel', 'poisondagger', 'prayerstaff', 'handaxe', 'chainmail', 'ironarmor', 'ironshield', 'circlet', 'bomb', 'strongherb'],
  sand: ['flamberge', 'chainwhip', 'holyspear', 'tigerfang', 'scalearmor', 'ironarmor', 'charm', 'boots', 'strongherb', 'moonwort', 'bomb'],
  snow: ['mythril', 'falcon', 'sagestaff', 'battleaxe', 'starwand', 'dragonmail', 'shadowsuit', 'sagerobe', 'greathelm', 'goldring', 'ring'],
  snowitem: ['strongherb', 'elixir', 'ether', 'moonwort', 'feather', 'incense', 'bomb'],
  camp: ['strongherb', 'elixir', 'ether', 'moonwort', 'feather', 'mirrorshield', 'dragonmail', 'sagerobe'],
};

// =====================================================================================
// THE EXPANSION: new spells and skills, link arts, the fourth path of every skill board,
// items, materials, fish, key items and equipment. Added to the tables above.
// =====================================================================================
Object.assign(SKILLS, {
  // thunder (Sera)
  jolt: S(['雷擊', 'Jolt'], { mp: 3, kind: 'dmg', tgt: 'foe', power: 18, el: 'bolt', fx: 'bolt', spell: true, d: ['以雷電打擊一名敵人。', 'Strikes one foe with lightning.'] }),
  thunderclap: S(['雷鳴', 'Thunderclap'], { mp: 10, kind: 'dmg', tgt: 'group', power: 52, el: 'bolt', fx: 'bolt', spell: true, d: ['雷鳴落在一群敵人身上。', 'A thunderclap falls on a group of foes.'] }),
  skyfall: S(['天雷', 'Skyfall'], { mp: 28, kind: 'dmg', tgt: 'foes', power: 136, el: 'bolt', fx: 'bolt', spell: true, d: ['讓整片天空的雷落下。', 'Brings down the lightning of the whole sky.'] }),
  // water (Sera, Mirela)
  splash: S(['水彈', 'Splash'], { mp: 4, kind: 'dmg', tgt: 'foe', power: 24, el: 'water', fx: 'ice', spell: true, d: ['射出強力的水彈。', 'Fires a hard ball of water at one foe.'] }),
  torrent: S(['激流', 'Torrent'], { mp: 11, kind: 'dmg', tgt: 'group', power: 62, el: 'water', fx: 'ice', spell: true, d: ['激流沖走一群敵人。', 'A torrent sweeps a group of foes away.'] }),
  maelstrom: S(['大漩渦', 'Maelstrom'], { mp: 30, kind: 'dmg', tgt: 'foes', power: 148, el: 'water', fx: 'ice', spell: true, d: ['捲起吞沒一切的大漩渦。', 'A maelstrom that swallows everything.'] }),
  // earth (Brannoc)
  stoneshard: S(['石礫', 'Stoneshard'], { mp: 4, kind: 'dmg', tgt: 'foe', power: 26, el: 'earth', fx: 'boom', spell: true, d: ['尖銳的石礫刺向一名敵人。', 'Sharp shards of stone fly at one foe.'] }),
  quakeline: S(['裂地', 'Rift Line'], { mp: 12, kind: 'dmg', tgt: 'foes', power: 46, el: 'earth', fx: 'boom', spell: true, d: ['大地裂開，吞噬全部敵人。', 'The ground splits under every foe.'] }),
  gaiawrath: S(['大地之怒', "Earth's Wrath"], { mp: 30, kind: 'dmg', tgt: 'foes', power: 142, el: 'earth', fx: 'boom', spell: true, d: ['大地本身憤怒地咆哮。', 'The land itself roars in anger.'] }),
  // holy and support (Mirela)
  smite: S(['聖擊', 'Smite'], { mp: 5, kind: 'dmg', tgt: 'foe', power: 42, el: 'light', fx: 'holy', spell: true, d: ['神聖之光擊打一名敵人。', 'Holy light strikes one foe.'] }),
  judgement: S(['審判', 'Judgement'], { mp: 22, kind: 'dmg', tgt: 'foes', power: 122, el: 'light', fx: 'holy', spell: true, d: ['天上的光審判全部敵人。', 'The light of heaven judges every foe.'] }),
  barrier: S(['魔障', 'Barrier'], { mp: 8, kind: 'buff', tgt: 'allies', st: 'mwall', fx: 'buff', spell: true, d: ['張開魔障，減輕全體同伴受到的吐息與咒文傷害。', 'A barrier that softens breath and spells for every friend.'] }),
  hymn: S(['再生聖歌', 'Hymn of Renewal'], { mp: 14, kind: 'buff', tgt: 'allies', st: 'regen', fx: 'heal', spell: true, d: ['唱起聖歌，全體同伴每回合回復體力。', 'A hymn: every friend recovers HP each round.'] }),
  seconddawn: S(['再晨', 'Second Dawn'], { mp: 24, kind: 'buff', tgt: 'ally', st: 'reraise', fx: 'heal', spell: true, d: ['為一名同伴祈福。倒下時會立刻復活一次。', 'A blessing: if the friend falls, they rise again at once.'] }),
  // hexes (Sera, Pell)
  weaken: S(['虛弱', 'Weaken'], { mp: 4, kind: 'debuff', tgt: 'group', st: 'atkdown', hit: 0.8, fx: 'dark', spell: true, d: ['降低一群敵人的攻擊力。', "Lowers a group of foes' attack."] }),
  sluggard: S(['遲緩', 'Sluggard'], { mp: 4, kind: 'debuff', tgt: 'group', st: 'agidown', hit: 0.8, fx: 'dark', spell: true, d: ['讓一群敵人的動作變慢。', 'Slows a group of foes.'] }),
  threadbind: S(['縛絲', 'Threadbind'], { mp: 8, kind: 'status', tgt: 'group', st: 'numb', hit: 0.5, fx: 'dark', spell: true, d: ['以光之絲線綁住一群敵人。', 'Binds a group of foes in threads of light.'] }),
  threadstorm: S(['萬絲風暴', 'Threadstorm'], { mp: 36, kind: 'dmg', tgt: 'foes', power: 262, fx: 'star', spell: true, d: ['織母傳下的祕術。無數絲線撕裂全部敵人。', "The Weaver's secret art. Countless threads tear through every foe."] }),
  // Rowan: the Starborn path
  gigaslash: S(['破曉斬', 'Daybreak Slash'], { mp: 16, kind: 'phys', tgt: 'foes', power: 1.6, el: 'light', fx: 'holy', d: ['晨星之光化作巨大的劍，斬向全部敵人。', 'The Dawnmark becomes a giant blade through every foe.'] }),
  dawnveil: S(['晨幕', 'Dawn Veil'], { mp: 10, kind: 'buff2', tgt: 'allies', fx: 'buff', d: ['晨光的帷幕守護全體同伴。', 'A veil of morning light shields every friend.'] }),
  heartlight: S(['心之光', 'Heartlight'], { mp: 18, kind: 'heal', tgt: 'allies', power: 220, fx: 'heal', d: ['晨星之印溫柔地發光，回復全體同伴。', 'The Dawnmark glows softly, healing every friend.'] }),
  meteorstrike: S(['星隕一擊', 'Falling Star'], { mp: 20, kind: 'phys', tgt: 'foe', power: 3.8, el: 'blast', fx: 'star', d: ['像墜落的星星一樣，一劍劈下。', 'Comes down on a foe like a falling star.'] }),
  supernova: S(['新星', 'Supernova'], { mp: 48, kind: 'dmg', tgt: 'foes', power: 310, el: 'light', fx: 'holy', spell: true, d: ['晨星之印的最終之光。', 'The last light of the Dawnmark.'] }),
  // Pell: the Treasure Hunter path
  mug: S(['搶奪', 'Mug'], { mp: 3, kind: 'steal', tgt: 'foe', power: 1.4, bonus: 0.2, fx: 'slash', d: ['狠狠一擊，順手搶走東西。', 'A hard blow that snatches something.'] }),
  backstab: S(['背刺', 'Backstab'], { mp: 8, kind: 'phys', tgt: 'foe', power: 2.0, crit: 0.5, fx: 'slash', d: ['繞到背後的一刺。一半的機率會心一擊。', 'A stab from behind. Critical half the time.'] }),
  goldtoss: S(['擲金', 'Gold Rain'], { mp: 0, kind: 'goldtoss', tgt: 'foes', power: 300, fx: 'star', d: ['撒出 200 金幣，傷害全部敵人。', 'Throws 200 gold that hurts every foe.'] }),
  thousandcuts: S(['千刃', 'Thousand Cuts'], { mp: 18, kind: 'phys', tgt: 'rand', power: 0.7, hits: 8, fx: 'slash', d: ['看不見的速度，八次斬擊。', 'Eight cuts too fast to see.'] }),
  // Odo: the Master's Way
  chakra: S(['氣功', 'Chakra'], { mp: 6, kind: 'heal', tgt: 'self', power: 220, cure: true, fx: 'heal', d: ['調整呼吸，回復自己的體力並治好異常。', 'Steadies his breath: heals himself and cures ailments.'] }),
  kiblast: S(['氣功波', 'Ki Blast'], { mp: 10, kind: 'phys', tgt: 'foes', power: 1.15, pierce: true, fx: 'boom', d: ['放出氣功波，無視防禦打擊全部敵人。', 'A wave of ki that ignores armour, hitting every foe.'] }),
  hundredfists: S(['百烈拳', 'Hundred Fists'], { mp: 14, kind: 'phys', tgt: 'rand', power: 0.65, hits: 7, fx: 'hit', d: ['如雨點般的連打。', 'A rain of blows.'] }),
  mastersfeast: S(['師父的宴席', "Master's Feast"], { mp: 20, kind: 'feast', tgt: 'allies', power: 1.0, fx: 'heal', d: ['師父傳下的料理。全體完全回復，攻擊力上升。', "His master's dish. Fully heals everyone and raises attack."] }),
  // Brannoc: the Oathkeeper path
  oathcharge: S(['誓約衝鋒', 'Oath Charge'], { mp: 8, kind: 'phys', tgt: 'foe', power: 2.3, fx: 'slash', d: ['舉盾衝鋒的強力一擊。', 'A mighty charge behind the shield.'] }),
  guardian: S(['守護者', 'Guardian'], { mp: 6, kind: 'buff', tgt: 'self', st: 'guardian', fx: 'buff', d: ['這一回合替全體同伴挨下攻擊，並提高防禦。', 'Takes the blows meant for friends this round, defence raised.'] }),
  aegisall: S(['聖盾陣', 'Shield Ring'], { mp: 14, kind: 'buff2', tgt: 'allies', fx: 'buff', d: ['騎士的守護陣，全體防禦與魔防大幅上升。', "A knight's ring of shields: every friend is warded."] }),
  oathbreaker: S(['斷誓', 'Oathbreaker'], { mp: 18, kind: 'phys', tgt: 'foe', power: 3.9, fx: 'holy', d: ['把一生的誓言都押在這一劍上。', 'A stroke with a whole life of oaths behind it.'] }),
});
for (const k of Object.keys(SKILLS)) if (SKILLS[k].spell) SPELL_IDS.add(k);

LEARN.sera.push([4, 'jolt'], [8, 'splash'], [13, 'thunderclap'], [19, 'torrent'], [23, 'weaken'], [33, 'skyfall'], [37, 'maelstrom']);
LEARN.mirela.push([15, 'smite'], [21, 'barrier'], [28, 'judgement']);
LEARN.brannoc.push([8, 'stoneshard'], [16, 'quakeline'], [33, 'gaiawrath']);
LEARN.pell.push([22, 'sluggard']);
LEARN.rowan.push([31, 'seconddawn']);
for (const k of Object.keys(LEARN)) LEARN[k].sort((a, b) => a[0] - b[0]);

Object.assign(ARTS, {
  mirrorveil: { n: ['幻影帷幕', 'Mirage Veil'], need: ['pell', 'sera'], kind: 'phys', tgt: 'foes', power: 1.3, st: 'confuse', hit: 0.6, fx: 'dark', d: ['幻影包圍敵陣，傷害全部敵人並使其混亂。', 'Mirages surround the foes, hurting and confusing them.'] },
  verdict: { n: ['光輝審判', 'Radiant Verdict'], need: ['rowan', 'mirela'], kind: 'healdmg', tgt: 'foes', power: 260, heal: 120, el: 'light', fx: 'holy', d: ['審判之光打擊全部敵人，同時治癒全體同伴。', 'The light of judgement strikes every foe and heals every friend.'] },
  ironwall: { n: ['鐵壁', 'Iron Wall'], need: ['brannoc', 'odo'], kind: 'buffall', tgt: 'allies', fx: 'buff', d: ['兩人擋在最前面。全體攻擊與防禦大幅上升。', 'The two stand at the front: every friend gains attack and defence.'] },
  glacierlance: { n: ['冰河突刺', 'Glacier Lance'], need: ['sera', 'brannoc'], kind: 'phys', tgt: 'foes', power: 1.85, el: 'ice', fx: 'ice', d: ['瑟菈把冰河凍在布藍諾的劍上。', "Sera freezes a glacier onto Brannoc's blade."] },
  tidalprayer: { n: ['潮汐之禱', 'Tidal Prayer'], need: ['mirela', 'sera'], kind: 'dmgmp', tgt: 'foes', power: 280, el: 'water', fx: 'ice', d: ['潮水沖走敵陣，回復全體同伴的魔力。', "The tide sweeps the foes and restores every friend's MP."] },
  shadowbind: { n: ['影縛', 'Shadow Bind'], need: ['pell', 'brannoc'], kind: 'phys', tgt: 'foe', power: 2.7, st: 'numb', hit: 0.7, fx: 'slash', d: ['佩兒踩住影子，布藍諾一劍劈下。', 'Pell pins its shadow; Brannoc brings the sword down.'] },
  zenmercy: { n: ['禪心', 'Zen Mercy'], need: ['odo', 'mirela'], kind: 'regenall', tgt: 'allies', power: 0.6, fx: 'heal', d: ['回復全體同伴大量體力，之後每回合持續回復。', 'Heals every friend greatly, then a little more every round.'] },
  risingdragon: { n: ['昇龍連擊', 'Rising Dragon'], need: ['rowan', 'odo'], kind: 'phys', tgt: 'foe', power: 1.6, hits: 3, fx: 'hit', d: ['拳與劍交錯，連續三次重擊。', 'Fist and sword cross for three heavy blows.'] },
  galetrio: { n: ['疾風三重奏', 'Gale Trio'], need: ['pell', 'odo', 'brannoc'], kind: 'phys', tgt: 'rand', power: 1.0, hits: 9, fx: 'slash', d: ['三人輪番上陣，九次攻擊。', 'Three take turns: nine strikes.'] },
  trinity: { n: ['三重光輝', 'Trinity Light'], need: ['rowan', 'mirela', 'sera'], kind: 'dmg', tgt: 'foes', power: 430, el: 'light', fx: 'star', d: ['三道光合而為一。', 'Three lights become one.'] },
});

// the fourth path of each board opens after the friend's own story
const P4 = (need, n, nodes) => ({ n, need, nodes });
BOARDS.rowan.push(P4('archive_done', ['晨星之子', 'Starborn'], [[8, { skill: 'gigaslash' }], [10, { skill: 'dawnveil' }], [12, { str: 16 }], [14, { skill: 'heartlight' }], [18, { skill: 'meteorstrike' }], [26, { spell: 'supernova' }]]));
BOARDS.pell.push(P4('ep_pell', ['尋寶者', 'Treasure Hunter'], [[6, { skill: 'mug' }], [8, { pass: 'lucky' }], [10, { skill: 'backstab' }], [12, { skill: 'goldtoss' }], [14, { agi: 20 }], [20, { skill: 'thousandcuts' }]]));
BOARDS.mirela.push(P4('ep_mirela', ['聖女', 'Saint'], [[6, { spell: 'barrier' }], [8, { heal: 16 }], [10, { spell: 'hymn' }], [14, { mp: 30 }], [16, { pass: 'mpregen' }], [22, { spell: 'seconddawn' }]]));
BOARDS.odo.push(P4('ep_odo', ['師父之道', "Master's Way"], [[6, { skill: 'chakra' }], [8, { pass: 'counter' }], [10, { skill: 'kiblast' }], [14, { str: 18 }], [16, { skill: 'hundredfists' }], [22, { skill: 'mastersfeast' }]]));
BOARDS.sera.push(P4('ep_sera', ['織絲', 'Threadweaving'], [[6, { spell: 'sluggard' }], [8, { pass: 'mpregen' }], [10, { spell: 'threadbind' }], [14, { mag: 20 }], [16, { mp: 40 }], [24, { spell: 'threadstorm' }]]));
BOARDS.brannoc.push(P4('ep_brannoc', ['守誓者', 'Oathkeeper'], [[6, { skill: 'oathcharge' }], [8, { skill: 'guardian' }], [10, { pass: 'regen' }], [14, { skill: 'aegisall' }], [16, { def: 20 }], [22, { skill: 'oathbreaker' }]]));
Object.assign(PASSIVES, {
  lucky: ['魔物更容易留下東西', 'Monsters drop things more often'], mpregen: ['每回合回復少許魔力', 'Restores some MP every round'],
  counter: ['有時會反擊攻擊', 'Sometimes strikes back'], expup: ['得到的經驗值增加', 'More experience'], swift: ['戰鬥開始時速度上升', 'Starts battles with speed up'],
  nopoison: ['不會中毒', 'Cannot be poisoned'], pepstart: ['戰鬥開始時更接近燃心', 'Starts battles closer to fired up'],
});

Object.assign(ITEMS, {
  megaherb: I(['群體藥草', 'Herb Bundle'], { price: 160, use: 'healall', power: 110, d: ['回復全體同伴約 110 點體力。', 'Restores about 110 HP to every friend.'] }),
  hiether: I(['高級魔法之水', 'Fine Magic Water'], { price: 900, use: 'mp', power: 90, d: ['回復約 90 點魔力。', 'Restores about 90 MP.'] }),
  remedy: I(['萬能藥', 'Remedy'], { price: 80, use: 'cure', st: ['poison', 'numb', 'sleep', 'confuse', 'blind', 'hush', 'doom'], d: ['解除所有的異常狀態。', 'Cures every ailment.'] }),
  stardew: I(['星之露', 'Stardew'], { price: 320, use: 'revive', power: 0.5, d: ['讓倒下的同伴以一半體力復活。', 'Brings a fallen friend back with half HP.'] }),
  weaverstear: I(['織母之淚', "Weaver's Tear"], { price: 0, use: 'fullall', d: ['完全回復全體同伴的體力與魔力。非常稀有。', 'Fully restores the HP and MP of every friend. Very rare.'] }),
  frostflask: I(['冰晶瓶', 'Frost Flask'], { price: 90, use: 'dmg', power: 70, el: 'ice', battle: true, d: ['在敵陣中碎裂，冰凍全部敵人。', 'Shatters among the foes, freezing them all.'] }),
  boltflask: I(['雷鳴瓶', 'Thunder Flask'], { price: 160, use: 'dmg', power: 95, el: 'bolt', battle: true, d: ['雷電在敵陣中炸開。', 'Lightning bursts among the foes.'] }),
  holywater: I(['聖水', 'Holy Water'], { price: 240, use: 'dmg', power: 130, el: 'light', battle: true, d: ['灑向敵陣的聖水。對不死者特別有效。', 'Holy water flung at the foes. The undead hate it.'] }),
  smokebomb: I(['煙霧彈', 'Smoke Bomb'], { price: 60, use: 'smoke', battle: true, d: ['趁煙霧逃走。頭目戰無效。', 'Escape in the smoke. Not from bosses.'] }),
  powertonic: I(['力量藥水', 'Power Tonic'], { price: 120, use: 'buffitem', st: 'atkup', battle: true, d: ['讓一名同伴的攻擊力大幅提高。', "Greatly raises one friend's attack."] }),
  swifttonic: I(['迅捷藥水', 'Swift Tonic'], { price: 120, use: 'buffitem', st: 'agiup', battle: true, d: ['讓一名同伴的速度提高。', "Raises one friend's speed."] }),
  guardtonic: I(['守護藥水', 'Guard Tonic'], { price: 120, use: 'buffitem', st: 'defup', battle: true, d: ['讓一名同伴的防禦提高。', "Raises one friend's defence."] }),
  sleepdust: I(['睡眠粉', 'Sleep Dust'], { price: 70, use: 'statusitem', st: 'sleep', battle: true, d: ['讓全部敵人有機會睡著。', 'May put every foe to sleep.'] }),
  mpnut: I(['魔力堅果', 'Mana Nut'], { price: 0, use: 'seed', stat: 'mp', n2: 4, d: ['最大魔力永久提高 4 點。', 'Raises max MP by 4 for good.'] }),
  starshard: I(['星之碎片', 'Star Shard'], { price: 0, d: ['閃著微光的小碎片。幸運港的收藏家在收集。', 'A tiny glimmering shard. A collector in Luckhaven wants them.'] }),
  coinpurse: I(['金幣袋', 'Coin Purse'], { price: 1000, sell: true, d: ['裝滿金幣的袋子。可以賣個好價錢。', 'A purse full of coins. Sells well.'] }),
  // materials for the forge
  ironore: I(['鐵礦石', 'Iron Ore'], { price: 30, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  fang: I(['猛獸之牙', 'Beast Fang'], { price: 40, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  scale: I(['龍鱗', 'Dragon Scale'], { price: 120, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  silk: I(['蜘蛛絲', 'Spider Silk'], { price: 50, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  crystal: I(['魔晶石', 'Mana Crystal'], { price: 150, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  ember: I(['火焰石', 'Ember Stone'], { price: 80, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  frostshard: I(['冰晶', 'Frost Shard'], { price: 80, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  dragonbone: I(['龍骨', 'Dragon Bone'], { price: 400, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  starsand: I(['星砂', 'Star Sand'], { price: 600, mat: true, d: ['鍛造用的素材。從天上落下的沙。', 'For the forge. Sand that fell from the sky.'] }),
  darkshard: I(['暗之碎片', 'Shadow Shard'], { price: 300, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  feather2: I(['大鵬之羽', 'Roc Feather'], { price: 90, mat: true, d: ['鍛造用的素材。', 'For the forge.'] }),
  // fish
  minnow: I(['小魚', 'Minnow'], { price: 12, fish: true, d: ['小小的魚。', 'A little fish.'] }),
  perch: I(['河鱸', 'River Perch'], { price: 30, fish: true, use: 'heal', power: 25, d: ['烤來吃可以回復少許體力。', 'Grilled, it restores a little HP.'] }),
  trout: I(['虹鱒', 'Rainbow Trout'], { price: 50, fish: true, use: 'heal', power: 45, d: ['回復約 45 點體力。', 'Restores about 45 HP.'] }),
  seabream: I(['海鯛', 'Sea Bream'], { price: 80, fish: true, use: 'heal', power: 70, d: ['回復約 70 點體力。', 'Restores about 70 HP.'] }),
  eel: I(['鰻魚', 'Eel'], { price: 120, fish: true, use: 'mp', power: 12, d: ['精力十足。回復約 12 點魔力。', 'Full of vigour. Restores about 12 MP.'] }),
  icefish: I(['冰魚', 'Icefish'], { price: 140, fish: true, use: 'mp', power: 18, d: ['冰冷的魚。回復約 18 點魔力。', 'An icy fish. Restores about 18 MP.'] }),
  swordfish: I(['旗魚', 'Swordfish'], { price: 260, fish: true, d: ['釣到就能炫耀的大魚。', 'A big fish to boast about.'] }),
  goldkoi: I(['黃金鯉', 'Golden Koi'], { price: 800, fish: true, d: ['傳說中的魚。非常值錢。', 'A fish of legend. Worth a great deal.'] }),
  lanternfish: I(['燈籠魚', 'Lanternfish'], { price: 400, fish: true, d: ['在深海發光的魚。', 'A fish that glows in the deep.'] }),
  starfish2: I(['星辰魚', 'Starfin'], { price: 1200, fish: true, d: ['據說是從星星上掉下來的魚。', 'They say it fell from a star.'] }),
  oldboot: I(['舊靴子', 'Old Boot'], { price: 1, fish: true, d: ['……是靴子。', '...It is a boot.'] }),
  // key items of the expansion
  windbell: I(['風之鈴', 'Wind Bell'], { key: true, d: ['風鈴鎮的古鈴。它的歌聲能打開天織塔的門。', "Chimeholm's ancient bell. Its song opens the Skyloom's door."] }),
  morrowname: I(['莫洛的名字', "Morrow's Name"], { key: true, d: ['一條寫著「馬提亞斯」的舊絲線。', 'An old thread with a name on it: Mattias.'] }),
  diary: I(['書庫員的日記', "Archivist's Diary"], { key: true, d: ['十三年前，一位書庫員寫下的日記。', 'A diary written by an archivist thirteen years ago.'] }),
  locket: I(['伊索德的墜子', "Ysolde's Locket"], { key: true, d: ['佩兒的母親留下的墜子。', "The locket Pell's mother left behind."] }),
  choirbell: I(['合唱團的手鈴', 'Choir Handbell'], { key: true, d: ['十年前沉入湖底的手鈴。', 'A handbell that sank into the lake ten years ago.'] }),
  recipe: I(['師父的食譜', "Master's Recipe"], { key: true, d: ['燒焦了一半的食譜。最後一頁寫著一句話。', 'A half-burnt recipe book. One line is written on the last page.'] }),
  oathring: I(['兄弟的戒指', "Brothers' Ring"], { key: true, d: ['刻著兩個名字的戒指。', 'A ring engraved with two names.'] }),
  threadspool: I(['最初的絲線', 'The First Thread'], { key: true, d: ['瑟菈的記憶，捲成了一捲。', "Sera's memories, wound on a spool."] }),
  monsterbook: I(['魔物圖鑑', 'Monster Book'], { key: true, use: 'book', d: ['打倒過的魔物會自動記錄下來。', 'Records every monster you defeat.'] }),
  fishingrod: I(['釣竿', 'Fishing Rod'], { key: true, d: ['在水面有漣漪的地方可以釣魚。', 'Fish where the water ripples.'] }),
  letters: I(['燈塔守的信', "Keeper's Letters"], { key: true, d: ['海鷗港燈塔守寫給兒子的一疊信。', 'A bundle of letters from the Gullport lighthouse keeper to his son.'] }),
  wrenpin: I(['小雀的髮夾', "Wren's Hairpin"], { key: true, d: ['小雀小時候弄丟的髮夾。', 'The hairpin Wren lost when she was little.'] }),
  verse: I(['古歌的歌詞', 'Verses of the Old Song'], { key: true, d: ['各地吟遊詩人唱的古歌，一段一段抄下來的。', 'The old song, copied down verse by verse from bards everywhere.'] }),
  tmap1: I(['藏寶圖・一', 'Treasure Map I'], { key: true, use: 'tmap', d: ['「沙梅爾的東邊，三棵沙中樹圍著的地方。」', '"East of Sandmere, where three desert trees stand round."'] }),
  tmap2: I(['藏寶圖・二', 'Treasure Map II'], { key: true, use: 'tmap', d: ['「河光神殿的湖，西南岸的盡頭。」', '"The Riverlight lake, at the end of its south-west shore."'] }),
  tmap3: I(['藏寶圖・三', 'Treasure Map III'], { key: true, use: 'tmap', d: ['「雪幕村的南邊，冰凍的山腳下。」', '"South of Snowveil, at the foot of the frozen peaks."'] }),
  tmap4: I(['藏寶圖・四', 'Treasure Map IV'], { key: true, use: 'tmap', d: ['「燼島，火口西側的海灘。」', '"Smolder Isle, the beach west of the crater."'] }),
  tmap5: I(['藏寶圖・五', 'Treasure Map V'], { key: true, use: 'tmap', d: ['「風鈴鎮的北邊，風最強的山丘。」', '"North of Chimeholm, on the windiest hill."'] }),
  tmap6: I(['藏寶圖・六', 'Treasure Map VI'], { key: true, use: 'tmap', d: ['「苔沼村的東邊，叢林最深的地方。」', '"East of Mossmere, where the jungle is deepest."'] }),
});

Object.assign(EQUIP, {
  // swords
  cutlass: EQ(['海盜彎刀', 'Cutlass'], 'weapon', 'sword', 1500, { atk: 35 }),
  icebrand: EQ(['冰刃', 'Icebrand'], 'weapon', 'sword', 3400, { atk: 50, el: 'ice' }),
  stormblade: EQ(['雷霆劍', 'Stormblade'], 'weapon', 'sword', 6400, { atk: 68, el: 'bolt' }),
  starsteel: EQ(['星鋼劍', 'Starsteel Sword'], 'weapon', 'sword', 14000, { atk: 96 }),
  oathkeeper: EQ(['守誓之劍', 'Oathkeeper'], 'weapon', 'sword', 0, { atk: 104, el: 'light', only: 'brannoc' }),
  aurorablade: EQ(['極光之劍', 'Aurora Blade'], 'weapon', 'sword', 0, { atk: 132, el: 'light', only: 'rowan', crit: 0.06 }),
  gamblersedge: EQ(['賭徒之刃', "Gambler's Edge"], 'weapon', 'sword', 0, { atk: 74, crit: 0.15 }),
  // axes
  greataxe: EQ(['巨斧', 'Great Axe'], 'weapon', 'axe', 7200, { atk: 74 }),
  titanaxe: EQ(['泰坦之斧', 'Titan Axe'], 'weapon', 'axe', 0, { atk: 112, crit: 0.06 }),
  // knives and whips
  mythrilknife: EQ(['祕銀短刀', 'Mythril Knife'], 'weapon', 'knife', 3000, { atk: 46 }),
  ysoldefang: EQ(['伊索德之牙', "Ysolde's Fang"], 'weapon', 'knife', 0, { atk: 80, hits: 2, crit: 0.1, only: 'pell' }),
  moonfang: EQ(['月牙刀', 'Moonfang'], 'weapon', 'knife', 13000, { atk: 92, hits: 2 }),
  thornwhip: EQ(['荊棘鞭', 'Thorn Whip'], 'weapon', 'whip', 3200, { atk: 40, all: true }),
  dragonwhip: EQ(['龍鬚鞭', 'Dragon Whip'], 'weapon', 'whip', 12000, { atk: 66, all: true }),
  // staves and spears
  crystalstaff: EQ(['水晶杖', 'Crystal Staff'], 'weapon', 'staff', 5600, { atk: 28, heal: 34, mag: 8 }),
  tidestaff: EQ(['潮汐之杖', 'Tide Staff'], 'weapon', 'staff', 0, { atk: 40, heal: 48, mag: 14, only: 'mirela' }),
  dawnstaff: EQ(['曙光之杖', 'Staff of Dawn'], 'weapon', 'staff', 15000, { atk: 44, heal: 60, mag: 16 }),
  trident: EQ(['三叉戟', 'Trident'], 'weapon', 'spear', 5400, { atk: 56, el: 'water' }),
  skypiercer: EQ(['穿天槍', 'Skypiercer'], 'weapon', 'spear', 14000, { atk: 90, el: 'wind' }),
  // fists and claws
  steelfist: EQ(['鋼鐵拳套', 'Steel Gauntlets'], 'weapon', 'fist', 3400, { atk: 50 }),
  sunfist: EQ(['日輪拳', 'Sunfist'], 'weapon', 'fist', 0, { atk: 96, el: 'fire', only: 'odo' }),
  thunderclaw: EQ(['雷爪', 'Thunder Claws'], 'weapon', 'claw', 6200, { atk: 64, el: 'bolt' }),
  firebirdclaw: EQ(['火鳥爪', 'Firebird Talons'], 'weapon', 'claw', 14000, { atk: 100, el: 'fire' }),
  fangknuckle: EQ(['獸牙拳', 'Fang Knuckles'], 'weapon', 'fist', 0, { atk: 40, crit: 0.05 }),
  // wands
  thunderrod: EQ(['雷之杖', 'Thunder Rod'], 'weapon', 'wand', 6000, { atk: 18, mag: 38 }),
  weaverrod: EQ(['織者之杖', "Weaver's Rod"], 'weapon', 'wand', 0, { atk: 26, mag: 54, only: 'sera' }),
  astralwand: EQ(['星界杖', 'Astral Wand'], 'weapon', 'wand', 15000, { atk: 30, mag: 62 }),
  // armour
  mythrilmail: EQ(['祕銀鎧', 'Mythril Mail'], 'armor', 'heavy', 5200, { def: 54 }),
  crystalmail: EQ(['水晶鎧', 'Crystal Mail'], 'armor', 'heavy', 7800, { def: 62, resist: 'ice' }),
  starsteelmail: EQ(['星鋼鎧', 'Starsteel Mail'], 'armor', 'heavy', 16000, { def: 80 }),
  oathplate: EQ(['誓約重鎧', 'Oath Plate'], 'armor', 'heavy', 0, { def: 74, resist: 'all' }),
  mythrilvest: EQ(['祕銀背心', 'Mythril Vest'], 'armor', 'light', 2800, { def: 30 }),
  ninjagarb: EQ(['忍裝束', 'Ninja Garb'], 'armor', 'light', 6400, { def: 42, agi: 14 }),
  starweave: EQ(['星織衣', 'Starweave'], 'armor', 'light', 15000, { def: 58, agi: 20 }),
  lightrobe: EQ(['光之長袍', 'Light Robe'], 'armor', 'robe', 1500, { def: 22 }),
  silkveil: EQ(['蛛絲羽衣', 'Silk Veil'], 'armor', 'robe', 0, { def: 32, agi: 8, resist: 'all' }),
  mirrorrobe: EQ(['明鏡長袍', 'Mirror Robe'], 'armor', 'robe', 6600, { def: 40, resist: 'all' }),
  weaverrobe: EQ(['織者長袍', "Weaver's Robe"], 'armor', 'robe', 16000, { def: 58, mag: 10, resist: 'all' }),
  // shields
  dragonshield: EQ(['龍之盾', 'Dragon Shield'], 'shield', 'shield', 3000, { def: 22, resist: 'fire' }),
  crystalshield: EQ(['水晶盾', 'Crystal Shield'], 'shield', 'shield', 6000, { def: 30, resist: 'ice' }),
  starshield: EQ(['星之盾', 'Star Shield'], 'shield', 'shield', 14000, { def: 42, resist: 'all' }),
  // heads
  feathercap: EQ(['羽毛帽', 'Feather Cap'], 'head', 'head', 1200, { def: 6, agi: 6 }),
  mythrilhelm: EQ(['祕銀盔', 'Mythril Helm'], 'head', 'helm', 2600, { def: 20 }),
  sagecirclet: EQ(['賢者額環', "Sage's Circlet"], 'head', 'head', 5400, { def: 14, mag: 14 }),
  starcrown: EQ(['星之冠', 'Star Crown'], 'head', 'head', 13000, { def: 28, mag: 12 }),
  // accessories with effects
  regenring: EQ(['再生戒指', 'Regen Ring'], 'acc', 'acc', 0, { def: 4, pass: 'regen' }),
  counterring: EQ(['反擊戒指', 'Counter Ring'], 'acc', 'acc', 0, { str: 6, pass: 'counter' }),
  swiftfeather: EQ(['迅羽', 'Swift Feather'], 'acc', 'acc', 4000, { agi: 10, pass: 'swift' }),
  luckycharm: EQ(['幸運護符', 'Lucky Charm'], 'acc', 'acc', 0, { def: 4, pass: 'lucky' }),
  monocle: EQ(['學者的單片眼鏡', "Scholar's Monocle"], 'acc', 'acc', 0, { mag: 6, pass: 'expup' }),
  goldbangle: EQ(['黃金手環', 'Gold Bangle'], 'acc', 'acc', 0, { def: 6, pass: 'gold' }),
  sagebangle: EQ(['賢者手環', "Sage's Bangle"], 'acc', 'acc', 0, { mag: 10, heal: 10, pass: 'mpregen' }),
  meditbeads: EQ(['冥想念珠', 'Prayer Beads'], 'acc', 'acc', 0, { heal: 8, pass: 'mpcut' }),
  thiefsglove: EQ(['盜賊手套', "Thief's Glove"], 'acc', 'acc', 2400, { agi: 6, pass: 'steal' }),
  firecharm: EQ(['火鼠護符', 'Fire Charm'], 'acc', 'acc', 0, { def: 6, resist: 'fire' }),
  icecharm: EQ(['雪狐護符', 'Frost Charm'], 'acc', 'acc', 0, { def: 6, resist: 'ice' }),
  antidotering: EQ(['解毒戒指', 'Antidote Ring'], 'acc', 'acc', 900, { def: 3, pass: 'nopoison' }),
  heroband: EQ(['勇者頭帶', "Hero's Band"], 'acc', 'acc', 0, { str: 16, pass: 'pepstart' }),
  championbelt: EQ(['冠軍腰帶', "Champion's Belt"], 'acc', 'acc', 0, { str: 24, def: 16, pass: 'pep' }),
  wrensribbon: EQ(['小雀的緞帶', "Wren's Ribbon"], 'acc', 'acc', 0, { def: 14, heal: 14, immune: true, pass: 'regen' }),
  locketcharm: EQ(['母親的護身符', "Mother's Charm"], 'acc', 'acc', 0, { agi: 12, pass: 'steal' }),
  anglerhat: EQ(['釣魚人的帽子', "Angler's Hat"], 'head', 'head', 0, { def: 10, agi: 10 }),
  starbrooch: EQ(['星之胸針', 'Star Brooch'], 'acc', 'acc', 0, { def: 10, mag: 10, heal: 10, agi: 10 }),
});
for (const [k, v] of Object.entries(EQUIP)) ITEMS[k] = v;

// ---------- the expansion's monsters ----------
// drops: [[item, chance], ...] besides drop ; phases: [{ hp, msg, acts, twice, weak, resist, look, summon }]
Object.assign(MON, {
  // new kin in the old lands
  blujelly: M(['藍凝膠', 'Blue Jelly'], 'aslime_b', { hp: 12, atk: 9, def: 4, agi: 6, exp: 4, gold: 3, acts: [[1, 'attack']], weak: ['fire'] }),
  fieldrat: M(['野鼠', 'Field Rat'], 'arat_g', { hp: 20, atk: 16, def: 6, agi: 12, exp: 9, gold: 6, acts: [[3, 'attack'], [1, 'gnaw']], drop: ['herb', 0.08] }),
  gobaxe: M(['哥布林斧兵', 'Goblin Axeman'], 'agob_g', { hp: 30, atk: 20, def: 9, agi: 8, exp: 14, gold: 10, acts: [[3, 'attack'], [1, 'smash']], drops: [['ironore', 0.08]] }),
  bramblecub: M(['荊棘小熊', 'Bramble Cub'], 'cub', { hp: 34, atk: 20, def: 10, agi: 9, exp: 15, gold: 9, acts: [[1, 'attack']], drop: ['fur', 0.15] }),
  bloodtick: M(['吸血蜱', 'Bloodtick'], 'bloodtick', { hp: 26, atk: 18, def: 10, agi: 14, exp: 15, gold: 8, acts: [[2, 'attack'], [1, 'drain']] }),
  rivercobra: M(['河蛇', 'River Cobra'], 'cobra_y', { hp: 50, atk: 30, def: 14, agi: 14, exp: 22, gold: 16, acts: [[2, 'attack'], [1, 'poisonbite']], drop: ['antidote', 0.1] }),
  rustwolf: M(['赤狼', 'Rust Wolf'], 'awolf_o', { hp: 56, atk: 33, def: 13, agi: 18, exp: 24, gold: 14, acts: [[3, 'attack'], [1, 'howl']], drops: [['fang', 0.12]] }),
  miredrop: M(['泥滴', 'Mire Drop'], 'miredrop', { hp: 36, mp: 20, atk: 24, def: 18, agi: 12, exp: 20, gold: 14, acts: [[2, 'attack'], [1, 'splash']], weak: ['bolt'] }),
  redlizard: M(['赤蜥', 'Red Lizard'], 'lizard_r', { hp: 90, atk: 46, def: 24, agi: 10, exp: 42, gold: 30, acts: [[3, 'attack'], [1, 'firebreath']], weak: ['ice'] }),
  cinderling: M(['餘燼小鬼', 'Cinderling'], 'cinderling', { hp: 70, mp: 30, atk: 42, def: 22, agi: 18, exp: 40, gold: 30, acts: [[1, 'attack'], [2, 'flameshot']], resist: ['fire'], weak: ['ice', 'water'], drops: [['ember', 0.1]] }),
  emberslime: M(['熔岩史萊姆', 'Ember Slime'], 'emberslime', { hp: 80, atk: 44, def: 30, agi: 8, exp: 44, gold: 30, acts: [[2, 'attack'], [1, 'ember']], resist: ['fire'], weak: ['ice', 'water'] }),
  sandscorp: M(['赤沙蠍', 'Sand Scorpion'], 'scorp_r', { hp: 110, atk: 60, def: 36, agi: 14, exp: 68, gold: 40, acts: [[2, 'attack'], [1, 'poisonbite']] }),
  jackal: M(['沙漠胡狼', 'Dune Jackal'], 'jackal', { hp: 100, atk: 58, def: 26, agi: 24, exp: 64, gold: 36, acts: [[3, 'attack'], [1, 'howl']], drops: [['fang', 0.15]] }),
  sandgrub: M(['沙蛆', 'Sandgrub'], 'sandgrub', { hp: 140, atk: 56, def: 40, agi: 6, exp: 70, gold: 40, acts: [[2, 'attack'], [1, 'devour']] }),
  brigand: M(['沙漠盜賊', 'Desert Brigand'], 'brigand', { hp: 120, atk: 62, def: 30, agi: 18, exp: 72, gold: 80, acts: [[2, 'attack'], [1, 'double']], drop: ['coinpurse', 0.03] }),
  ruinskel: M(['遺跡骷髏', 'Ruin Skeleton'], 'askel_r', { hp: 120, atk: 60, def: 34, agi: 14, exp: 70, gold: 44, acts: [[2, 'attack'], [1, 'double']], weak: ['light', 'fire'] }),
  snowhare: M(['雪兔', 'Snow Hare'], 'rabbit_w', { hp: 130, atk: 70, def: 30, agi: 30, exp: 100, gold: 60, acts: [[1, 'attack']], drop: ['fur', 0.3] }),
  bloodeye: M(['血眼', 'Blood Eye'], 'aeye_r', { hp: 220, mp: 80, atk: 90, def: 40, agi: 24, exp: 220, gold: 100, acts: [[1, 'attack'], [1, 'stare'], [1, 'darkfire']], weak: ['light'] }),
  swarm: M(['蝗群', 'Locust Swarm'], 'swarm', { hp: 300, atk: 112, def: 40, agi: 40, exp: 280, gold: 120, acts: [[2, 'attack'], [1, 'swarmbite']], weak: ['fire'] }),
  peeper: M(['窺魂屍', 'Grave Peeper'], 'peeper', { hp: 500, atk: 136, def: 60, agi: 20, exp: 400, gold: 180, acts: [[2, 'attack'], [1, 'stare'], [1, 'drain']], weak: ['light', 'fire'] }),
  // Gullwing Grotto (lv 12-14)
  seadrop: M(['海露', 'Sea Drop'], 'dewdrop', { look: { hue: 60, sat: 1, lum: 1 }, hp: 40, mp: 20, atk: 30, def: 14, agi: 10, exp: 22, gold: 14, acts: [[2, 'attack'], [1, 'splash']], weak: ['bolt'] }),
  ironshell: M(['鐵殼蟹', 'Ironshell'], 'shellcrawler', { hp: 70, atk: 36, def: 30, agi: 6, exp: 30, gold: 20, acts: [[3, 'attack'], [1, 'harden']], weak: ['bolt'] }),
  corsair: M(['海盜哥布林', 'Goblin Corsair'], 'agob_b', { hp: 66, atk: 40, def: 20, agi: 12, exp: 32, gold: 30, acts: [[2, 'attack'], [1, 'double']], drop: ['herb', 0.12] }),
  cavebat: M(['洞窟蝙蝠', 'Cave Bat'], 'bat_r', { hp: 44, atk: 34, def: 14, agi: 20, exp: 26, gold: 14, acts: [[2, 'attack'], [1, 'drain']] }),
  tidecobra: M(['潮蛇', 'Tide Cobra'], 'cobra_b', { hp: 60, atk: 38, def: 18, agi: 14, exp: 30, gold: 18, acts: [[2, 'attack'], [1, 'poisonbite']] }),
  deckhand: M(['海盜嘍囉', 'Pirate Deckhand'], 'pirate_o', { hp: 80, atk: 42, def: 22, agi: 13, exp: 36, gold: 40, acts: [[2, 'attack'], [1, 'double']], drop: ['strongherb', 0.06] }),
  rena: M(['海盜船長蕾娜', 'Captain Rena'], 'pirate_r', { hp: 2400, mp: 99, atk: 54, def: 24, agi: 18, exp: 700, gold: 500, acts: [[2, 'attack'], [1, 'double'], [1, 'cannon'], [1, 'rumdrink']], boss: true, twice: 0.45,
    phases: [{ hp: 0.4, msg: ['蕾娜：「可惡……全員，砲擊準備！」', 'Rena: "Blast it... all hands, ready the cannon!"'], acts: [[1, 'attack'], [2, 'cannon'], [1, 'double']], twice: 0.7 }] }),
  // Luckhaven isle (lv 15-17)
  hopper: M(['跳跳兔', 'Hopper'], 'rabbit_p', { hp: 60, atk: 44, def: 20, agi: 22, exp: 38, gold: 30, acts: [[1, 'attack']], drop: ['fur', 0.2] }),
  cockatrice: M(['雞蛇', 'Cockatrice'], 'cocka1', { hp: 90, atk: 48, def: 22, agi: 14, exp: 44, gold: 32, acts: [[2, 'attack'], [1, 'stare']], drops: [['feather2', 0.06]] }),
  grasslizard: M(['草蜥', 'Grass Lizard'], 'lizard_g', { hp: 96, atk: 50, def: 26, agi: 10, exp: 46, gold: 30, acts: [[3, 'attack'], [1, 'tonguelash']], drops: [['scale', 0.03]] }),
  hornet: M(['大黃蜂', 'Hornet'], 'hornet', { hp: 70, atk: 46, def: 18, agi: 24, exp: 40, gold: 26, acts: [[2, 'attack'], [1, 'poisonbite']], weak: ['fire'] }),
  sporecap: M(['孢子菇', 'Sporecap'], 'sporecap', { hp: 84, mp: 30, atk: 44, def: 22, agi: 8, exp: 42, gold: 28, acts: [[2, 'attack'], [1, 'spore']], weak: ['fire'] }),
  // Aeolia, the windswept east (lv 24-26)
  pixie: M(['風之妖精', 'Pixie'], 'pixie', { hp: 160, mp: 60, atk: 70, def: 30, agi: 32, exp: 140, gold: 80, acts: [[1, 'attack'], [1, 'galecut'], [1, 'doze']], weak: ['earth'], resist: ['wind'] }),
  galecocka: M(['暴風雞蛇', 'Gale Cockatrice'], 'cocka3', { hp: 210, atk: 84, def: 36, agi: 22, exp: 160, gold: 84, acts: [[2, 'attack'], [1, 'stare']], drops: [['feather2', 0.12]] }),
  azurewolf: M(['蒼狼', 'Azure Wolf'], 'awolf_b', { hp: 200, atk: 86, def: 34, agi: 30, exp: 150, gold: 70, acts: [[3, 'attack'], [1, 'howl']], drops: [['fang', 0.2]] }),
  vulture: M(['禿鷲', 'Carrion Vulture'], 'vulture', { hp: 190, atk: 82, def: 30, agi: 28, exp: 150, gold: 74, acts: [[2, 'attack'], [1, 'dive']], weak: ['bolt'], drops: [['feather2', 0.15]] }),
  thunderape: M(['雷猿', 'Thunder Ape'], 'gorilla', { hp: 280, mp: 40, atk: 94, def: 40, agi: 18, exp: 180, gold: 90, acts: [[2, 'attack'], [1, 'smash'], [1, 'jolt']], weak: ['earth'], resist: ['bolt'] }),
  tuskmaul: M(['長牙獸', 'Tuskmaul'], 'tuskmaul', { hp: 340, atk: 98, def: 52, agi: 10, exp: 200, gold: 100, acts: [[2, 'attack'], [1, 'charge']], drops: [['fang', 0.2]] }),
  // Galespire (lv 25-27)
  galespirit: M(['風之幽靈', 'Gale Spirit'], 'windghost', { hp: 200, mp: 99, atk: 76, def: 34, agi: 34, exp: 170, gold: 90, acts: [[1, 'attack'], [1, 'tempest'], [1, 'drain']], weak: ['bolt', 'light'], resist: ['wind'] }),
  gargoyle: M(['石像鬼', 'Gargoyle'], 'gargoyle', { hp: 260, atk: 92, def: 60, agi: 20, exp: 190, gold: 96, acts: [[2, 'attack'], [1, 'harden'], [1, 'dive']], weak: ['earth'] }),
  stormbat: M(['暴風蝠', 'Storm Bat'], 'bat_o', { hp: 170, atk: 80, def: 30, agi: 36, exp: 160, gold: 80, acts: [[2, 'attack'], [1, 'drain']] }),
  azureidol: M(['蒼鳥像', 'Azure Idol'], 'idol', { hp: 240, mp: 99, atk: 70, def: 70, agi: 12, exp: 200, gold: 110, acts: [[1, 'attack'], [1, 'thunderclap'], [1, 'healally']], weak: ['earth'], resist: ['bolt'], drops: [['crystal', 0.05]] }),
  needlewasp: M(['針蜂', 'Needle Wasp'], 'wasp', { hp: 160, atk: 84, def: 30, agi: 38, exp: 160, gold: 80, acts: [[2, 'attack'], [1, 'poisonbite'], [1, 'double']], weak: ['fire'] }),
  zephyra: M(['風暴巨鵬　賽菲拉', 'Zephyra, the Storm Roc'], 'harpyqueen', { hp: 10000, mp: 999, atk: 114, def: 42, agi: 32, exp: 3200, gold: 1600, acts: [[2, 'attack'], [2, 'galeforce'], [1, 'featherstorm'], [1, 'dive']], boss: true, twice: 0.8, weak: ['bolt'], resist: ['wind'],
    phases: [{ hp: 0.5, msg: ['賽菲拉張開巨大的翅膀，捲起了風暴！', 'Zephyra spreads her vast wings and calls up a storm!'], acts: [[1, 'attack'], [2, 'galeforce'], [1, 'featherstorm'], [1, 'gather']], charge: 'cyclone', twice: 1, summon: ['galespirit'] }] }),
  // Verdigris, the southern jungle (lv 27-30)
  panther: M(['影豹', 'Shadow Panther'], 'panther', { hp: 280, atk: 104, def: 40, agi: 36, exp: 220, gold: 100, acts: [[2, 'attack'], [1, 'double']], drops: [['fang', 0.2]] }),
  snapvine: M(['咬人藤', 'Snapvine'], 'snapvine', { hp: 240, atk: 96, def: 44, agi: 14, exp: 200, gold: 90, acts: [[2, 'attack'], [1, 'squeeze'], [1, 'poisonbite']], weak: ['fire'] }),
  thornbloom: M(['荊棘花', 'Thornbloom'], 'thornbloom', { hp: 230, mp: 80, atk: 90, def: 40, agi: 16, exp: 210, gold: 96, acts: [[1, 'attack'], [1, 'pollen'], [1, 'doze']], weak: ['fire'] }),
  junglecobra: M(['叢林眼鏡蛇', 'Jungle Cobra'], 'cobra_g', { hp: 250, atk: 100, def: 42, agi: 26, exp: 210, gold: 92, acts: [[2, 'attack'], [1, 'poisonbite']] }),
  leafling: M(['葉精', 'Leafling'], 'leafling', { hp: 200, mp: 80, atk: 86, def: 40, agi: 24, exp: 200, gold: 100, acts: [[1, 'attack'], [1, 'healally'], [1, 'galecut']], weak: ['fire'] }),
  flameant: M(['火蟻', 'Flame Ant'], 'fireant', { hp: 380, atk: 110, def: 66, agi: 14, exp: 260, gold: 120, acts: [[2, 'attack'], [1, 'firebreath']], weak: ['ice', 'water'], drops: [['ember', 0.12]] }),
  bloattoad: M(['膨脹蟾蜍', 'Bloat Toad'], 'bloattoad', { hp: 420, atk: 108, def: 50, agi: 8, exp: 270, gold: 120, acts: [[2, 'attack'], [1, 'devour'], [1, 'tonguelash']] }),
  // Gloomfen (lv 29-31)
  swamptroll: M(['沼澤巨魔', 'Swamp Troll'], 'swamptroll', { hp: 480, atk: 120, def: 56, agi: 10, exp: 300, gold: 140, acts: [[2, 'attack'], [1, 'smash'], [1, 'healself']], weak: ['fire'] }),
  bogsludge: M(['泥沼凝膠', 'Bog Sludge'], 'bogsludge', { hp: 300, atk: 100, def: 70, agi: 8, exp: 260, gold: 120, acts: [[2, 'attack'], [1, 'acid']], weak: ['fire', 'bolt'] }),
  bloodsucker: M(['吸血蚊', 'Bloodsucker'], 'mosquito', { hp: 200, atk: 96, def: 36, agi: 40, exp: 230, gold: 100, acts: [[1, 'attack'], [2, 'drain']], weak: ['fire'] }),
  mossnail: M(['苔蝸牛', 'Mossnail'], 'mossnail', { hp: 260, atk: 94, def: 90, agi: 6, exp: 280, gold: 160, acts: [[2, 'attack'], [1, 'harden']], drops: [['crystal', 0.1]] }),
  hauntwood: M(['鬼樹', 'Hauntwood'], 'hauntwood', { hp: 520, mp: 99, atk: 118, def: 60, agi: 10, exp: 320, gold: 150, acts: [[2, 'attack'], [1, 'squeeze'], [1, 'drain'], [1, 'doze']], weak: ['fire'] }),
  mirehydra: M(['沼之九頭蛇', 'Mire Hydra'], 'jadeserpent', { hp: 11000, mp: 999, atk: 138, def: 58, agi: 20, exp: 3400, gold: 2000, acts: [[2, 'attack'], [1, 'poisonbreath'], [1, 'squeeze'], [1, 'healself']], boss: true, twice: 0.9, weak: ['fire'], resist: ['water'],
    phases: [{ hp: 0.5, msg: ['九頭蛇的傷口長出了新的頭！', "New heads sprout from the hydra's wounds!"], acts: [[2, 'attack'], [2, 'poisonbreath'], [1, 'tailsweep']], twice: 1 }] }),
  // the Sunken Archive (lv 33-35)
  inkhorror: M(['墨之恐怖', 'Ink Horror'], 'inkhorror', { hp: 520, mp: 120, atk: 128, def: 60, agi: 22, exp: 380, gold: 170, acts: [[2, 'attack'], [1, 'inkcloud'], [1, 'squeeze'], [1, 'darkfire']], weak: ['light'] }),
  mindjelly: M(['腦水母', 'Mind Jelly'], 'brainjelly', { hp: 380, mp: 150, atk: 110, def: 54, agi: 24, exp: 360, gold: 170, acts: [[1, 'attack'], [1, 'mindblast'], [1, 'hush']], weak: ['bolt'] }),
  seekereye: M(['窺伺之眼', 'Seeker Eye'], 'seekereye', { hp: 400, mp: 150, atk: 116, def: 56, agi: 30, exp: 370, gold: 170, acts: [[1, 'attack'], [1, 'stare'], [1, 'darkfire']], weak: ['light'] }),
  archmummy: M(['書庫木乃伊', 'Archive Mummy'], 'mummy', { hp: 560, atk: 132, def: 64, agi: 14, exp: 390, gold: 160, acts: [[2, 'attack'], [1, 'curse']], weak: ['fire', 'light'] }),
  bubblespirit: M(['泡沫之靈', 'Bubble Spirit'], 'bubblespirit', { hp: 420, mp: 150, atk: 112, def: 58, agi: 28, exp: 360, gold: 160, acts: [[1, 'attack'], [1, 'torrent'], [1, 'splash']], weak: ['bolt'], resist: ['water'] }),
  greatoctopus: M(['大章魚', 'Great Octopus'], 'octopus', { hp: 700, atk: 140, def: 66, agi: 16, exp: 460, gold: 200, acts: [[2, 'attack'], [1, 'squeeze'], [1, 'inkcloud'], [1, 'tidal']], weak: ['bolt'] }),
  inkwyrm: M(['墨之海龍', 'The Inkwyrm'], 'seaserpent', { hp: 16500, mp: 999, atk: 158, def: 66, agi: 24, exp: 4200, gold: 3000, acts: [[2, 'attack'], [2, 'tidal'], [1, 'inkcloud'], [1, 'squeeze'], [1, 'sunderall']], boss: true, twice: 1, weak: ['bolt', 'light'], resist: ['water'],
    phases: [{ hp: 0.45, msg: ['海龍吞下了書庫的墨，身體變得漆黑！', 'The wyrm swallows the ink of the Archive and turns pitch black!'], look: { hue: 0, sat: 0.2, lum: 0.5 }, acts: [[2, 'attack'], [1, 'tidal'], [1, 'gather'], [1, 'mindblast']], charge: 'inkflood', weak: ['light'], resist: ['water', 'bolt'] }] }),
  // the dark east and south, after the fall (lv 33-35)
  nighthound: M(['夜犬', 'Night Hound'], 'nighthound', { hp: 500, atk: 136, def: 60, agi: 36, exp: 380, gold: 160, acts: [[3, 'attack'], [1, 'howl']], weak: ['light'], drops: [['fang', 0.2]] }),
  gloomtroll: M(['幽暗巨魔', 'Gloom Troll'], 'gloomtroll', { hp: 640, atk: 150, def: 66, agi: 14, exp: 420, gold: 180, acts: [[2, 'attack'], [1, 'smash']], weak: ['light'] }),
  chainghoul: M(['鎖鏈食屍鬼', 'Chain Ghoul'], 'chainghoul', { hp: 540, atk: 140, def: 64, agi: 16, exp: 400, gold: 170, acts: [[2, 'attack'], [1, 'chainlash']], weak: ['light', 'fire'], drops: [['darkshard', 0.05]] }),
  pitchimp: M(['叉魔', 'Pitchfork Imp'], 'pitchimp', { hp: 420, mp: 120, atk: 128, def: 56, agi: 32, exp: 380, gold: 170, acts: [[1, 'attack'], [1, 'darkfire'], [1, 'blaze']], weak: ['light'] }),
  zombie: M(['屍人', 'Zombie'], 'zombie', { hp: 600, atk: 134, def: 58, agi: 10, exp: 380, gold: 150, acts: [[2, 'attack'], [1, 'poisonbite']], weak: ['fire', 'light'] }),
  weeper: M(['哭泣者', 'Weeper'], 'weeper', { hp: 460, mp: 120, atk: 126, def: 56, agi: 24, exp: 390, gold: 160, acts: [[1, 'attack'], [1, 'lament'], [1, 'drain']], weak: ['light'] }),
  // the Glimmer Mines (Pell's story, lv 20-23)
  rubble: M(['碎石怪', 'Rubble'], 'rubble', { hp: 200, atk: 76, def: 70, agi: 8, exp: 120, gold: 70, acts: [[2, 'attack'], [1, 'harden']], weak: ['wind', 'water'], drops: [['ironore', 0.25]] }),
  goldscorp: M(['黃金蠍', 'Gold Scorpion'], 'scorp_y', { hp: 180, atk: 80, def: 44, agi: 18, exp: 120, gold: 90, acts: [[2, 'attack'], [1, 'poisonbite']], drop: ['gem', 0.06] }),
  minerat: M(['礦坑鼠', 'Mine Rat'], 'arat_b', { hp: 140, atk: 72, def: 30, agi: 24, exp: 100, gold: 60, acts: [[2, 'attack'], [1, 'gnaw']] }),
  pitspider: M(['暗穴蜘蛛', 'Pit Spider'], 'spider_k', { hp: 170, atk: 78, def: 36, agi: 22, exp: 110, gold: 70, acts: [[2, 'attack'], [1, 'web'], [1, 'poisonbite']], drops: [['silk', 0.25]] }),
  automaton: M(['熔岩機兵', 'Magma Automaton'], 'automaton', { hp: 260, atk: 88, def: 64, agi: 12, exp: 150, gold: 100, acts: [[2, 'attack'], [1, 'smash'], [1, 'firebreath']], weak: ['water', 'ice'], drops: [['ironore', 0.2]] }),
  millipede: M(['巨蜈蚣', 'Giant Millipede'], 'millipede', { hp: 300, atk: 90, def: 54, agi: 14, exp: 160, gold: 100, acts: [[2, 'attack'], [1, 'poisonbite'], [1, 'double']] }),
  colossus: M(['閃晶巨像', 'Glimmer Colossus'], 'golem', { look: { hue: 150, sat: 1.4, lum: 1.25 }, hp: 7000, mp: 999, atk: 92, def: 62, agi: 10, exp: 2600, gold: 2000, acts: [[2, 'attack'], [1, 'smash'], [1, 'prism'], [1, 'harden']], boss: true, twice: 0.6, weak: ['bolt', 'earth'],
    phases: [{ hp: 0.5, msg: ['巨像身上的寶石發出刺眼的光！', "The gems on the colossus blaze with blinding light!"], acts: [[1, 'attack'], [2, 'prism'], [1, 'gather']], charge: 'gemburst', twice: 0.8 }] }),
  // the Choirwell (Mirela's story, lv 24-27)
  choirghost: M(['合唱的亡靈', 'Choir Ghost'], 'ghost_w', { hp: 200, mp: 99, atk: 80, def: 34, agi: 26, exp: 160, gold: 80, acts: [[1, 'attack'], [1, 'drain'], [1, 'lament']], weak: ['light'] }),
  drownedghost: M(['水底亡靈', 'Drowned Ghost'], 'ghost_g', { hp: 220, mp: 99, atk: 84, def: 36, agi: 24, exp: 170, gold: 84, acts: [[1, 'attack'], [1, 'icewind'], [1, 'drain']], weak: ['light'] }),
  armorshrimp: M(['盔甲蝦', 'Armour Shrimp'], 'helmshrimp', { hp: 240, atk: 90, def: 60, agi: 16, exp: 160, gold: 90, acts: [[2, 'attack'], [1, 'double']], weak: ['bolt'] }),
  tidenaga: M(['潮蛇人', 'Tide Naga'], 'naga', { look: { hue: 170, sat: 1, lum: 1 }, hp: 260, mp: 80, atk: 92, def: 44, agi: 20, exp: 180, gold: 96, acts: [[2, 'attack'], [1, 'torrent']], weak: ['bolt'], resist: ['water'] }),
  dewling: M(['凝露', 'Dewling'], 'dewdrop', { look: { hue: 120, sat: 1, lum: 1.1 }, hp: 140, mp: 60, atk: 70, def: 40, agi: 30, exp: 130, gold: 70, acts: [[1, 'attack'], [1, 'splash']], weak: ['bolt'] }),
  cantor: M(['水底的領唱者', 'The Drowned Cantor'], 'tidesprite', { look: { hue: 40, sat: 0.7, lum: 0.75 }, hp: 9800, mp: 999, atk: 114, def: 46, agi: 24, exp: 3000, gold: 1800, acts: [[2, 'attack'], [1, 'lament'], [1, 'tidal'], [1, 'drain'], [1, 'healself']], boss: true, twice: 0.8, weak: ['light', 'bolt'], resist: ['water', 'ice'],
    phases: [{ hp: 0.5, msg: ['領唱者唱起了悲傷的歌，沉沒的合唱團回應了她！', 'The Cantor sings a sorrowful song, and the drowned choir answers!'], summon: ['choirghost', 'drownedghost'], acts: [[1, 'attack'], [1, 'lament'], [2, 'tidal'], [1, 'drain']] }] }),
  // Cindershelf Monastery (Odo's story, lv 24-27)
  snowcub: M(['雪熊仔', 'Snow Cub'], 'cub', { look: { hue: 0, sat: 0.1, lum: 1.6 }, hp: 200, atk: 86, def: 40, agi: 18, exp: 150, gold: 70, acts: [[2, 'attack'], [1, 'double']], weak: ['fire'], drop: ['fur', 0.3] }),
  frostwisp: M(['霜火', 'Frost Wisps'], 'frostwisp', { hp: 180, mp: 99, atk: 74, def: 40, agi: 30, exp: 160, gold: 80, acts: [[1, 'attack'], [1, 'icewind']], weak: ['fire'], resist: ['ice'], drops: [['frostshard', 0.15]] }),
  greywolf: M(['灰狼', 'Grey Wolf'], 'awolf_g', { hp: 210, atk: 88, def: 36, agi: 32, exp: 160, gold: 70, acts: [[3, 'attack'], [1, 'howl']], drops: [['fang', 0.2]] }),
  revenant: M(['鐵甲亡魂', 'Iron Revenant'], 'revenant', { hp: 300, atk: 96, def: 64, agi: 14, exp: 190, gold: 100, acts: [[2, 'attack'], [1, 'smash']], weak: ['light'], drops: [['ironore', 0.2]] }),
  frostskel: M(['雪原骷髏', 'Frost Skeleton'], 'askel_w', { hp: 240, atk: 92, def: 46, agi: 18, exp: 170, gold: 90, acts: [[2, 'attack'], [1, 'double']], weak: ['light', 'fire'] }),
  snowmaul: M(['雪山老魔　白鬃', 'Whitemane, Elder Snowmaul'], 'yeti', { hp: 10500, mp: 999, atk: 128, def: 48, agi: 16, exp: 3000, gold: 1800, acts: [[3, 'attack'], [1, 'smash'], [1, 'icebreath'], [1, 'roar']], boss: true, twice: 0.8, weak: ['fire'], resist: ['ice'],
    phases: [{ hp: 0.5, msg: ['白鬃捶打胸口，山上傳來了雪崩的轟鳴！', 'Whitemane beats its chest, and an avalanche rumbles down the mountain!'], acts: [[2, 'attack'], [1, 'icebreath'], [1, 'gather']], charge: 'avalanche', twice: 1 }] }),
  // Ashford Keep (Brannoc's story, lv 31-33)
  turncoat: M(['叛變的士兵', 'Turncoat Soldier'], 'soldier_s', { hp: 460, atk: 130, def: 64, agi: 22, exp: 340, gold: 160, acts: [[3, 'attack'], [1, 'guard']] }),
  mercenary: M(['黃金傭兵', 'Gilded Mercenary'], 'soldier_g', { hp: 500, atk: 136, def: 68, agi: 20, exp: 360, gold: 240, acts: [[2, 'attack'], [1, 'double']], drop: ['coinpurse', 0.06] }),
  blacklancer: M(['黑槍騎士', 'Black Lancer'], 'captain_g', { look: { hue: 180, sat: 0.4, lum: 0.7 }, hp: 600, atk: 142, def: 72, agi: 22, exp: 400, gold: 200, acts: [[2, 'attack'], [1, 'lancecharge']] }),
  shadowninja: M(['影忍', 'Shadow Ninja'], 'ninja_k', { hp: 420, atk: 138, def: 56, agi: 44, exp: 380, gold: 180, acts: [[2, 'attack'], [1, 'double'], [1, 'inkcloud']] }),
  wartiger: M(['戰虎', 'War Tiger'], 'tiger_o', { hp: 560, atk: 144, def: 60, agi: 34, exp: 400, gold: 170, acts: [[2, 'attack'], [1, 'double'], [1, 'roar']], drops: [['fang', 0.3]] }),
  kestrel: M(['黑槍　凱斯卓', 'Kestrel, the Black Lance'], 'captain_k', { hp: 14000, mp: 999, atk: 160, def: 70, agi: 26, exp: 3600, gold: 2400, acts: [[3, 'attack'], [1, 'lancecharge'], [1, 'cleave'], [1, 'guard'], [1, 'darkfire']], boss: true, twice: 0.9, weak: ['light'],
    phases: [{ hp: 0.5, msg: ['凱斯卓：「哥哥……我不會再輸給你了！」', 'Kestrel: "Brother... I will not lose to you again!"'], acts: [[2, 'attack'], [2, 'lancecharge'], [1, 'cleave'], [1, 'darkfire']], twice: 1, summon: ['blacklancer'] }] }),
  // the Thread Garden (Sera's story, lv 32-34)
  threadcreep: M(['織網怪', 'Threadcreep'], 'threadcreep', { hp: 460, atk: 128, def: 58, agi: 30, exp: 360, gold: 160, acts: [[2, 'attack'], [1, 'web'], [1, 'bind']], weak: ['fire'], drops: [['silk', 0.3]] }),
  dreamfiend: M(['夢魔', 'Dream Fiend'], 'succubus', { hp: 480, mp: 150, atk: 124, def: 56, agi: 32, exp: 380, gold: 180, acts: [[1, 'attack'], [1, 'doze'], [1, 'drain'], [1, 'charm']], weak: ['light'] }),
  envywisp: M(['妒火', 'Envy Wisps'], 'envywisp', { hp: 420, mp: 150, atk: 120, def: 54, agi: 34, exp: 370, gold: 170, acts: [[1, 'attack'], [2, 'blaze']], weak: ['ice', 'water'], resist: ['fire'] }),
  huskpod: M(['空殼莢', 'Husk Pod'], 'huskpod', { hp: 520, atk: 130, def: 70, agi: 12, exp: 380, gold: 160, acts: [[2, 'attack'], [1, 'spore']], weak: ['fire'] }),
  lostseraph: M(['失憶的天使', 'Forgotten Seraph'], 'seraph', { hp: 600, mp: 200, atk: 130, def: 64, agi: 30, exp: 420, gold: 200, acts: [[1, 'attack'], [1, 'dawnbolt'], [1, 'healally']], resist: ['light'], drops: [['crystal', 0.08]] }),
  forgetting: M(['遺忘', 'The Forgetting'], 'smokewraith', { hp: 14500, mp: 999, atk: 150, def: 64, agi: 30, exp: 3600, gold: 2400, acts: [[2, 'attack'], [1, 'mindwipe'], [1, 'darkfire'], [1, 'deepfrost'], [1, 'drain']], boss: true, twice: 1, weak: ['light'],
    phases: [{ hp: 0.6, msg: ['遺忘把自己包在鏡子般的霧裡！', 'The Forgetting wraps itself in a mirror-like mist!'], acts: [[1, 'attack'], [1, 'reflect'], [1, 'darkfire'], [1, 'mindwipe']] }, { hp: 0.25, msg: ['遺忘：「……全部……忘掉吧……」', 'The Forgetting: "...forget... all of it..."'], acts: [[2, 'attack'], [1, 'mindwipe'], [1, 'deepfrost'], [1, 'darkfire']], twice: 1 }] }),
  // sea monsters of the eastern sea
  seawyrm: M(['海龍', 'Sea Wyrm'], 'jadeserpent', { look: { hue: 80, sat: 1, lum: 1 }, hp: 320, atk: 96, def: 46, agi: 22, exp: 220, gold: 110, acts: [[2, 'attack'], [1, 'tidal']], weak: ['bolt'] }),
  // the Crown Arena's champion
  varro: M(['不敗的瓦羅', 'Varro the Unbroken'], 'orcchief', { hp: 22000, atk: 180, def: 76, agi: 30, exp: 5000, gold: 5000, acts: [[3, 'attack'], [1, 'double'], [1, 'roar'], [1, 'lancecharge']], boss: true, twice: 1,
    phases: [{ hp: 0.5, msg: ['瓦羅：「好！好久沒有這麼痛快了！」', 'Varro: "Yes! It has been years since a fight like this!"'], acts: [[2, 'attack'], [1, 'gather'], [1, 'double']], charge: 'champion', twice: 1 }] }),
  arenatiger: M(['瓦羅的白虎', "Varro's White Tiger"], 'tiger_w', { hp: 6000, atk: 150, def: 60, agi: 40, exp: 1200, gold: 0, acts: [[2, 'attack'], [1, 'double'], [1, 'roar']], boss: true }),
  // the Starwell, after the end (lv 40-50)
  cometgazer: M(['彗眼', 'Comet Gazer'], 'gazer', { hp: 900, mp: 200, atk: 170, def: 80, agi: 40, exp: 800, gold: 300, acts: [[1, 'attack'], [1, 'starbeam'], [1, 'stare']], resist: ['light'], drops: [['starsand', 0.08]] }),
  starwisp: M(['星火', 'Starfire Wisps'], 'flamewisp', { hp: 820, mp: 200, atk: 160, def: 76, agi: 44, exp: 760, gold: 280, acts: [[1, 'attack'], [1, 'firestorm'], [1, 'blaze']], weak: ['ice', 'water'], resist: ['fire'] }),
  drakeman: M(['龍人', 'Drakeman'], 'drakeman', { hp: 1200, atk: 190, def: 90, agi: 30, exp: 900, gold: 320, acts: [[2, 'attack'], [1, 'cleave'], [1, 'firebreath']], drops: [['scale', 0.15]] }),
  fallenseraph: M(['墮天使', 'Fallen Seraph'], 'darkangel', { hp: 1100, mp: 255, atk: 180, def: 84, agi: 46, exp: 950, gold: 340, acts: [[1, 'attack'], [1, 'darkfire'], [1, 'judgment']], weak: ['light'], drops: [['darkshard', 0.12]] }),
  amethystdragon: M(['紫晶龍', 'Amethyst Dragon'], 'adragon_p', { hp: 1400, atk: 200, def: 96, agi: 28, exp: 1100, gold: 380, acts: [[2, 'attack'], [1, 'icebreath'], [1, 'tailsweep']], drops: [['dragonbone', 0.08], ['scale', 0.2]] }),
  verdantdragon: M(['翠龍', 'Verdant Dragon'], 'adragon_g', { hp: 1350, atk: 196, def: 94, agi: 28, exp: 1080, gold: 360, acts: [[2, 'attack'], [1, 'poisonbreath'], [1, 'tailsweep']], drops: [['dragonbone', 0.08], ['scale', 0.2]] }),
  emberdragon: M(['炎龍', 'Ember Dragon'], 'adragon_r', { hp: 1380, atk: 198, def: 94, agi: 28, exp: 1090, gold: 370, acts: [[2, 'attack'], [1, 'firestorm'], [1, 'tailsweep']], weak: ['ice'], drops: [['dragonbone', 0.08], ['ember', 0.3]] }),
  mycelord: M(['菌王', 'Myco Lord'], 'mycelord', { hp: 1000, mp: 200, atk: 176, def: 80, agi: 22, exp: 860, gold: 300, acts: [[1, 'attack'], [1, 'spore'], [1, 'healself'], [1, 'poisonbreath']], weak: ['fire'] }),
  magmaooze: M(['熔岩凝膠', 'Magma Ooze'], 'magmaooze', { hp: 900, atk: 172, def: 120, agi: 14, exp: 900, gold: 300, acts: [[2, 'attack'], [1, 'firebreath'], [1, 'harden']], weak: ['ice', 'water'], resist: ['fire'] }),
  moltenhead: M(['熔岩首', 'Molten Head'], 'moltenhead', { hp: 1000, mp: 200, atk: 180, def: 90, agi: 24, exp: 950, gold: 330, acts: [[1, 'attack'], [1, 'firestorm'], [1, 'starshower']], weak: ['ice', 'water'] }),
  cursedurn: M(['受詛的寶甕', 'Cursed Urn'], 'urn', { hp: 1500, mp: 255, atk: 210, def: 140, agi: 60, exp: 2600, gold: 3000, acts: [[2, 'attack'], [1, 'deathknell'], [1, 'flee']], drop: ['seedlife', 0.6], drops: [['weaverstear', 0.1]] }),
  orbitaleye: M(['軌道之眼', 'The Orbital Eye'], 'worldeye', { hp: 26000, mp: 999, atk: 186, def: 84, agi: 30, exp: 6000, gold: 5000, acts: [[1, 'attack'], [2, 'starbeam'], [1, 'stare'], [1, 'sluggard2'], [1, 'mpdrain']], boss: true, twice: 1, weak: ['dark', 'earth'],
    phases: [{ hp: 0.5, msg: ['軌道之眼開始旋轉，星星從它的裂縫裡掉了出來！', 'The Orbital Eye begins to spin, and stars spill out of its cracks!'], summon: ['cometgazer', 'cometgazer'], acts: [[1, 'attack'], [2, 'starbeam'], [1, 'starshower'], [1, 'mpdrain']] }] }),
  vaelith: M(['緋紅龍　薇莉絲', 'Vaelith, the Crimson Wyrm'], 'reddragon', { hp: 30000, mp: 999, atk: 200, def: 92, agi: 30, exp: 7000, gold: 6000, acts: [[2, 'attack'], [2, 'firestorm'], [1, 'tailsweep'], [1, 'roar']], boss: true, twice: 1, weak: ['ice', 'water'], resist: ['fire'],
    phases: [{ hp: 0.5, msg: ['薇莉絲深深吸了一口氣，喉嚨裡亮起了白色的火！', 'Vaelith draws a deep breath, and white fire glows in its throat!'], acts: [[2, 'attack'], [1, 'firestorm'], [1, 'gather']], charge: 'whitefire', twice: 1 }] }),
  eclipse1: M(['蝕星', 'Eclipse'], 'mage1', { hp: 24000, mp: 999, atk: 196, def: 90, agi: 36, exp: 0, gold: 0, acts: [[2, 'attack'], [1, 'darkfire'], [1, 'deathknell'], [1, 'starshower']], boss: true, twice: 1, weak: ['light'] }),
  eclipse2: M(['蝕星・覺醒', 'Eclipse, Awakened'], 'mage2', { hp: 30000, mp: 999, atk: 206, def: 94, agi: 38, exp: 0, gold: 0, acts: [[2, 'attack'], [1, 'starshower'], [1, 'reflect'], [1, 'unravel'], [1, 'sunderall']], boss: true, twice: 1, weak: ['light'] }),
  eclipse3: M(['蝕星・虛無之冠', 'Eclipse, Crown of Nothing'], 'mage3', { hp: 30000, mp: 999, atk: 206, def: 98, agi: 40, exp: 20000, gold: 20000, acts: [[2, 'attack'], [1, 'unravel'], [1, 'deathknell'], [1, 'starshower'], [1, 'gather']], charge: 'blackstar', boss: true, twice: 1, weak: ['light'],
    phases: [{ hp: 0.3, msg: ['蝕星：「為什麼……你有光……而我只有影子……」', 'Eclipse: "Why... do you have the light... and I only the shadow..."'], acts: [[2, 'attack'], [2, 'unravel'], [1, 'gather']], charge: 'blackstar' }] }),
  shade1: M(['千年之影', 'The Thousand-Year Shade'], 'shadowboss_k', { look: { hue: 0, sat: 1, lum: 1.5 }, hp: 30000, mp: 999, atk: 220, def: 100, agi: 40, exp: 0, gold: 0, acts: [[2, 'attack'], [1, 'deathknell'], [1, 'judgment'], [1, 'mpdrain']], boss: true, twice: 1, weak: ['light'], resist: ['dark'] }),
  shade2: M(['千年之影・蒼', 'The Shade, in Blue'], 'shadowboss_b', { look: { hue: 0, sat: 1.3, lum: 1.4 }, hp: 38000, mp: 999, atk: 226, def: 102, agi: 42, exp: 0, gold: 0, acts: [[2, 'attack'], [2, 'deepfrost'], [1, 'avalanche'], [1, 'reflect']], boss: true, twice: 1, weak: ['fire', 'bolt'], resist: ['ice', 'water'] }),
  shade3: M(['千年之影・燼', 'The Shade, in Embers'], 'shadowboss_o', { look: { hue: 0, sat: 1.2, lum: 1.4 }, hp: 44000, mp: 999, atk: 236, def: 106, agi: 44, exp: 30000, gold: 30000, acts: [[2, 'attack'], [1, 'whitefire'], [1, 'starshower'], [1, 'gather'], [1, 'sunderall']], charge: 'endofdays', boss: true, twice: 1, weak: ['ice', 'water', 'light'], resist: ['fire'],
    phases: [{ hp: 0.3, msg: ['千年之影：「……星之子啊。讓我看看，你能不能背得起千年的孤獨。」', 'The Shade: "...Child of the star. Show me whether you can carry a thousand years of loneliness."'], acts: [[2, 'attack'], [1, 'whitefire'], [1, 'deathknell'], [1, 'gather']], charge: 'endofdays', twice: 1 }] }),
});
// darkened and post-game kin of familiar monsters (same pictures, stronger)
const KIN = (base, n, look, k, extra = {}) => { const b = MON[base]; MON[base + '_x'] = { ...b, n, look, hp: Math.round(b.hp * k), atk: Math.round(b.atk * Math.sqrt(k) * 1.15), def: Math.round(b.def * Math.sqrt(k) * 1.1), agi: Math.round(b.agi * 1.2), exp: Math.round(b.exp * k * 0.8), gold: Math.round(b.gold * k * 0.6), boss: false, phases: undefined, ...extra }; };
KIN('panther', ['星豹', 'Star Panther'], { hue: 220, sat: 1.2, lum: 1.2 }, 3.4);
KIN('greatoctopus', ['深淵章魚', 'Abyss Octopus'], { hue: 200, sat: 1, lum: 0.8 }, 1.8);
KIN('gloomtroll', ['星界巨魔', 'Astral Troll'], { hue: 160, sat: 1.1, lum: 1.2 }, 2.0);
KIN('thunderape', ['風暴猿王', 'Storm Ape King'], { hue: 40, sat: 1.2, lum: 1.1 }, 3.6);
KIN('gargoyle', ['黑曜石像鬼', 'Obsidian Gargoyle'], { hue: 0, sat: 0.4, lum: 0.6 }, 3.6);
KIN('revenant', ['星鐵亡魂', 'Starsteel Revenant'], { hue: 200, sat: 1.4, lum: 1.2 }, 3.8);

// ---------- the expansion's monster actions ----------
Object.assign(MACTS, {
  gnaw: A(['啃咬', 'Gnaw'], { kind: 'phys', tgt: 'foe', power: 1.1, st: 'poison', hit: 0.3, msg: ['%s啃咬了過來！', '%s gnaws!'] }),
  cannon: A(['砲擊', 'Cannon'], { kind: 'breath', tgt: 'foes', power: 30, el: 'fire', msg: ['%s點燃了小砲！轟——！', '%s lights the cannon! BOOM!'] }),
  rumdrink: A(['灌一口', 'Swig'], { kind: 'healself', power: 0.1, msg: ['%s灌了一大口不知道是什麼的東西！', '%s takes a big swig of something!'] }),
  galeforce: A(['暴風', 'Galeforce'], { kind: 'breath', tgt: 'foes', power: 66, el: 'wind', msg: ['%s拍動翅膀，捲起暴風！', '%s beats its wings into a gale!'] }),
  featherstorm: A(['羽刃', 'Feather Storm'], { kind: 'phys', tgt: 'foes', power: 0.8, msg: ['%s射出了刀刃般的羽毛！', '%s looses feathers sharp as knives!'] }),
  cyclone: A(['大旋風', 'Cyclone'], { kind: 'breath', tgt: 'foes', power: 150, el: 'wind', msg: ['%s放出了積蓄的力量——大旋風！', '%s unleashes its gathered power: a cyclone!'] }),
  tonguelash: A(['長舌', 'Tongue Lash'], { kind: 'phys', tgt: 'foe', power: 1.3, st: 'numb', hit: 0.2, msg: ['%s伸出長長的舌頭！', '%s lashes out with a long tongue!'] }),
  spore: A(['孢子', 'Spores'], { kind: 'status', tgt: 'foes', st: 'sleep', hit: 0.3, msg: ['%s噴出了孢子！', '%s puffs out spores!'] }),
  pollen: A(['花粉', 'Pollen'], { kind: 'status', tgt: 'foes', st: 'confuse', hit: 0.25, msg: ['%s撒出了奇怪的花粉！', '%s scatters a strange pollen!'] }),
  acid: A(['酸液', 'Acid'], { kind: 'phys', tgt: 'foe', power: 1.1, sunder: true, msg: ['%s吐出了酸液！盔甲被腐蝕了！', '%s spits acid! Armour corrodes!'] }),
  poisonbreath: A(['毒之吐息', 'Venom Breath'], { kind: 'breath', tgt: 'foes', power: 70, st: 'poison', hit: 0.5, msg: ['%s吐出了劇毒的氣息！', '%s breathes venom!'] }),
  mindblast: A(['精神衝擊', 'Mind Blast'], { kind: 'breath', tgt: 'foes', power: 60, el: 'dark', st: 'confuse', hit: 0.3, msg: ['%s放出了扭曲的思念！', '%s sends out twisted thoughts!'] }),
  curse: A(['詛咒', 'Curse'], { kind: 'herodebuff', tgt: 'foes', st: 'atkdown', hit: 0.6, msg: ['%s念出了詛咒！', '%s mutters a curse!'] }),
  sluggard2: A(['重力', 'Gravity'], { kind: 'herodebuff', tgt: 'foes', st: 'agidown', hit: 0.7, msg: ['%s讓周圍的空氣變得沉重！', '%s makes the air heavy!'] }),
  lament: A(['悲歌', 'Lament'], { kind: 'status', tgt: 'foes', st: 'sleep', hit: 0.35, msg: ['%s唱起了悲傷的歌……', '%s sings a sorrowful song...'] }),
  chainlash: A(['鎖鏈', 'Chain Lash'], { kind: 'phys', tgt: 'foes', power: 0.8, msg: ['%s甩動沉重的鎖鏈！', '%s swings its heavy chain!'] }),
  bind: A(['縛絲', 'Bind'], { kind: 'status', tgt: 'foe', st: 'numb', hit: 0.4, msg: ['%s吐出了絲線綁住了人！', '%s binds someone in thread!'] }),
  charm: A(['魅惑', 'Charm'], { kind: 'status', tgt: 'foe', st: 'confuse', hit: 0.45, msg: ['%s露出了迷人的微笑……', '%s smiles bewitchingly...'] }),
  mindwipe: A(['忘卻', 'Mindwipe'], { kind: 'status', tgt: 'foes', st: 'hush', hit: 0.45, msg: ['%s的霧氣抹去了咒文的記憶！', "%s's mist wipes away the memory of spells!"] }),
  starbeam: A(['星光束', 'Starbeam'], { kind: 'breath', tgt: 'foes', power: 130, el: 'light', msg: ['%s射出了刺眼的星光！', '%s fires a blinding beam of starlight!'] }),
  starshower: A(['流星雨', 'Starshower'], { kind: 'breath', tgt: 'foes', power: 170, el: 'blast', msg: ['%s讓流星落了下來！', '%s brings down a shower of stars!'] }),
  judgment: A(['黑之審判', 'Black Verdict'], { kind: 'breath', tgt: 'foes', power: 160, el: 'dark', msg: ['%s降下了漆黑的審判！', '%s passes a black verdict!'] }),
  deathknell: A(['死亡鐘聲', 'Death Knell'], { kind: 'status', tgt: 'foe', st: 'doom', hit: 0.5, msg: ['%s敲響了死亡的鐘聲……', '%s tolls a death knell...'] }),
  swarmbite: A(['群咬', 'Swarm'], { kind: 'phys', tgt: 'foes', power: 0.7, msg: ['%s一擁而上！', '%s swarms over everyone!'] }),
  lancecharge: A(['突刺衝鋒', 'Lance Charge'], { kind: 'phys', tgt: 'foe', power: 1.8, msg: ['%s舉槍衝了過來！', '%s charges with the lance!'] }),
  avalanche: A(['雪崩', 'Avalanche'], { kind: 'breath', tgt: 'foes', power: 150, el: 'ice', msg: ['雪崩從山上滾了下來！', 'An avalanche roars down the mountain!'] }),
  prism: A(['稜光', 'Prism Ray'], { kind: 'breath', tgt: 'foes', power: 80, el: 'light', msg: ['%s的寶石射出七色的光！', "%s's gems fire rays of seven colours!"] }),
  gemburst: A(['寶石爆裂', 'Gem Burst'], { kind: 'breath', tgt: 'foes', power: 140, el: 'blast', msg: ['%s全身的寶石同時爆裂了！', 'Every gem on %s bursts at once!'] }),
  inkflood: A(['墨之洪流', 'Flood of Ink'], { kind: 'breath', tgt: 'foes', power: 175, el: 'water', st: 'blind', hit: 0.5, msg: ['%s吐出了漆黑的墨之洪流！', '%s vomits a black flood of ink!'] }),
  champion: A(['冠軍一擊', "Champion's Blow"], { kind: 'phys', tgt: 'foe', power: 3.2, msg: ['%s使出了二十年不敗的一擊！', '%s throws the blow that has not lost in twenty years!'] }),
  whitefire: A(['白焰', 'White Fire'], { kind: 'breath', tgt: 'foes', power: 210, el: 'fire', msg: ['%s吐出了白色的火焰！', '%s breathes white fire!'] }),
  blackstar: A(['黑星', 'Black Star'], { kind: 'breath', tgt: 'foes', power: 205, el: 'dark', msg: ['一顆黑色的星星在頭頂炸開！', 'A black star bursts overhead!'] }),
  endofdays: A(['終焉', 'End of Days'], { kind: 'breath', tgt: 'foes', power: 280, el: 'dark', msg: ['%s：「千年的黑夜，落下吧。」', '%s: "Fall, night of a thousand years."'] }),
  gather: A(['蓄力', 'Gather'], { kind: 'gather', msg: ['%s正在蓄積力量……！', '%s is gathering its power...!'] }),
  reflect: A(['鏡之霧', 'Mirror Mist'], { kind: 'reflect', msg: ['%s的身體被鏡子般的光包圍了！咒文會被彈回！', '%s is wrapped in mirror-light! Spells will bounce back!'] }),
  mpdrain: A(['吸魔', 'Mana Drain'], { kind: 'mpdrain', tgt: 'foe', power: 30, msg: ['%s吸走了魔力！', '%s drains magic!'] }),
  flee: A(['逃走', 'Flee'], { kind: 'flee', msg: ['%s想要逃走！', '%s tries to run!'] }),
});
for (const id of ['jolt', 'thunderclap', 'splash', 'torrent', 'blaze', 'deepfrost', 'dawnbolt', 'tempest']) if (!MACTS[id] || !MACTS[id].msg) MACTS[id] = { ...SKILLS[id], kind: 'spell', msg: ['%s唸出了「' + SKILLS[id].n[0] + '」的咒文！', '%s casts ' + SKILLS[id].n[1] + '!'] };

// ---------- the expansion's encounters ----------
ZONES.crag.push([2, ['blujelly', 'blujelly']], [1, ['blujelly', 'slime']]);
ZONES.road.push([2, ['fieldrat', 'fieldrat']], [1, ['fieldrat', 'slime']]);
ZONES.meadow.push([2, ['gobaxe']], [2, ['bramblecub']], [1, ['fieldrat', 'gobaxe']]);
ZONES.sewer.push([2, ['bloodtick', 'bloodtick']], [1, ['bloodtick', 'rat']]);
ZONES.river.push([2, ['rivercobra']], [2, ['rustwolf', 'rustwolf']], [1, ['rivercobra', 'toadman']]);
ZONES.temple.push([2, ['miredrop', 'miredrop']], [1, ['miredrop', 'helmeel']]);
ZONES.coast.push([2, ['redlizard']], [2, ['deckhand', 'corsair']]);
ZONES.volcano.push([2, ['cinderling', 'cinderling']], [2, ['emberslime']], [1, ['cinderling', 'salamander']]);
ZONES.desert.push([2, ['sandscorp']], [2, ['jackal', 'jackal']], [2, ['sandgrub']], [1, ['brigand', 'brigand']]);
ZONES.ruins.push([2, ['ruinskel', 'ruinskel']], [1, ['ruinskel', 'gnawer']]);
ZONES.snow.push([2, ['snowhare', 'snowhare']], [1, ['snowhare', 'icegolem']]);
ZONES.dark.push([2, ['bloodeye', 'bloodeye']], [1, ['bloodeye', 'orc']]);
ZONES.dark2.push([2, ['swarm']], [1, ['swarm', 'shade']]);
ZONES.citadel.push([2, ['peeper']], [1, ['peeper', 'reaper']]);
Object.assign(ZONES, {
  grotto: [[3, ['seadrop', 'seadrop']], [3, ['ironshell']], [3, ['corsair', 'corsair']], [2, ['cavebat', 'cavebat', 'cavebat']], [2, ['tidecobra', 'seadrop']], [2, ['deckhand']], [1, ['deckhand', 'corsair']]],
  luck: [[3, ['hopper', 'hopper']], [3, ['cockatrice']], [2, ['grasslizard']], [2, ['hornet', 'hornet']], [2, ['sporecap', 'hopper']], [1, ['sporecap', 'sporecap', 'sporecap']]],
  east: [[3, ['pixie', 'pixie']], [3, ['galecocka']], [3, ['azurewolf', 'azurewolf']], [2, ['vulture', 'vulture']], [2, ['thunderape']], [2, ['tuskmaul']], [1, ['pixie', 'azurewolf', 'pixie']]],
  galespire: [[3, ['galespirit', 'galespirit']], [3, ['gargoyle']], [2, ['stormbat', 'stormbat', 'stormbat']], [2, ['azureidol', 'galespirit']], [2, ['needlewasp', 'needlewasp']], [1, ['gargoyle', 'azureidol']]],
  jungle: [[3, ['panther']], [3, ['snapvine', 'snapvine']], [2, ['thornbloom', 'leafling']], [2, ['junglecobra']], [2, ['flameant']], [2, ['bloattoad']], [1, ['leafling', 'leafling', 'panther']]],
  fen: [[3, ['swamptroll']], [3, ['bogsludge', 'bogsludge']], [2, ['bloodsucker', 'bloodsucker', 'bloodsucker']], [2, ['mossnail']], [2, ['hauntwood']], [1, ['bogsludge', 'swamptroll']]],
  archive: [[3, ['inkhorror']], [3, ['mindjelly', 'mindjelly']], [2, ['seekereye', 'archmummy']], [2, ['bubblespirit', 'bubblespirit']], [2, ['greatoctopus']], [1, ['archmummy', 'archmummy', 'seekereye']]],
  dark3: [[3, ['nighthound', 'nighthound']], [3, ['gloomtroll']], [2, ['chainghoul']], [2, ['pitchimp', 'pitchimp']], [2, ['zombie', 'zombie']], [2, ['weeper', 'chainghoul']]],
  mines: [[3, ['rubble', 'rubble']], [3, ['goldscorp']], [2, ['minerat', 'minerat', 'minerat']], [2, ['pitspider', 'pitspider']], [2, ['automaton']], [2, ['millipede']], [1, ['goldscorp', 'goldscorp']]],
  choir: [[3, ['choirghost', 'choirghost']], [3, ['drownedghost']], [2, ['armorshrimp', 'tidenaga']], [2, ['dewling', 'dewling', 'dewling']], [2, ['tidenaga', 'choirghost']]],
  monastery: [[3, ['snowcub', 'snowcub']], [3, ['frostwisp']], [2, ['greywolf', 'greywolf']], [2, ['revenant']], [2, ['frostskel', 'frostskel']], [1, ['revenant', 'frostwisp']]],
  keep: [[3, ['turncoat', 'turncoat']], [3, ['mercenary']], [2, ['blacklancer']], [2, ['shadowninja', 'shadowninja']], [2, ['wartiger']], [1, ['blacklancer', 'turncoat']]],
  garden: [[3, ['threadcreep', 'threadcreep']], [3, ['dreamfiend']], [2, ['envywisp', 'envywisp']], [2, ['huskpod']], [2, ['lostseraph']], [1, ['dreamfiend', 'lostseraph']]],
  sea2: [[3, ['seawyrm']], [2, ['armorshrimp', 'armorshrimp']], [2, ['tidenaga', 'seawyrm']], [2, ['bubblespirit']]],
  starwell: [[3, ['cometgazer', 'cometgazer']], [3, ['starwisp', 'starwisp']], [2, ['drakeman']], [2, ['fallenseraph']], [2, ['mycelord', 'magmaooze']], [2, ['moltenhead']], [1, ['amethystdragon']], [1, ['verdantdragon']], [1, ['emberdragon']], [1, ['cursedurn']]],
  starwell2: [[3, ['panther_x', 'panther_x']], [3, ['gloomtroll_x']], [2, ['thunderape_x']], [2, ['gargoyle_x', 'gargoyle_x']], [2, ['revenant_x']], [2, ['greatoctopus_x']], [2, ['fallenseraph', 'drakeman']], [1, ['cursedurn']]],
});
Object.assign(BOSSES, {
  rena: ['deckhand', 'rena', 'deckhand'], zephyra: ['zephyra'], mirehydra: ['mirehydra'], inkwyrm: ['inkwyrm'], colossus: ['colossus'], cantor: ['cantor'],
  snowmaul: ['snowmaul'], kestrel: ['kestrel'], forgetting: ['forgetting'], varro: ['arenatiger', 'varro'], orbitaleye: ['orbitaleye'], vaelith: ['vaelith'],
  eclipse: ['eclipse1'], shade: ['shade1'],
});
Object.assign(BG, {
  grotto: ['underground', '#081820', '#183848'], luck: ['grass', '#58a0e8', '#c0e8f8'], east: ['mountains', '#6890d0', '#c8e0f8'], galespire: ['mountains_bridge', '#3868b8', '#a8d0f0'],
  jungle: ['jungle', '#205028', '#68a858'], fen: ['jungle', '#182818', '#405838'], archive: ['water', '#081828', '#204060'], dark3: ['jungle', '#100818', '#382040'],
  mines: ['underground', '#181008', '#403018'], choir: ['water', '#102030', '#305068'], monastery: ['moon', '#90a0c8', '#e0e8f8'], keep: ['fort', '#181818', '#383848'],
  garden: ['foo', '#402868', '#a888d8'], sea2: ['water', '#2868c0', '#88c0f0'], starwell: ['moon', '#100828', '#483880'], starwell2: ['keep_outer', '#080418', '#302058'],
  arena: ['fort', '#402010', '#b07040'], hollow: ['keep_outer', '#000000', '#180818'],
});
Object.assign(SHOPS, {
  luckitem: ['herb', 'strongherb', 'antidote', 'moonwort', 'feather', 'incense', 'smokebomb', 'frostflask', 'bomb'],
  luckgear: ['cutlass', 'chainwhip', 'lightrobe', 'feathercap', 'ironshield', 'thiefsglove', 'antidotering'],
  chime: ['icebrand', 'mythrilknife', 'thornwhip', 'steelfist', 'mythrilmail', 'mythrilvest', 'dragonshield', 'mythrilhelm', 'lightrobe'],
  chimeitem: ['strongherb', 'megaherb', 'ether', 'remedy', 'stardew', 'boltflask', 'frostflask', 'smokebomb', 'feather', 'incense'],
  moss: ['stormblade', 'greataxe', 'trident', 'thunderclaw', 'thunderrod', 'crystalstaff', 'ninjagarb', 'crystalmail', 'mirrorrobe', 'crystalshield', 'sagecirclet', 'swiftfeather'],
  mossitem: ['megaherb', 'elixir', 'ether', 'remedy', 'stardew', 'holywater', 'boltflask', 'powertonic', 'swifttonic', 'guardtonic', 'sleepdust', 'feather'],
  star: ['starsteel', 'moonfang', 'dragonwhip', 'dawnstaff', 'skypiercer', 'firebirdclaw', 'astralwand', 'starsteelmail', 'starweave', 'weaverrobe', 'starshield', 'starcrown'],
  staritem: ['megaherb', 'elixir', 'hiether', 'remedy', 'stardew', 'holywater', 'boltflask', 'powertonic', 'swifttonic', 'guardtonic', 'feather'],
});
SHOPS.camp.push('megaherb', 'remedy', 'stardew', 'holywater');
