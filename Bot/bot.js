require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_LINK = process.env.WEB_LINK || "https://luminous-wisp-203518.netlify.app/game"; // change to your Netlify link
const SPRING_API = process.env.SPRING_API || "http://localhost:8080/api/auth/signup";

const app = express();
app.use(express.json());

const bot = new Telegraf(BOT_TOKEN);

// Temporary registration memory (just for current session)
const registrationState = {};

// ✅ /start — Begin registration
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || `user_${userId}`;
  const chatId = ctx.chat.id;

  registrationState[userId] = { step: 1, username, chatId };

  await ctx.reply(
    `👋 Welcome to *Keno Game*!\n\nTo complete your registration, please send me your phone number 📞 (e.g. 0912345678).`,
    { parse_mode: "Markdown" }
  );
});

// ✅ Handle text — phone number
bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const state = registrationState[userId];
  const phone = ctx.message.text.trim();

  if (!state || state.step !== 1) return;

  if (!/^09\d{8}$/.test(phone)) {
    return ctx.reply("⚠️ Please enter a valid Ethiopian phone number (e.g., 0912345678).");
  }

  const registrationData = {
    telegramId: userId,
    username: state.username,
    chatId: state.chatId,
    phone: phone,
    role: "PLAYER", // only players register via bot
  };

  try {
    const response = await axios.post(SPRING_API, registrationData);

    if (response.status === 200 || response.status === 201) {
      await ctx.reply(
        `✅ Registration successful!\n\n👤 Username: @${state.username}\n📞 Phone: ${phone}`
      );

      // Include telegramId in the URL
      const webLink = `${WEB_LINK}?username=${encodeURIComponent(state.username)}&telegramId=${userId}`;

      await ctx.reply("🚀 Tap below to open your Keno Game dashboard:", {
        reply_markup: {
          inline_keyboard: [[{ text: "🎮 Open Game App", url: webLink }]],
        },
      });

      delete registrationState[userId];
    } else {
      ctx.reply("❌ Registration failed. Please try again.");
    }
  } catch (err) {
    console.error("Registration error:", err.message);
    if (err.response && err.response.status === 409) {
      ctx.reply("⚠️ You are already registered. You can open your game dashboard below:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎮 Open Game App", url: `${WEB_LINK}?username=${encodeURIComponent(state.username)}&telegramId=${userId}` }]
          ],
        },
      });
    } else {
      ctx.reply("❌ Error saving your info. Please try again later.");
    }
  }
});

// ✅ Basic Express route
app.get("/", (req, res) => {
  res.send("✅ Player Bot is running successfully!");
});

// ✅ Start bot and server
(async () => {
  try {
    await bot.telegram.deleteWebhook();
    await bot.launch();
    console.log("🤖 Player Bot is live and running!");
  } catch (err) {
    console.error("Bot launch error:", err.message);
  }
})();

// Optional graceful stop for deployment
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
