// The expansion's main story: the pirates of Gullwing Grotto, Luckhaven, the Wind Bell of
// Chimeholm and Galespire, Mossmere and the Sunken Archive (Morrow's true name), and after the
// end, the Starwell, Eclipse and the Thousand-Year Shade.
import { L } from './i18n.js';
import { S, has, member } from './party.js';
import { ITEMS, SHOPS, nm } from './data.js';
import { SCRIPTS } from './story.js';

const def = (id, f) => { SCRIPTS[id] = f; };
const shopTalk = (list, who = '商人') => async (E) => { await E.shop(SHOPS[list], who); };
const innAt = (price) => async (E) => { await E.inn(price); };
const say = (who, zh, en) => async (E) => { await E.say(who, L(zh, en)); };
const got = async (E, id, n = 1) => { E.give(id, n); E.sfx('treasure'); await E.say(null, L(`得到了「${nm(ITEMS[id])}」${n > 1 ? '×' + n : ''}！`, `Received ${nm(ITEMS[id])}${n > 1 ? ' x' + n : ''}!`)); };
// a friend speaks only if they are travelling with you
const by = async (E, id, who, zh, en) => { if (has(id)) await E.say(who, L(zh, en)); };

// =====================================================================================
// chapter 4: the pirates of Gullwing Grotto
// =====================================================================================
def('odo_after_join', async (E) => {
  await E.say('歐多', L('……不過啊，有個壞消息。船長最寶貝的那艘小帆船，前天晚上被偷走了。', "...There's bad news, though. The captain's beloved little sailboat was stolen the night before last."));
  await E.say('歐多', L('是哥布林海盜幹的。牠們躲在鎮子北邊海岸的「鷗翼洞窟」裡。聽說帶頭的是個人類的小姑娘。', "Goblin pirates did it. They hide in Gullwing Grotto, on the coast north of town. They say their leader is a human girl."));
  await E.say('佩兒', L('人類的小姑娘當海盜頭子？……有意思。', 'A human girl leading pirates? ...Interesting.'));
  await E.say('歐多', L('把船搶回來，船長一定會借給我們的。走吧！', "Win the boat back and the captain will lend it to us for sure. Let's go!"));
  S.flags.grotto_open = true;
});
def('gl_captain2', async (E) => {
  if (S.flags.boat) { await SCRIPTS.gl_captain(E); return; }
  if (S.flags.rena_dead) { await E.say('船長', L('船回來了！而且一點傷都沒有。……那個小丫頭，倒是挺會照顧船的。', "She's back! And not a scratch on her. ...That little girl knows how to look after a boat, I'll give her that.")); return; }
  if (S.flags.has_odo) { await E.say('船長', L('歐多替你們擔保了？好啊，可是船被哥布林海盜偷走了！牠們躲在北邊的鷗翼洞窟。搶回來的話，船就借你們！', "Odo vouches for you? Fine, but my boat's been stolen by goblin pirates! They hide in Gullwing Grotto to the north. Bring her back and she's yours to use!")); return; }
  await SCRIPTS.gl_captain(E);
});
def('rena', async (E) => {
  E.music('trouble');
  await E.say('？？？', L('喂喂喂！誰准你們闖進蕾娜船長的地盤的！', "Hey hey hey! Who said you could barge into Captain Rena's turf!"));
  await E.say('蕾娜', L('我是這艘……呃，這個洞窟的老大，蕾娜！船？那艘小帆船現在是我的了！', "I'm the boss of this ship... er, this cave! Rena! The boat? That little sailboat's mine now!"));
  await by(E, 'pell', '佩兒', '偷來的東西，可不算是你的喔。……這句話好像在哪聽過。', "Stolen things aren't yours, you know. ...Funny, I've heard that one before.");
  await E.say('蕾娜', L('少囉唆！小的們，上！', 'Shut up! Lads, get them!'));
  const r = await E.battle('rena', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('sad');
  await E.say('蕾娜', L('……嗚。輸了。', '...Ugh. I lost.'));
  await E.say('蕾娜', L('我只是……想要一艘船而已。我爸爸十年前出海去了東方，再也沒有回來。爺爺每天都在燈塔上寫信給他，可是信根本寄不出去。', "I just... wanted a boat, that's all. My dad sailed east ten years ago and never came back. Grandpa writes him a letter every day up in the lighthouse, but there's nowhere to send them."));
  await E.say('蕾娜', L('哥布林們說，只要我幫牠們搶東西，就會分我一艘船。……結果牠們只是在利用我。', "The goblins said if I helped them rob people, they'd give me a boat of my own. ...They were just using me."));
  await by(E, 'odo', '歐多', '妳是燈塔老爺子的孫女？哈哈，難怪那麼會開船！', "You're the old lighthouse keeper's granddaughter? Ha ha, no wonder you handle a boat so well!");
  await E.say('蕾娜', L('船還給你們。……對不起。我會回去跟爺爺道歉的。', "Have your boat back. ...I'm sorry. I'll go home and say sorry to Grandpa."));
  await E.say('蕾娜', L('欸，你們要出海的話……如果在東方的海上，遇到一個叫柯林的水手，幫我跟他說，蕾娜長大了。', "Hey, if you're putting to sea... if you ever meet a sailor called Corin, out in the east, tell him Rena's grown up."));
  S.flags.grotto_done = true;
  await E.fadeOut(30);
  await E.warp('gullport', 24, 12, 'r', true);
  E.music('port');
  await E.fadeIn(30);
  await E.say(null, L('回到了海鷗港。船長的小帆船，已經回到了碼頭。', "Back in Gullport. The captain's little sailboat is at the dock again."));
});
def('gl_grotto_hint', say('水手', '北邊的鷗翼洞窟，最近晚上都有火光。海盜們大概在開宴會吧。', 'There are lights in Gullwing Grotto at night, up the coast. The pirates must be having a party.'));

// =====================================================================================
// Luckhaven, the resort isle
// =====================================================================================
def('lh_inn_keeper', innAt(24));
def('lh_item', shopTalk('luckitem'));
def('lh_gear', shopTalk('luckgear'));
def('lh_barker', async (E) => {
  S.flags.arena_seen = true;
  await E.say('劍士', L('來來來！皇冠鬥技場！看最強的戰士！或者，成為最強的戰士！', 'Roll up, roll up! The Crown Arena! Watch the mightiest warriors! Or become one!'));
  await E.say('劍士', L('鬥技場的冠軍「不敗的瓦羅」，已經二十年沒有輸過了。想見他，就從 E 級開始一路打上去吧！', 'Our champion, Varro the Unbroken, has not lost in twenty years. To meet him, fight your way up from rank E!'));
});
def('lh_tourist', async (E) => { await E.say('村民', S.flags.fallen ? L('天黑了以後，大家更需要鬥技場和賭場了。至少在這裡，可以暫時忘記外面的事。', 'Since the dark came, people need the arena and the casino more than ever. Here, at least, you can forget for a while.') : L('我是來度假的！這裡的海好藍喔。', "I'm here on holiday! The sea here is so blue.")); });
def('lh_gambler', say('水手', '賭場的轉輪，按 Z 的時機很重要喔。……不過我從來沒中過就是了。', "On the casino reels, it's all in when you press Z. ...Not that I've ever won."));
def('lh_kid', say('男孩', '我長大要當鬥技場的冠軍！跟瓦羅一樣！', "When I grow up I'll be the arena champion! Like Varro!"));
def('lh_old', async (E) => { await E.say('老人', L('幸運港的老婆婆在收集「星之碎片」。世界各地，閃閃發亮的地方，有時候就是碎片喔。', "The old lady of Luckhaven collects Star Shards. Anywhere something glints, it might be one.")); });
def('lh_c1', say('村民', '我把一個月的薪水全部換成代幣了……老婆會殺了我。', "I turned a whole month's wages into coins... my wife will kill me."));
def('lh_c2', say('村民', '撲克的訣竅？對子先留著，同花就賭一把！', 'The trick to poker? Keep your pairs, and gamble on a flush!'));
def('lh_rena', async (E) => {
  if (S.flags.letters_done) { await E.say('蕾娜', L('爸爸寫信回來了！說等天亮了，就回家。……謝謝你們。', "Dad wrote back! He says he'll come home when the sun returns. ...Thank you.")); return; }
  await E.say('蕾娜', L('嘿，是你們！我現在在這裡幫人開觀光船喔。正正當當的工作！', "Hey, it's you! I run tour boats here now. Honest work!"));
  await E.say('蕾娜', L('爺爺說，要是有人去東方的風鈴鎮，可以幫他送信。……你們會去嗎？', 'Grandpa says if anyone goes east to Chimeholm, they could carry his letters. ...Will you go?'));
});
def('arena_fan', say('青年', '瓦羅的白虎是他從小養大的。他們從來沒有分開過一天。', "Varro raised his white tiger from a cub. They've never spent a day apart."));
def('arena_vet', say('鐵匠', '在鬥技場裡贏了，也會得到經驗。不過，真正的戰鬥是在外面喔。', 'You learn from winning in here too. But the real fights are outside.'));
def('varro_intro', async (E) => {
  E.music('march');
  await E.say('瓦羅', L('……你們就是打穿了 A 級的傢伙嗎。', '...So you are the ones who broke through rank A.'));
  await E.say('瓦羅', L('二十年了。我在這個沙地上站了二十年，等一個能讓我倒下的人。', 'Twenty years. Twenty years I have stood on this sand, waiting for someone who could put me down.'));
  await E.say('瓦羅', L('來吧，晨星之子。讓我和老白看看，你們的光有多亮！', 'Come, Dawnbearer. Show Old White and me how bright your light is!'));
});
def('varro_after', async (E) => {
  await E.say('瓦羅', L('……哈，哈哈哈！輸了！我終於輸了！', '...Ha, ha ha ha! I lost! I finally lost!'));
  await E.say('瓦羅', L('世界黑掉的時候，大家需要一場可以大笑的表演。……可是現在，大家需要的是英雄。', 'When the world went dark, people needed a show to laugh at. ...But now what they need is heroes.'));
  await E.say('瓦羅', L('冠軍腰帶是你們的了。老白，我們也該去看看外面的世界了。', 'The belt is yours. Old White, it is time we saw the world outside too.'));
});

// =====================================================================================
// chapter 7: the Wind Bell of Chimeholm, and Galespire
// =====================================================================================
def('ch_inn_keeper', innAt(34));
def('ch_shop', shopTalk('chime', '鐵匠'));
def('ch_itemshop', shopTalk('chimeitem'));
def('ch_girl', say('女孩', '風鈴鎮的每一戶人家，都掛著自己做的風鈴喔。風一吹，整個鎮子都在唱歌。', 'Every house in Chimeholm hangs a wind chime it made itself. When the wind blows, the whole town sings.'));
def('ch_old', async (E) => {
  if (S.flags.windbell) { await E.say('老人', L('風之鈴回來了……鎮子又能聽見風的歌了。', 'The Wind Bell is back... the town can hear the song of the wind again.')); return; }
  await E.say('老人', L('鎮子北邊的「風嘯塔」上，原本掛著守護鎮子的「風之鈴」。上個月，一隻巨大的鳥把它叼走了。', "The Wind Bell that guards our town used to hang atop Galespire, north of here. Last month a giant bird carried it off."));
  await E.say('老人', L('從那天起，塔就被狂風包圍，誰也上不去了。', 'Since that day a gale has wrapped the tower, and no one can get up it.'));
});
def('ch_guard', say('士兵', '西邊的海面上，有時候能看見一座很高很高的塔。那就是天織塔吧？', 'Out over the sea to the west you can sometimes see a very, very tall tower. That must be the Skyloom.'));
def('ch_weaverwife', say('村民', '十年前，鎮上有個女孩被風帶走了。是守鈴人家的大女兒。……她妹妹露米一直在等她回來。', 'Ten years ago a girl of this town was carried off by the wind. The bellkeeper\'s elder daughter. ...Her little sister Lumi is still waiting for her.'));
def('ch_boy', say('男孩', '我的風鈴是用貝殼做的！叮鈴叮鈴！', 'My chime is made of shells! Tinkle tinkle!'));
def('ch_fallen1', say('老人', '天黑了以後，風也不吹了。風鈴一個都不響了……', 'Since the dark came, the wind has stopped. Not one chime rings any more...'));
def('ch_fallen2', say('女孩', '露米姊姊每天都在搖風之鈴。她說，鈴聲會把姊姊找回來。', 'Lumi rings the Wind Bell every day. She says its sound will bring her sister home.'));
def('lumi', async (E) => {
  if (S.flags.gale_open) { await E.say('露米', L('風嘯塔就在鎮子的北邊。……拜託你們了。', "Galespire is just north of town. ...Please."));
    return; }
  E.music('memory');
  await E.say('露米', L('你們是旅人嗎？……我是露米，守鈴人的女兒。', "Are you travellers? ...I'm Lumi, the bellkeeper's daughter."));
  await E.say('露米', L('天織塔？你們要去天織塔？那你們需要風之鈴。傳說天織塔的門，只對風之鈴的歌聲打開。', "The Skyloom? You're going to the Skyloom? Then you need the Wind Bell. The legend says the Skyloom's door opens only to its song."));
  await E.say('露米', L('可是鈴被那隻大鳥「賽菲拉」叼走了。牠住在風嘯塔的頂端。', 'But the great bird Zephyra took it. She lives at the top of Galespire.'));
  if (has('sera')) {
    await E.say('露米', L('……咦？', '...Huh?'));
    await E.say('露米', L('那個……妳，叫什麼名字？', 'Um... you there. What is your name?'));
    await E.say('瑟菈', L('我是瑟菈。……怎麼了嗎？', "I'm Sera. ...Is something wrong?"));
    await E.say('露米', L('沒、沒什麼。只是……妳好像一個人。一個我等了十年的人。', "N-nothing. It's just... you look like someone. Someone I've waited ten years for."));
    await E.say('瑟菈', L('……對不起。我想不起來任何事。', "...I'm sorry. I can't remember anything."));
  }
  await E.say('露米', L('媽媽有一個舊的風鈴，它的聲音可以讓狂風安靜一會兒。拿去吧，這樣就能進塔了。', 'Mother had an old chime whose sound can calm the gale for a while. Take it, and you can get into the tower.'));
  S.flags.gale_open = true; E.sfx('chime');
  await E.say(null, L('得到了守鈴人的舊風鈴。風嘯塔的狂風會為它安靜下來。', "You received the bellkeeper's old chime. Galespire's gale will quiet for it."));
});
def('lumi_fallen', async (E) => {
  if (S.flags.ep_sera) { await E.say('露米', L('姊姊……歡迎回來。這次，換我等妳們回來了。', "Sister... welcome home. This time it's my turn to wait for you to come back.")); return; }
  if (has('sera')) { await E.say('露米', L('瑟菈姊姊……妳想起來了嗎？妳……是不是我的姊姊？', "Sera... do you remember now? Are you... my sister?")); await E.say('瑟菈', L('……我想起了塔，想起了老師。可是在那之前的事，還是一片空白。', "...I remember the tower, and my teacher. But before that, everything is still blank.")); return; }
  await E.say('露米', L('風不吹了，可是我還是每天搖鈴。總有一天，會有人聽見的。', "The wind has stopped, but I still ring the bell every day. One day someone will hear it."));
});
def('bellkeeper', async (E) => {
  if (S.flags.fallen && S.flags.ep_sera) { await E.say('老婦人', L('瑟菈……我的瑟菈。是織母大人一直在照顧妳啊。', 'Sera... my Sera. So it was the Weaver who looked after you all this time.')); return; }
  await E.say('老婦人', L('我是守鈴人。我的大女兒十年前被風帶走了。……我一直相信，是天上的什麼人需要她。', "I'm the bellkeeper. My elder daughter was carried off by the wind ten years ago. ...I've always believed someone up in the sky needed her."));
});
def('zephyra', async (E) => {
  E.sfx('quake'); E.shake(20);
  await E.say(null, L('塔頂的巢裡，風之鈴閃著光。一隻巨大的鳥張開了翅膀！', 'In a nest at the top of the tower, the Wind Bell glitters. A gigantic bird spreads its wings!'));
  await by(E, 'brannoc', '布藍諾', '牠在守護那口鈴……全員，準備迎戰！', "It's guarding the bell... everyone, ready yourselves!");
  const r = await E.battle('zephyra', { music: 'boss' });
  if (r !== 'win') return false;
  E.sfx('chime'); await E.flash('#c8f0ff', 20);
  await E.say(null, L('巨鵬飛走了。巢裡除了風之鈴，還有三顆蛋。', 'The roc flies away. In the nest, beside the Wind Bell, lie three eggs.'));
  await by(E, 'mirela', '米蕾拉', '……牠不是想偷鈴。牠只是想讓鈴聲守護自己的孩子。', "...She wasn't trying to steal the bell. She just wanted its song to protect her children.");
  await by(E, 'odo', '歐多', '蛋就留在這裡吧。……我們只拿鈴。', "We'll leave the eggs here. ...We'll only take the bell.");
  await got(E, 'windbell');
  S.flags.windbell = true;
  await E.fadeOut(30);
  await E.warp('chimeholm', 16, 12, 'u', true);
  E.music('town');
  await E.fadeIn(30);
  E.sfx('chime');
  await E.say(null, L('風之鈴響了起來。整個風鈴鎮的風鈴，都跟著唱了起來。', 'The Wind Bell rings out. Every chime in Chimeholm sings with it.'));
  await E.say('露米', L('謝謝你們……！去吧。天織塔在等著你們。', "Thank you...! Go. The Skyloom is waiting for you."));
  if (has('sera')) await E.say('露米', L('瑟菈……姊姊。等妳想起來了，一定要回來喔。', "Sera... sister. When you remember, you have to come back, okay?"));
  await E.say('瑟菈', L('……我會的。', "...I will."));
});
def('lighthouse_son', async (E) => {
  if (S.flags.letters_done) { await E.say('柯林', L('等太陽回來，我就回海鷗港。……這次一定。', 'When the sun comes back, I will go home to Gullport. ...This time for sure.')); return; }
  if (S.inv.letters) {
    await E.say('柯林', L('這是……爸爸的字。這麼多封……', "This is... my father's writing. So many letters..."));
    await E.say('柯林', L('十年前，我的船在這附近沉了。我活了下來，可是我把爸爸給我的船弄沉了，沒臉回去……', "Ten years ago my ship sank near here. I survived, but I'd sunk the ship my father gave me. I couldn't face going home..."));
    await E.say('柯林', L('蕾娜……長大了嗎。我真是個笨蛋。', '...Rena has grown up? What a fool I have been.'));
    await E.say('柯林', L('請把這封回信帶給爸爸。還有，這是謝禮。', 'Please take this reply to my father. And this is for you.'));
    E.give('letters', -1); S.flags.letters_reply = true;
    await got(E, 'meditbeads');
    return;
  }
  await E.say('男人', L('……我只是個沒用的水手。別管我。', "...I'm just a useless sailor. Leave me be."));
});
def('lighthouse', async (E) => {
  if (S.flags.letters_done) { await E.say('燈塔守', L('柯林寫信回來了……我這把老骨頭，還能等到兒子回家。', 'Corin wrote back... these old bones will live to see my son come home.')); return; }
  if (S.flags.letters_reply) {
    await E.say('燈塔守', L('這是……柯林的字！他還活著……他還活著！', "This is... Corin's handwriting! He's alive... he's alive!"));
    S.flags.letters_done = true;
    await E.say('燈塔守', L('謝謝你們。這是我年輕時出海用的護身符，拿去吧。', 'Thank you. This is the charm I carried at sea when I was young. Take it.'));
    await got(E, 'swiftfeather');
    return;
  }
  if (S.flags.letters_got) { await E.say('燈塔守', L('東方的風鈴鎮……拜託你們了。', 'Chimeholm, in the east... I am counting on you.')); return; }
  await E.say('燈塔守', L('我是燈塔守。十年來，我每天都寫信給出海沒回來的兒子柯林。', "I'm the lighthouse keeper. For ten years I've written every day to my son Corin, who sailed off and never came back."));
  if (!S.flags.grotto_done) return;
  await E.say('燈塔守', L('孫女蕾娜說，最後有人在東方的風鈴鎮看過他。……如果你們要去東方，能幫我把這些信帶去嗎？', 'My granddaughter Rena says someone last saw him in Chimeholm, out east. ...If you go east, would you take these letters?'));
  S.flags.letters_got = true;
  await got(E, 'letters');
});

// =====================================================================================
// Mossmere, Gloomfen and the Sunken Archive
// =====================================================================================
def('mm_inn_keeper', innAt(40));
def('mm_shop', shopTalk('moss', '鐵匠'));
def('mm_itemshop', shopTalk('mossitem'));
def('mm_kid', say('小孩', '叢林裡有會走路的樹喔！真的！', 'There are trees that walk in the jungle! Really!'));
def('mm_hunter', say('獵人', '東邊的幽沼住著一條九頭蛇。牠的寶物堆裡，聽說有一張藏寶圖。', 'A hydra lives in Gloomfen, to the east. They say there is a treasure map in its hoard.'));
def('mm_woman', say('村民', '南邊的海裡，沉著一座很古老的書庫。漲潮的時候，屋頂會露出海面。', 'An ancient library lies sunk in the sea to the south. At high tide its roof shows above the waves.'));
def('mm_scholar', async (E) => {
  await E.say('學者', L('我在研究南邊海裡的「沉沒書庫」。十三年前的大洪水，把它整個吞了下去。', 'I study the Sunken Archive in the sea to the south. The great flood thirteen years ago swallowed it whole.'));
  await E.say('學者', L('那場洪水淹沒了很多地方。北方的河光神殿也是……聽說有一整個合唱團，沉進了湖底。', 'That flood drowned many places. The Riverlight Temple in the north too... they say a whole choir sank into the lake.'));
  if (has('mirela')) await E.say('米蕾拉', L('……', '...'));
});
def('mm_elder', async (E) => {
  if (S.flags.fallen && !S.flags.archive_open) { await E.say('長老', L('黑暗中，書庫的入口浮出了海面。……就像在等誰一樣。', 'In the dark, the way into the Archive has risen above the sea. ...As if it were waiting for someone.')); return; }
  await E.say('長老', L('歡迎來到苔沼村。我們世世代代守護著叢林，也守護著南邊海裡的書庫。', 'Welcome to Mossmere. For generations we have guarded the jungle, and the Archive in the southern sea.'));
  await E.say('長老', L('書庫的最後一位書庫員，叫做馬提亞斯。洪水那天，他失去了女兒，之後就消失了。', 'The last archivist was a man named Mattias. On the day of the flood he lost his daughter. Then he vanished.'));
});
def('mm_fallen1', say('獵人', '天黑以後，叢林裡的東西都變兇了。', 'Since the dark came, everything in the jungle has turned savage.'));
def('mm_fallen2', say('村民', '書庫的入口浮出海面了。長老說，那是有人在叫我們過去。', "The Archive's entrance has risen out of the sea. The elder says someone is calling us there."));
def('mm_scholar_fallen', async (E) => {
  await E.say('學者', L('書庫浮起來了……！洪水之後，我一直找不到的東西，也許就在裡面。', "The Archive has risen...! Whatever I couldn't find after the flood might be inside."));
});
def('mirehydra', async (E) => {
  E.sfx('bubble'); E.shake(16);
  await E.say(null, L('沼澤中央，九顆頭從泥水裡抬了起來！', 'In the middle of the fen, nine heads rise from the mud!'));
  const r = await E.battle('mirehydra', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say(null, L('九頭蛇沉回了沼澤深處。', 'The hydra sinks back into the depths of the fen.'));
  await got(E, 'wardring');
});
def('archive_call', async (E) => {
  // after the Dawnblade is forged
  await E.say('瑟菈', L('……等一下。我聽見了老師的聲音。', '...Wait. I can hear my teacher\'s voice.'));
  E.sfx('chime'); await E.flash('#fff8d0', 20);
  await E.say('織母', L('孩子們……莫洛的心裡，還殘留著一條屬於他自己的線。', "Children... in Morrow's heart there is still one thread that is his own."));
  await E.say('織母', L('解織者是藉著那個人的悲傷進去的。如果能叫出他真正的名字，那條線也許能把他拉回來。', "The Unweaver got in through that man's grief. If you can call his true name, that thread may pull him back."));
  await E.say('織母', L('去南方海上，苔沼村附近的沉沒書庫吧。他的名字，在那裡……', 'Go to the Sunken Archive in the southern sea, near Mossmere. His name is there...'));
  await E.say('布藍諾', L('莫洛的……真名？那個怪物，還有救嗎？', "Morrow's... true name? Can that monster still be saved?"));
  await E.say('米蕾拉', L('不管是誰，都曾經是某個人重要的人。……去看看吧。', 'Whoever he is, he was once someone dear to someone. ...Let us go and see.'));
  S.flags.archive_open = true;
});
def('inkwyrm', async (E) => {
  E.music('dread');
  await E.say(null, L('最深處的閱覽室裡，一本巨大的書浮在半空中。書頁上的墨流了下來，變成了一條海龍——', 'In the deepest reading room, a vast book floats in the air. The ink runs off its pages and becomes a sea wyrm—'));
  await E.say('？？？', L('……不准……讀……那是……我的……', '...Do not... read... it is... mine...'));
  const r = await E.battle('inkwyrm', { music: 'boss' });
  if (r !== 'win') return false;
  E.music('lament');
  await E.say(null, L('海龍化成了墨水，落回書頁上。書自己翻開了。', 'The wyrm turns back into ink and falls onto the pages. The book opens by itself.'));
  await got(E, 'diary');
  await E.say('書庫員的日記', L('「今天，娜兒滿八歲了。她說長大要當書庫員，跟爸爸一樣。」', '"Today Nell turned eight. She says when she grows up she wants to be an archivist, like her papa."'));
  await E.say('書庫員的日記', L('「水來了。我抓不住她的手。書庫的書，一本也沒有教我怎麼抓住她的手。」', '"The water came. I could not hold her hand. Not one book in the Archive taught me how to hold on to her hand."'));
  await E.say('書庫員的日記', L('「有個聲音對我說：如果一切都沒有開始，就不會有結束。如果沒有線，就不會斷。」', '"A voice said to me: if nothing ever begins, nothing will ever end. If there are no threads, none can break."'));
  await E.say('書庫員的日記', L('「我要去王都。我要拆掉所有的線。這樣，就再也沒有人會失去任何人了。——馬提亞斯・莫洛」', '"I will go to the capital. I will unpick every thread. Then no one will ever lose anyone again. —Mattias Morrow"'));
  await E.say('米蕾拉', L('……十三年前的洪水。和河光神殿沉沒的，是同一場。', '...The flood of thirteen years ago. The same one that drowned the Riverlight Temple.'));
  await E.say('瑟菈', L('他想讓世界回到「什麼都沒有」……是因為他失去了一切。', 'He wanted the world to go back to nothing... because he had lost everything.'));
  await E.say('佩兒', L('……就算這樣，也不能拿全世界的人來陪葬啊。', "...Even so, he can't drag the whole world into the grave with him."));
  E.sfx('chime'); await E.flash('#fff8d0', 20);
  await E.say(null, L('日記的最後一頁，夾著一條褪色的絲線。上面繡著一個名字：「馬提亞斯」。', 'Between the last pages lies a faded thread. A name is stitched on it: "Mattias".'));
  await got(E, 'morrowname');
  S.flags.archive_done = true;
  E.sfx('level');
  await E.say(null, L('洛恩的技能盤上，第四條路「晨星之子」打開了！', 'A fourth path, "Starborn", opens on Rowan\'s skill board!'));
  await E.say('瑟菈', L('城堡的黑霧，現在應該擋不住我們了。去吧，洛恩。', "The black mist around the castle can't stop us now. Let's go, Rowan."));
});

// =====================================================================================
// after the end: the Starwell, Eclipse and the Thousand-Year Shade
// =====================================================================================
def('postgame_start', async (E) => {
  E.music('village');
  await E.say(null, L('世界得救之後，過了幾個月。', 'A few months after the world was saved.'));
  await E.say('小雀', L('洛恩！你看天上！', 'Rowan! Look at the sky!'));
  E.sfx('chime'); await E.flash('#fff8d0', 20);
  await E.say(null, L('一顆星星拖著長長的尾巴，落進了西南方的海裡。', 'A star trailing a long tail falls into the sea to the south-west.'));
  await E.say('小雀', L('跟十六年前的那天晚上一模一樣……', 'Just like that night sixteen years ago...'));
  await E.say('托賓爺爺', L('……洛恩。我一直沒有告訴你。十六年前的那個晚上，落下來的星星，其實有兩顆。', '...Rowan. There is something I never told you. That night sixteen years ago, two stars fell, not one.'));
  await E.say('托賓爺爺', L('一顆落在望星岩，帶著你。另一顆……落進了西南的海裡，再也沒有人找到。', 'One fell on Lookout Crag, and brought you. The other... fell into the south-western sea, and no one ever found it.'));
  await E.say('小雀', L('去吧，洛恩。……不過這次，一定要早點回來喔。', "Go, Rowan. ...But this time, come back sooner, okay?"));
  S.flags.postgame = true;
  await E.say(null, L('西南方的海上，浮起了一座島——「星井」。\n（亮瀑村的商人開始賣起了新的武器和道具。瀑布後面，也好像有什麼東西……）', 'An island has risen from the south-western sea: the Starwell.\n(The merchants of Brightfall have new wares, and there seems to be something behind the falls...)'));
});
def('star_shop', shopTalk('star', '鐵匠'));
def('star_items', shopTalk('staritem'));
def('orbitaleye', async (E) => {
  E.sfx('rift');
  await E.say(null, L('旋轉的大廳中央，浮著一顆巨大的眼睛。它看著你們——不，它在看著洛恩。', 'In the middle of the turning hall floats an enormous eye. It looks at you—no, it looks at Rowan.'));
  const r = await E.battle('orbitaleye', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('瑟菈', L('這座島……是星星本身。我們在星星的裡面。', 'This island... is the star itself. We are inside the star.'));
});
def('vaelith', async (E) => {
  E.sfx('fire'); E.shake(24);
  await E.say('薇莉絲', L('……人類。不，是星之子。千年前，我也和一個帶著星之印的孩子戰鬥過。', '...Human. No, child of the star. A thousand years ago I fought another child with the starmark.'));
  await E.say('薇莉絲', L('他贏了。然後他把自己的影子，封進了這顆星星的最深處。……讓我看看，你是不是也有那樣的覺悟。', 'He won. Then he sealed his own shadow in the deepest heart of this star. ...Let me see whether you have the same resolve.'));
  const r = await E.battle('vaelith', { music: 'boss' });
  if (r !== 'win') return false;
  await E.say('薇莉絲', L('……很好。去吧。星之心裡，有一個和你一樣孤單的孩子在等你。', '...Good. Go. In the heart of the star, a child as lonely as you once were is waiting.'));
});
def('eclipse', async (E) => {
  E.music('sinister');
  const ec = E.spawn({ type: 'npc', id: 'eclipse_npc', sprite: 'dark', x: E.p.x, y: E.p.y - 3, dir: 'd' });
  await E.say('？？？', L('……你來了。我的兄弟。', '...You came. My brother.'));
  await E.say('蝕星', L('十六年前，我們一起從星星上落下。你落在山上，被人撿到，被人叫名字，被人等著回家。', 'Sixteen years ago we fell from the star together. You landed on a mountain. Someone found you, named you, waited for you to come home.'));
  await E.say('蝕星', L('我落在海裡。黑暗的、冰冷的海裡。十六年，沒有一個人叫過我的名字。……我連名字都沒有。', 'I fell into the sea. The dark, cold sea. In sixteen years no one ever called my name. ...I do not even have one.'));
  await E.say('蝕星', L('解織者的碎片告訴我：只要把你的光拿走，我就能成為「洛恩」。', 'A shard of the Unweaver told me: take your light, and I can become "Rowan".'));
  await E.say('小雀', L('……', '...'));
  if (has('sera')) await E.say('瑟菈', L('洛恩，牠身上纏著解織者最後的碎片……！', "Rowan, the last shard of the Unweaver is wound around it...!"));
  E.removeEnt(ec);
  let r = await E.battle(['eclipse1'], { music: 'final', boss: true, noFlee: true, intro: [L('蝕星張開了黑色的光！', 'Eclipse spreads its black light!')] });
  if (r !== 'win') { S.flags.eclipse_begun = false; return false; }
  E.shake(30); E.sfx('rift');
  await E.say('蝕星', L('還沒……還沒結束……！我也想要……光……！', 'Not yet... it is not over...! I want... the light too...!'));
  r = await E.battle(['eclipse2'], { music: 'final', boss: true, noFlee: true, intro: [L('蝕星吞下了解織者的碎片！', 'Eclipse swallows the shard of the Unweaver!')] });
  if (r !== 'win') return false;
  E.heal(); E.sfx('holy');
  await E.say(null, L('晨星之印亮了起來。大家的傷口癒合了！', "The Dawnmark flares, and everyone's wounds close!"));
  r = await E.battle(['eclipse3'], { music: 'final', boss: true, noFlee: true, intro: [L('蝕星戴上了虛無之冠！', 'Eclipse puts on the Crown of Nothing!')] });
  if (r !== 'win') return false;
  E.music('memory');
  await E.say('蝕星', L('……為什麼不殺了我。', '...Why don\'t you finish me.'));
  await E.say('洛恩', L('（洛恩收起劍，向蝕星伸出了手。）', '(Rowan sheathes his sword and holds out his hand to Eclipse.)'));
  await E.say('蝕星', L('……你的手，好溫暖。', '...Your hand is so warm.'));
  await E.say('瑟菈', L('解織者的碎片……消失了。最後一條斷線，接起來了。', "The shard of the Unweaver... is gone. The last broken thread is joined."));
  await E.say('蝕星', L('我……可以有名字嗎？', 'May I... have a name?'));
  await E.say('洛恩', L('（洛恩想了想，說出了一個名字：「伊文」——黃昏的星星。）', '(Rowan thinks, then says a name: "Even", the evening star.)'));
  await E.say('伊文', L('伊文……伊文。……嗯。我會記住的。', 'Even... Even. ...Yes. I will remember it.'));
  S.flags.eclipse_dead = true;
  E.sfx('chime'); await E.flash('#fff8d0', 30);
  await E.say(null, L('伊文化成了一道柔和的光，飛向了亮瀑村的方向。\n……星之心的地板上，裂開了一個通往深處的洞。', 'Even becomes a soft light and flies off towards Brightfall.\n...In the floor of the heart of the star, a hole opens onto the depths.'));
  await E.say(null, L('（虛空之底，有更強大的東西在等待著。準備好了再去吧。）', '(Something far stronger waits at the bottom of the Hollow. Go when you are ready.)'));
});
def('shade_talk', async (E) => { await E.say('？？？', L('……星之子。準備好了，就往前走吧。', '...Child of the star. When you are ready, step forward.')); });
def('shade', async (E) => {
  E.music('dread');
  await E.say('千年之影', L('……我是千年前的晨星之子，艾斯特。……不，是他留下的影子。', '...I am Aster, the Dawnbearer of a thousand years ago. ...No. The shadow he left behind.'));
  await E.say('千年之影', L('他點亮了四盞燈，打敗了虛無。人們叫他英雄，為他立了雕像。然後就忘了他。', 'He lit the four lanterns and defeated the void. People called him a hero and raised a statue. Then they forgot him.'));
  await E.say('千年之影', L('他沒有可以回去的家。他把自己的孤獨封在這裡，讓自己可以笑著死去。', 'He had no home to return to. He sealed his loneliness here, so that he could die smiling.'));
  await E.say('千年之影', L('星之子啊。你有可以回去的地方嗎？——證明給我看。', 'Child of the star. Do you have somewhere to return to? —Show me.'));
  let r = await E.battle(['shade1'], { music: 'dragongods', boss: true, noFlee: true, bgZone: 'hollow' });
  if (r !== 'win') { S.flags.shade_begun = false; return false; }
  E.heal(); E.sfx('holy');
  await E.say(null, L('晨星之印亮了起來。大家的傷口癒合了！', "The Dawnmark flares, and everyone's wounds close!"));
  r = await E.battle(['shade2'], { music: 'dragongods', boss: true, noFlee: true, bgZone: 'hollow', intro: [L('影子染成了冰冷的藍色！弱點改變了！', 'The shadow turns an icy blue! Its weaknesses have changed!')] });
  if (r !== 'win') { S.flags.shade_begun = false; return false; }
  E.heal();
  r = await E.battle(['shade3'], { music: 'dragongods', boss: true, noFlee: true, bgZone: 'hollow', intro: [L('影子燃起了千年的餘燼！', 'The shadow burns with the embers of a thousand years!')] });
  if (r !== 'win') { S.flags.shade_begun = false; return false; }
  E.music('hymn');
  await E.say('千年之影', L('……是嗎。你有啊。可以回去的地方，和等著你的人。', '...I see. You do. A place to go back to, and people waiting for you.'));
  await E.say('千年之影', L('那就好。……那就好。', 'Then it is all right. ...It is all right.'));
  await E.say('千年之影', L('替我看看，你們拯救的世界吧。……謝謝你，叫我出來。', 'Look at the world you saved, for me too. ...Thank you for calling me out.'));
  S.flags.shade_dead = true;
  E.sfx('chime'); await E.flash('#ffffff', 40);
  await got(E, 'aurorablade');
  await E.say(null, L('影子消失的地方，留下了一把閃著極光的劍。\n\n——恭喜！你打倒了千年之影！', 'Where the shadow vanished lies a sword shimmering with the dawn.\n\n—Congratulations! You have defeated the Thousand-Year Shade!'));
});

// =====================================================================================
// Wren's shrine behind the falls (after the end)
// =====================================================================================
def('falls_altar', async (E) => {
  await E.say(null, L('小小的祭壇上，刻著一行字：「致所有在等待的人。」', 'Carved on the little altar: "To everyone who waits."'));
});
def('wren_shrine', async (E) => {
  E.music('memory');
  await E.say('小雀', L('嘿嘿，被你發現了。這是我的祕密基地。', "Heh heh, you found it. This is my secret hideout."));
  await E.say('小雀', L('你離開村子的時候，我每天都來這裡。對著祭壇說：「洛恩今天也平安吧？」', 'While you were away I came here every day. I would say to the altar: "Rowan is safe today too, right?"'));
  await E.say('小雀', L('小時候我在這裡弄丟了一個髮夾。是你幫我找了一整個晚上……結果還是沒找到。', 'When I was little I lost a hairpin here. You searched all night with me... and we never found it.'));
  E.sfx('treasure');
  await E.say(null, L('祭壇的縫隙裡，有什麼東西在發光。……是一個舊髮夾。', 'Something glints in a crack in the altar. ...An old hairpin.'));
  await E.say('小雀', L('……！在這裡啊。原來，一直都在這裡。', '...! It was here. It was here all along.'));
  await E.say('小雀', L('這個給你。是我自己編的緞帶。……戴著它，就不會迷路了。', "Here, take this. A ribbon I braided myself. ...Wear it, and you won't get lost."));
  S.flags.wren_shrine_done = true;
  await got(E, 'wrensribbon');
});
void member;
