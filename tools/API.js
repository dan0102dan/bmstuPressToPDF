import axios from 'axios'
import { cookie } from '../config.js'

export const bmstuPress = axios.create({
    baseURL: 'https://bmstu.press',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
        Cookie: cookie
    }
})