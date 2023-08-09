import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { bot } from '../tools'
import { getBook, getBookURL } from './'
// import { setTimeout } from 'timers/promises'
import { dir, libDir } from '../config'
import fs from 'fs'

export default async (chatId, bookId) => {
    const mes = await bot.telegram.sendMessage(chatId, 'Дождитесь окончания загрузки!')
    // await setTimeout(2500)

    try {
        const book = await getBook(bookId)
        const url = await (await getBookURL(book.readerLink))
        console.log(book, url)

        await bot.telegram.sendMessage(
            chatId,
            `<b>${book.name}</b>\n\n<b>Автор:</b> ${book.author}\n<b>Предмет:</b> ${book.subject}\n<b>Год издания:</b> ${book.year}\n<b>Кол-во страниц:</b> ${book.pagesCount}\n<a href="${book.cover}">Обложка</a>`,
            { parse_mode: 'HTML' }
        )

        const libPath = `${libDir}/${bookId}.pdf`
        if (fs.existsSync(libPath)) {
            await bot.telegram.editMessageText(
                chatId, mes.message_id, '',
                'Нашли в базе, отправляем!'
            )

            await bot.telegram.sendDocument(
                chatId,
                {
                    source: libPath,
                    filename: `${book.name}.pdf`
                }
            )
        }
        else {
            await bot.telegram.editMessageText(
                chatId, mes.message_id, '',
                'Запускаем браузер...'
            )
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', '--disable-features=DefaultPassthroughCommandDecoder', '--disable-gpu-sandbox']
            })

            fs.mkdirSync(dir, { recursive: true })
            const bookPath = `${dir}/${[...Array(20)].map(() => (~~(Math.random() * 36)).toString(36)).join('')}.pdf`

            await bot.telegram.editMessageText(
                chatId, mes.message_id, '',
                'Загружаем...'
            )

            for (let page = 1; page <= book.pagesCount; page++) {
                const XhtmlURL = url + 'mybook' + page.toString().padStart(4, '0') + '.xhtml'

                const tab = await browser.newPage()
                await tab.goto(XhtmlURL, { timeout: 0, waitUntil: 'networkidle0' })
                console.log(`${page}-ая страница загружена (${XhtmlURL})`)
                const buffer = await tab.pdf({
                    pageRanges: '1-1',
                    printBackground: true,
                    preferCSSPageSize: true,
                    format: 'A5',
                })
                await tab.close()

                const pdfDoc = (page === 1) ? await PDFDocument.create() : await PDFDocument.load(fs.readFileSync(bookPath), { updateMetadata: false })
                if (page === 1) {
                    pdfDoc.setTitle(book.name)
                    pdfDoc.setAuthor(book.author)
                    pdfDoc.setSubject(book.subject)
                    pdfDoc.setCreationDate(new Date(book.year, 0))
                    pdfDoc.setProducer('studentinator corporation')
                    pdfDoc.setCreator('Издательство МГТУ им. Н. Э. Баумана')
                }

                const pdf = await PDFDocument.load(buffer)
                const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices())
                copiedPages.forEach((e) => pdfDoc.addPage(e))

                fs.writeFileSync(bookPath, await pdfDoc.save())

                await bot.telegram.editMessageText(
                    chatId, mes.message_id, '',
                    `Загрузка... (${(page / book.pagesCount * 100).toFixed(2)}%)`
                )
            }
            fs.mkdirSync(`${libDir}`, { recursive: true })
            fs.copyFileSync(bookPath, libPath)

            await browser.close()

            await bot.telegram.editMessageText(
                chatId, mes.message_id, '',
                'Загрузка завершена'
            )
            await bot.telegram.sendDocument(
                chatId,
                {
                    source: bookPath,
                    filename: `${book.name}.pdf`
                }
            )
            fs.rmSync(bookPath)
        }

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