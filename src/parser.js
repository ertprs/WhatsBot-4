/**
 * Configuration
 */

const PARSER_COMMAND_CHAR = '.'

const logger = require('./logger')
const { _craftResponse } = require('./utils')

// TODO: Use utils - craftResponse - maybe create an object? ORM???
module.exports = (client) =>
{
	class Parser
	{
		constructor(client)
		{
			this.client = client
			this.executer = require('./executer')(client)
		}

		async parseMessage(msg)
		{
			// This also creates the user if it doesn't exist
			await logger.logMessage(msg)

			// Ejecutamos los módulos
			let response = await this.parseForCommand(msg)
			if(!response.success)
				return response

			// TODO: Parse for other modules
			// If it's a private message we should always return false if a module is not executed

			return _craftResponse(true)
		}
		async parseForCommand(msg)
		{
			msg.body = msg.body.trim()

			if(PARSER_COMMAND_CHAR === msg.body.charAt(0)) {
				// TODO: STRTOLOWER
				const command = msg.body.substring(1, msg.body.indexOf(' '))
				const response = await this.executer.executeCommandModule(command, msg)

				if(!response.success)
					return response
			}

			return _craftResponse(true)
		}
	}

	return new Parser(client)
}