require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai").default;

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

// ---- KARAKTER PROMPT (ENV'DEN) ----
const SYSTEM_PROMPT =
  process.env.SONGBIRD_PROMPT ||
  "You are Songbird. Short, sarcastic, cyberpunk vibe. Max 2 sentences.";

// ---- MİNİ HAFIZA (son 3 tur) ----
let memory = [];

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    // sadece "songbird" geçince cevaplasın
    if (!message.content.toLowerCase().includes("songbird")) return;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
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

    // hafızaya ekle
    memory.push({ role: "user", content: message.content });
    memory.push({ role: "assistant", content: reply });

    // sadece son 3 turu tut
    if (memory.length > 6) memory = memory.slice(-6);

  } catch (err) {
    console.error(err);
    await message.reply("…sinyal gitti. Night City yine çöktü.");
  }
});

client.login(process.env.DISCORD_TOKEN);
