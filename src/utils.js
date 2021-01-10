module.exports = {
	_path(path) {
		return __dirname + '/../' + path
	},
	_craftResponse(success, message = null)
	{
		// TODO: Log responses ?
		return {
			success: success,
			message: message,
		}
	}
}