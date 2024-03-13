import axios from 'axios'
import { Cookie } from '../config'

export default axios.create({
    baseURL: 'https://press.bmstu.ru',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
        Cookie
    }
})