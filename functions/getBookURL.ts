import cheerio from 'cheerio'
import { bmstuAPI } from '../tools'

export default async (readerLink) => {
    const { data } = await bmstuAPI.get(readerLink)
    const $ = cheerio.load(data)

    const url = $('div[id=app-reader] > app-reader').attr('url')?.slice(0, -11)
    // console.log(url)
    return url
}