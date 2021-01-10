/**
 * Configuration
 */
	const SESSION_FILE_PATH = 'data/session.json'

const { _path, _log } = require('./utils.js')
const { Client } = require('whatsapp-web.js')
const fs = require('fs')

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
				// TODO: SAVE ERROR WITH stringified data
				if(err !== null)
					_log("Error while trying to save session data")
			})
		})

		// QR CODE RECEIVED
		client.on('qr', (qr) => {
			require('qrcode-terminal').generate(qr, { small: true })
			_log("QR code received: " + qr, false)
		})

		// CLIENT READY
		client.on('ready', () => {
		    console.log('Client is ready!')
		})

		client.on('message', async (msg) => {
			try {
				// Limpiamos el cache de require así podemos recargar el parser cada vez que lo usamos. 
				Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
				//let parser = require()
				const parser = require('./parser.js')
				await parser.setClient(client)
				await parser.parse(msg)
			} catch (err) {
				msg.reply("No funca al parss")
				_log(err)
			}
		})

		client.initialize().catch((e) =>
		{
			throw e
		})
    } catch (e) {
		_log(e)
		console.log(e)
	}
})()