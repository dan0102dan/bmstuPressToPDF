import cheerio from 'cheerio'
import { bmstuPress } from '../tools/API.js'

export default async (readerLink) => {
    const { data } = await bmstuPress.get(readerLink)
    const $ = cheerio.load(data)

    const url = $('div[id=app-reader] > app-reader').attr('url').slice(0, -11)
    // console.log(url)
    return url
}