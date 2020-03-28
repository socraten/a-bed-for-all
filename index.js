require('dotenv').config()

const Telegraf = require('telegraf')

let bot = new Telegraf(process.env.BOT_TOKEN)
const port = process.env.PORT || 2000;

bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

if (process.env.NODE_ENV == 'production') {
    bot.telegram.setWebhook(`S{HEROKU_URL}/bot${BOT_TOKEN}`);
    // bot.setWebHook(process.env.HEROKU_URL+'/bot/' + bot.token);
    bot.startWebhook(`/bot${BOT_TOKEN}`, null, port);
}else {
  bot.launch()
}

