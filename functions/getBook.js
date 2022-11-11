import cheerio from 'cheerio'
import { bmstuPress } from '../tools/API.js'

export default async (id) => {
    const book = {}

    const { data } = await bmstuPress.get(`catalog/item/${id}/`)
    const $ = cheerio.load(data)

    book.pagesCount = Number($('body > section > div > div.content > div > div.book-wrapper > div.area-cost > div > div.data-list > div.item.d-none > div > ul > li:nth-child(2)').text().replace(/[^0-9]/g, ''))
    book.readerLink = $('body > section > div > div.content > div > div.book-wrapper > div.cover > div.actions > a').attr('href')
    book.name = $('body > section > div > div.content > div > div.book-wrapper > div.area-title > header > div.page-title > h1').text().trim()
    // console.log(book)
    return book
}