import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

console.log(config.get('TEST_ENV'))

const INITIAL_SESSION = {
    messages: [],
}
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Чекаю вашого голосового або текстового повідомлення')
})

bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Чекаю вашого голосового або текстового повідомлення')
})

bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
//      await ctx.reply(code('Повідомлення отримав. Чекаю повідомлення від сервера...'))
//      await ctx.reply(JSON.stringify(ctx.message.voice, null, 2) )
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)        
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)
//      console.log(link.href)
//      await ctx.reply(JSON.stringify(link, null, 2) )

        const text = await openai.transcription(mp3Path)
        await ctx.reply(code(`Ваш запит: ${text}`))

//      const messages = [{ role: openai.roles.USER, content: text }]
        ctx.session.messages.push({ role: openai.roles.USER, content: text })

        const response = await openai.chat(ctx.session.messages)
//      console.log(response)
//      await ctx.reply(mp3Path)
//      await ctx.reply(text)

        ctx.session.messages.push({ 
            role: openai.roles.ASSISTANT, 
            content: response.content,
        })

        await ctx.reply(response.content)
    } catch (e) {
        console.log(`Error while voice message`, e.message)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Повідомлення отримав. Чекаю відповідь від сервера...'))

        ctx.session.messages.push({ 
            role: openai.roles.USER, 
            content: ctx.message.text, 
        })

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({ 
            role: openai.roles.ASSISTANT, 
            content: response.content,
        })

        await ctx.reply(response.content)
    } catch (e) {
        console.log(`Error while text message`, e.message)
    }
})

bot.command('start', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message, null, 2) )
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))