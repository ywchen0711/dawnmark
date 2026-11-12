// Each friend's own story, the side stories, the bards' old song, and the new people in old towns.
import { L } from './i18n.js';
import { S, has } from './party.js';
import { ITEMS, nm } from './data.js';
import { SCRIPTS } from './story.js';

const def = (id, f) => { SCRIPTS[id] = f; };
const say = (who, zh, en) => async (E) => { await E.say(who, L(zh, en)); };
const got = async (E, id, n = 1) => { E.give(id, n); E.sfx('treasure'); await E.say(null, L(`得到了「${nm(ITEMS[id])}」${n > 1 ? '×' + n : ''}！`, `Received ${nm(ITEMS[id])}${n > 1 ? ' x' + n : ''}!`)); };
const by = async (E, id, who, zh, en) => { if (has(id)) await E.say(who, L(zh, en)); };
const path4 = async (E, who, zh, en) => { E.sfx('level'); await E.say(null, L(`${who}的技能盤上，第四條路「${zh}」打開了！`, `A fourth path, "${en}", opens on ${L(who, { 佩兒: 'Pell', 米蕾拉: 'Mirela', 歐多: 'Odo', 布藍諾: 'Brannoc', 瑟菈: 'Sera' }[who])}'s skill board!`)); };
const need = async (E, id, zh, en) => { if (has(id)) return true; await E.say(null, L(zh, en)); return false; };

