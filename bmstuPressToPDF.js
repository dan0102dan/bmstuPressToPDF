import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { getBook, getBookURL } from './functions/index.js'
import { bookID, dir } from './config.js'
import fs from 'fs'

try {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const pdfDoc = await PDFDocument.create()

    const book = await getBook(bookID)

    const url = await getBookURL(book.readerLink)

    fs.mkdirSync(dir, { recursive: true })
    console.log(`Книга: "${book.name}\nСтраниц: ${book.pagesCount}\n\nЗагружаем...`)
    for (let page = 1; page <= book.pagesCount; page++) {
        const XhtmlURL = url + 'mybook' + page.toString().padStart(4, '0') + '.xhtml'
        console.log(XhtmlURL)

        const tab = await browser.newPage()
        await tab.goto(XhtmlURL, { waitUntil: 'networkidle0' })

        const buffer = await tab.pdf({
            pageRanges: '1-1',
            printBackground: true,
            PreferCSSPageSize: true,
            format: 'A5',
        })
        // fs.writeFileSync(`${dir}/${book.name}${page}.pdf`, buffer)

        const pdf = await PDFDocument.load(buffer)
        const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((e) => pdfDoc.addPage(e))
    }

    await browser.close()

    fs.writeFileSync(`${dir}/${book.name}.pdf`, await pdfDoc.save())
} catch (e) {
    switch (e.response.status) {
        case 403:
            console.error('Ошибка авторизации, проверьте введённые данные')
            break

        default:
            console.error(e)
    }
}