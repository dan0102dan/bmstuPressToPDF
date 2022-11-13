import { Scenes, Markup } from 'telegraf'
import { sendBook } from '../../../../functions'

interface WizardSession extends Scenes.WizardSessionData {
	mesWithCancel: any
}

export default new Scenes.WizardScene<Scenes.WizardContext<WizardSession>>(
	'getbook',
	async (ctx) => {
		ctx.scene.session.mesWithCancel = await ctx.reply(
			'Пришлите ссылку на книгу ✏️',
			Markup.inlineKeyboard([Markup.button.callback('Отмена ❌', 'cancel')])
		)

		return ctx.wizard.next()
	},
	async (ctx) => {
		if ('reply_markup' in ctx.scene.session.mesWithCancel)
			ctx.scene.session.mesWithCancel = await ctx.telegram.editMessageReplyMarkup(
				ctx.chat.id, ctx.scene.session.mesWithCancel.message_id, '',
				Markup.inlineKeyboard([]).reply_markup
			)

		const bookId = Number('text' in ctx.message && ctx.message.text.replace(/[^0-9]/g, ''))
		if (!bookId) {
			ctx.scene.session.mesWithCancel = await ctx.reply(
				'Не могу разобрать, что написано, попробуйте ещё раз! 👀',
				Markup.inlineKeyboard([Markup.button.callback('Отмена ❌', 'cancel')])
			)
			return
		}

		sendBook(ctx.chat.id, bookId)

		return ctx.scene.leave()
	}
)