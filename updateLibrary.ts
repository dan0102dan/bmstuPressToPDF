import { sendBook } from './functions'

(async () => {
    for (let i = 0; i < 10000; i++) {
        await sendBook(768331152, i)
    }
})()