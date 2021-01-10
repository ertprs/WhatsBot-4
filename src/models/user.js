const { Model, DataTypes } = require('sequelize')
module.exports = (sequelize) =>
{
	// Helpers
	class User extends Model
	{
		async isEnabled(blockIfMessagesExceeded = false, maxMessages = 3)
		{
			if(blockIfMessagesExceeded && !this.enabled && (await this.countMessages()) > maxMessages) {
				await this.block('maxMessages exceeded when disabled')
			}

			return this.enabled && this.blocked
		}

		async block(reason = null)
		{
			this.blocked = true
			// TODO: Add block reason somewhere more locatable in the table?
			await this.save()
			logger.log('The user ' + this.username + ' has been blocked (reason: ' + reason + ').')
		}

		hasClearance = (requiredAccessLevel) =>
		{
			return this.accessLevel >= requiredAccessLevel
		}
	}

	// Definition
	User.init({
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		username: {
			type: DataTypes.STRING,
			unique: true
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		// 1 = Admin; 9 = Just registered
		accessLevel: {
			type: DataTypes.INTEGER(1),
			defaultValue: 9
		},
		blocked: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	}, {
		sequelize
	})

	return User
}