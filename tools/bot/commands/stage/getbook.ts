import { Scenes, Markup } from 'telegraf'
import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { getBook, getBookURL } from '../../../../functions'

interface WizardSession extends Scenes.WizardSessionData {
	mes: any
	bookID: number
}

export default new Scenes.WizardScene<Scenes.WizardContext<WizardSession>>(
	'getbook',
	async (ctx) => {
		if (!ctx.scene.session.bookID)
			ctx.scene.session.mes = await ctx.reply(
				'Пришлите ссылку на книгу ✏️',
				Markup.inlineKeyboard([Markup.button.callback('Отмена ❌', 'cancel')])
			)

		return ctx.wizard.next()
	},
	async (ctx) => {
		await ctx.telegram.editMessageReplyMarkup(
			ctx.chat.id, ctx.scene.session.mes.message_id, '',
			Markup.inlineKeyboard([]).reply_markup
		)

		ctx.scene.session.bookID = Number('text' in ctx.message && ctx.message.text.replace(/[^0-9]/g, ''))
		if (!ctx.scene.session.bookID)
			return ctx.scene.session.mes = await ctx.reply(
				'Не могу разобрать, что написано, попробуйте ещё раз! 👀',
				Markup.inlineKeyboard([Markup.button.callback('Отмена ❌', 'cancel')])
			)

		try {
			const browser = await puppeteer.launch({
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			})
			const pdfDoc = await PDFDocument.create()

			const book = await getBook(ctx.scene.session.bookID)

			const url = await getBookURL(book.readerLink)

			ctx.scene.session.mes = await ctx.reply(
				`<b>«${book.name}»</b>\n\n<b>Автор:</b> ${book.author}\n<b>Год издания:</b> ${book.year}\n<b>Кол-во страниц:</b> ${book.pagesCount}\n<a href="${book.cover}">Обложка</a>`,
				{ parse_mode: 'HTML' }
			)
			const mes = await ctx.reply('Загрузка...')

			for (let page = 1; page <= book.pagesCount; page++) {
				const XhtmlURL = url + 'mybook' + page.toString().padStart(4, '0') + '.xhtml'
				// console.log(XhtmlURL)

				const tab = await browser.newPage()
				await tab.goto(XhtmlURL, { timeout: 0, waitUntil: 'networkidle0' })
				console.log(`${page} page loaded`)
				const buffer = await tab.pdf({
					pageRanges: '1-1',
					printBackground: true,
					preferCSSPageSize: true,
					format: 'A5',
				})
				await tab.close()

				const pdf = await PDFDocument.load(buffer)
				const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices())
				copiedPages.forEach((e) => pdfDoc.addPage(e))

				await ctx.telegram.editMessageText(
					ctx.chat.id, mes.message_id, '',
					`Загрузка... (${(page / book.pagesCount * 100).toFixed(2)}%)`
				)
			}

			await browser.close()

			await ctx.telegram.editMessageText(
				ctx.chat.id, mes.message_id, '',
				'Загрузка завершена'
			)

			await ctx.replyWithDocument(
				{
					source: Buffer.from(await pdfDoc.save()),
					filename: `${book.name}.pdf`
				}
			)
			await ctx.telegram.deleteMessage(ctx.chat.id, mes.message_id)
		}
		catch (e) {
			console.error(e)
			switch (e.response?.status || e.response?.error_code) {
				case 403:
					return await ctx.reply('Ошибка авторизации, проверьте введённые данные')
				case 404:
					return await ctx.reply('Книга с таким id не найдена :(')
				case 400:
					return await ctx.reply('Сайт не доступен, попробуйте позже 📛')

				default:
					throw (e)
			}
		}
		finally {
			return ctx.scene.leave()
		}
	}
)