// =====================================================================================
// Pell: Her Mother's Locket
// =====================================================================================
def('pell_fence', async (E) => {
  if (S.flags.ep_pell) { await E.say('盜賊', L('伊索德的女兒，比她媽媽還厲害呢。', "Ysolde's girl is even better than her mother was.")); return; }
  if (S.flags.ep_pell_start) { await E.say('盜賊', L('閃晶礦坑在王都西邊，望星岩山腳下的海岸那邊。小心點。', 'The Glimmer Mines are west of the capital, on the coast below Lookout Crag. Careful.')); return; }
  if (!has('pell') || !S.flags.ch4_done) { await E.say('盜賊', L('……我只跟認識的人做生意。', '...I only deal with people I know.')); return; }
  await E.say('盜賊', L('……佩兒？是佩兒嗎？長這麼大了。', '...Pell? Is that you? Look how you\'ve grown.'));
  await E.say('佩兒', L('老鼠叔叔……你還活著啊。', "Uncle Rat... you're still alive."));
  await E.say('盜賊', L('我欠妳媽媽伊索德一條命。……有件事，我一直想告訴妳。', 'I owe your mother Ysolde my life. ...There is something I have always meant to tell you.'));
  await E.say('盜賊', L('伊索德不是普通的小偷。她是幫王家尋找失落寶物的「尋寶人」。妳偷回來的那個寶物，是她最後一次冒險帶回來的。', "Ysolde was no common thief. She was a treasure hunter who found lost relics for the crown. The treasure you stole back was the last thing she brought home."));
  await E.say('盜賊', L('她最後去的地方，是西邊的「閃晶礦坑」。她沒有回來……可是聽說，礦坑最深處有一個會發光的巨人。', 'The last place she went was the Glimmer Mines, to the west. She never came back... but they say a glowing giant lives in the deepest seam.'));
  await E.say('佩兒', L('……媽媽。', '...Mother.'));
  await E.say('佩兒', L('喂，英雄大人。陪我去一趟吧。……我想知道，媽媽最後看到了什麼。', 'Hey, hero. Come with me. ...I want to know what Mother saw at the end.'));
  S.flags.ep_pell_start = true;
  await E.say(null, L('（閃晶礦坑：亮瀑村南邊，西海岸的礦坑。）', '(The Glimmer Mines: a mine on the west coast, south of Brightfall.)'));
});
def('colossus', async (E) => {
  if (!(await need(E, 'pell', '巨大的晶石在黑暗中發光。……佩兒應該在這裡。', 'A huge crystal glows in the dark. ...Pell should be here for this.'))) { S.flags.colossus_dead = false; return; }
  E.sfx('quake'); E.shake(20);
  await E.say('佩兒', L('那個……是媽媽的匕首？插在那傢伙的胸口……！', "That's... Mother's dagger? Stuck in that thing's chest...!"));
  const r = await E.battle('colossus', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('farewell');
  await E.say(null, L('巨像碎裂了。碎片之中，躺著一把匕首，和一個小小的墜子。', 'The colossus shatters. Among the pieces lie a dagger and a little locket.'));
  await E.say('佩兒', L('墜子裡……是我小時候的畫像。', "Inside the locket... is a picture of me when I was little."));
  await E.say('佩兒', L('背面寫著：「給佩兒。等媽媽回去，就不再偷東西了。我們一起去看海。」', 'On the back it says: "For Pell. When Mama comes home, no more stealing. We\'ll go and see the sea together."'));
  await E.say('佩兒', L('……騙子。說好要一起去看海的。', '...Liar. You promised we would see the sea together.'));
  await E.say('佩兒', L('……可是，我現在每天都在看海呢，媽媽。和一群笨蛋一起。', "...But I see the sea every day now, Mother. With a bunch of idiots."));
  await by(E, 'odo', '歐多', '笨蛋也包括我嗎？哈哈哈！', 'Does "idiots" include me? Ha ha ha!');
  await got(E, 'locket');
  await got(E, 'ysoldefang');
  S.flags.ep_pell = true;
  await path4(E, '佩兒', '尋寶者', 'Treasure Hunter');
});

// =====================================================================================
// Mirela: The Drowned Song
// =====================================================================================
def('mirela_ep_start', async (E) => {
  if (S.flags.ep_mirela) { await E.say('修女', L('柯黛莉亞修女……終於可以安息了。', 'Sister Cordelia... can rest at last.')); return; }
  if (S.flags.ep_mirela_start) { await E.say('修女', L('沉歌之井在神殿湖的西岸。願光守護你們。', 'The Choirwell is on the west shore of the temple lake. May the light keep you.')); return; }
  if (!has('mirela') || !(S.flags.ch6_done || S.flags.abbot_dead)) { await E.say('修女', L('……河光神殿的合唱團，曾經是全國最美的歌聲。', "...The Riverlight choir once had the most beautiful voices in the land.")); return; }
  await E.say('修女', L('米蕾拉……妳最近還會做那個夢嗎？', 'Mirela... do you still have that dream?'));
  await E.say('米蕾拉', L('……會。湖底傳來歌聲。是柯黛莉亞修女和大家的聲音。', "...I do. Singing from the bottom of the lake. Sister Cordelia's voice, and everyone's."));
  await E.say('米蕾拉', L('十三年前的洪水那天，合唱團在湖邊的小聖堂練唱。修女把我推上了屋頂……然後水就來了。', 'On the day of the flood thirteen years ago, the choir was practising in the little chapel by the lake. Sister pushed me up onto the roof... and then the water came.'));
  await E.say('米蕾拉', L('只有我活了下來。所以我成了神官。我想……替大家把歌唱完。', 'Only I lived. That is why I became a priestess. I wanted to... finish the song for all of them.'));
  await E.say('修女', L('最近，湖西岸的「沉歌之井」開始傳出歌聲。……不是好的歌聲。像是有什麼東西，把她們困在那裡。', 'Lately singing has been heard from the Choirwell on the west shore. ...Not a good song. As if something holds them there.'));
  await E.say('米蕾拉', L('……洛恩，拜託你。陪我去見大家。', '...Rowan, please. Come with me to see them.'));
  S.flags.ep_mirela_start = true;
});
def('cantor', async (E) => {
  if (!(await need(E, 'mirela', '水底聖堂裡，有人在唱歌。……米蕾拉應該在這裡。', 'Someone is singing in the drowned chapel. ...Mirela should be here.'))) { S.flags.cantor_dead = false; return; }
  E.music('crypt');
  await E.say('？？？', L('♪ 光啊，請守護……守護……守護……', '♪ O light, protect... protect... protect...'));
  await E.say('米蕾拉', L('柯黛莉亞修女！是我，米蕾拉！', "Sister Cordelia! It's me, Mirela!"));
  await E.say('水底的領唱者', L('米蕾拉……？不，不行，水要來了……孩子們，唱下去，不要停……', "Mirela...? No, no, the water is coming... children, keep singing, don't stop..."));
  await E.say('米蕾拉', L('她被困在那一天了……！解織者的黑水，把她的悲傷綁在這裡！', "She's trapped in that day...! The Unweaver's black water has tied her grief to this place!"));
  const r = await E.battle('cantor', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('hymn');
  await E.say('柯黛莉亞修女', L('……米蕾拉。妳長大了呢。', '...Mirela. How you have grown.'));
  await E.say('米蕾拉', L('修女……對不起。只有我一個人……', "Sister... I'm sorry. Only I..."));
  await E.say('柯黛莉亞修女', L('傻孩子。妳活下來，就是我們的歌最美的一段啊。', 'Silly child. Your living is the most beautiful verse of our song.'));
  await E.say('柯黛莉亞修女', L('來，最後一起唱吧。我們一直沒有唱完的那首歌。', "Come, let us sing it one last time together. The song we never finished."));
  E.sfx('chime');
  await E.say(null, L('水底的聖堂裡，響起了很多人的歌聲。歌聲一個一個化成了光，升向水面。', 'Many voices sing in the drowned chapel. One by one the voices turn to light and rise towards the surface.'));
  await E.say('米蕾拉', L('……再見了，大家。我會繼續唱下去的。', '...Goodbye, everyone. I will keep singing.'));
  await got(E, 'choirbell');
  await got(E, 'tidestaff');
  S.flags.ep_mirela = true;
  await path4(E, '米蕾拉', '聖女', 'Saint');
});

// =====================================================================================
// Odo: The Master's Recipe
// =====================================================================================
def('odo_ep_start', async (E) => {
  if (S.flags.ep_odo) { await E.say('武僧', L('歐多師兄的燉菜，真的和恩尼克師父的一模一樣。', "Brother Odo's stew tastes exactly like Master Ennick's.")); return; }
  if (S.flags.ep_odo_start) { await E.say('武僧', L('燼棚修道院在雪幕村東南方的山上。……師兄，拜託了。', 'Cindershelf Monastery is on the mountain south-east of Snowveil. ...Brother, please.')); return; }
  if (!has('odo') || !S.flags.ch6_done) { await E.say('武僧', L('……我在等一個人。一個逃走的師兄。', "...I'm waiting for someone. A brother monk who ran away.")); return; }
  await E.say('武僧', L('……歐多師兄？！真的是你！', '...Brother Odo?! It really is you!'));
  await E.say('歐多', L('小婷……妳怎麼會在這裡。', 'Little Ting... what are you doing here?'));
  await E.say('武僧', L('燼棚修道院被雪山的魔物佔領了！大家都逃了下來……可是，師父的墓還在山上。', "Cindershelf Monastery has been overrun by the monsters of the mountain! Everyone fled down here... but Master's grave is still up there."));
  await E.say('歐多', L('……', '...'));
  await E.say('歐多', L('洛恩，我沒跟你說過吧。十年前，修道院的廚房失火了。是我顧著爐火的時候睡著了。', "Rowan, I never told you. Ten years ago the monastery kitchen caught fire. I fell asleep while I was minding the stove."));
  await E.say('歐多', L('師父為了救我，衝進了火裡。……之後我就逃下山了。我沒臉見任何人。', 'Master ran into the fire to save me. ...Afterwards I ran down the mountain. I couldn\'t face anyone.'));
  await E.say('武僧', L('師兄，師父最後說的話，是「歐多的燉菜還沒學完」啊！', 'Brother, Master\'s last words were "Odo hasn\'t finished learning the stew"!'));
  await E.say('歐多', L('……走吧。去把師父的廚房搶回來。', "...Let's go. Let's take Master's kitchen back."));
  S.flags.ep_odo_start = true;
});
def('snowmaul', async (E) => {
  if (!(await need(E, 'odo', '燒焦的廚房裡，有什麼巨大的東西在睡覺。……歐多應該在這裡。', 'Something huge sleeps in the burnt kitchen. ...Odo should be here.'))) { S.flags.snowmaul_dead = false; return; }
  E.sfx('quake'); E.shake(20);
  await E.say('歐多', L('白鬃……！十年前，就是你這傢伙把爐子撞翻的嗎！', "Whitemane...! So it was you who knocked over the stove ten years ago!"));
  await E.say('歐多', L('……不。不對。睡著的是我。是我的錯。', "...No. That's not right. I was the one asleep. It was my fault."));
  await E.say('歐多', L('可是今天，我不會再睡著了！', "But today I won't fall asleep again!"));
  const r = await E.battle('snowmaul', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('farewell');
  await E.say(null, L('燒焦的櫃子深處，有一本半焦的食譜。', 'Deep in a scorched cupboard lies a half-burnt recipe book.'));
  await got(E, 'recipe');
  await E.say('歐多', L('最後一頁……是師父的字。', "The last page... it's Master's writing."));
  await E.say('恩尼克師父', L('「歐多。燉菜的祕訣，不是火候，不是材料。是想著要給誰吃。你一直都做得很好。」', '"Odo. The secret of a stew is not the fire, nor what goes in it. It is thinking of who will eat it. You have always done that well."'));
  await E.say('歐多', L('……師父。哈……哈哈……我這不是……早就學會了嗎……', '...Master. Ha... ha ha... then I... learned it long ago, didn\'t I...'));
  await by(E, 'pell', '佩兒', '……喂，大個子，你在哭喔。', '...Hey, big guy. You\'re crying.');
  await E.say('歐多', L('是洋蔥！是洋蔥啦！', "It's onions! Onions, I tell you!"));
  await got(E, 'sunfist');
  S.flags.ep_odo = true;
  await path4(E, '歐多', '師父之道', "Master's Way");
});

// =====================================================================================
// Brannoc: The Black Lance
// =====================================================================================
def('brannoc_ep_start', async (E) => {
  if (S.flags.ep_brannoc) { await E.say('士兵', L('凱斯卓大人也回到騎士團了。兄弟倆並肩作戰的樣子，真是威風。', 'Sir Kestrel has rejoined the Order too. The two brothers fighting side by side are a sight to see.')); return; }
  if (S.flags.ep_brannoc_start) { await E.say('士兵', L('灰淺城在索爾海文的東北方，海岸邊的高地上。', 'Ashford Keep is north-east of Solhaven, on the heights by the coast.')); return; }
  if (!has('brannoc') || !S.flags.leo_dead) { await E.say('士兵', L('我是從北方逃過來的。灰淺城……被黑色的騎士佔領了。', 'I fled here from the north. Ashford Keep... has been taken by a black knight.')); return; }
  await E.say('士兵', L('布藍諾隊長！您平安無事……！', 'Captain Brannoc! You are safe...!'));
  await E.say('士兵', L('灰淺城被佔領了。帶頭的是……是凱斯卓大人。您的弟弟。', 'Ashford Keep has fallen. The one leading them is... is Sir Kestrel. Your brother.'));
  await E.say('布藍諾', L('……凱斯卓。', '...Kestrel.'));
  await E.say('布藍諾', L('灰淺城是我們兄弟長大的地方。我們發過誓，要一起成為守護索爾海文的騎士。', 'Ashford is where my brother and I grew up. We swore we would both become knights of Solhaven.'));
  await E.say('布藍諾', L('可是騎士團只選了一個人。我。……從那天起，他就不再叫我哥哥了。', 'But the Order chose only one of us. Me. ...From that day he never called me brother again.'));
  await E.say('布藍諾', L('他投靠了莫洛的教團。……洛恩，這是我的家事。可是，我想請你陪我去。', "He went over to Morrow's cult. ...Rowan, this is my family's business. But I would ask you to come with me."));
  S.flags.ep_brannoc_start = true;
});
def('kestrel', async (E) => {
  if (!(await need(E, 'brannoc', '大廳的王座上，一個黑色的騎士在等著。……布藍諾應該在這裡。', 'A black knight waits on the throne of the great hall. ...Brannoc should be here.'))) { S.flags.kestrel_dead = false; return; }
  E.music('march');
  await E.say('凱斯卓', L('來了嗎，騎士團長大人。', 'So you came, Lord Captain of the Order.'));
  await E.say('布藍諾', L('凱斯卓。回來吧。', 'Kestrel. Come home.'));
  await E.say('凱斯卓', L('回去？回到哪裡？回到永遠站在你影子裡的地方嗎！', 'Home? Home to where? Back to standing in your shadow forever!'));
  await E.say('凱斯卓', L('解織者說得對。只要沒有線，就沒有比較，沒有輸贏，沒有人會被丟下！', 'The Unweaver was right. With no threads there is no comparing, no winning or losing, no one left behind!'));
  await E.say('布藍諾', L('……那就用劍說話吧。像小時候一樣。', '...Then let our swords speak. As when we were boys.'));
  const r = await E.battle('kestrel', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('paladins');
  await E.say('凱斯卓', L('……又輸了。我永遠贏不了你。', '...I lost again. I can never beat you.'));
  await E.say('布藍諾', L('凱斯卓。你知道騎士團為什麼選了我嗎？', 'Kestrel. Do you know why the Order chose me?'));
  await E.say('布藍諾', L('因為我在試煉的時候說：「我弟弟比我強。請讓我守護他守護的東西。」', 'Because at the trial I said: "My brother is stronger than I. Let me protect what he protects."'));
  await E.say('凱斯卓', L('……什麼？', '...What?'));
  await E.say('布藍諾', L('這個戒指，是父親留給我們兩個的。上面刻著兩個名字。我一直在等你回來，把另一半拿走。', 'This ring is what Father left to us both. Two names are carved on it. I have been waiting for you to come back and take your half.'));
  await E.say('凱斯卓', L('……哥哥。', '...Brother.'));
  await got(E, 'oathring');
  await got(E, 'oathkeeper');
  S.flags.ep_brannoc = true;
  await path4(E, '布藍諾', '守誓者', 'Oathkeeper');
});

// =====================================================================================
// Sera: The First Thread
// =====================================================================================
def('sera_ep_start', async (E) => {
  if (S.flags.ep_sera_start) { await E.say('瑟菈', L('庭園就在風鈴鎮的西北邊。……走吧。', "The garden is north-west of Chimeholm. ...Let's go.")); return; }
  await E.say('瑟菈', L('……洛恩。我想起了一件事。', "...Rowan. I've remembered something."));
  await E.say('瑟菈', L('老師把我收為弟子的時候，拿走了我小時候的記憶。她說，「等妳成為真正的織者，就還給妳」。', 'When my teacher took me as her apprentice, she took my childhood memories. She said, "When you become a true weaver, I will give them back."'));
  await E.say('瑟菈', L('老師把那些記憶，織成了一座庭園，藏在風鈴鎮的西北邊。……可是天黑以後，有什麼東西住進去了。', "She wove those memories into a garden and hid it north-west of Chimeholm. ...But since the dark came, something has moved in."));
  await E.say('瑟菈', L('露米說我是她的姊姊。……我想知道，那是不是真的。', 'Lumi says I am her sister. ...I want to know if that is true.'));
  S.flags.ep_sera_start = true;
});
def('forgetting', async (E) => {
  if (!(await need(E, 'sera', '庭園的中心，有一團霧在等著。……瑟菈應該在這裡。', 'A mist waits at the heart of the garden. ...Sera should be here.'))) { S.flags.forgetting_dead = false; return; }
  E.music('evil');
  await E.say('遺忘', L('……回去吧。想起來，只會痛而已。', '...Go back. Remembering will only hurt.'));
  await E.say('遺忘', L('妳的媽媽在哭，妹妹在哭。妳被風帶走的那天，所有人都在哭。忘掉不是比較輕鬆嗎？', 'Your mother wept, your sister wept. The day the wind took you, everyone wept. Isn\'t forgetting easier?'));
  await E.say('瑟菈', L('……也許吧。可是，有人一直搖著鈴等我回去。', '...Perhaps. But someone has been ringing a bell for me all this time, waiting for me to come home.'));
  await E.say('瑟菈', L('我不要再忘記了。', 'I will not forget again.'));
  const r = await E.battle('forgetting', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('memory');
  E.sfx('chime'); await E.flash('#fff8d0', 30);
  await E.say(null, L('霧散開了。庭園裡，無數的絲線發著光，一條一條地纏回瑟菈的手上。', 'The mist clears. Countless threads in the garden shine and wind themselves, one by one, back onto Sera\'s hands.'));
  await E.say('瑟菈', L('……媽媽做的風鈴。露米第一次會走路。冬天的晚上，三個人一起喝的熱湯……', "...The chime Mother made. The day Lumi first walked. Hot soup, the three of us together, on winter nights..."));
  await E.say('瑟菈', L('我的名字是瑟菈。風鈴鎮守鈴人的女兒。露米的姊姊。', "My name is Sera. Daughter of the bellkeeper of Chimeholm. Lumi's sister."));
  await by(E, 'pell', '佩兒', '……歡迎回來，魔女大人。', '...Welcome back, witch.');
  await got(E, 'threadspool');
  await got(E, 'weaverrod');
  S.flags.ep_sera = true;
  await path4(E, '瑟菈', '織絲', 'Threadweaving');
});

// =====================================================================================
// the bards' old song: six verses about the first Dawnbearer
// =====================================================================================
const VERSES = {
  verse_bright: ['♪ 星星落在山上，那孩子叫艾斯特～ 沒有父親，沒有母親，只有一身的光～ ♪', '♪ A star fell on the mountain, and the child was called Aster~ No father and no mother, only light upon him~ ♪'],
  verse_sol: ['♪ 艾斯特點亮了燈，水火大地與冰霜～ 四道光合而為一，照亮了織母的塔～ ♪', "♪ Aster lit the lanterns, water, fire, earth and frost~ Four lights became one, and lit the Weaver's tower~ ♪"],
  verse_dove: ['♪ 虛無從塔裡湧出，想把一切都拆散～ 艾斯特舉起了劍，獨自走進了黑暗～ ♪', '♪ The void poured from the tower, to unpick everything~ Aster raised his sword, and walked alone into the dark~ ♪'],
  verse_gull: ['♪ 他回來了，大家歡呼，為他立了石像～ 可是沒有一扇門，為他亮著燈火～ ♪', '♪ He came back, and all rejoiced, and raised a statue to him~ But not one door kept a lamp lit for him~ ♪'],
  verse_sand: ['♪ 他把孤獨收起來，藏進天上的星星～ 笑著說：「下一個孩子，一定要有家可回」～ ♪', '♪ He gathered up his loneliness and hid it in a star~ Smiling, said: "The next child must have a home to go to"~ ♪'],
  verse_snow: ['♪ 所以啊，旅人，如果你遇見帶著星星的孩子～ 請為他留一盞燈，請叫他的名字～ ♪', '♪ So, traveller, if you meet a child who bears a star~ Keep a lamp lit for him, and call him by his name~ ♪'],
};
for (const [k, v] of Object.entries(VERSES)) def(k, async (E) => {
  await E.say('吟遊詩人', L(v[0], v[1]));
  if (!S.flags[k]) {
    S.flags[k] = true; S.flags.verse_any = true;
    if (!S.inv.verse) { E.give('verse'); await E.say(null, L('把歌詞抄了下來。（得到了「古歌的歌詞」）', 'You copy down the verse. (Received Verses of the Old Song.)')); }
    const n = Object.keys(VERSES).filter((x) => S.flags[x]).length;
    await E.say(null, L(`古歌的歌詞：${n}/6`, `Verses of the old song: ${n}/6`));
    if (n === 6 && !S.flags.verses_done) {
      S.flags.verses_done = true;
      await E.say('吟遊詩人', L('你把六段都收集齊了？……這是千年前晨星之子的歌。據說唱完整首歌的人，會得到他留下的祝福。', 'You have all six verses? ...This is the song of the Dawnbearer of a thousand years ago. They say whoever sings it whole receives the blessing he left behind.'));
      E.sfx('chime');
      await got(E, 'starpendant');
    }
  }
});

// =====================================================================================
// new people in old places
// =====================================================================================
def('sn_old2', say('老婦人', '村口的雕像，是千年前的晨星之子，艾斯特。……可是，沒有人記得他後來去了哪裡。', 'The statue by the gate is Aster, the Dawnbearer of a thousand years ago. ...But no one remembers where he went afterwards.'));
