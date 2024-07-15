import cheerio from 'cheerio'
import { bmstuAPI } from '../tools'

export default async (id) => {
    const book = <{
        pagesCount: number
        readerLink?: string
        name: string
        author: string
        cover?: string
        year: number,
        subject: string
    }>{}

    const { data } = await bmstuAPI.get(`catalog/item/${id}/`)
    const $ = cheerio.load(data)

    book.pagesCount = Number($('body > section > div > div.content > div > div.book-wrapper > div.area-cost > div > div.data-list > div.item.d-none > div > ul > li:nth-child(2)').text().replace(/[^0-9]/g, ''))
    book.readerLink = $('body > section > div > div.content > div > div.book-wrapper > div.cover > div.actions > a').attr('href')
    book.name = $('body > section > div > div.content > div > div.book-wrapper > div.area-title > header > div.page-title > h1').text().trim()
    book.author = $('body > section > div > div.content > div > div.book-wrapper > div.area-title > div.info__author > div:nth-child(2)').text().replace(/\s\s+/g, ' ').trim()
    book.cover = $('body > section > div > div.content > div > div.book-wrapper > div.cover > div.cover-wrapper > img').attr('src')
    book.year = Number($('body > section > div > div.content > div > div.book-wrapper > div.area-cost > div > div.data-list > div.item.d-none > div > ul > li:nth-child(3)').text().replace(/[^0-9]/g, ''))
    book.subject = $('body > section > div > div > div > div.book-wrapper > div.area-title > div.info__rubric > a.category-pill.item').text().trim().split('\n')[0].trim()

    return book
}