import wkhtmltopdf from 'wkhtmltopdf'
import { bot } from '../tools'
import { getBook, getBookURL } from './'
// import { setTimeout } from 'timers/promises'
import { dir } from '../config'
import fs from 'fs'

export default async (chatId, bookId) => {
    const mes = await bot.telegram.sendMessage(chatId, 'Дождитесь окончания загрузки!')
    // await setTimeout(2500)

    try {
        const book = await getBook(bookId)
        const url = await (await getBookURL(book.readerLink))
        console.log(url)
        await bot.telegram.sendMessage(
            chatId,
            `<b>«${book.name}»</b>\n\n<b>Автор:</b> ${book.author}\n<b>Год издания:</b> ${book.year}\n<b>Кол-во страниц:</b> ${book.pagesCount}\n<a href="${book.cover}">Обложка</a>`,
            { parse_mode: 'HTML' }
        )

        fs.mkdirSync(dir, { recursive: true })
        const bookPath = `${dir}/${[...Array(20)].map(() => (~~(Math.random() * 36)).toString(36)).join('')}.pdf`

        await bot.telegram.editMessageText(
            chatId, mes.message_id, '',
            'Загружаем...'
        )

        await new Promise((resolve, reject) => {
            const stream = wkhtmltopdf(
                new Array(book.pagesCount).fill(0).map((e, i) => url + 'mybook' + (i + 1).toString().padStart(4, '0') + '.xhtml'),
                {
                    images: true,
                    background: true,
                    enableExternalLinks: true,
                    enableForms: true,
                    imageQuality: 100,
                    printMediaType: true,
                    disableSmartShrinking: true,
                    headerSpacing: 0
                }
            )
            stream.on('error', reject)
            stream.on('end', resolve)

            stream.pipe(fs.createWriteStream(bookPath))
        })

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