const { Log } = require('./db')

module.exports = {
	_path(path) {
		return __dirname + '/../' + path
	},
	_log(l = null, display = true) {
		if(l === null) {
			console.log()
			return
		}

		if(display)
			console.log(l)

		if(l !== null && typeof(l) === 'object')
			l = JSON.stringify(l)

		if(!global.sessionID)
			global.sessionID = new Date().getTime();

		Log.create({ sessionID: global.sessionID, message: l });
	}
}