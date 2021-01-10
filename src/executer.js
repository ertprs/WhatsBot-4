const { _path, _log } = require('./utils.js')
const { User } = require('./db.js')
const fs = require('fs')

const COMMAND_MODULE = 'command'

module.exports = {


	// async executeModule generico que haga todo el chiste de permisos y etc.
	// msg se convierte en data y se pasa como arg a todos los modulos!
	async executeCommandModule(command, msg)
	{
		return await module.exports.executeMessageModule('command', command, msg)
	},
	async executeMessageModule(type, moduleName, msg)
	{
		// TODO: Move to User class
		const user = await User.findOne({ where: { username: msg.from }})
		if(! await module.exports.isEnabled(user /* TODO: BLOCK SOLO SI != GRUPO */)) {
			_log("El usuario " + msg.from + " está deshabilitado o bloqueado. Ignorando mensaje...")
			return
		}

		// TODO: If has clearance

		return await module.exports.executeModule(type, moduleName, msg)
	},
	async executeModule(type, moduleName, data)
	{
		// TODO: Check types ?
		// TODO: Check the module path to prevent attacks
		let commandPath = _path('src/modules/' + type + '_' + moduleName + '.js')

		if(fs.existsSync(commandPath)) {
			try {
				const mod = require(commandPath)

				if(typeof mod.config.requiredAccessLevel === 'undefined')
					mod.config.requiredAccessLevel = 1

				console.log(typeof(mod[moduleName]))
			} catch (err) {
				_log(err)
				msg.reply('Ocurrió un error al ejecutar el módulo')
			}
		} else {
			msg.reply('El módulo no existe')
		}
	},
	/**
	 * TODO: Move to User class
	 */
	async isEnabled(user, block = true)
	{
		if(user === null || user.blocked)
			return false

		if(!user.enabled && (await user.countMessages()) > 10 && block) {
			_log("El usuario " + user.username + " ha superado los 10 mensajes sin estar habilitado, bloqueando...")
			user.blocked = true
			user.save()

			return false
		}

		return true
	},
	async hasClearance(user, command)
	{

		

		// TODO: Check module configs!

		return true;
	},
	async isSafePath(path)
	{
		// TODO
		// If not, block ;)
		return true;
	},
}