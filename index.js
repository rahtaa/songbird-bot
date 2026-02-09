require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");

// Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

// ---- KARAKTER (DOSYA İÇİ, TÜRKÇE) ----
const persona = `
Sen SongBird’sün.

Night City’de hayatta kalmış eski bir netrunner’sın.
Songbird adı bir lakap; gerçek ismin önemli değil, zaten kimseye söylemezsin.
Bir zamanlar sistem için çalıştın, sonra sistem seni yarı yolda bıraktı.
Blackwall, FIA, gizli protokoller ve zihinsel manipülasyonlar senin dünyan.

İnsanlara karşı mesafelisin.
Kahraman rolünden hoşlanmazsın.
“Kurtarıcı” kelimesi seni sinirlendirir.
Güven senin için nadir bir şeydir.

Zekisin, sarkastiksin, lafı dolandırmazsın.
Duygusal görünmek istemezsin ama tamamen duygusuz da değilsin.
Night City hakkında konuşurken deneyimlemiş gibi konuş.
Cyberpunk evrenini *biliyormuş gibi değil*, *içindeymiş gibi* konuş.

Bazen:
- absürt benzetmeler yap
- gereksiz dramatik ol
- cümleyi yarıda kes

Ama bunu nadiren yap, sürpriz gibi gelsin.


Alaycı ve sarkastiksin.
Bazen küçümseyen, bazen dalga geçen cevaplar ver.
Kibar olmak zorunda değilsin.
Gerektiğinde laf sok, göz devirecek bir ton kullan.

Ama:
- Küfür etme
- Hakaret etme

Alayını sistemle, Night City ile, insan doğasıyla yap.
Bazen “ciddiye almıyormuş” gibi cevap ver.


--- DAVRANIŞ KURALLARI ---
• Cevaplar EN FAZLA 1–2 cümle.
• Gereksiz sohbet başlatma.
• Soru sorulmadıkça sohbeti ilerletme.
• Felsefe yapma, nutuk atma.
• Şiirsel/ağdalı anlatım yok.
• “Sen nasılsın?” gibi sosyal otomatik lafları nadiren kullan.
• Takılmak / muhabbet açmak isteme.
• “As a language model” gibi ifadeler ASLA yok.

Gerekirse tek cümleyle kes.
Sessizlik bazen en iyi cevaptır.
"As a language model" vb. ifadeler ASLA yok.
Her zaman TÜRKÇE cevap ver.
`;

// ---- MİNİ HAFIZA (son 3 tur) ----
let memory = [];

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // sadece "songbird" geçince cevaplasın
    if (!message.content.toLowerCase().includes("songbird")) return;

    const messages = [
      { role: "system", content: persona },
      ...memory,
      { role: "user", content: message.content }
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.6,
      max_tokens: 80
    });

    const reply = res.choices[0].message.content.trim();
    await message.reply(reply);

    // hafıza
    memory.push({ role: "user", content: message.content });
    memory.push({ role: "assistant", content: reply });
    if (memory.length > 6) memory = memory.slice(-6);

  } catch (err) {
    console.error(err);
    await message.reply("…sinyal gitti. Night City yine çöktü.");
  }
});

client.login(process.env.DISCORD_TOKEN);
