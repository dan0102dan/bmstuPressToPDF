import { Markup } from 'telegraf'

export default async (ctx) => {
	await ctx.reply(
		'Привет! 👋',
		{
			parse_mode: 'HTML',
			...Markup.inlineKeyboard([
				[Markup.button.callback('Меню 📖', 'menu')]
			])
		}
	)
}