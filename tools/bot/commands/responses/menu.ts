import { Markup } from 'telegraf'

export default async (ctx) => {
	await ctx[ctx.callbackQuery?.message?.text ? 'editMessageText' : 'reply'](
		'Меню:',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.callback('Скачать книгу 📖', 'getbook')]
			])
		}
	)
}