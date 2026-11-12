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
