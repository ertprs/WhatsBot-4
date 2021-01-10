const { _path, _craftResponse } = require('./utils')
const { User } = require('./db')
const logger = require('./logger')
const fs = require('fs')

// Block the user after 5 messages if it's disabled
const BLOCK_IF_DISABLED_AFTER_MESSAGES = 5;

const COMMAND_MODULE = 'command'

class Executer
{
	constructor(client)
	{
		this.client = client
	}

	// Alias
	async executeCommandModule(command, msg)
	{
		return await this.executeMessageModule('command', command, msg)
	}

	// The actual stuff
	async executeMessageModule(type, moduleName, msg)
	{
		const user = await User.findOne({
			where: { username: msg.from}
		})

		// If we can't find the user, that's really wrong because it should've been added beforehand
		if(user === null) {
			await logger.log("Can't find user " + msg.from + " in the DB. It should have been added by the logger, ignoring message...")
			return _craftResponse(false, null /*'user_not_found'*/)
		}

		if(user.blocked) {
			await logger.log('Message from blocked user ' + msg.from + '. Ignoring...')
			return _craftResponse(false)
		}

		// We'll block the user if it's disabled and has exceeded 3 messages
		if(!user.enabled) {
			if((await user.countMessages()) > BLOCK_IF_DISABLED_AFTER_MESSAGES) {
				user.blocked = true
				await user.save()
				// TODO: save block reason

				return _craftResponse(false, 'blocked_max_messages')
			}

			// TODO: Implementar corner cases,
			// 1. Si el mensaje viene de un grupo, ignorar a menos que sea un comando
			// 2. Si el mensaje es un privado, contar SIEMPRE
			if(COMMAND_MODULE === type) {
				return _craftResponse(false, 'user_disabled_warning_message_limit')
			}

			// If the message is not a command message, we'll just ignore it
			return _craftResponse(true)
		}

		return await this.executeModule(type, moduleName, msg, user)
	}

	// Main module, the core logic happens here
	async executeModule(type, moduleName, data, user)
	{
		// TODO: Check types ?
		// TODO: Check the module path to prevent attacks

		const path = _path('src/modules/' + type + '_' + moduleName + '.js')

		// If the user is trying to access a file outside the safe path
		if(!this.isSafePath(path)) {
			await logger.log('Module path attack attempted. Blocking user...')
			user.blocked = true
			await user.save()
			//user.block('module_path_attack_attempted')
			return _craftResponse(false, 'attack_attempted_blocked')
		}

		// If the module doesn't exist
		if(!fs.existsSync(path))
			return _craftResponse(false, 'module_not_found')

		// Try to load the module and execute it
		try {
			const mod = require(path)

			// Check the access level, if not set, set to maximum
			if(typeof mod.config.requiredAccessLevel === 'undefined')
				// TODO: Avoid hardcoding the numbers this way, use enum type maybe?
				mod.config.requiredAccessLevel = 1

			// TODO: Log the amount of times an user tries and block if exceeds it
			if(!user.hasClearance(mod.config.requiredAccessLevel))
				return _craftResponse(false, 'module_not_allowed')

			// Now the module is loaded and the user has clearance
			// TODO: Unroll the args for the module ?
			const response = await mod[moduleName](data, this.client)

			// TODO: Check if it would not be undefined if there's no return
			if(typeof(response) !== 'undefined' && response !== null && typeof(response.success) !== 'undefined' && response.success === false) {
				console.log(response)
				return response
			}

		} catch(err) {
			await logger.log('Module fatal error')
			await logger.log(err)

			return _craftResponse(false, 'module_fatal_error')
		}
	}

	// Helpers
	isSafePath = (path) =>
	{
		// TODO
		return true;
	}
}

// TODO: instead of receiving the msg itself, it should receive an user object from the web-whatsapp api
module.exports = (client) => {
	return new Executer(client)
}