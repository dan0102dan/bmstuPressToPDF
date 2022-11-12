import { Telegraf } from 'telegraf'
import { mainBot } from '../../config'

import { helloMes } from './commands/responses'
import { catchBookID } from './commands/updates'

const bot = new Telegraf(mainBot.id + ':' + mainBot.token, {
	telegram: {
		apiRoot: 'http://localhost:8081'
	}
})

bot.catch(console.error)
// приветствие
bot.start(helloMes)

bot.on('message', catchBookID)

export default bot