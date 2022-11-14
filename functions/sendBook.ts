import puppeteer from 'puppeteer'
import { bot } from '../tools'
import { PDFDocument } from 'pdf-lib'
import { getBook, getBookURL } from './'
import { setTimeout } from 'timers/promises'
import { dir } from '../config'
import fs from 'fs'

export default async (chatId, bookId) => {
    const mes = await bot.telegram.sendMessage(chatId, 'Дождитесь окончания загрузки!')
    await setTimeout(2500)

    try {
        const book = await getBook(bookId)
        const url = await getBookURL(book.readerLink)

        await bot.telegram.editMessageText(
            chatId, mes.message_id, '',
            'Запускаем браузер...'
        )
        const browser = await puppeteer.launch({
            args: ['--incognito', '--headless', '--disable-gpu', '--full-memory-crash-report', '--unlimited-storage', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-zygote']
        })

        await bot.telegram.editMessageText(
            chatId, mes.message_id, '',
            'Создаём PDF документ...'
        )
        fs.mkdirSync(dir, { recursive: true })
        const pdfPath = `${dir}/${[...Array(20)].map(() => (~~(Math.random() * 36)).toString(36)).join('')}.pdf`

        await bot.telegram.editMessageText(
            chatId, mes.message_id, '',
            'Загружаем...'
        )

        await bot.telegram.sendMessage(
            chatId,
            `<b>«${book.name}»</b>\n\n<b>Автор:</b> ${book.author}\n<b>Год издания:</b> ${book.year}\n<b>Кол-во страниц:</b> ${book.pagesCount}\n<a href="${book.cover}">Обложка</a>`,
            { parse_mode: 'HTML' }
        )

        for (let page = 1; page <= book.pagesCount; page++) {
            const XhtmlURL = url + 'mybook' + page.toString().padStart(4, '0') + '.xhtml'
            // console.log(XhtmlURL)

            const tab = await browser.newPage()
            await tab.goto(XhtmlURL, { timeout: 0, waitUntil: 'networkidle0' })
            console.log(`${page}-ая страница загружена`)
            const buffer = await tab.pdf({
                pageRanges: '1-1',
                printBackground: true,
                preferCSSPageSize: true,
                format: 'A5',
            })
            await tab.close()

            const pdfDoc = (page === 1) ? await PDFDocument.create() : await PDFDocument.load(fs.readFileSync(pdfPath))

            const pdf = await PDFDocument.load(buffer)
            const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices())
            copiedPages.forEach((e) => pdfDoc.addPage(e))

            fs.writeFileSync(pdfPath, await pdfDoc.save())

            await bot.telegram.editMessageText(
                chatId, mes.message_id, '',
                `Загрузка... (${(page / book.pagesCount * 100).toFixed(2)}%)`
            )
        }

        await browser.close()

        await bot.telegram.editMessageText(
            chatId, mes.message_id, '',
            'Загрузка завершена'
        )

        await bot.telegram.sendDocument(
            chatId,
            {
                source: pdfPath,
                filename: `${book.name}.pdf`
            }
        )
        fs.rmSync(pdfPath)

        await bot.telegram.deleteMessage(chatId, mes.message_id)
    }
    catch (e) {
        console.error(e)
        bot.telegram.sendMessage(768331152, `error: ${e}`)
        switch (e.response?.status || e.response?.error_code) {
            case 403:
                return await bot.telegram.editMessageText(
                    chatId, mes.message_id, '',
                    'Ошибка авторизации, проверьте введённые данные'
                )
            case 404:
                return await bot.telegram.editMessageText(
                    chatId, mes.message_id, '',
                    'Книга с таким id не найдена :('
                )
            case 400:
                return await bot.telegram.editMessageText(
                    chatId, mes.message_id, '',
                    'Сайт не доступен, попробуйте позже 📛'
                )
            default:
                return await bot.telegram.editMessageText(
                    chatId, mes.message_id, '',
                    'Что-то произошло, выясняем'
                )
        }
    }
}