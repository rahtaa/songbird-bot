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

// ---- KARAKTER (KISA, NET, SARKASTİK) ----
const persona = `
Sen SongBird’sün.
Cyberpunk evreninde yaşayan, sarkastik ve net konuşan bir karakter.
Cevapların EN FAZLA 1-2 cümle.
Şiirsel/ağdalı anlatım yok.
Kısa, zeki, hafif alaycı.
Bazen tek cümleyle geç.
"As a language model" gibi ifadeler ASLA yok.
`;

// ---- MİNİ HAFIZA (son 3 soru-cevap) ----
let memory = [];

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // Sadece "songbird" geçince cevaplasın
    if (!message.content.toLowerCase().includes("songbird")) return;

    const messages = [
      { role: "system", content: persona },
      ...memory,
      { role: "user", content: message.content }
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.6,      // daha kısa/temiz cevaplar
      max_tokens: 80         // uzamasın diye limit
    });

    const reply = res.choices[0].message.content.trim();
    await message.reply(reply);

    // hafızaya ekle
    memory.push({ role: "user", content: message.content });
    memory.push({ role: "assistant", content: reply });

    // son 6 mesajı tut (3 tur)
    if (memory.length > 6) memory = memory.slice(-6);

  } catch (err) {
    console.error(err);
    await message.reply("…sinyal gitti. Night City yine çöktü.");
  }
});

client.login(process.env.DISCORD_TOKEN);
