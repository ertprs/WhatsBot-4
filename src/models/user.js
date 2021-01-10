const { Model, DataTypes } = require('sequelize')
module.exports = (sequelize) =>
{
	// Helpers
	class User extends Model
	{
		hasClearance(user, requiredClearance)
		{

		}
		/*sequelize.models.User.prototype.hasClearance = (user, requiredClearance) =>
{

    User.prototype.isValidPassword = async (user, userInputtedPassword) => {
        try {
            return await bcrypt.compare(userInputtedPassword, user.password);
        } catch (error) {
            throw new Error(error);
        }
    };

    return User;
}*/

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
		// 1 = Admin; 9 = Not registered yet
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