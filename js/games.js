// Things to do besides the story: the Crown Arena, the Luckhaven casino (slots and Dawn Poker),
// fishing, the forge, the Monster Book, star shards for the collector, treasure maps and the
// journal. Each one is a script the map's people or the menu can call.
import { ctx, W, H, text, textW, windowBox, HAND } from './gfx.js';
import { input } from './input.js';
import { sfx } from './audio.js';
import { S, stats, heroName, addItem, count, has, member } from './party.js';
import { ITEMS, MON, BOSSES, nm, ds } from './data.js';
import { SCRIPTS } from './story.js';
import { menu, custom, say, ask, notice, panel, pressKey } from './ui.js';
import { monArt } from './sprites.js';
import { L, isEn } from './i18n.js';

const def = (id, f) => { SCRIPTS[id] = f; };
const give = (E, id, n = 1) => { addItem(id, n); E.sfx('treasure'); return E.say(null, L(`得到了「${nm(ITEMS[id])}」${n > 1 ? '×' + n : ''}！`, `Received ${nm(ITEMS[id])}${n > 1 ? ' x' + n : ''}!`)); };

// =====================================================================================
// the casino
// =====================================================================================
const PRIZES = [['elixir', 300], ['seedlife', 800], ['goldbangle', 2000], ['gamblersedge', 6000], ['weaverstear', 9000]];
def('casino_coins', async (E) => {
  const close = panel(() => { windowBox(150, 4, 102, 40); text(`${S.gold} G`, 244, 10, '#f8e070', { align: 'right' }); text(L(`代幣 ${S.coins || 0}`, `Coins ${S.coins || 0}`), 244, 26, '#a8e0f8', { align: 'right' }); });
  for (;;) {
    const r = await ask('商人', L('歡迎來到幸運港賭場！一枚代幣 20 金幣。', 'Welcome to the Luckhaven Casino! Coins are 20 gold each.'), [L('買代幣', 'Buy coins'), L('換獎品', 'Prizes'), L('離開', 'Leave')]);
    if (r === 0) {
      const k = await menu([{ label: L('10 枚', '10 coins'), right: '200G' }, { label: L('50 枚', '50 coins'), right: '1000G' }, { label: L('100 枚', '100 coins'), right: '2000G' }], { x: 120, y: 60, w: 130 });
      if (k < 0) continue;
      const n = [10, 50, 100][k];
      if (S.gold < n * 20) { sfx('buzz'); await say('商人', L('金幣不夠呢。', 'Not enough gold.')); continue; }
      S.gold -= n * 20; S.coins = (S.coins || 0) + n; sfx('chest');
    } else if (r === 1) {
      const k = await menu(PRIZES.map(([id, c]) => ({ label: nm(ITEMS[id]), right: c, disabled: (S.coins || 0) < c })), { x: 40, y: 50, w: 210, title: L('要換什麼？', 'Which prize?') });
      if (k < 0) continue;
      const [id, c] = PRIZES[k];
      S.coins -= c; await give(E, id);
    } else break;
  }
  close();
});
// slots: three reels, stopped one at a time with Z
const SYM = ['7', '★', '☾', '♥', '◆', '♣'];
const SYMC = ['#f84040', '#f8e048', '#c8c8ff', '#f878a8', '#58c8f8', '#78e078'];
const PAY = { '7': 100, '★': 30, '☾': 15, '♥': 8, '◆': 8, '♣': 8 };
const REEL = [0, 3, 1, 4, 2, 5, 3, 1, 4, 0, 5, 2, 4, 3, 1, 5];
def('casino_slots', async (E) => {
  await E.say('舞者', L('呼呼，來轉一轉吧？按 Z 讓轉輪一個一個停下來喔。', 'Ho ho, care for a spin? Press Z to stop the reels one by one.'));
  for (;;) {
    const r = await ask('舞者', L(`要押幾枚？（代幣 ${S.coins || 0}）`, `How many coins? (You have ${S.coins || 0})`), ['1', '5', '10', L('不玩了', 'Done')]);
    if (r < 0 || r === 3) break;
    const bet = [1, 5, 10][r];
    if ((S.coins || 0) < bet) { sfx('buzz'); await E.say('舞者', L('代幣不夠喔。去櫃檯買吧。', "Not enough coins. Buy some at the counter.")); continue; }
    S.coins -= bet;
    const win = await custom({
      t: 0, pos: [Math.random() * 16, Math.random() * 16, Math.random() * 16], stop: 0, res: null, wait: 0,
      update() {
        this.t++;
        for (let i = this.stop; i < 3; i++) this.pos[i] = (this.pos[i] + 0.34 + i * 0.05) % 16;
        if (this.res !== null) { if (++this.wait > 70 || (this.wait > 15 && input.pressed('a'))) this.done(this.res); return; }
        if (input.pressed('a') && this.stop < 3) {
          // the reel slides on a little before it settles
          this.pos[this.stop] = Math.round(this.pos[this.stop] + Math.random() * 1.2) % 16; this.stop++; sfx('cursor');
          if (this.stop === 3) {
            const s = this.pos.map((p) => SYM[REEL[Math.round(p) % 16]]);
            let m = 0;
            if (s[0] === s[1] && s[1] === s[2]) m = PAY[s[0]];
            else if (s[0] === s[1] || s[1] === s[2]) m = s[1] === '7' ? 4 : s[1] === '★' ? 2 : 1;
            this.res = m * bet; sfx(m >= 8 ? 'fanfare' : m ? 'chest' : 'miss');
          }
        }
      },
      draw() {
        windowBox(40, 40, 176, 110);
        text(L('幸運轉輪', 'LUCKY REELS'), 128, 48, '#f8e070', { align: 'center' });
        for (let i = 0; i < 3; i++) {
          const x = 62 + i * 46;
          ctx.fillStyle = '#f8f0e0'; ctx.fillRect(x, 66, 40, 50);
          ctx.fillStyle = '#c84848'; ctx.fillRect(x, 89, 40, 1);
          const p = this.pos[i], base = Math.floor(p), frac = p - base;
          for (let k = -1; k <= 1; k++) {
            const idx = REEL[(((base + k) % 16) + 16) % 16], y = 84 + (k - frac) * 18;
            if (y < 62 || y > 108) continue;
            const big = Math.abs(k - frac) < 0.5;
            text(SYM[idx], x + 20, y, big ? SYMC[idx] : '#a09080', { align: 'center' });
          }
          if (i >= this.stop && (this.t >> 3) % 2) text('▲', x + 20, 118, '#f8e070', { align: 'center' });
        }
        if (this.res !== null) text(this.res ? L(`中了！得到 ${this.res} 枚代幣！`, `A win! ${this.res} coins!`) : L('沒中……', 'No luck...'), 128, 132, this.res ? '#78f878' : '#f8f8f8', { align: 'center' });
        else text(L('Z：停止轉輪', 'Z: stop a reel'), 128, 132, '#c0c0d8', { align: 'center' });
      },
    });
    S.coins += win;
  }
});
// Dawn Poker: five cards, hold some with Z, draw once; pairs of jacks or better pay
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], SUITS = ['♠', '♥', '◆', '♣'];
const HANDS = () => [['royal', L('皇家同花順', 'Royal Flush'), 250], ['sflush', L('同花順', 'Straight Flush'), 50], ['four', L('四條', 'Four of a Kind'), 25], ['full', L('葫蘆', 'Full House'), 9], ['flush', L('同花', 'Flush'), 6], ['straight', L('順子', 'Straight'), 4], ['three', L('三條', 'Three of a Kind'), 3], ['two', L('兩對', 'Two Pair'), 2], ['jacks', L('J 以上的對子', 'Jacks or Better'), 1]];
function judge(hand) {
  const r = hand.map((c) => c % 13).sort((a, b) => a - b), su = hand.map((c) => Math.floor(c / 13));
  const flush = su.every((x) => x === su[0]);
  const uniq = [...new Set(r)];
  const straight = uniq.length === 5 && (r[4] - r[0] === 4 || r.join() === '0,1,2,3,12');
  const cnt = {}; for (const x of r) cnt[x] = (cnt[x] || 0) + 1;
  const c = Object.values(cnt).sort((a, b) => b - a);
  if (straight && flush) return r[0] === 8 ? 'royal' : 'sflush';
  if (c[0] === 4) return 'four';
  if (c[0] === 3 && c[1] === 2) return 'full';
  if (flush) return 'flush';
  if (straight) return 'straight';
  if (c[0] === 3) return 'three';
  if (c[0] === 2 && c[1] === 2) return 'two';
  if (c[0] === 2 && Object.entries(cnt).some(([k, v]) => v === 2 && +k >= 9)) return 'jacks';
  return null;
}
function drawCard(x, y, card, held, hot) {
  ctx.fillStyle = hot ? '#f8e070' : '#202030'; ctx.fillRect(x - 1, y - 1, 34, 46);
  ctx.fillStyle = card === null ? '#304878' : '#f8f8f0'; ctx.fillRect(x, y, 32, 44);
  if (card === null) return;
  const red = Math.floor(card / 13) === 1 || Math.floor(card / 13) === 2, col = red ? '#d83030' : '#202020';
  text(RANKS[card % 13], x + 3, y + 2, col, { shadow: null });
  text(SUITS[Math.floor(card / 13)], x + 16, y + 18, col, { align: 'center', shadow: null });
  if (held) { ctx.fillStyle = '#c83030'; ctx.fillRect(x, y + 46, 32, 12); text(L('保留', 'HOLD'), x + 16, y + 46, '#ffffff', { align: 'center', shadow: null }); }
}
def('casino_poker', async (E) => {
  await E.say('吟遊詩人', L('晨星撲克，玩法很簡單。五張牌，按 Z 選要保留的牌，再選「換牌」。J 以上的對子就有獎！', 'Dawn Poker is simple. Five cards: press Z on the ones to keep, then choose "Draw". A pair of jacks or better wins!'));
  for (;;) {
    const r = await ask('吟遊詩人', L(`要押幾枚？（代幣 ${S.coins || 0}）`, `How many coins? (You have ${S.coins || 0})`), ['1', '5', '10', L('不玩了', 'Done')]);
    if (r < 0 || r === 3) break;
    const bet = [1, 5, 10][r];
    if ((S.coins || 0) < bet) { sfx('buzz'); await E.say('吟遊詩人', L('代幣不夠喔。', 'Not enough coins.')); continue; }
    S.coins -= bet;
    const deck = Array.from({ length: 52 }, (_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    const hand = deck.splice(0, 5);
    const win = await custom({
      cur: 0, held: [false, false, false, false, false], drawn: false, res: null, wait: 0,
      update() {
        if (this.res !== null) { if (++this.wait > 20 && (input.pressed('a') || input.pressed('b'))) this.done(this.res); return; }
        if (input.repeat('right')) { this.cur = (this.cur + 1) % 6; sfx('cursor'); }
        if (input.repeat('left')) { this.cur = (this.cur + 5) % 6; sfx('cursor'); }
        if (input.pressed('a')) {
          if (this.cur < 5) { this.held[this.cur] = !this.held[this.cur]; sfx('ok'); return; }
          for (let i = 0; i < 5; i++) if (!this.held[i]) hand[i] = deck.shift();
          const h = judge(hand), row = HANDS().find((x) => x[0] === h);
          this.res = row ? row[2] * bet : 0; this.name = row ? row[1] : L('沒有牌型', 'Nothing');
          sfx(row && row[2] >= 4 ? 'fanfare' : row ? 'chest' : 'miss');
        }
      },
      draw() {
        windowBox(8, 20, 240, 150);
        text(L('晨星撲克', 'DAWN POKER'), 128, 28, '#f8e070', { align: 'center' });
        HANDS().slice(0, 5).forEach(([, n, m], i) => { text(n, 16, 44 + i * 12, '#a0a8c8'); text('×' + m, 120, 44 + i * 12, '#a0a8c8', { align: 'right' }); });
        HANDS().slice(5).forEach(([, n, m], i) => { text(n, 132, 44 + i * 12, '#a0a8c8'); text('×' + m, 240, 44 + i * 12, '#a0a8c8', { align: 'right' }); });
        for (let i = 0; i < 5; i++) drawCard(20 + i * 40, 106, hand[i], this.held[i] && this.res === null, this.cur === i && this.res === null);
        ctx.drawImage(HAND, this.cur < 5 ? 30 + this.cur * 40 : 214, this.cur < 5 ? 96 : 120);
        windowBox(214, 112, 30, 22, { hot: this.cur === 5 });
        text(L('換', 'GO'), 229, 117, '#f8f8f8', { align: 'center' });
        if (this.res !== null) text(this.res ? L(`${this.name}！得到 ${this.res} 枚代幣！`, `${this.name}! ${this.res} coins!`) : this.name, 128, 152, this.res ? '#78f878' : '#f8f8f8', { align: 'center' });
      },
    });
    S.coins += win;
  }
});

// =====================================================================================
// the Crown Arena
// =====================================================================================
export const ARENA = [
  { id: 'E', fights: [['hopper', 'hopper'], ['cockatrice', 'grasslizard'], ['deckhand', 'deckhand', 'corsair']], prize: 'feathercap', gold: 800 },
  { id: 'D', fights: [['redlizard', 'redlizard'], ['brigand', 'brigand', 'brigand'], ['basilisk']], prize: 'counterring', gold: 2000 },
  { id: 'C', fights: [['galecocka', 'azurewolf'], ['thunderape', 'tuskmaul'], ['icegolem', 'icegolem', 'icegolem']], prize: 'regenring', gold: 4000 },
  { id: 'B', fights: [['panther', 'panther'], ['flameant', 'bloattoad'], ['mirehydra']], prize: 'heroband', gold: 6000 },
  { id: 'A', fights: [['gloomtroll', 'chainghoul'], ['greatoctopus', 'greatoctopus'], ['leocephas']], prize: 'monocle', gold: 9000 },
  { id: 'S', fights: [['amethystdragon'], ['drakeman', 'drakeman'], ['arenatiger', 'varro']], prize: 'championbelt', gold: 20000 },
];
def('arena_desk', async (E) => {
  const ranks = ARENA.filter((r, i) => i === 0 || S.flags['arena_' + ARENA[i - 1].id]);
  await E.say('士兵', L('這裡是皇冠鬥技場！每一個等級要連續打贏三場。中途不會回復，也不能逃跑。輸了也沒關係，我們會把你們抬出去的。', 'This is the Crown Arena! Each rank is three fights in a row. No healing between them, and no running. If you lose, we carry you out. No harm done.'));
  const r = await menu(ranks.map((a) => ({ label: L(`${a.id} 級`, `Rank ${a.id}`), right: S.flags['arena_' + a.id] ? '★' : nm(ITEMS[a.prize]) })), { x: 60, y: 40, w: 180, title: L('要挑戰哪一級？', 'Which rank?') });
  if (r < 0) { await E.say('士兵', L('隨時歡迎！', 'Come back any time!')); return; }
  const a = ranks[r];
  if (a.id === 'S' && !S.flags.varro_met) { S.flags.varro_met = true; await SCRIPTS.varro_intro(E); }
  for (let i = 0; i < 3; i++) {
    await E.say(null, L(`第 ${i + 1} 場！`, `Fight ${i + 1}!`));
    const last = i === 2;
    const res = await E.battle(a.fights[i], { noFlee: true, canLose: true, bgZone: 'arena', boss: last && a.fights[i].some((id) => MON[id].boss), music: last ? 'boss' : 'tides', arena: true });
    if (res !== 'win') { await E.say('士兵', L('……被抬出來了呢。下次加油！', '...They carried you out. Better luck next time!')); return; }
    if (!last) { const k = await ask(null, L('觀眾在歡呼！要繼續下一場嗎？', 'The crowd roars! Go on to the next fight?'), [L('繼續', 'Fight on'), L('棄權', 'Withdraw')]); if (k !== 0) { await E.say('士兵', L('棄權了。下次再來吧！', 'You withdraw. Come again!')); return; } }
  }
  E.sfx('fanfare');
  await E.say('士兵', L(`恭喜！${a.id} 級冠軍！`, `Congratulations! Champions of rank ${a.id}!`));
  if (!S.flags['arena_' + a.id]) { S.flags['arena_' + a.id] = true; await give(E, a.prize); S.gold += a.gold; await E.say(null, L(`得到了 ${a.gold} 金幣的獎金！`, `A prize purse of ${a.gold} gold!`)); }
  else { S.gold += Math.floor(a.gold / 4); await E.say(null, L(`得到了 ${Math.floor(a.gold / 4)} 金幣的獎金。`, `A purse of ${Math.floor(a.gold / 4)} gold.`)); }
  if (a.id === 'S') await SCRIPTS.varro_after(E);
});

// =====================================================================================
// fishing
// =====================================================================================
const FISH = {
  river: [['minnow', 30], ['perch', 26], ['trout', 18], ['eel', 10], ['oldboot', 10], ['goldkoi', 2]],
  sea: [['minnow', 22], ['seabream', 26], ['eel', 14], ['swordfish', 10], ['oldboot', 8], ['lanternfish', 4]],
  ice: [['icefish', 34], ['trout', 26], ['minnow', 14], ['lanternfish', 6], ['oldboot', 6]],
  cliff: [['seabream', 30], ['swordfish', 18], ['lanternfish', 10], ['starfish2', 3], ['oldboot', 6]],
};
const HARD = { minnow: 0.42, perch: 0.36, trout: 0.3, seabream: 0.3, eel: 0.24, icefish: 0.28, swordfish: 0.18, lanternfish: 0.16, goldkoi: 0.12, starfish2: 0.1, oldboot: 0.5 };
export const FISHLIST = ['minnow', 'perch', 'trout', 'seabream', 'eel', 'icefish', 'swordfish', 'lanternfish', 'goldkoi', 'starfish2'];
def('fish', async (E, e) => {
  if (!S.inv.fishingrod) { await E.say(null, L('魚在水面下游來游去。……要是有釣竿就好了。', "Fish dart about under the surface. ...If only you had a rod.")); return; }
  const table = FISH[e.spot] || FISH.river, tot = table.reduce((a, [, w]) => a + w, 0);
  let roll = Math.random() * tot, catchId = table[0][0];
  for (const [id, w] of table) { roll -= w; if (roll <= 0) { catchId = id; break; } }
  const zone = HARD[catchId] || 0.3;
  const res = await custom({
    t: 0, phase: 'wait', bite: 60 + Math.floor(Math.random() * 120), cur: 0, dir: 1, sp: 0.018 + (0.5 - zone) * 0.03, zs: Math.random() * (1 - zone),
    update() {
      this.t++;
      if (this.phase === 'wait') {
        if (input.pressed('b')) { this.done('quit'); return; }
        if (input.pressed('a')) { this.done('early'); return; }
        if (this.t >= this.bite) { this.phase = 'bite'; this.t = 0; sfx('chime'); }
      } else if (this.phase === 'bite') {
        if (input.pressed('a')) { this.phase = 'reel'; this.t = 0; sfx('ok'); return; }
        if (this.t > 40) this.done('slow');
      } else if (this.phase === 'reel') {
        this.cur += this.dir * this.sp; if (this.cur > 1) { this.cur = 1; this.dir = -1; } if (this.cur < 0) { this.cur = 0; this.dir = 1; }
        if (input.pressed('a')) this.done(this.cur >= this.zs && this.cur <= this.zs + zone ? 'got' : 'miss');
      }
    },
    draw() {
      windowBox(40, 120, 176, 70);
      if (this.phase === 'wait') { text(L('靜靜地等著……', 'Waiting quietly...'), 128, 130, '#f8f8f8', { align: 'center' }); text('～', 128 + Math.sin(this.t / 10) * 6, 150, '#78c8f8', { align: 'center' }); text(L('X：收竿', 'X: stop'), 128, 172, '#a0a0b8', { align: 'center' }); }
      if (this.phase === 'bite') { text(L('上鉤了！按 Z！', 'A bite! Press Z!'), 128, 130, '#f8e070', { align: 'center' }); text('！', 128, 150, '#f84848', { align: 'center' }); }
      if (this.phase === 'reel') {
        text(L('在綠色的地方按 Z！', 'Press Z in the green!'), 128, 128, '#f8f8f8', { align: 'center' });
        ctx.fillStyle = '#303048'; ctx.fillRect(52, 152, 152, 12);
        ctx.fillStyle = '#48c860'; ctx.fillRect(52 + this.zs * 152, 152, zone * 152, 12);
        ctx.fillStyle = '#f8f8f8'; ctx.fillRect(52 + this.cur * 152 - 1, 148, 3, 20);
      }
    },
  });
  if (res === 'quit') return;
  if (res === 'early') { await E.say(null, L('太早拉竿了，魚跑掉了。', 'You pulled too soon. The fish swims off.')); return; }
  if (res === 'slow') { await E.say(null, L('慢了一步，魚把餌吃掉跑了。', 'Too slow. The fish took the bait and fled.')); return; }
  if (res === 'miss') { E.sfx('miss'); await E.say(null, L('線斷了！魚跑掉了……', 'The line snaps! It got away...')); return; }
  S.fish = S.fish || {}; S.fish[catchId] = (S.fish[catchId] || 0) + 1;
  addItem(catchId); E.sfx(catchId === 'oldboot' ? 'miss' : 'treasure');
  await E.say(null, L(`釣到了「${nm(ITEMS[catchId])}」！`, `You caught a ${nm(ITEMS[catchId])}!`));
});
def('fisher_quest', async (E) => {
  if (!S.inv.fishingrod) {
    await E.say('漁夫', L('年輕人，會釣魚嗎？……不會？那可不行。釣魚可以讓人學會等待。', "Young one, do you fish? ...No? That won't do. Fishing teaches you how to wait."));
    await E.say('漁夫', L('這根舊釣竿給你吧。水面上有漣漪的地方就是好釣點。釣到不同種類的魚，就來給我看看。', "Take this old rod. Wherever the water ripples, the fishing is good. Come and show me the different fish you catch."));
    await give(E, 'fishingrod'); return;
  }
  const kinds = FISHLIST.filter((k) => S.fish && S.fish[k]).length;
  const steps = [[3, 'strongherb', 5], [6, 'seedagi', 2], [9, 'anglerhat', 1]];
  await E.say('漁夫', L(`你已經釣過 ${kinds} 種魚了。全部有 ${FISHLIST.length} 種喔。`, `You've caught ${kinds} kinds of fish. There are ${FISHLIST.length} in all.`));
  for (const [n, it, c] of steps) if (kinds >= n && !S.flags['fishprize' + n]) { S.flags['fishprize' + n] = true; await E.say('漁夫', L('了不起！這是獎勵。', 'Splendid! Here, a reward.')); await give(E, it, c); }
  if (kinds >= FISHLIST.length && !S.flags.fishmaster) { S.flags.fishmaster = true; await E.say('漁夫', L('全部都釣到了……你已經是真正的釣魚高手了。', 'Every one of them... you are a true angler now.')); }
});

// =====================================================================================
// the forge
// =====================================================================================
export const RECIPES = [
  ['fangknuckle', [['fang', 4], ['ironore', 2]], 1200], ['firecharm', [['ember', 3]], 500], ['icecharm', [['frostshard', 3]], 500],
  ['swiftfeather', [['feather2', 4]], 800], ['dragonshield', [['scale', 3], ['ironore', 2]], 1500], ['silkveil', [['silk', 6], ['crystal', 1]], 3000],
  ['stardew', [['crystal', 1]], 100], ['megaherb', [['herb', 4]], 40], ['anglerhat', [['fur', 3], ['feather2', 2]], 900],
  ['oathplate', [['ironore', 6], ['scale', 4], ['darkshard', 2]], 9000], ['titanaxe', [['ironore', 6], ['dragonbone', 2], ['starsand', 2]], 12000],
  ['aurorablade', [['starsand', 5], ['crystal', 3], ['dragonbone', 2]], 20000],
];
def('forge', async (E) => {
  await E.say('鐵匠', L('想打造東西嗎？把素材和工錢拿來，我就幫你打。魔物身上常常帶著好素材喔。', 'Want something made? Bring the materials and my fee, and I will forge it. Monsters often carry good materials.'));
  for (;;) {
    let desc = '';
    const close = panel(() => { windowBox(4, 150, W - 8, 70); desc.split('\n').forEach((l, i) => text(l, 12, 156 + i * 15)); text(`${S.gold} G`, W - 12, 202, '#f8e070', { align: 'right' }); });
    const ok = (r) => r[1].every(([id, n]) => count(id) >= n) && S.gold >= r[2];
    const k = await menu(RECIPES.map((r) => ({ label: nm(ITEMS[r[0]]), right: r[2], disabled: !ok(r) })), {
      x: 4, y: 4, w: W - 8, maxRows: 8, title: L('要打造什麼？', 'Forge what?'),
      onMove: (i) => { const r = RECIPES[i]; desc = r[1].map(([id, n]) => `${nm(ITEMS[id])} ${count(id)}/${n}`).join(L('　', '  ')) + '\n' + (ds(ITEMS[r[0]]) || ''); },
    });
    close();
    if (k < 0) break;
    const r = RECIPES[k];
    if (!ok(r)) { sfx('buzz'); continue; }
    for (const [id, n] of r[1]) addItem(id, -n);
    S.gold -= r[2];
    await E.fadeOut(20); E.sfx('hit'); await E.wait(14); E.sfx('hit'); await E.wait(14); E.sfx('crit'); await E.fadeIn(20);
    await give(E, r[0]);
  }
  await E.say('鐵匠', L('好好用吧。', 'Use it well.'));
});

// =====================================================================================
// the Monster Book
// =====================================================================================
export const bookList = () => Object.keys(MON).filter((id) => !MON[id].scripted && !/^(arenatiger)$/.test(id));
export const bookPct = () => { const all = bookList().filter((id) => !MON[id].boss); return Math.floor((all.filter((id) => S.book && S.book[id]).length / all.length) * 100); };
export async function showBook() {
  const list = bookList();
  let i = 0, top = 0;
  const seen = (id) => S.book && S.book[id];
  await custom({
    update() {
      const n = list.length;
      if (input.repeat('down')) { i = (i + 1) % n; sfx('cursor'); }
      if (input.repeat('up')) { i = (i + n - 1) % n; sfx('cursor'); }
      if (input.repeat('right')) { i = Math.min(n - 1, i + 8); sfx('cursor'); }
      if (input.repeat('left')) { i = Math.max(0, i - 8); sfx('cursor'); }
      if (i < top) top = i; if (i >= top + 11) top = i - 10;
      if (input.pressed('b') || input.pressed('a')) { sfx('cancel'); this.done(); }
    },
    draw() {
      windowBox(0, 0, W, H);
      text(L(`魔物圖鑑　${bookPct()}%`, `Monster Book  ${bookPct()}%`), 8, 6, '#f8e070');
      for (let k = 0; k < 11 && top + k < list.length; k++) {
        const id = list[top + k], y = 24 + k * 16;
        text(String(top + k + 1).padStart(3, '0'), 18, y, '#8088a8');
        text(seen(id) ? nm(MON[id]).slice(0, isEn() ? 13 : 7) : '？？？', 44, y, seen(id) ? (MON[id].boss ? '#f8c048' : '#f8f8f8') : '#606078');
      }
      ctx.drawImage(HAND, 4 + ((Date.now() >> 8) % 2), 25 + (i - top) * 16);
      const id = list[i], m = MON[id];
      windowBox(128, 20, 124, 200);
      if (!seen(id)) { text('？？？', 190, 100, '#606078', { align: 'center' }); return; }
      const art = monArt(m.art.startsWith('person:') ? 'slime' : m.art, m.look);
      if (art) { const k = Math.min(1, 108 / art.width, 80 / art.height), w = art.width * k, h = art.height * k; ctx.drawImage(art, 190 - w / 2, 110 - h, w, h); }
      const rows = [[L('體力', 'HP'), m.hp], [L('經驗', 'EXP'), m.exp], [L('金幣', 'Gold'), m.gold], [L('打倒', 'Defeated'), S.book[id]]];
      rows.forEach(([a, b], k) => { text(a, 136, 116 + k * 13, '#a8b0c8'); text(String(b), 244, 116 + k * 13, '#f8f8f8', { align: 'right' }); });
      const EL = { fire: L('火', 'Fire'), ice: L('冰', 'Ice'), wind: L('風', 'Wind'), bolt: L('雷', 'Bolt'), light: L('光', 'Light'), dark: L('暗', 'Dark'), water: L('水', 'Water'), earth: L('地', 'Earth'), blast: L('爆', 'Blast') };
      if (m.weak) text(L('弱：', 'Weak: ') + m.weak.map((e) => EL[e] || e).join(isEn() ? ',' : ''), 136, 170, '#f8a078');
      if (m.resist) text(L('抗：', 'Resist: ') + m.resist.map((e) => EL[e] || e).join(isEn() ? ',' : ''), 136, 184, '#78c8f8');
      const dr = [m.drop && m.drop[0], ...(m.drops || []).map((d) => d[0])].filter(Boolean);
      if (dr.length) text(nm(ITEMS[dr[0]]).slice(0, isEn() ? 14 : 8), 136, 200, '#a8f0a8');
    },
  });
}
def('book_scholar', async (E) => {
  if (!S.inv.monsterbook) {
    await E.say('學者', L('我在研究世界上的魔物。可是我太怕了，不敢出城……', "I study the monsters of the world. But I'm far too frightened to leave the city..."));
    await E.say('學者', L('這本《魔物圖鑑》給你們。打倒的魔物會自動記錄下來。記錄得越多，我就送你們越好的東西！', "Take this Monster Book. Every monster you defeat is written in it by itself. The more you record, the better the gifts I'll give you!"));
    await give(E, 'monsterbook'); return;
  }
  const pct = bookPct();
  await E.say('學者', L(`圖鑑完成了 ${pct}%……哦哦！`, `The book is ${pct}% complete... oh, splendid!`));
  for (const [p, it, n] of [[25, 'seedlife', 2], [50, 'mpnut', 3], [75, 'starbrooch', 1], [100, 'weaverstear', 3]]) if (pct >= p && !S.flags['bookprize' + p]) { S.flags['bookprize' + p] = true; await E.say('學者', L(`${p}% 的獎勵！`, `Your ${p}% reward!`)); await give(E, it, n); }
});

// =====================================================================================
// star shards for the collector
// =====================================================================================
const MEDALS = [[3, 'mpnut', 1], [6, 'seedagi', 2], [10, 'meditbeads', 1], [15, 'luckycharm', 1], [20, 'seedlife', 3], [25, 'mpnut', 3], [30, 'starbrooch', 1]];
def('medal_lady', async (E) => {
  const have = count('starshard');
  if (!S.flags.medal_met) { S.flags.medal_met = true; await E.say('老婦人', L('哎呀，年輕人。我在收集「星之碎片」，那是很久以前碎掉的星星喔。世界各地都閃著它的光。', 'Oh my, young people. I collect Star Shards: pieces of a star that broke long, long ago. They glimmer all over the world.')); await E.say('老婦人', L('找到了就拿來給我吧。我會用我的寶物跟你換。', "Bring me any you find. I'll trade you my treasures for them.")); }
  if (have) { S.flags.medals = (S.flags.medals || 0) + have; addItem('starshard', -have); E.sfx('chest'); await E.say('老婦人', L(`收下了 ${have} 個碎片。到現在一共是 ${S.flags.medals} 個了。`, `I'll take those ${have} shards. That makes ${S.flags.medals} in all.`)); }
  const tot = S.flags.medals || 0;
  for (const [n, it, c] of MEDALS) if (tot >= n && !S.flags['medal' + n]) { S.flags['medal' + n] = true; await E.say('老婦人', L(`${n} 個的謝禮。`, `My thanks for ${n}.`)); await give(E, it, c); }
  const next = MEDALS.find(([n]) => tot < n);
  await E.say('老婦人', next ? L(`再收集到 ${next[0]} 個的話，我就送你「${nm(ITEMS[next[1]])}」。`, `Bring me ${next[0]} in all and I'll give you ${nm(ITEMS[next[1]])}.`) : L('全部都收集到了呢。謝謝你，年輕人。', 'You found every one. Thank you, young one.'));
});

// =====================================================================================
// treasure maps
// =====================================================================================
export const TMAPS = {
  tmap1: { at: [28, 53], loot: [['coinpurse', 3], ['seedstr', 1]] }, tmap2: { at: [40, 14], loot: [['seedlife', 2]] }, tmap3: { at: [67, 22], loot: [['dragonbone', 2], ['frostshard', 3]] },
  tmap4: { at: [59, 48], loot: [['goldbangle', 1], ['ember', 3]] }, tmap5: { at: [89, 6], loot: [['feather2', 3], ['starbrooch', 1]] }, tmap6: { at: [86, 52], loot: [['weaverstear', 1], ['seedmag', 2]] },
};
export async function useTreasureMap(E, id, field) {
  const t = TMAPS[id];
  if (S.flags[id + '_dug']) { await notice(L('這張圖的寶物已經挖出來了。', "This map's treasure has been dug up.")); return; }
  if (!field.world) { await notice(L('在世界地圖上才能挖寶。', 'You can only dig on the world map.')); return; }
  const d = Math.abs(field.x - t.at[0]) + Math.abs(field.y - t.at[1]);
  if (d <= 1) {
    S.flags[id + '_dug'] = true; E.sfx('hit'); await E.wait(10); E.sfx('treasure');
    await E.say(null, L('挖了挖……有東西！', 'You dig... and find something!'));
    for (const [it, n] of t.loot) await give(E, it, n);
    return;
  }
  await notice(d > 30 ? L('……寶藏好像很遠很遠。', '...The treasure feels very far away.') : d > 15 ? L('……寶藏還有點遠。', '...The treasure is still some way off.') : d > 6 ? L('……寶藏就在附近！', '...The treasure is close!') : L('……就快到了！再找找看！', '...Almost there! Look around!'));
}
def('digger', async (E) => {
  const found = Object.keys(TMAPS).filter((k) => S.inv[k]).length, dug = Object.keys(TMAPS).filter((k) => S.flags[k + '_dug']).length;
  await E.say('水手', L('嘿嘿，我是挖寶的。世界上埋著六張藏寶圖的寶藏喔。藏寶圖常常放在地城的寶箱裡。', 'Heh heh, I dig for treasure. There are six treasure maps out there, and six hoards. The maps turn up in dungeon chests.'));
  await E.say('水手', L('在世界地圖上「使用」藏寶圖，就知道寶藏離你多遠。走到旁邊再用一次，就挖得出來。', 'Use a map on the world map and you will feel how far the treasure is. Stand next to the spot and use it again to dig.'));
  if (found) await E.say('水手', L(`你有 ${found} 張圖，挖出了 ${dug} 個寶藏。`, `You have ${found} maps and have dug up ${dug} hoards.`));
  if (dug >= 6 && !S.flags.digger_prize) { S.flags.digger_prize = true; await E.say('水手', L('六個全挖到了？！你真是天生的挖寶人！這個給你！', 'All six?! You were born to dig! Take this!')); await give(E, 'coinpurse', 5); }
});

// =====================================================================================
// the journal: what to do next, and the side stories
// =====================================================================================
export function mainGoal() {
  const f = S.flags;
  if (!f.ch1_rite) return L('去瀑布邊找小雀。', 'Meet Wren by the falls.');
  if (!f.ch1_done) return L('和小雀比賽，爬上村子西北邊的望星岩。', 'Race Wren up Lookout Crag, north-west of the village.');
  if (!f.ch2_throne) return L('把托賓的信送到東南方王都索爾海文的國王手上。', "Take Tobin's letter to the King in Solhaven, to the south-east.");
  if (!f.escaped) return L('和佩兒一起逃出地下牢獄。', 'Escape the Undercroft with Pell.');
  if (!f.has_mirela) return L('到東邊的鴿巢鎮，找河光神殿的神官。', 'Find the Riverlight priestess in Dovecote, to the east.');
  if (!f.mire_dead) return L('到北邊湖中的河光神殿，點亮水之燈。', 'Light the Water Lantern in the Riverlight Temple, in the lake to the north.');
  if (!f.has_odo) return L('到東南方的海鷗港找船。', 'Look for a ship in Gullport, to the south-east.');
  if (!f.rena_dead) return L('到海鷗港北邊的鷗翼洞窟，把船長的船搶回來。', "Win the captain's boat back from the pirates of Gullwing Grotto, north of Gullport.");
  if (!f.brannoc_duel) return L('回到海鷗港的碼頭。', 'Go back to the Gullport docks.');
  if (!f.ember_dead) return L('搭船到東南海上的燼島，取得火之燈。', 'Sail to Smolder Isle in the south-eastern sea for the Fire Lantern.');
  if (!f.has_sera) return L('搭船往南，前往沙漠王國沙梅爾。', 'Sail south to the desert kingdom of Sandmere.');
  if (!f.clay_dead) return L('在沙中遺跡取得地之燈。', 'Find the Earth Lantern in the Dune Ruins.');
  if (!f.rime_dead) return L('前往北方的雪幕村與霜冠洞窟。', 'Go north to Snowveil and the Frostcrown.');
  if (!f.windbell) return L('越過東方的海，到風鈴鎮尋找風之鈴。', 'Cross the eastern sea to Chimeholm and find the Wind Bell.');
  if (!f.ch7_done) return L('登上內海中央的天織塔。', 'Climb the Skyloom in the middle of the inner sea.');
  if (f.fallen) {
    const miss = ['mirela', 'odo', 'brannoc', 'sera'].filter((id) => !has(id));
    if (!f.tobin_saved && !has('pell')) return L('……', '...');
    if (miss.length) return L('把散落各地的同伴找回來：', 'Find your scattered friends: ') + miss.map((id) => ({ mirela: L('鴿巢鎮', 'Dovecote'), odo: L('海鷗港', 'Gullport'), brannoc: L('沙梅爾', 'Sandmere'), sera: L('雪幕村', 'Snowveil') }[id])).join(L('、', ', '));
    if (!f.fiend_dead) return L('和瑟菈一起到霜冠洞窟的冰之心。', 'Take Sera to the Ice Heart of the Frostcrown.');
    if (!f.tobin_saved) return L('從河岸的排水口潛入王都的地下牢獄，救出托賓爺爺。', "Slip into the Undercroft through the riverside drain and save Grandpa Tobin.");
    if (!f.dawnblade) return L('到望星岩山頂找星鐵，再交給亮瀑村的鐵匠。', 'Find the star-iron on the summit of Lookout Crag and take it to the Brightfall smith.');
    if (!f.archive_done) return L('到東南海上苔沼村附近的沉沒書庫，找出莫洛真正的名字。', "Learn Morrow's true name in the Sunken Archive, in the south-eastern sea near Mossmere.");
    return L('吹響龍笛，飛向解織城。', 'Blow the drake whistle and fly to the Unspun Citadel.');
  }
  if (f.cleared) {
    if (!f.eclipse_dead) return L('探索西南海上出現的星井。', 'Explore the Starwell that rose in the south-western sea.');
    if (!f.shade_dead) return L('虛空之底，有什麼在等著。', 'Something waits at the bottom of the Hollow.');
    return L('你已經看遍了一切。謝謝你的遊玩！', 'You have seen everything. Thank you for playing!');
  }
  return '';
}
export function sideQuests() {
  const f = S.flags, out = [];
  const q = (on, done, zh, en) => { if (on) out.push([done, L(zh, en)]); };
  q(f.ep_pell_start || f.ep_pell, f.ep_pell, '佩兒：母親的墜子（閃晶礦坑）', "Pell: Her Mother's Locket (the Glimmer Mines)");
  q(f.ep_mirela_start || f.ep_mirela, f.ep_mirela, '米蕾拉：沉沒的歌聲（沉歌之井）', 'Mirela: The Drowned Song (the Choirwell)');
  q(f.ep_odo_start || f.ep_odo, f.ep_odo, '歐多：師父的食譜（燼棚修道院）', "Odo: The Master's Recipe (Cindershelf Monastery)");
  q(f.ep_brannoc_start || f.ep_brannoc, f.ep_brannoc, '布藍諾：黑槍（灰淺城）', 'Brannoc: The Black Lance (Ashford Keep)');
  q(f.ep_sera_start || f.ep_sera, f.ep_sera, '瑟菈：最初的絲線（絲之庭園）', 'Sera: The First Thread (the Thread Garden)');
  q(f.letters_got || f.letters_done, f.letters_done, '燈塔守的信（海鷗港→風鈴鎮）', "The Keeper's Letters (Gullport to Chimeholm)");
  q(f.verse_any, f.verses_done, `古歌的歌詞（${['verse_bright', 'verse_sol', 'verse_dove', 'verse_gull', 'verse_sand', 'verse_snow'].filter((k) => f[k]).length}/6）`, `The Old Song (${['verse_bright', 'verse_sol', 'verse_dove', 'verse_gull', 'verse_sand', 'verse_snow'].filter((k) => f[k]).length}/6 verses)`);
  q(S.inv.monsterbook, bookPct() >= 100, `魔物圖鑑（${bookPct()}%）`, `The Monster Book (${bookPct()}%)`);
  q(S.inv.fishingrod, f.fishmaster, `釣魚（${FISHLIST.filter((k) => S.fish && S.fish[k]).length}/${FISHLIST.length} 種）`, `Fishing (${FISHLIST.filter((k) => S.fish && S.fish[k]).length}/${FISHLIST.length} kinds)`);
  q(f.medal_met, f.medal30, `星之碎片（${f.medals || 0}/30）`, `Star Shards (${f.medals || 0}/30)`);
  q(Object.keys(TMAPS).some((k) => S.inv[k]), Object.keys(TMAPS).every((k) => f[k + '_dug']), `藏寶圖（${Object.keys(TMAPS).filter((k) => f[k + '_dug']).length}/6）`, `Treasure Maps (${Object.keys(TMAPS).filter((k) => f[k + '_dug']).length}/6)`);
  q(f.arena_seen, f.arena_S, `皇冠鬥技場（${ARENA.filter((a) => f['arena_' + a.id]).length}/6 級）`, `The Crown Arena (${ARENA.filter((a) => f['arena_' + a.id]).length}/6 ranks)`);
  q(f.cleared, f.wren_shrine_done, '瀑布後的祠堂', 'The Shrine Behind the Falls');
  return out;
}
export async function showJournal() {
  const goal = mainGoal(), side = sideQuests();
  const close = panel(() => {
    windowBox(0, 0, W, H);
    text(L('冒險日誌', 'Journal'), 8, 6, '#f8e070');
    text(L('現在要做的事：', 'What to do now:'), 12, 24, '#a8c8f8');
    const lines = [];
    let ln = '';
    for (const ch of goal.match(/[A-Za-z0-9'".,!?:;()\-]+ ?|./gu) || []) { if (textW(ln + ch) > 232) { lines.push(ln); ln = ch.trimStart(); } else ln += ch; }
    lines.push(ln);
    lines.slice(0, 3).forEach((l, i) => text(l, 16, 40 + i * 14));
    text(L('支線故事：', 'Side stories:'), 12, 90, '#a8c8f8');
    if (!side.length) text(L('（還沒有）', '(None yet)'), 16, 106, '#8088a8');
    side.slice(0, 8).forEach(([done, s], i) => text((done ? '★ ' : '・ ') + s, 16, 106 + i * 14, done ? '#a8f0a8' : '#f8f8f8'));
  });
  await pressKey();
  close();
}
void stats; void heroName; void member; void BOSSES; void say; void ask;
