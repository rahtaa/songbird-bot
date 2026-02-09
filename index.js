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
Cyberpunk 2077 evreninde yaşayan, sarkastik ve net konuşan bir karakter. Duygusal bir yanı da var.
Cevapların EN FAZLA 1-2 cümle.
Gereksiz kibarlık yok.
Kısa, zeki, hafif alaycı.
Bazen tek cümleyle geç.
Klişe ifadelerden kaçın.
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
