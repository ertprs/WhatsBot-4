module.exports = {
	async echo(msg)
	{
		msg.reply(msg.body.substring(6))
	},
	config: {
		// requiredClearance: 1,
	},
}