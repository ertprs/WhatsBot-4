const { Log, User, Message } = require('./db')

class Logger
{
	// Internal stuff
	static async log(l = null, display = true)
	{
		// TODO: Notify via email if it's an exception or an error and we're in production
		if(l === null) {
			console.log()
			return
		}

		if(display) {
			//if(typeof(l) !== 'object')
			process.stdout.write(' => ')
			console.log(l)
		}

		if(l !== null && typeof(l) === 'object')
			l = JSON.stringify(l)

		if(!global.sessionID)
			global.sessionID = new Date().getTime()

		Log.create({ sessionID: global.sessionID, message: l })
	}

	// Client stuff
	static async logMessage(msg)
	{
		// Dejamos los datos del usuario como están, eso nos va a permitir tener granularidad con los permisos (grupos, etc)
		// TODO: Agregar datos de la persona si es nueva!
		const [user, created] = await User.findOrCreate({
			where: { username: msg.from }
		})

		if(created)
			// TODO: Also log name
			this.log('New user created: ' + msg.from)

		const message = await Message.create({
			data: JSON.stringify(msg)
		})
		await user.addMessage(message)
	}
}

module.exports = Logger