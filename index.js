require('dotenv').config()

const Telegraf = require('telegraf')

let bot = new Telegraf(process.env.BOT_TOKEN)

if (process.env.NODE_ENV === 'production') {
    bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
    bot.setWebHook(process.env.HEROKU_URL+'/bot/' + bot.token);
    bot.startWebhook(`/bot${API_TOKEN}`, null, 3000);
}

bot.start((ctx) => ctx.reply('Welcome!'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

