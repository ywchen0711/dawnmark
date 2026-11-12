// The story: every scene, conversation and event, in Chinese and English.
// A script is async (E, ent) => {...}; E is the toolbox main.js hands over.
import { L } from './i18n.js';
import { S, member, has, stats, heroName } from './party.js';
import { ITEMS, SHOPS, nm } from './data.js';

export const SCRIPTS = {};
const def = (id, f) => { SCRIPTS[id] = f; };
const line = (who, zh, en) => (E) => E.say(who, L(zh, en));
void line;

// ---------- generic ----------
def('chest', async (E, e) => {
  if (e.open) { await E.say(null, L('寶箱是空的。', 'The chest is empty.')); return; }
  e.open = true; S.flags['chest:' + e.id] = true;
  E.sfx('treasure');
  if (e.gold) { S.gold += e.gold; await E.say(null, L(`打開寶箱，得到了 ${e.gold} 金幣！`, `Inside the chest: ${e.gold} gold!`)); return; }
  E.give(e.item, e.n || 1);
  await E.say(null, L(`打開寶箱，得到了「${nm(ITEMS[e.item])}」${e.n > 1 ? '×' + e.n : ''}！`, `Inside the chest: ${nm(ITEMS[e.item])}${e.n > 1 ? ' x' + e.n : ''}!`));
});
def('glint', async (E, e) => {
  if (e.story) { await SCRIPTS[e.story](E, e); return; }
  e.gone = true; S.flags['chest:' + e.id] = true;
  E.sfx('treasure');
  E.give(e.item, e.n || 1);
  await E.say(null, L(`地上有東西在閃閃發亮……\n撿到了「${nm(ITEMS[e.item])}」！`, `Something glints on the ground...\nYou pick up ${nm(ITEMS[e.item])}!`));
});
def('save', async (E) => {
  E.sfx('save');
  const r = await E.ask(null, L('溫暖的光包圍著你們。傷口漸漸癒合了。', 'A warm light surrounds you. Your wounds close.'), [L('記錄冒險', 'Save'), L('離開', 'Leave')]);
  E.heal(false);
  if (r === 0) { const ok = E.save(); E.sfx(ok ? 'church' : 'buzz'); await E.say(null, ok ? L('冒險已記錄。', 'Your adventure has been saved.') : L('無法存檔。', 'Could not save.')); }
});
def('church', async (E) => { await E.church('神父'); });
const shopTalk = (list, who = '商人') => async (E) => { await E.shop(SHOPS[list], who); };

// =====================================================================================
// chapter 1: Brightfall
// =====================================================================================
def('opening', async (E) => {
  E.music('village');
  await E.wait(30);
  await E.say('托賓爺爺', L('洛恩，起來了嗎？', 'Rowan, are you awake?'));
  await E.say('托賓爺爺', L('今天是你十六歲的生日。也是村子的成年禮——爬上望星岩，在山頂看日出的日子。', "It's your sixteenth birthday today. And the village rite: you climb Lookout Crag and watch the sun rise from the top."));
  await E.say('托賓爺爺', L('小雀一大早就在瀑布那邊等你了。去吧，別讓她等太久。', "Wren has been waiting by the falls since dawn. Go on, don't keep her waiting."));
  S.flags.opened = true;
});
def('tobin', async (E) => {
  if (S.flags.ch1_done) { await E.say('托賓爺爺', L('去索爾海文吧。國王會告訴你，那個印記的意思。……路上小心。', 'Go to Solhaven. The King will tell you what that mark means. ...Take care on the road.')); return; }
  if (S.flags.ch1_rite) { await E.say('托賓爺爺', L('小雀先上山了？呵呵，那孩子總是比誰都急。', 'Wren went up ahead? Heh. That girl is always in more of a hurry than anyone.')); return; }
  await E.say('托賓爺爺', L('小雀在瀑布那邊等你喔。', "Wren is waiting for you by the falls."));
});
def('wren_bf', async (E) => { await SCRIPTS.falls(E); });
def('falls', async (E) => {
  if (S.flags.ch1_rite) return;
  const w = E.ent('wren');
  if (w) w.dir = 'd';
  await E.say('小雀', L('洛恩！好慢喔！', 'Rowan! You took forever!'));
  await E.say('小雀', L('生日快樂。……欸嘿嘿，這是我們兩個一起等了好久的日子呢。', 'Happy birthday. ...Heh heh. We both waited ages for this day.'));
  await E.say('小雀', L('望星岩的山頂，就是十六年前星星掉下來的地方。聽說從那裡看到的日出，是全世界最漂亮的。', 'The top of Lookout Crag is where the star fell, sixteen years ago. They say the sunrise from up there is the most beautiful in the world.'));
  await E.say('小雀', L('我們來比賽吧！看誰先到山頂！村子北邊……不對，是出了村子往西北的山路喔。我先走啦！', "Let's race! First one to the top wins! Out of the village and up the mountain path to the north-west. I'm off!"));
  if (w) { await E.walk(w, 'ddddrr', 3); E.removeEnt(w); }
  S.flags.ch1_rite = true;
});
def('bf_gate', async (E) => { await E.say('村民', L('今天是成年禮吧？望星岩的山路就在村子外面的西北邊。魔物不多，不過還是要小心喔。', "It's your rite today, isn't it? The path up Lookout Crag is just north-west of the village. Not many monsters, but be careful."));
});
def('bf_man', async (E) => { await E.say('村民', L('托賓老爹撿到你那天晚上，整座山都在發光。我到現在都還記得。', 'The night old Tobin found you, the whole mountain was glowing. I still remember it.')); });
def('bf_woman', async (E) => { await E.say('村民', L('小雀那孩子，從小就跟在你屁股後面跑。呵呵，現在倒是她跑在前面了。', 'That Wren has been running after you since she could walk. Heh. Now she runs ahead.')); });
def('bf_boy', async (E) => { await E.say('男孩', L('等我長大了，也要去爬望星岩！還要打倒好多好多魔物！', "When I grow up I'm climbing Lookout Crag too! And beating loads and loads of monsters!")); });
def('bf_shop', shopTalk('bright'));
def('bf_innkeeper', async (E) => { await E.inn(6); });
def('bf_soldier', async (E) => { await E.say('士兵', L('……你就是托賓家的孩子嗎。國王陛下下令，要我們護送……不，是「看著」你。快去王都吧。', "...So you're Tobin's boy. His Majesty ordered us to escort... no, to watch you. Off to the capital with you.")); });

def('summit', async (E) => {
  E.music('memory');
  const w = E.spawn({ type: 'npc', id: 'wren_s', sprite: 'maiden2', x: 9, y: 8, dir: 'd' });
  await E.walkPlayer('uuu');
  await E.say('小雀', L('嘿嘿，我贏了！……你看，太陽要出來了。', "Heh heh, I win! ...Look, the sun's coming up."));
  await E.say('小雀', L('這個凹下去的地方，就是星星掉下來的地方喔。托賓爺爺就是在這裡撿到你的。', "This hollow is where the star fell. It's where Grandpa Tobin found you."));
  await E.say('小雀', L('有時候我會想……你是不是哪天會回到星星上去呢？', "Sometimes I wonder... will you go back up to the stars one day?"));
  E.shake(20); E.sfx('quake');
  await E.say('小雀', L('咦？什麼聲音——', "Huh? What's that noise—"));
  const d = E.spawn({ type: 'sprite', id: 'drk', x: 9, y: 4, draw: null });
  void d;
  await E.say(null, L('崖邊的岩石裂開，一隻幼龍爬了出來！', 'The rocks at the cliff edge split, and a young dragon climbs out!'));
  w.dir = 'u';
  await E.say('小雀', L('洛恩，小心！', 'Rowan, look out!'));
  const r = await E.battle('drakeling', { music: 'danger', noFlee: true, intro: [L('洛恩擋在小雀的前面！', 'Rowan stands in front of Wren!')] });
  if (r !== 'win') return false;
  E.removeEnt('drk');
  E.music(null);
  await E.flash('#fff8d0', 30);
  E.sfx('holy');
  await E.say(null, L('就在這時，洛恩的左手背亮起了耀眼的光。\n像一顆小小的星星。', "Just then, the back of Rowan's left hand lit up with a dazzling light.\nLike a little star."));
  await E.say('小雀', L('洛恩……你的手……！那個印記……在發光……', "Rowan... your hand...! That mark... it's shining..."));
  await E.say('小雀', L('我們快回去找托賓爺爺吧！', "Let's go back to Grandpa Tobin, quick!"));
  await E.fadeOut(40);
  await E.warp('bf_home', 8, 6, 'r', true);
  E.spawn({ type: 'npc', id: 'wren_h', sprite: 'maiden2', x: 8, y: 7, dir: 'r' });
  E.music('memory');
  await E.fadeIn(40);
  await SCRIPTS.reveal(E);
});
def('reveal', async (E) => {
  await E.say('托賓爺爺', L('……是嗎。印記終於醒了。', '...I see. So the mark has woken at last.'));
  await E.say('托賓爺爺', L('洛恩。十六年前的那個晚上，我在望星岩的星坑裡撿到你的時候，你的小手上，就有這個印記了。', 'Rowan. Sixteen years ago, when I found you in the star-crater on Lookout Crag, that mark was already on your little hand.'));
  await E.say('托賓爺爺', L('古老的歌謠裡唱著：「當天織的絲線開始斷裂，帶著晨星之印的孩子會從天而降。」', 'The old songs say: "When the threads of the Skyloom begin to break, a child with the Dawnmark will fall from the sky."'));
  await E.say('托賓爺爺', L('最近，各地的魔物越來越多了。也許……這就是絲線開始斷裂的徵兆。', "Monsters have been multiplying everywhere lately. Perhaps... it's a sign the threads are breaking."));
  await E.say('托賓爺爺', L('拿著這封信，去王都索爾海文，見歐瑞爾王。他年輕時和我是舊識。國王一定知道該怎麼做。', 'Take this letter to Solhaven, the royal city, and see King Aurel. We knew each other when we were young. The King will know what to do.'));
  E.give('letter'); E.sfx('treasure');
  await E.say(null, L('得到了「托賓的信」！', "Received Tobin's Letter!"));
  S.gold += 60; E.give('herb', 2);
  await E.say('托賓爺爺', L('還有這些。路上用得到。……王都在山的東南邊，過了山口一直往南走就到了。', "And these. You'll need them. ...The capital lies south-east beyond the mountains. Through the pass, then keep going south."));
  await E.say('小雀', L('……洛恩，你一定會回來的吧？', "...Rowan, you will come back, won't you?"));
  await E.say('小雀', L('我會一直在瀑布那裡等你的。所以——一定要回來喔！', "I'll be waiting by the falls. So you'd better come back!"));
  E.removeEnt('wren_h');
  S.flags.ch1_done = true;
  E.music('village');
});

