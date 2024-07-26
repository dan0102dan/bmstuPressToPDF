import { Telegraf, Scenes, session } from 'telegraf'
import { mainBot } from '../../config'

import { helloMes, menu } from './commands/responses'
import { cancel, getbook } from './commands/stage'

const stage = new Scenes.Stage<Scenes.WizardContext>([getbook])
stage.command('cancel', cancel)
stage.action('cancel', cancel)

const bot = new Telegraf<Scenes.SceneContext>(mainBot.id + ':' + mainBot.token, {
	// telegram: {
	// 	apiRoot: 'http://localhost:8081'
	// }
})
bot.use(session())
bot.use(stage.middleware())

bot.catch(console.error)

bot.start(helloMes)

bot.command('menu', menu)
bot.action('menu', menu)

bot.command('getbook', (ctx) => ctx.scene.enter('getbook'))
bot.action('getbook', (ctx) => ctx.scene.enter('getbook'))

export default bot