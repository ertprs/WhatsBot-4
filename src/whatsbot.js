/**
 * Configuration
 */
	const SESSION_FILE_PATH = 'data/session.json'

const { _path } = require('./utils')
const logger = require('./logger')
const { Client } = require('whatsapp-web.js')
const fs = require('fs')
const i18n = require('./i18n')

// Main
;(async () => {
	try {
		/**
			Debug and test code!
		 */

		// Inicializamos el bot, si es posible con los datos de sesión previos
		let sessionData = fs.existsSync(_path(SESSION_FILE_PATH)) ? require(_path(SESSION_FILE_PATH)) : null
		const client = new Client({ puppeteer: { headless: false }, session: sessionData })

		// AUTHENTICATED
		client.on('authenticated', (session) => {
			sessionData = session
			fs.writeFile(_path(SESSION_FILE_PATH), JSON.stringify(session), (err) => {
				if(err !== null) {
					logger.log('Error while trying to save session data')
					logger.log(err)
				}
			})
		})

		// QR CODE RECEIVED
		client.on('qr', (qr) => {
			require('qrcode-terminal').generate(qr, { small: true })
			logger.log("QR code received: " + qr, false)
		})

		// CLIENT READY
		client.on('ready', () => {
			logger.log('Connected!')
		})

		client.on('message', async (msg) => {
			try {
				// Limpiamos el cache de require así podemos recargar el parser cada vez que lo usamos. 
				Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
				const parser = require('./parser')(client)

				const response = await parser.parseMessage(msg)
				if(!response.success && typeof(response.message) !== 'undefined' && response.message !== null) {
					// TODO: Add language support / module
					rep = i18n(response.message)
					if(rep !== null)
						msg.reply(rep)
					else
						logger.log("REVENTO TODO TODOS A LOS BOTES")
				}
			} catch (err) {
				logger.log('Parser fatal error')
				logger.log(err)
			}
		})

		client.initialize().catch((e) =>
		{
			throw e
		})
    } catch (e) {
		logger.log(e)
		// TODO: Cerrar WP!
	}
})()