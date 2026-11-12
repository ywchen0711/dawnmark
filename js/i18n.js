// Language switching. Text is written in place as L('中文', 'English'); data tables get
// getters so .name and .desc follow the current language.

function initial() {
  try { const v = localStorage.getItem('dawnmark-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* no storage */ }
  try { return /^zh/i.test(navigator.language) ? 'zh' : 'en'; } catch (e) { return 'zh'; }
}
export let LANG = initial();
const hooks = [];
export function onLang(f) { hooks.push(f); }
export function setLang(l) {
  LANG = l;
  try { localStorage.setItem('dawnmark-lang', l); } catch (e) { /* private mode */ }
  try { document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; } catch (e) { /* node */ }
  for (const f of hooks) f(l);
}
export const isEn = () => LANG === 'en';
export const L = (zh, en) => (LANG === 'en' ? en : zh);

// speaker names in dialogue, and the portrait each speaker shows
const NAMES = {
  洛恩: 'Rowan', 佩兒: 'Pell', 米蕾拉: 'Mirela', 歐多: 'Odo', 瑟菈: 'Sera', 布藍諾: 'Brannoc', 小雀: 'Wren', 托賓爺爺: 'Grandpa Tobin',
  歐瑞爾王: 'King Aurel', 莫洛: 'Morrow', 大祭司莫洛: 'High Seer Morrow', 解織者: 'The Unweaver', 士兵: 'Soldier', 衛兵: 'Guard', 騎士: 'Knight',
  村民: 'Villager', 老人: 'Old Man', 老婦人: 'Old Woman', 小孩: 'Child', 男孩: 'Boy', 女孩: 'Girl', 商人: 'Merchant', 旅店老闆: 'Innkeeper',
  神父: 'Priest', 修女: 'Sister', 船長: 'Captain', 水手: 'Sailor', 漁夫: 'Fisher', 學者: 'Scholar', 女王: 'Queen', 沙梅爾女王: 'Queen of Sandmere',
  吟遊詩人: 'Bard', 舞者: 'Dancer', 鐵匠: 'Smith', 獄卒: 'Jailer', 聲音: 'A Voice', '？？？': '???', 天織: 'The Loom', 織母: 'The Weaver',
  長老: 'Elder', 獵人: 'Hunter', 盜賊: 'Thief', 院長: 'Abbess', 礦工: 'Miner', 隊長: 'Captain', 巫女: 'Shrine Maiden', 守門人: 'Gatekeeper',
  蕾娜: 'Rena', 露米: 'Lumi', 柯林: 'Corin', 瓦羅: 'Varro', 燈塔守: 'Lighthouse Keeper', 書庫員的日記: "Archivist's Diary", 馬提亞斯: 'Mattias', 蝕星: 'Eclipse',
  伊文: 'Even', 千年之影: 'The Thousand-Year Shade', 薇莉絲: 'Vaelith', 遺忘: 'The Forgetting', 水底的領唱者: 'The Drowned Cantor', 柯黛莉亞修女: 'Sister Cordelia',
  恩尼克師父: 'Master Ennick', 凱斯卓: 'Kestrel', 武僧: 'Monk', 劍士: 'Swordsman', 青年: 'Youth', 男人: 'Man',
};
export const speaker = (n) => (n && LANG === 'en' ? NAMES[n] || n : n);
export const FACES = {
  洛恩: 8, 佩兒: 18, 米蕾拉: 16, 歐多: 20, 瑟菈: 15, 布藍諾: 22, 小雀: 31, 托賓爺爺: 51, 歐瑞爾王: 49, 莫洛: 38, 大祭司莫洛: 38,
  沙梅爾女王: 50, 女王: 50, 船長: 43, 院長: 39, 修女: 39, 獄卒: 23, 隊長: 23, 長老: 51, 巫女: 30, 吟遊詩人: 55,
  蕾娜: 42, 露米: 14, 柯林: 46, 瓦羅: 44, 凱斯卓: 37, 柯黛莉亞修女: 56, 恩尼克師父: 13, 馬提亞斯: 38, 燈塔守: 52, 武僧: 26, 伊文: 27, 蝕星: 41, 盜賊: 11,
};