// =====================================================================================
// chapter 2: Solhaven and the Undercroft
// =====================================================================================
def('sol_gate', async (E, e) => {
  if (S.flags.escaped && !S.flags.pardoned) { await E.say('衛兵', L('通緝中的逃犯……？不，認錯人了吧。快走快走。', 'A wanted fugitive...? No, must be someone else. Move along.')); return; }
  if (S.flags.ch2_throne) { await E.say('衛兵', L('城堡現在不開放。', 'The castle is closed.')); return; }
  await E.say('衛兵', L('這裡是索爾海文城。有什麼事嗎？……托賓的信？好，進去吧，國王在王座廳。', "This is Solhaven Castle. Your business? ...A letter from Tobin? Fine, go in. The King is in the throne room."));
  void e;
});
def('sol_w1', async (E) => { await E.say('村民', L('最近大祭司莫洛大人常常在國王身邊。國王也變得越來越不笑了。', 'High Seer Morrow is always at the King\'s side these days. And the King smiles less and less.')); });
def('sol_m1', async (E) => { await E.say('村民', L('城下的地下牢獄，聽說有一隻巨大的石頭怪在看守。被關進去的人，從來沒有逃出來過。', "They say a huge stone thing guards the Undercroft beneath the castle. No one thrown in there has ever got out.")); });
def('sol_bard', async (E) => { await E.say('吟遊詩人', L('♪ 天織的塔高入雲，織母的手不停歇～ 四盞明燈照大地，晨星之子從天降～♪', '♪ The Skyloom climbs into the clouds, the Weaver never rests~ Four lanterns light the land below, the dawn-child falls from the sky~ ♪')); });
def('sol_kid', async (E) => { await E.say('女孩', L('哥哥，你的手上畫了星星耶！好漂亮！', "Mister, there's a star drawn on your hand! So pretty!")); });
def('sol_old', async (E) => { await E.say('老婦人', L('四盞燈……那是天織塔的鑰匙喔。水、火、地、霜，各自守護在世界的四個角落。', 'The four lanterns... they are the keys to the Skyloom. Water, fire, earth and frost, each guarded at a corner of the world.')); });
def('sol_item', shopTalk('solitem'));
def('sol_weapon', shopTalk('solweapon', '鐵匠'));
def('sol_armor', shopTalk('solarmor'));
def('sol_innkeeper', async (E) => { await E.inn(10); });
def('sol_traveler', async (E) => { await E.say('旅人', L('東邊的鴿巢鎮，最近河水一直是混濁的。聽說河光神殿出事了。', 'Over east in Dovecote, the river has been running muddy. They say something has happened at the Riverlight Temple.')); });
def('sol_nun', async (E) => { await E.say('修女', L('在教會向神父祈禱，就能把冒險記錄下來喔。萬一倒下了，光也會把你們帶回這裡。', 'Pray with the priest at a church to record your journey. And if you ever fall, the light will bring you back here.')); });
def('sol_wcust', async (E) => { await E.say('劍士', L('武器要配合每個人。短刀給身手靈巧的人，長劍給力氣大的人。', 'Weapons have to suit the hand. Daggers for the nimble, swords for the strong.')); });
def('sol_mom', async (E) => { await E.say('村民', L('我丈夫是騎士團的。布藍諾隊長是個嚴格的人，可是從來不會欺負弱小。', "My husband is in the Order. Captain Brannoc is strict, but he never bullies the weak.")); });
def('sol_barkeep', async (E) => { await E.say('酒館老闆', L('要喝點什麼？……未成年？那就喝牛奶吧。', "What'll it be? ...Underage? Milk, then.")); });
def('sol_drinker', async (E) => { await E.say('水手', L('海鷗港的船啊，沒有通行證是不讓人上船的。最近海上的魔物太多啦。', "The ships at Gullport won't take anyone without a harbour pass. Too many monsters at sea these days.")); });
def('sol_dancer', async (E) => { await E.say('舞者', L('呵呵，小哥要不要一起跳舞？……開玩笑的啦。', 'Ho ho, care for a dance, young man? ...Only teasing.')); });
def('sol_queen', async (E) => { await E.say('女王', L('……陛下最近總是睡不好。每晚都在說夢話，說什麼「線要斷了」。', '...His Majesty has not slept well of late. Every night he talks in his sleep, about "the threads breaking".')); });
def('sol_cg1', async (E) => { await E.say('士兵', L('王座廳就在北邊。', 'The throne room is to the north.')); });
def('sol_cg2', async (E) => { await E.say('士兵', L('騎士隊長布藍諾大人去巡邏邊境了。', 'Captain Brannoc is out patrolling the border.')); });
def('sol_cg3', async (E) => { await E.say('士兵', L('城堡的地下就是牢獄。好孩子不要靠近。', 'The prison is beneath the castle. Good children keep away.')); });
def('sol_cg4', async (E) => { await E.say('士兵', L('大祭司莫洛大人，是三年前來到王都的。一來就成了國王的心腹。', 'High Seer Morrow came to the capital three years ago. He became the King\'s confidant at once.')); });
def('morrow_hall', async (E) => { await E.say('大祭司莫洛', L('……陛下在等你。', '...His Majesty is waiting for you.')); });

