/**
 * Configuration
 */

	const PARSER_COMMAND_CHAR = '.'

const { _log, _path } = require('./utils.js')
const { User, Message } = require('./db.js');
const executer = require('./executer.js')
const fs = require('fs')

function setClient(client)
{
	module.exports.client = client;
}

module.exports = {
	setClient: setClient,
	
	async parse(msg)
	{
		// Guardamos los logs correspondientes, esperando a que se guarden
		await module.exports.logMessage(msg)

		// Ejecutamos los módulos
		await module.exports.parseForCommand(msg)
	},
	async parseForCommand(msg)
	{
		msg.body = msg.body.trim()

		if(PARSER_COMMAND_CHAR === msg.body.charAt(0)) {
			let command = msg.body.substring(1, msg.body.indexOf(' '))
			await executer.executeCommandModule(command, msg)
		}
	},
	async logMessage(const msg)
	{

		// Move to logger!!
		// Aunque venga de un grupo vamos a dejar el from original, con el dato del grupo, 
		// esto nos va a permitir tener granularidad en los permisos. 
		const [user, created] = await User.findOrCreate({
			where: { username: msg.from }
		})

		// TODO: also log nombre!!
		if(created)
			_log("Message received from new user: " + msg.from)

		await Message.create({
			userId: user.id,
			data: JSON.stringify(msg)
		})
	},
}