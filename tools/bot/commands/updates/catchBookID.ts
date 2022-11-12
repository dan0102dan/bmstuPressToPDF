import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { getBook, getBookURL } from '../../../../functions'
// import { dir } from '../../../../config'
import { helloMes } from '../responses'
// import fs from 'fs'

export default async (ctx) => {
	try {
		const bookID = Number(ctx.message.text.replace(/[^0-9]/g, ''))
		if (!bookID)
			return await helloMes(ctx)

		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		})
		const pdfDoc = await PDFDocument.create()

		const book = await getBook(bookID)

		const url = await getBookURL(book.readerLink)

		await ctx.replyWithPhoto(
			book.cover,
			{
				caption: `<b>«${book.name}»</b>\n\n<b>Автор:</b> ${book.author}\n<b>Год издания:</b> ${book.year}\n<b>Кол-во страниц:</b> ${book.pagesCount}`,
				parse_mode: 'HTML'
			}
		)
		const mes = await ctx.reply('Загрузка...')

		for (let page = 1; page <= book.pagesCount; page++) {
			const XhtmlURL = url + 'mybook' + page.toString().padStart(4, '0') + '.xhtml'
			// console.log(XhtmlURL)

			const tab = await browser.newPage()
			await tab.goto(XhtmlURL, { waitUntil: 'networkidle0' })
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

		// fs.mkdirSync(dir, { recursive: true })
		// fs.writeFileSync(`${dir}/${book.name}.pdf`, await pdfDoc.save())
		await ctx.telegram.editMessageText(
			ctx.chat.id, mes.message_id, '',
			'Загрузка завершена'
		)

		await ctx.replyWithDocument({
			source: await pdfDoc.save()
		})
	} catch (e) {
		switch (e.response?.status || e.response?.error_code) {
			case 403:
				return await ctx.reply('Ошибка авторизации, проверьте введённые данные')
			case 404:
				return await ctx.reply('Книга с таким id не найдена :(')
			case 400:
				return await ctx.reply('Сайт не доступен, попробуйте позже')

			default:
				console.error(e)
				throw (e)
		}
	}
}