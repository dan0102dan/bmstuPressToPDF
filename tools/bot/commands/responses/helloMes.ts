export default async (ctx) => {
	await ctx.reply(
		'Привет! 👋\nПришли <code>id</code> книги, чтобы получить PDF файл',
		{ parse_mode: 'HTML' }
	)
}