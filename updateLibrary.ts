import { sendBook } from './functions'
import { setTimeout } from 'timers/promises'

(async () => {
    for (let i = 2947; i < 10000; i++)
        try {
            await sendBook(768331152, i)
            await setTimeout(500)
            throw Error()
        }
        catch {
            console.log('skip', i)
        }
})()
