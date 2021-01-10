const { _path, _craftResponse } = require('./utils')
const { User } = require('./db')
const logger = require('./logger')
const fs = require('fs')

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
			logger.log("Can't find user " + msg.from + " in the DB. It should have been added by the logger, ignoring message...")
			return _craftResponse(false, null /*'user_not_found'*/)
		}

		if(user.blocked) {
			logger.log('Message from blocked user ' + msg.from + '. Ignoring...')
			return _craftResponse(false)
		}

		// If the user is not enabled and has sent more than 3 messages, isEnabled will block the user. 
		// ONLY if it's a command module. 
		// TODO: ALL THE MESSAGES SHOULD BE BLOCKED IF ITS A PRIVATE MESSAGE!!!
		if(!user.isEnabled(type === COMMAND_MODULE)) {
			return _craftResponse(false, 'user_disabled_warning_message_limit')
		}

		return await this.executeModule(type, moduleName, msg, user)
	}

	// Main module, the core logic happens here
	async executeModule(type, moduleName, data, user)
	{
		// TODO: Check types ?
		// TODO: Check the module path to prevent attacks

		const path = _path('src/modules/' + type + '_' + moduleName)

		// If the user is trying to access a file outside the safe path
		if(!this.isSafePath(path)) {
			user.block('module_path_attack_attempted')
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
			const response = await mod[moduleName](client, data)

			// TODO: Check if it would not be undefined if there's no return
			if(response !== null && response.success === false)
				return response

		} catch(err) {
			logger.log('Module fatal error')
			logger.log(err)

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