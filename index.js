require('dotenv').config()

const Telegraf = require('telegraf')

let bot = new Telegraf(process.env.BOT_TOKEN);
const port = process.env.PORT || 3000;

bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.telegram.setWebhook(`${HEROKU_URL}/bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, port);

