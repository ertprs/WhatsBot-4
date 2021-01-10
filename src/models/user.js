const { Model, DataTypes } = require('sequelize')
module.exports = (sequelize) =>
{
	// Helpers
	class User extends Model
	{
		hasClearance(requiredAccessLevel)
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

	//User.prototype.logger = require('../logger')

	return User
}