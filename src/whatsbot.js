/**
 * Configuration
 */
	const SESSION_FILE_PATH = 'data/session.json'

	const CLEAN_REQUIRE_CACHE = [
		'src/db',
		'src/executer',
		'src/i18n',
		'src/logger',
		'src/parser',
		'src/utils',
		'src/models/',
		'src/modules/',
		'src/locales',
	];

const { _path } = require('./utils')
const logger = require('./logger')
const { Client } = require('whatsapp-web.js')
const fs = require('fs')
const i18n = require('./i18n')

// Main
;(async () => {
	try {
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
				// Limpiamos el cache de require así podemos hacer deploys continuos
				Object.keys(require.cache).forEach(function(key) {
					CLEAN_REQUIRE_CACHE.forEach((string) => {
						if(key.indexOf(string) !== -1) {
							delete require.cache[key]
						}
					})
				})

				const parser = require('./parser')(client)

				const response = await parser.parseMessage(msg)
				if(!response.success && typeof(response.message) !== 'undefined' && response.message !== null) {
					// TODO: Add language support / module
					const rep = i18n(response.message)
					if(rep !== null)
						await msg.reply(rep)
					else {
						await logger.log('Locale string not found')
						await logger.log(response)
					}
				}
			} catch (err) {
				await logger.log('Parser fatal error')
				await logger.log(err)
			}
		})

		client.initialize().catch((e) =>
		{
			throw e
		})
    } catch (e) {
		await logger.log(e)
		// TODO: Cerrar WP!
	}
})()