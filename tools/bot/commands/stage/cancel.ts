import { Markup } from 'telegraf'

export default async (ctx) => {
    if (ctx.session?.__scenes?.current)
        await ctx[ctx.callbackQuery?.message?.text ? 'editMessageText' : 'reply'](
            'Действие отменено ✅',
            Markup.inlineKeyboard([])
        )
    else
        await ctx[ctx.callbackQuery?.message?.text ? 'editMessageText' : 'reply'](
            'У Вас нет активных действий для отмены 🤓',
            Markup.inlineKeyboard([])
        )

    return ctx.scene.leave()
}