def('king', async (E) => {
  if (S.flags.ch2_throne) { await E.say('歐瑞爾王', L('……', '...')); return; }
  S.flags.ch2_throne = true;
  E.music('castle');
  await E.say('歐瑞爾王', L('你就是托賓的孩子嗎。信，我看過了。……把手給我看看。', "So you are Tobin's child. I have read the letter. ...Show me your hand."));
  E.sfx('holy'); await E.flash('#fff8d0', 16);
  await E.say('歐瑞爾王', L('這是……晨星之印。千年前的傳說，竟然是真的……', 'This is... the Dawnmark. The legend of a thousand years ago, true after all...'));
  await E.say('大祭司莫洛', L('陛下，請恕臣直言。', 'Your Majesty, forgive me for speaking plainly.'));
  await E.say('大祭司莫洛', L('神殿最古老的卷軸上寫著：「帶著星之印的孩子降臨之時，天織將會崩塌。」', 'The oldest scroll of the temple says: "When the child with the star\'s mark descends, the Skyloom shall fall."'));
  await E.say('大祭司莫洛', L('這孩子不是晨星之子。是「崩解之子」。最近各地的魔物，都是被這個印記召喚來的。', 'This boy is no child of the dawn. He is the Child of Ruin. The monsters plaguing the land were summoned by that mark.'));
  await E.say('歐瑞爾王', L('莫洛，這……托賓說——', 'Morrow, but... Tobin said—'));
  await E.say('大祭司莫洛', L('陛下。您還記得您的夢嗎？絲線斷裂的夢。', 'Your Majesty. Do you remember your dream? The dream of the breaking threads.'));
  await E.say('歐瑞爾王', L('……', '...'));
  await E.say('歐瑞爾王', L('……衛兵。把他帶下去。', '...Guards. Take him away.'));
  E.music(null);
  await E.say('洛恩', L('（等一下——！）', '(Wait—!)'));
  E.sfx('hurt'); E.shake(10);
  await E.fadeOut(40);
  await E.say(null, L('……', '...'));
  await E.warp('undercroft', 3, 3, 'd', true);
  E.music('sneak');
  await E.fadeIn(40);
  await SCRIPTS.cell_wake(E);
});
def('cell_wake', async (E) => {
  if (S.flags.cell_woke) return;
  S.flags.cell_woke = true;
  await E.say(null, L('洛恩被關進了城堡地下的牢房。\n裝備沒有被拿走，看來他們很急。', 'Rowan has been thrown into a cell beneath the castle.\nThey left his gear. They must have been in a hurry.'));
  await E.say('？？？', L('喂，新來的。隔壁的。聽得到嗎？', 'Hey. New one. Next door. Can you hear me?'));
  await E.say('？？？', L('我是佩兒。被冤枉偷了國王寶物的可憐少女。……好吧，其實是真的偷了。不過那本來就是我媽媽的東西。', "I'm Pell. A poor innocent girl falsely accused of stealing the King's treasure. ...Fine, I did steal it. But it was my mother's to begin with."));
  await E.say('佩兒', L('你呢？手上那個發光的東西是什麼？……過來牆這邊說話吧。', "And you? What's that glowing thing on your hand? ...Come over by the wall and talk."));
});
def('pell_cell', async (E) => {
  if (S.flags.cell_open) return;
  await E.say('佩兒', L('晨星之印？哈！所以你是傳說中的英雄，被當成壞人關進來了？真有趣。', 'The Dawnmark? Ha! So you\'re the hero of legend, and they locked you up as a villain? Priceless.'));
  await E.say('佩兒', L('好啦，我們聯手吧。我會開鎖，你會打架。這裡的下水道一直通到河邊，只是……聽說有個石頭大怪物在看守出口。', "All right, let's team up. I can pick locks, you can fight. The drains here run all the way to the river. Only... they say a big stone monster guards the way out."));
  await E.say('佩兒', L('看我的——', 'Watch this—'));
  E.sfx('switch'); await E.wait(20); E.sfx('door');
  S.flags.cell_open = true;
  E.refresh();
  const j = E.ent('jailer');
  await E.say('獄卒', L('喂！你們在做什麼——', "Hey! What are you two—"));
  E.sfx('hit'); E.shake(6);
  await E.say(null, L('佩兒從牢門溜出去，一腳把獄卒踢倒了。', 'Pell slips out of the cell and knocks the jailer flat with one kick.'));
  if (j) E.removeEnt(j);
  E.removeEnt('pell_cell');
  E.join('pell', 4);
  await E.say(null, L('佩兒加入了隊伍！', 'Pell joins the party!'));
  await E.say('佩兒', L('走吧，英雄大人。往下水道去，出口在東南邊。', "Let's go, hero. Down into the drains. The way out is to the south-east."));
});
def('jailer', async (E) => { await E.say('獄卒', L('安靜點！', 'Quiet down!')); });
def('warden', async (E) => {
  E.shake(20); E.sfx('quake');
  await E.say('佩兒', L('出口就在前面……可是，那是什麼？牆壁在動！', "The way out is right there... but what's that? The wall is moving!"));
  const r = await E.battle('warden', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('佩兒', L('呼……贏了。你還真的挺能打的嘛。', 'Phew... we won. You really can fight, huh.'));
  await E.say('？？？', L('站住！那兩個逃犯！', 'Halt! You two fugitives!'));
  await E.say('佩兒', L('糟糕，是騎士團的布藍諾！被他抓到就完了，快跑！', "Uh-oh, that's Brannoc of the Order! If he catches us we're finished. Run!"));
  S.flags.escaped = true;
  await E.fadeOut(30);
  await E.warp('world', 35, 31, 'd', true);
  await E.fadeIn(30);
  await E.say('佩兒', L('……甩掉了。這裡是河的東岸。', "...Lost them. This is the east bank of the river."));
  await E.say('佩兒', L('我有個想法。四盞燈的傳說你聽過吧？如果你真的是晨星之子，點亮四盞燈、打開天織塔，就能證明你不是什麼「崩解之子」。', "I've got an idea. You know the legend of the four lanterns? If you really are the Dawnbearer, light the four lanterns, open the Skyloom, and you'll prove you're no Child of Ruin."));
  await E.say('佩兒', L('最近的一盞是「水之燈」，在東北邊的河光神殿。先去東邊的鴿巢鎮打聽看看吧。', "The nearest is the Water Lantern, at the Riverlight Temple to the north-east. Let's ask around in Dovecote, to the east."));
  S.flags.ch2_done = true;
});

// stubs for scenes written further on
for (const id of ['wren_fallen', 'wren_home', 'bf_man2', 'bf_woman2', 'smith', 'sol_occupied', 'sol_fallen1', 'sol_fallen2', 'sol_wanted', 'ending_scenes']) if (!SCRIPTS[id]) def(id, async (E) => { await E.say(null, '...'); });
void member; void has; void stats; void heroName;

// =====================================================================================
// chapter 3: Dovecote and the Riverlight Temple
// =====================================================================================
const innAt = (price) => async (E) => { await E.inn(price); };
def('dove_inn_keeper', innAt(14)); def('gull_inn_keeper', innAt(20)); def('sand_inn_keeper', innAt(28)); def('snow_inn_keeper', innAt(36));
def('dove_shop', shopTalk('dove')); def('gull_shop', shopTalk('gull')); def('sand_shop', shopTalk('sand', '鐵匠')); def('sand_item', shopTalk('snowitem'));
def('snow_shop', shopTalk('snow', '鐵匠')); def('snow_itemshop', shopTalk('snowitem'));
def('dv_fisher', async (E) => { await E.say('漁夫', L('河水變得又黑又臭，連魚都跑光了。都是從上游的河光神殿流下來的。', "The river's gone black and stinking, and the fish have all fled. It's coming down from the Riverlight Temple upstream.")); });
def('dv_girl', async (E) => { await E.say('女孩', L('米蕾拉姊姊每天都在教會裡祈禱。她是神殿的神官喔，可是神殿被魔物佔領了。', "Sister Mirela prays at the church every day. She's the temple's priestess, but monsters took the temple.")); });
def('dv_old', async (E) => { await E.say('老人', L('河光神殿守護著「水之燈」。燈一熄滅，整條河就會死掉。', 'The Riverlight Temple keeps the Water Lantern. If the lantern goes out, the whole river dies.')); });
def('dv_guard', async (E) => { await E.say('士兵', L('橋的另一邊就是往神殿的路。北邊的湖中央。', "Across the bridge is the road to the temple. In the middle of the lake to the north.")); });
def('dove_wife', async (E) => { await E.say('村民', L('我先生是船夫，最近都不敢出船了。', "My husband's a boatman. He doesn't dare take the boat out these days.")); });
def('dove_mayor', async (E) => { await E.say('鎮長', L('如果有人能救回神殿，鴿巢鎮全鎮都會感謝他的。', 'If someone could save the temple, all of Dovecote would be grateful.')); });
def('dove_trav', async (E) => { await E.say('商人', L('往東南走，就是海港城鎮海鷗港。那裡什麼都買得到喔。', 'South-east of here is Gullport, the harbour town. You can buy anything there.')); });
def('mirela_meet', async (E) => {
  if (S.flags.has_mirela) return;
  await E.say('米蕾拉', L('……光啊，請守護河光神殿……', '...O light, protect the Riverlight Temple...'));
  await E.say('米蕾拉', L('啊，對不起，我太專心了。我是米蕾拉，河光神殿的神官。', "Oh, I'm sorry, I was lost in prayer. I am Mirela, priestess of the Riverlight Temple."));
  await E.say('米蕾拉', L('一個月前，泥沼裡爬出了可怕的魔物，佔領了神殿。牠們想吞掉「水之燈」的光。我一個人……什麼也做不到。', 'A month ago, terrible monsters crawled out of the mire and took the temple. They want to swallow the light of the Water Lantern. Alone... I could do nothing.'));
  E.sfx('holy');
  await E.say('米蕾拉', L('……！你的手！那是晨星之印……！神殿的經文裡寫著：晨星之子會點亮四盞燈，打開天織之門。', '...! Your hand! That is the Dawnmark...! The temple scriptures say the Dawnbearer will light the four lanterns and open the gate of the Skyloom.'));
  await E.say('佩兒', L('看吧，我就說嘛。大祭司那老頭說的才是假話。', 'See? Told you. That old High Seer was the one lying.'));
  await E.say('米蕾拉', L('請讓我跟你們一起走。只要有神官的祈禱，就能打開神殿奧殿的門。', "Please let me come with you. A priestess's prayer will open the sanctum doors."));
  E.removeEnt('mirela_ch');
  E.join('mirela', 8);
  await E.say(null, L('米蕾拉加入了隊伍！', 'Mirela joins the party!'));
  S.flags.dove_done = true;
});
def('mirequeen', async (E) => {
  await E.say('米蕾拉', L('水之燈就在祭壇上……可是，那團黑影……！', "The Water Lantern is on the altar... but that black shape...!"));
  E.shake(16); E.sfx('bubble');
  await E.say('？？？', L('咕嚕嚕……光……好吃的光……誰都不准拿走……', 'Glub glub... the light... tasty light... no one takes it...'));
  const r = await E.battle('mirequeen', { music: 'boss' });
  if (r !== 'win') return false;
  await getLantern(E, 'lantern_w', L('水之燈', 'Water Lantern'), '#68b8f8');
  await E.say('米蕾拉', L('河水會慢慢變乾淨的。……謝謝你們。', 'The river will slowly run clear again. ...Thank you.'));
  await E.say('米蕾拉', L('下一盞是「火之燈」，在東南海上的燼島。要渡海，就得去海鷗港找船。', 'The next is the Fire Lantern, on Smolder Isle in the south-eastern sea. To cross, we must find a ship at Gullport.'));
  S.flags.ch3_done = true;
});
async function getLantern(E, id, name, col) {
  E.removeEnt(id);
  await E.flash(col, 20);
  E.sfx('treasure');
  E.give(id);
  await E.say(null, L(`得到了「${name}」！`, `Obtained the ${name}!`));
  const all = ['lantern_w', 'lantern_f', 'lantern_e', 'lantern_i'].every((k) => S.inv[k]);
  if (all && !S.flags.lanterns) {
    S.flags.lanterns = true;
    E.sfx('chime');
    await E.say(null, L('四盞燈同時亮了起來，光芒合而為一，指向世界的正中央。\n——天織塔的封印解開了。', 'All four lanterns flare at once. Their light becomes one beam, pointing to the centre of the world.\nThe seal on the Skyloom is broken.'));
  }
}
def('lantern_got', async () => {});

// =====================================================================================
// chapter 4: Gullport, Brannoc and Smolder Isle
// =====================================================================================
def('gl_sailor', async (E) => { await E.say('水手', L('出海？別開玩笑了，外面全是魔物。除非船長點頭。', 'Put to sea? Are you mad? It\'s all monsters out there. Not unless the captain says so.')); });
def('gl_captain', async (E) => {
  if (S.flags.boat) { await E.say('船長', L('那艘小帆船就交給你們了。燼島在東南方，別翻船了啊！', "The little sailboat's yours. Smolder Isle is south-east. Don't capsize!")); return; }
  if (S.flags.has_odo) { await E.say('船長', L('歐多那傢伙替你們擔保了？哈，那就沒辦法了。', "Odo vouched for you? Ha, then I've no choice.")); return; }
  await E.say('船長', L('我的船不載來路不明的人。沒有通行證，什麼都免談。……除非有我信得過的人替你們擔保。', "My boat doesn't take strangers. No pass, no talk. ...Unless someone I trust vouches for you."));
});
def('gl_w', async (E) => { await E.say('村民', L('酒館裡有個很會做菜的大個子，聽說以前是武僧呢。', "There's a big fellow in the tavern who cooks like a dream. They say he used to be a monk.")); });
def('gl_m', async (E) => { await E.say('村民', L('燼島的火山最近一直在冒煙。老人們說，火之燈在哭。', 'The volcano on Smolder Isle has been smoking. The old folk say the Fire Lantern is weeping.')); });
def('gl_fish', async (E) => { await E.say('漁夫', L('船可以去很多地方喔。南邊的沙漠、北邊的雪國，都要坐船才到得了。', 'A boat can go lots of places. The desert to the south, the snow country to the north: you need a boat for both.')); });
def('gl_drinker', async (E) => { await E.say('水手', L('嗝。騎士團的人在找什麼通緝犯呢。……嗯？你的臉好像在哪看過。', "Hic. The Order's lot are hunting some fugitive. ...Hm? Your face looks familiar.")); });
def('gl_dancer', async (E) => { await E.say('舞者', L('歐多做的海鮮湯，是全海鷗港最好吃的喔。', "Odo's seafood stew is the best in all of Gullport.")); });
def('gull_old', async (E) => { await E.say('老婦人', L('雪國的人，冬天會穿用沙漠的火羊毛做的斗篷。不然在那暴風雪裡，一步也走不動。', 'In the snow country they wear cloaks of desert fire-wool. Without one you cannot take a step in that blizzard.')); });
def('odo_meet', async (E) => {
  if (S.flags.fallen) { await SCRIPTS.odo_fallen(E); return; }
  if (S.flags.has_odo) return;
  await E.say('歐多', L('喲！客人，要吃點什麼？今天的海鮮湯可是極品喔！', 'Hey there! What can I get you? Today\'s seafood stew is a masterpiece!'));
  await E.say('歐多', L('……嗯？那隻手上的光……', '...Hm? That light on your hand...'));
  await E.say('歐多', L('我以前在山裡修行的時候，師父說過：「有一天，帶著星星的孩子會經過你的門前。那時候，就跟著他走吧。」', 'When I trained in the mountains, my master told me: "One day a child carrying a star will pass your door. When he does, follow him."'));
  await E.say('歐多', L('我還以為是老頭子在說夢話呢！哈哈哈！好，要出海是吧？船長是我的老朋友，交給我吧。', "I thought the old man was talking in his sleep! Ha ha ha! Right, you want to put to sea? The captain's an old friend. Leave it to me."));
  E.removeEnt('odo_t');
  E.join('odo', 12);
  await E.say(null, L('歐多加入了隊伍！', 'Odo joins the party!'));
  if (S.members.length + S.reserve.length > 4) await E.say(null, L('（戰鬥時最多四人上場。可以在選單的「隊伍」中更換出戰的同伴。）', '(Up to four fight at once. Change who fights under "Party" in the menu.)'));
  await SCRIPTS.odo_after_join(E);
});
def('brannoc_duel', async (E) => {
  E.music('march');
  await E.say('？？？', L('終於追到了。', 'At last.'));
  const b = E.spawn({ type: 'npc', id: 'brannoc_d', sprite: 'darkknight', x: 20, y: 12, dir: 'r' });
  await E.walk(b, 'rrr', 1);
  await E.say('布藍諾', L('我是索爾海文騎士團的隊長，布藍諾。崩解之子洛恩——奉國王之命，逮捕你。', 'I am Brannoc, captain of the Order of Solhaven. Rowan, Child of Ruin: by the King\'s command, you are under arrest.'));
  await E.say('佩兒', L('又是你！我們才剛點亮了水之燈，河都變乾淨了，你看不見嗎？', "You again! We just lit the Water Lantern and the river's running clean. Are you blind?"));
  await E.say('布藍諾', L('……我只服從命令。拔劍吧。', '...I follow orders. Draw your sword.'));
  const r = await E.battle('brannoc', { music: 'boss', noFlee: true });
  if (r !== 'win') return false;
  await E.say('布藍諾', L('……好強的劍。', '...A strong sword.'));
  await E.say('布藍諾', L('剛才，你明明可以砍下最後一劍。……為什麼停手？', 'Just now you could have struck the last blow. ...Why did you stop?'));
  await E.say('洛恩', L('（洛恩靜靜地收起了劍。）', '(Rowan quietly sheathes his sword.)'));
  await E.say('布藍諾', L('崩解之子，不會饒恕敵人。……大祭司說的話，也許不是全部的真相。', 'A Child of Ruin would not spare his enemy. ...Perhaps the High Seer did not tell the whole truth.'));
  await E.say('布藍諾', L('我要用自己的眼睛確認。……後會有期。', 'I will see with my own eyes. ...Until we meet again.'));
  await E.walk(b, 'llllll', 2);
  E.removeEnt(b);
  E.music('port');
  const c = E.ent('gl_captain');
  await E.say('船長', L('哎呀呀，好險。歐多，這就是你說的小子們？……好吧，碼頭邊那艘小帆船借你們。燼島在東南方的海上。', "Whew, that was close. Odo, these are your kids? ...Fine. Take the little sailboat by the dock. Smolder Isle is out in the south-eastern sea."));
  void c;
  S.flags.boat = true;
  E.placeRideNear('boat', 53, 30);
  await E.say(null, L('可以搭船了！走到船上就能出航。', 'You have a boat! Walk onto it to set sail.'));
});
def('emberwraith', async (E) => {
  E.shake(20); E.sfx('fire');
  await E.say('歐多', L('好燙！祭壇上的火……在動！', "Hot! The fire on the altar... it's moving!"));
  const r = await E.battle('emberwraith', { music: 'boss' });
  if (r !== 'win') return false;
  await getLantern(E, 'lantern_f', L('火之燈', 'Fire Lantern'), '#f87830');
  await E.say('歐多', L('呼……肚子都餓了。下一盞是「地之燈」吧？聽說在南邊沙漠的沙梅爾王國。', "Phew... I've worked up an appetite. The next is the Earth Lantern, isn't it? They say it's in the kingdom of Sandmere, in the southern desert."));
  S.flags.ch4_done = true;
});

// =====================================================================================
// chapter 5: Sandmere and the Dune Ruins
// =====================================================================================
def('sd_guard', async (E) => { await E.say('衛兵', L('女王陛下在王宮裡。', 'Her Majesty is in the palace.')); });
def('sd_dancer', async (E) => { await E.say('舞者', L('王宮裡的瑟菈大人，三年前被發現倒在沙漠裡，什麼都不記得了。可是魔法超厲害的喔！', "Lady Sera at the palace was found collapsed in the desert three years ago. She remembered nothing, but her magic is incredible!")); });
def('sd_kid', async (E) => { await E.say('男孩', L('遺跡裡有一隻會把人變成石頭的大蜥蜴！我才不怕呢……我才不怕……', "There's a giant lizard in the ruins that turns people to stone! I'm not scared... not scared at all...")); });
def('sand_queen', async (E) => {
  if (S.flags.fallen) { await E.say('沙梅爾女王', S.flags.leo_dead ? L('布藍諾大人拯救了我們。請帶著他一起去吧。', 'Sir Brannoc saved us. Please, take him with you.') : L('城門外……獅首的將軍……！', 'Outside the gates... a lion-headed general...!')); return; }
  if (S.flags.ch5_done) { await E.say('沙梅爾女王', L('北方的雪國，就拜託你們了。', 'The snow country in the north is in your hands.')); return; }
  await E.say('沙梅爾女王', L('歡迎來到沙梅爾。……晨星之子？呵呵，河光神殿的神官已經派信鴿告訴我了。', "Welcome to Sandmere. ...The Dawnbearer? Ho ho, the Riverlight priestess already sent word by dove."));
  await E.say('沙梅爾女王', L('地之燈沉睡在東南方的沙中遺跡。我們的祖先封住了那裡，因為裡面住著一隻石化蜥蜴。', 'The Earth Lantern sleeps in the Dune Ruins to the south-east. Our ancestors sealed them, for a basilisk dwells inside.'));
  await E.say('沙梅爾女王', L('如果你們要去，請帶上瑟菈。那孩子……總說她在夢裡看見一座光之塔。', 'If you go, take Sera. That girl... she always says she sees a tower of light in her dreams.'));
});
def('sera_meet', async (E) => {
  if (S.flags.has_sera) return;
  await E.say('瑟菈', L('……你，就是我夢裡的那顆星星嗎？', '...Are you the star from my dreams?'));
  await E.say('瑟菈', L('我是瑟菈。三年前在沙漠裡醒來，除了名字，什麼都不記得。……可是每天晚上，都有一個光之女人在夢裡叫我：「去找那個孩子。」', "I am Sera. Three years ago I woke in the desert, remembering nothing but my name. ...But every night a woman of light calls to me in my dreams: \"Find the child.\""));
  await E.say('瑟菈', L('帶我一起去吧。我會用魔法回報你們的。……也許在旅途的盡頭，我能想起自己是誰。', "Take me with you. I'll repay you with magic. ...Perhaps at the end of the road I'll remember who I am."));
  E.removeEnt('sera_p');
  E.join('sera', 16);
  await E.say(null, L('瑟菈加入了隊伍！', 'Sera joins the party!'));
});
def('basilisk', async (E) => {
  E.sfx('quake');
  await E.say('瑟菈', L('小心，牠的眼睛……！不要直視！', "Careful, its eyes...! Don't look straight at them!"));
  const r = await E.battle('basilisk', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('佩兒', L('呼。前面的路通了。', 'Phew. The way ahead is clear.'));
});
def('clayborn', async (E) => {
  E.shake(24); E.sfx('quake');
  await E.say('瑟菈', L('地面在說話……「回去」……不，是「你終於來了」……？', 'The ground is speaking... "go back"... no, "at last you came"...?'));
  const r = await E.battle('clayborn', { music: 'boss' });
  if (r !== 'win') return false;
  await getLantern(E, 'lantern_e', L('地之燈', 'Earth Lantern'), '#e8c058');
  await E.say('瑟菈', L('……燈的光裡，我好像看見了。一座塔，一個織著光的女人……她在叫我「孩子」。', "...In the lantern's light, I think I saw it. A tower, and a woman weaving light... she called me \"child\"."));
  await E.say('瑟菈', L('最後一盞是「霜之燈」，在北方的雪國。女王說過，那裡的暴風雪要穿火羊毛斗篷才走得過去。', 'The last is the Frost Lantern, in the snow country to the north. The Queen said you need a cloak of fire-wool to get through the blizzard there.'));
  S.flags.ch5_done = true;
  E.give('rimecloak'); S.flags.cloak = true; E.sfx('treasure');
  await E.say(null, L('回到王宮，女王送了「禦寒斗篷」作為謝禮！', 'Back at the palace, the Queen gives you a Rime Cloak in thanks!'));
});

// =====================================================================================
// chapter 6: Snowveil, Brannoc and the Frostcrown
// =====================================================================================
def('sn_kid', async (E) => { await E.say('女孩', L('雪人做好了！……你們是從南邊來的嗎？好厲害，暴風雪那麼大。', "Snowman's done! ...You came from the south? Wow, with the blizzard so bad?")); });
def('sn_hunter', async (E) => { await E.say('獵人', L('霜冠洞窟在東北方。最深處住著一條冰龍，霜之燈就在牠的身後。', 'The Frostcrown is to the north-east. An ice dragon lives in its depths, and the Frost Lantern lies behind it.')); });
def('sn_old', async (E) => { await E.say('老婦人', L('村口的雕像，是很久以前的晨星之子喔。千年前，他也點亮了四盞燈。', 'The statue by the gate is the Dawnbearer of long ago. A thousand years back, he too lit the four lanterns.')); });
def('snow_elder', async (E) => {
  if (S.flags.fallen) { await E.say('長老', L('那位魔女大人每天都站在雕像前，望著南方的天空。', 'The witch stands before the statue every day, looking at the southern sky.')); return; }
  await E.say('長老', L('晨星之子，歡迎。……天織塔的守護者織母大人，已經衰弱了好多年。', 'Welcome, Dawnbearer. ...The Weaver, keeper of the Skyloom, has been weakening for many years.'));
  await E.say('長老', L('有什麼東西在吃她的絲線。從塔的內部。……小心你們身邊的人。', 'Something is eating her threads. From inside the tower. ...Beware those close to you.'));
  if (S.flags.lanterns && !S.flags.windbell) await E.say('長老', L('四盞燈都亮了嗎。……那麼，還需要東方風鈴鎮的「風之鈴」。織母的門，只為鈴聲而開。', 'All four lanterns are lit? ...Then you still need the Wind Bell of Chimeholm in the east. The Weaver\'s door opens only to its song.'));
});
def('brannoc_join', async (E) => {
  E.music('resolve');
  const b = E.spawn({ type: 'npc', id: 'brannoc_j', sprite: 'darkknight', x: 14, y: 24, dir: 'u' });
  await E.walk(b, 'u', 1);
  await E.say('布藍諾', L('……等等。我不是來打架的。', "...Wait. I haven't come to fight."));
  await E.say('布藍諾', L('那天之後，我回了王都。我看見大祭司的「先知們」在地下室裡舉行黑色的儀式。國王被下了咒，整天對著空氣說話。', 'After that day I went back to the capital. I saw the High Seer\'s "prophets" holding black rites in the cellars. The King is under a spell; he talks to empty air all day.'));
  await E.say('布藍諾', L('我發過誓，要守護索爾海文的光。……真正的光，在你們這邊。', 'I swore to protect the light of Solhaven. ...The true light is on your side.'));
  await E.say('布藍諾', L('請讓我同行。從今天起，我的劍和盾，都屬於晨星之子。', "Let me come with you. From today, my sword and shield belong to the Dawnbearer."));
  await E.say('佩兒', L('……哼，算你有眼光。', "...Hmph. Good eye, I suppose."));
  E.removeEnt(b);
  E.join('brannoc', 20);
  await E.say(null, L('布藍諾加入了隊伍！', 'Brannoc joins the party!'));
});
def('rimewyrm', async (E) => {
  E.sfx('ice'); E.shake(16);
  await E.say('布藍諾', L('冰龍……！全員，散開！', 'The ice dragon...! Everyone, spread out!'));
  const r = await E.battle('rimewyrm', { music: 'boss' });
  if (r !== 'win') return false;
  await getLantern(E, 'lantern_i', L('霜之燈', 'Frost Lantern'), '#e8f8ff');
  await E.say('米蕾拉', L('天織塔在內海中央的島上。去吧，洛恩。去證明你是誰。', 'The Skyloom stands on the island in the middle of the inner sea. Go, Rowan. Go and show them who you are.'));
  await E.say('瑟菈', L('……等一下。我在夢裡聽過：天織塔的門，要聽見「風之鈴」的歌聲才會打開。', '...Wait. I heard it in a dream: the door of the Skyloom opens only to the song of the Wind Bell.'));
  await E.say('布藍諾', L('風之鈴……東方海上的風鈴鎮，有一口守護鎮子的古鈴。先去那裡吧。', 'The Wind Bell... Chimeholm, across the eastern sea, has an ancient bell that guards the town. We should go there first.'));
  S.flags.ch6_done = true;
});

// =====================================================================================
// chapter 7: the Skyloom
// =====================================================================================
def('loomwarden', async (E) => {
  E.sfx('chime');
  await E.say('聲音', L('……晨星之印的持有者。在見織母之前，讓我看看你的光。', '...Bearer of the Dawnmark. Before you see the Weaver, show me your light.'));
  const r = await E.battle('loomwarden', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('聲音', L('……很好。進去吧。', '...Good. Go in.'));
});
def('weaver', async (E) => {
  E.music('memory');
  await E.say('織母', L('……你終於來了，晨星之子。還有……瑟菈。我的孩子。', '...At last you have come, Dawnbearer. And... Sera. My child.'));
  await E.say('瑟菈', L('……！我……我想起來了……我是……織母大人的弟子……', '...! I... I remember... I am... the Weaver\'s apprentice...'));
  await E.say('織母', L('三年前，我把你送出塔外，去尋找晨星之子。因為塔裡，已經藏著「解織者」了。', 'Three years ago I sent you out of the tower to find the Dawnbearer. For the Unweaver was already hiding within.'));
  await E.say('織母', L('解織者是世界誕生之前的虛無。牠想把所有的絲線拆開，讓一切回到「什麼都沒有」的時候。牠藏在一個人的心裡……', 'The Unweaver is the void from before the world was born. It wants to unpick every thread and return all to nothing. It hides in a human heart...'));
  await E.say('大祭司莫洛', L('——就是我的心。', '—In my heart.'));
  const m = E.spawn({ type: 'npc', id: 'morrow_l', sprite: 'priest', x: 9, y: 14, dir: 'u' });
  E.music('evil');
  await E.walk(m, 'uuuu', 1);
  await E.say('大祭司莫洛', L('謝謝你們，晨星之子。天織塔的封印，只有四盞燈的光才能打開。我一個人，怎麼也進不來呢。', 'Thank you, Dawnbearer. The seal on the Skyloom opens only to the light of the four lanterns. On my own I could never get in.'));
  await E.say('布藍諾', L('莫洛……！你這傢伙！', 'Morrow...! You!'));
  await E.say('大祭司莫洛', L('「崩解之子」嗎……不，我沒有說謊喔。這孩子來了，天織就會崩塌。……因為他會帶我來這裡。', '"Child of Ruin"... no, I did not lie. When this boy came, the Skyloom would fall. ...Because he would bring me here.'));
  const r = await E.battle('morrow1', { music: 'final', canLose: true, endAfter: 2, noFlee: true, noPep: true, intro: [L('莫洛身上散發出可怕的壓力！', 'A terrible pressure pours from Morrow!')] });
  void r;
  E.fullHealParty();
  E.shake(30); E.sfx('abyss');
  await E.say('大祭司莫洛', L('沒用的。……晨星之印的光，現在歸我了。', 'Useless. ...The light of the Dawnmark is mine now.'));
  await E.flash('#000000', 30);
  await E.say(null, L('黑色的劍刺進洛恩的左手。印記的光，被一點一點地吸走了。', "A black blade pierces Rowan's left hand. The mark's light drains away, little by little."));
  await E.say('織母', L('不——！瑟菈！帶著大家，離開這裡！', 'No—! Sera! Take them all, get out of here!'));
  await E.say('瑟菈', L('織母大人——！', 'Weaver—!'));
  E.music(null); E.sfx('quake'); E.shake(60);
  await E.say(null, L('天織塔發出了斷裂的聲音。千萬條光之絲線，一條一條地斷開——', 'The Skyloom gives a sound like snapping. Ten thousand threads of light break, one by one—'));
  await E.flash('#ffffff', 60);
  await E.fadeOut(60);
  await SCRIPTS.the_fall(E);
});
def('the_fall', async (E) => {
  S.flags.ch7_done = true; S.flags.fallen = true;
  // everyone is scattered; only Rowan wakes in Brightfall
  S.flags.lost = [...S.members, ...S.reserve].filter((m) => m.id !== 'rowan').map((m) => m.id);
  for (const id of S.flags.lost) E.leave(id);
  E.stash(S.flags.lost);
  S.ride = null;
  E.heal();
  E.music('sad');
  await E.say(null, L('……', '...'));
  await E.say(null, L('那一天，天織塔從世界上消失了。\n天空被黑暗覆蓋，太陽再也沒有升起。', 'That day, the Skyloom vanished from the world.\nDarkness covered the sky, and the sun rose no more.'));
  await E.say(null, L('在塔原來的地方，浮起了一座漆黑的城堡。', 'Where the tower had stood, a pitch-black castle floated in the air.'));
  await E.warp('bf_home', 3, 4, 'd', true);
  await E.fadeIn(60);
  await SCRIPTS.wake_fallen(E);
});
def('wake_fallen', async (E) => {
  await E.say('小雀', L('洛恩……？洛恩！你醒了！', 'Rowan...? Rowan! You\'re awake!'));
  await E.say('小雀', L('你昏迷了一個月了。是漁夫在瀑布下面發現你的……從天上掉下來的，跟十六年前一樣。', "You've been unconscious for a month. A fisherman found you below the falls... fallen from the sky, just like sixteen years ago."));
  await E.say('小雀', L('天空一直是黑的。魔物越來越兇，好多村子都被毀了。托賓爺爺……去了王都，想求國王想辦法，可是到現在都沒有回來。', "The sky's been black ever since. The monsters are fiercer, and so many villages are gone. Grandpa Tobin... went to the capital to beg the King for help, and he hasn't come back."));
  await E.say('小雀', L('你的手……印記的光，好微弱。', 'Your hand... the mark is so faint.'));
  await E.say('？？？', L('哈，果然在這裡！就知道你命硬。', 'Ha, knew you\'d be here! Too stubborn to die.'));
  E.spawn({ type: 'npc', id: 'pell_r', sprite: 'ranger_f', x: 7, y: 8, dir: 'u' });
  await E.say('佩兒', L('我找你找了好久。……我是落在王都附近的。聽說亮瀑村的瀑布下掉了一顆星星，我就猜是你。', "I've been looking for you forever. ...I came down near the capital. When I heard a star fell below the Brightfall falls, I knew it was you."));
  await E.say('佩兒', L('其他人也都還活著喔，我打聽到消息了。米蕾拉在鴿巢鎮照顧難民，歐多在海鷗港，布藍諾在沙漠王國，瑟菈在北方的雪國。', "The others are alive too, I've heard. Mirela's looking after refugees in Dovecote, Odo's in Gullport, Brannoc's in the desert kingdom, Sera's up north in the snow country."));
  await E.say('佩兒', L('而且……托賓爺爺，被關在王都的地下牢獄裡。國王也是。', "And... Grandpa Tobin's locked in the Undercroft beneath the capital. So is the King."));
  await E.say('小雀', L('……！', '...!'));
  await E.say('佩兒', L('走吧，英雄大人。把大家找回來，然後把那個大祭司揍飛。', "Let's go, hero. Get everyone back, then knock that High Seer into next week."));
  E.removeEnt('pell_r');
  E.unstash('pell');
  E.join('pell');
  await E.say(null, L('佩兒回到了隊伍！', 'Pell rejoins the party!'));
  S.flags.ch8 = true;
  E.music('lament');
});
// =====================================================================================
// chapter 8: the dark world and the reunions
// =====================================================================================
def('wren_fallen', async (E) => { await E.say('小雀', L('大家一定都在等你。……我也會一直在這裡等你回來。', 'They are all waiting for you. ...And I will be here, waiting for you to come home.')); });
def('wren_home', async (E) => { await SCRIPTS.wren_fallen(E); });
def('bf_man2', async (E) => { await E.say('村民', L('天黑了以後，連瀑布的聲音都變得好可怕。', 'Since the dark came, even the sound of the falls is frightening.')); });
def('bf_woman2', async (E) => { await E.say('村民', L('洛恩，你回來了……光好像還沒有完全離開你。', 'Rowan, you\'re back... the light hasn\'t quite left you, has it.')); });
def('smith', async (E) => {
  if (S.flags.dawnblade) { await E.say('鐵匠', L('晨星之劍，好好用它吧。', 'The Dawnblade. Use it well.')); return; }
  if (S.flags.star_iron) {
    await E.say('鐵匠', L('這是……星鐵！十六年前落下的那顆星星的碎片！交給我吧。', "This is... star-iron! A shard of the star that fell sixteen years ago! Leave it to me."));
    await E.fadeOut(30); E.sfx('hit'); await E.wait(20); E.sfx('hit'); await E.wait(20); E.sfx('crit'); await E.wait(30); await E.fadeIn(30);
    E.sfx('holy'); await E.flash('#fff8d0', 30);
    E.give('dawnblade'); S.flags.dawnblade = true;
    const r = S.members.find((m) => m.id === 'rowan');
    if (r) { if (r.equip.weapon) E.give(r.equip.weapon); r.equip.weapon = 'dawnblade'; E.give('dawnblade', -1); }
    await E.say(null, L('得到了「晨星之劍」！洛恩裝備了它。\n左手的印記，再次亮了起來。', 'Received the Dawnblade! Rowan takes it up.\nThe mark on his left hand shines once more.'));
    if (!S.flags.archive_open) await SCRIPTS.archive_call(E);
    else await E.say('瑟菈', L('……這樣就準備好了。吹響龍笛，飛向那座城吧。', '...Now we are ready. Blow the drake whistle, and fly to that castle.'));
    return;
  }
  await E.say('鐵匠', L('武器？抱歉，現在連鐵都沒有了。除非……天上掉下什麼好東西來。', 'Weapons? Sorry, there\'s not even iron left. Unless... something good falls from the sky.'));
});
def('star_iron', async (E, e) => {
  e.gone = true; S.flags.star_iron = true;
  E.sfx('treasure'); await E.flash('#fff8d0', 20);
  await E.say(null, L('星坑的中心，埋著一塊微微發光的金屬。\n得到了「星鐵」！', 'In the heart of the crater lies a faintly glowing metal.\nYou found the star-iron!'));
  await E.say('瑟菈', L('拿去亮瀑村的鐵匠那裡吧。', 'Take it to the smith in Brightfall.'));
});
def('sol_occupied', async (E) => { await E.say('解織教徒', L('索爾海文已經是解織者大人的城了。滾開。', 'Solhaven belongs to the Unweaver now. Begone.')); });
def('sol_fallen1', async (E) => { await E.say('村民', L('教徒們把反抗的人都關進了地下牢獄……聽說那裡有黑色的狼在看守。', "The cultists threw everyone who resisted into the Undercroft... they say black wolves guard it.")); });
def('sol_fallen2', async (E) => { await E.say('老婦人', L('河岸邊的排水口，還可以進去喔……', 'The drain by the riverbank... you can still get in that way...')); });
def('sol_wanted', async (E) => { await E.say('士兵', L('……逃犯？我什麼也沒看見。', "...Fugitive? I didn't see a thing.")); });
def('alphawolf', async (E) => {
  E.sfx('abyss');
  await E.say('佩兒', L('就是牠……！看守牢獄的黑狼！', "That's it...! The black wolf guarding the prison!"));
  const r = await E.battle('alphawolf', { music: 'boss' });
  if (r !== 'win') return false;
  await E.fadeOut(30);
  await E.fadeIn(30);
  await E.say('托賓爺爺', L('……洛恩？是洛恩嗎……！', '...Rowan? Is that you, Rowan...!'));
  await E.say('托賓爺爺', L('哈哈……我這把老骨頭，還能再見到你……', 'Ha ha... these old bones got to see you again...'));
  await E.say('歐瑞爾王', L('……洛恩。我被莫洛的咒術矇蔽，竟然把晨星之子關進了牢裡。原諒我。', '...Rowan. Blinded by Morrow\'s spell, I threw the Dawnbearer into a cell. Forgive me.'));
  await E.say('歐瑞爾王', L('至少讓我給你們這些。這是王家寶庫裡最後的東西了。', 'At least let me give you these. They are the last things in the royal treasury.'));
  E.give('knightsword'); E.give('mirrorshield'); E.sfx('treasure');
  await E.say(null, L('得到了「騎士劍」和「魔鏡之盾」！', 'Received the Knightly Blade and the Mirror Shield!'));
  await E.say('托賓爺爺', L('我們會想辦法回亮瀑村。……去吧，洛恩。', "We'll find our way back to Brightfall. ...Go, Rowan."));
  S.flags.tobin_saved = true;
});
def('dv_camp', async (E) => { await E.say('士兵', L('米蕾拉大人去了河光神殿。說是那裡有疫病的源頭……一個人去的。', 'Lady Mirela went to the Riverlight Temple. She said the source of the plague is there... alone.')); });
def('dv_ref1', async (E) => { await E.say('村民', L('米蕾拉大人每天都在照顧病人，自己都沒怎麼睡……', 'Lady Mirela tends the sick every day. She barely sleeps...')); });
def('dv_ref2', async (E) => { await E.say('老人', L('天黑以後，河又變黑了。', 'Since the dark came, the river has turned black again.')); });
def('dv_ref3', async (E) => { await E.say('小孩', L('太陽什麼時候才會回來？', 'When is the sun coming back?')); });
def('abbot', async (E) => {
  const mm = E.spawn({ type: 'npc', id: 'mirela_r', sprite: 'healer_f', x: 9, y: 4, dir: 'd' });
  await E.say('米蕾拉', L('洛恩……！大家！來得正好，疫病的源頭就是牠——！', 'Rowan...! Everyone! Just in time, that thing is the source of the plague—!'));
  E.removeEnt(mm);
  E.unstash('mirela'); E.join('mirela');
  await E.say(null, L('米蕾拉回到了隊伍！', 'Mirela rejoins the party!'));
  const r = await E.battle('plagueabbot', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('米蕾拉', L('……謝謝你們。我一直相信，你們會回來的。', "...Thank you. I always believed you'd come back."));
});
def('odo_fallen', async (E) => {
  if (S.flags.odo_back) return;
  await E.say('歐多', L('喲！洛恩！哈哈哈，我就知道！來，先喝碗湯！', "Hey! Rowan! Ha ha ha, I knew it! Here, have a bowl of stew first!"));
  await E.say('歐多', L('……港口被一隻巨大的海妖堵住了。船出不去，糧食也進不來。我一直在等，等一起揍牠的夥伴。', "...A giant kraken has the harbour blocked. No ships out, no food in. I've been waiting for friends to thump it with."));
  E.removeEnt('odo_t');
  E.unstash('odo'); E.join('odo');
  S.flags.odo_back = true;
  await E.say(null, L('歐多回到了隊伍！', 'Odo rejoins the party!'));
  await E.say('歐多', L('去碼頭吧！', 'To the docks!'));
});
def('deepkraken', async (E) => {
  if (S.flags.kraken_dead) return;
  E.sfx('bubble'); E.shake(20);
  await E.say('歐多', L('出來了！', "Here it comes!"));
  const r = await E.battle('deepkraken', { music: 'boss', bgZone: 'sea' });
  if (r !== 'win') return false;
  S.flags.kraken_dead = true;
  await E.say('船長', L('海妖被打倒了！……小帆船修好了，拿去吧！', "The kraken's beaten! ...The little sailboat's mended. She's yours!"));
  E.placeRideNear('boat', 53, 30);
});
def('gl_fallen1', async (E) => { await E.say('水手', L('海妖在的時候，連出港都不行。', "With the kraken out there, nobody leaves port.")); });
def('gl_fallen2', async (E) => { await E.say('村民', L('歐多先生每天煮湯給大家喝。', 'Mister Odo makes soup for everyone every day.')); });
def('leocephas', async (E) => {
  if (S.flags.leo_dead) return;
  E.music('danger');
  const b = E.spawn({ type: 'npc', id: 'brannoc_s', sprite: 'darkknight', x: 15, y: 10, dir: 'd' });
  await E.say('布藍諾', L('……洛恩！你們來了！獅首的將軍帶著魔物攻進來了，我一個人快撐不住了！', '...Rowan! You came! The lion-headed general has led his monsters in. I can\'t hold alone much longer!'));
  E.removeEnt(b);
  E.unstash('brannoc'); E.join('brannoc');
  await E.say(null, L('布藍諾回到了隊伍！', 'Brannoc rejoins the party!'));
  const r = await E.battle('leocephas', { music: 'boss' });
  if (r !== 'win') return false;
  S.flags.leo_dead = true;
  await E.say('布藍諾', L('……多謝。這一次，換我欠你們了。', '...My thanks. This time, I owe you.'));
});
def('sera_waits', async (E) => {
  await E.say('瑟菈', L('……你們來了。我全都想起來了。', '...You came. I remember everything now.'));
  await E.say('瑟菈', L('織母大人用最後的力量，把一條絲線藏在了霜冠洞窟的冰之心裡。可是，莫洛派了「記憶的惡魔」守在那裡。', "With the last of her strength, the Weaver hid one thread in the Ice Heart of the Frostcrown. But Morrow sent a Memory Fiend to guard it."));
  await E.say('瑟菈', L('帶我去吧。那是我的老師留給我們的，最後的希望。', 'Take me there. It is the last hope my teacher left us.'));
  E.removeEnt('sera_w');
  E.unstash('sera'); E.join('sera');
  S.flags.sera_back = true;
  await E.say(null, L('瑟菈回到了隊伍！', 'Sera rejoins the party!'));
});
def('archfiend', async (E) => {
  if (!S.flags.sera_back) { await E.say(null, L('冰之心的深處，有什麼在蠢動。……瑟菈也許知道些什麼。', 'Something stirs deep in the Ice Heart. ...Sera might know about it.')); S.flags.final_begun = false; S.flags.fiend_dead = false; return; }
  E.sfx('abyss');
  await E.say('瑟菈', L('就是牠……吃掉我記憶的東西！', "That's it... the thing that ate my memories!"));
  const r = await E.battle('archfiend', { music: 'boss' });
  if (r !== 'win') { S.flags.fiend_dead = false; return; }
  E.sfx('chime'); await E.flash('#fff8d0', 30);
  await E.say('織母', L('……瑟菈。晨星之子。聽得見嗎……', '...Sera. Dawnbearer. Can you hear me...'));
  await E.say('織母', L('解織者還沒能拆開最後的絲線。牠的城浮在天上，你們需要天龍的翅膀，還有用星鐵打造的劍。', 'The Unweaver has not yet unpicked the last thread. Its castle floats in the sky. You need the wings of the sky drake, and a sword forged of star-iron.'));
  await E.say('織母', L('星鐵，就埋在十六年前那顆星星落下的地方……', 'The star-iron lies where the star fell, sixteen years ago...'));
  E.give('whistle'); S.flags.drake = true; S.flags.forge_quest = true; E.sfx('treasure');
  await E.say(null, L('得到了「龍笛」！在世界地圖上使用，天龍就會飛來。', 'Received the Drake Whistle! Use it on the world map and the sky drake will come.'));
  await E.say('瑟菈', L('去望星岩的山頂吧。那裡有星鐵。', 'Let us go to the top of Lookout Crag. The star-iron is there.'));
});

// =====================================================================================
// chapter 9: the Unspun Citadel
// =====================================================================================
def('gloomwyrm', async (E) => {
  E.sfx('quake'); E.shake(30);
  await E.say('布藍諾', L('雙頭龍……莫洛的看門狗嗎！', 'A two-headed dragon... Morrow\'s watchdog!'));
  const r = await E.battle('gloomwyrm', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('歐多', L('呼……前面就是王座了。', 'Phew... the throne is just ahead.'));
});
def('morrow_final', async (E) => {
  if (S.flags.morrow_dead) return;
  E.music('evil');
  await E.say('大祭司莫洛', L('……來了嗎。被拆散的絲線，竟然又一條一條地織回去了。', '...So you came. Threads I unpicked, woven back together one by one.'));
  await E.say('大祭司莫洛', L('為什麼要掙扎？一切終將歸於虛無。沒有生，就沒有死；沒有光，就沒有失去光的痛苦。', 'Why struggle? All things return to nothing. No life, and so no death; no light, and so no pain of losing it.'));
  await E.say('洛恩', L('（洛恩舉起了晨星之劍。）', '(Rowan raises the Dawnblade.)'));
  await E.say('米蕾拉', L('失去的痛，是因為曾經擁有過。我們不會放手的。', 'Losing hurts because we once had something. We will not let go.'));
  await E.say('大祭司莫洛', L('……那就一起消失吧。', '...Then vanish together.'));
  const r = await E.battle('morrow2', { music: 'final' });
  if (r !== 'win') { S.flags.final_begun = false; return; }
  if (S.inv.morrowname) {
    E.music('lament');
    await E.say('洛恩', L('（洛恩拿出了那條褪色的絲線，喊出了上面的名字。）\n「馬提亞斯！」', '(Rowan holds up the faded thread and calls the name stitched on it.)\n"Mattias!"'));
    E.sfx('chime'); await E.flash('#fff8d0', 20);
    await E.say('馬提亞斯', L('……那個名字……好久……沒有人叫過了……', '...That name... it has been so long... since anyone called it...'));
    await E.say('馬提亞斯', L('娜兒……爸爸做了好可怕的事……我只是……不想再失去任何東西……', 'Nell... Papa has done such terrible things... I only... did not want to lose anything ever again...'));
    if (has('mirela')) await E.say('米蕾拉', L('馬提亞斯先生。失去的痛，是因為愛過。……您的女兒，一定希望您好好地記得她。', 'Mister Mattias. Loss hurts because we loved. ...Your daughter would surely want you to remember her.'));
    await E.say('馬提亞斯', L('……謝謝你們。快……那東西要出來了……把它……徹底……', '...Thank you. Quickly... the thing is coming out... finish it... for good...'));
    S.flags.mattias_freed = true;
  }
  await E.say('大祭司莫洛', L('……呵……呵呵……這副軀殼……已經沒用了……', '...Heh... heh heh... this shell... has served its purpose...'));
  E.shake(40); E.sfx('rift');
  await E.say('解織者', L('——我，是一切之前的虛無。', '—I am the nothing that came before all things.'));
  E.sfx('holy'); await E.flash('#fff8d0', 20);
  E.heal();
  await E.say(null, L('晨星之印亮了起來，大家的傷口癒合了！', 'The Dawnmark flares, and everyone\'s wounds close!'));
  const r2 = await E.battle('unweaver', { music: 'final', intro: [L('莫洛的身體裂開，虛無從中湧出！', "Morrow's body splits, and the void pours out!")] });
  if (r2 !== 'win') { S.flags.final_begun = false; return; }
  await E.say('解織者', L('……光……又是光……', '...Light... always the light...'));
  E.shake(30); E.sfx('rift');
  const r3 = await E.battle(['unweaver2'], { music: 'final', boss: true, intro: [L('解織者伸出了無數的手臂！', 'The Unweaver spreads countless arms!')] });
  if (r3 !== 'win') { S.flags.final_begun = false; return; }
  E.sfx('chime'); await E.flash('#fff8d0', 30);
  await E.say('織母', L('……孩子們，我把最後的光借給你們。', '...Children, I lend you the last of my light.'));
  E.heal();
  await E.say(null, L('溫暖的光包圍了大家。體力與魔力都回復了！', 'A warm light surrounds everyone. HP and MP are fully restored!'));
  E.shake(40); E.sfx('abyss');
  await E.say('解織者・終焉', L('拆開吧……拆開吧……全部，全部……', 'Unpick... unpick... all of it, all of it...'));
  const r4 = await E.battle(['unweaver3'], { music: 'final', boss: true, intro: [L('解織者露出了真正的姿態！', 'The Unweaver shows its true form!')] });
  if (r4 !== 'win') { S.flags.final_begun = false; return; }
  S.flags.morrow_dead = true;
  await E.ending();
});
def('morrow_final_talk', async (E) => { await SCRIPTS.morrow_final(E); });

def('ending_scenes', async (E) => {
  E.music(null);
  E.shake(40); E.sfx('boom');
  await E.say('解織者・終焉', L('……為什麼……這些細小的線……斷了又接……接了又斷……', '...Why... these little threads... break and join... join and break...'));
  for (let i = 0; i < 3; i++) { E.flash('#ffffff', 12); E.sfx('boom'); E.shake(20); await E.wait(26); }
  await E.say('洛恩', L('（洛恩左手的晨星之印，發出了前所未有的光。）', '(The Dawnmark on Rowan\'s left hand shines as never before.)'));
  await E.fadeOut(60);
  S.flags.fallen = false;
  E.music('hymn');
  await E.warp('world', 47, 43, 'd', true);
  await E.fadeIn(60);
  await E.say(null, L('黑色的城堡化成了光的碎片，像雪一樣落下。\n碎片在空中交織，重新織成了一座高塔。', 'The black castle broke into shards of light that fell like snow.\nThe shards wove together in the air, and became a tower once more.'));
  await E.say('織母', L('……謝謝你們。絲線，又連起來了。', '...Thank you. The threads are joined again.'));
  await E.say('瑟菈', L('織母大人……！', 'Weaver...!'));
  await E.say('織母', L('瑟菈，我的孩子。天織塔需要新的織者。……不過，不是現在。先去跟大家一起，看看你們拯救的世界吧。', 'Sera, my child. The Skyloom will need a new weaver. ...But not yet. First go with the others and see the world you saved.'));
  await E.fadeOut(40);
  await E.warp('brightfall', 15, 9, 'u', true);
  E.spawn({ type: 'npc', id: 'e_wren', sprite: 'maiden2', x: 15, y: 7, dir: 'd' });
  E.spawn({ type: 'npc', id: 'e_tobin', sprite: 'oldman', x: 13, y: 9, dir: 'r' });
  E.music('village');
  await E.fadeIn(60);
  await E.say(null, L('黎明來了。\n太陽，從望星岩的後面升了起來。', 'Dawn came.\nThe sun rose from behind Lookout Crag.'));
  await E.say('小雀', L('……歡迎回來，洛恩。', '...Welcome home, Rowan.'));
  await E.say('托賓爺爺', L('呵呵……星星的孩子，終於回到家了。', 'Heh heh... the child of the star is home at last.'));
  if (has('pell')) await E.say('佩兒', L('欸，英雄大人。下次冒險要找我喔。……偷東西的那種除外。', "Hey, hero. Call me for the next adventure. ...Not the stealing kind, though."));
  if (has('mirela')) await E.say('米蕾拉', L('河光神殿要重建了。我會在那裡，為大家祈禱。', 'The Riverlight Temple will be rebuilt. I will pray there for all of you.'));
  if (has('odo')) await E.say('歐多', L('今晚我來做菜！慶祝世界得救的大餐！哈哈哈！', "I'm cooking tonight! A feast for the world being saved! Ha ha ha!"));
  if (has('brannoc')) await E.say('布藍諾', L('國王重新任命我為騎士團長。……第一個命令，是請晨星之子吃飯。', "The King has named me head of the Order again. ...My first command is to treat the Dawnbearer to dinner."));
  if (has('sera')) await E.say('瑟菈', L('總有一天，我會成為新的織母。到那時候，我會把你們的線，織得最漂亮。', "One day I'll become the new Weaver. When I do, I'll weave your threads the most beautifully of all."));
  if (S.flags.ep_sera) await E.say('瑟菈', L('對了，露米要來亮瀑村玩。……她說，要聽我講你們的事。', "Oh, Lumi is coming to visit Brightfall. ...She wants to hear me tell her all about you."));
  if (S.flags.ep_brannoc) await E.say('布藍諾', L('凱斯卓也回到了騎士團。……兄弟兩個，從頭開始。', 'Kestrel has rejoined the Order too. ...Two brothers, starting over.'));
  if (S.flags.letters_done) await E.say(null, L('海鷗港的燈塔上，一個老人和他的兒子、孫女，一起看著日出。', 'On the Gullport lighthouse, an old man, his son and his granddaughter watch the sunrise together.'));
  if (S.flags.mattias_freed) await E.say(null, L('沉沒書庫的入口，有人放了一束花。花旁邊的卡片上寫著：「給娜兒，和她的爸爸。」', 'Someone has left flowers at the entrance of the Sunken Archive. The card beside them says: "For Nell, and her papa."'));
  await E.say('小雀', L('洛恩。……生日快樂。晚了好久好久的那種。', 'Rowan. ...Happy birthday. A very, very late one.'));
  await E.wait(40);
});
