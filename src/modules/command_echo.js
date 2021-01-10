module.exports = {
	async echo(msg)
	{
		await msg.reply(msg.body.substring(6))
	},
	config: {
		requiredAccessLevel: 9,
	},
}