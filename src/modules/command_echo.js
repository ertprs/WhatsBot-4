module.exports = {
	async echo(msg)
	{
		msg.reply(msg.body.substring(6))
	},
	config: {
		requiredAccessLevel: 9,
	},
}