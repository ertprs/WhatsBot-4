const { Sequelize, DataTypes } = require('sequelize')

// Instancia principal
const sequelize = new Sequelize('sqlite:./data/db.sqlite', {
	//logging: (...msg) => console.log(msg)
	// TODO: Custom logging!
})

// Plantillas
const _db_template_id = {
	type: DataTypes.INTEGER,
	autoIncrement: true,
	primaryKey: true
}

/**
 * Definiciones
 */

sequelize.define('Log', {
	id: _db_template_id,
	sessionID: DataTypes.INTEGER(20),
	message: DataTypes.TEXT,
})

/*sequelize.define('User', {
	id: _db_template_id,
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
})*/

sequelize.define('Message', {
	id: _db_template_id,
	userId: {
		type: _db_template_id.type,
		// Es necesario??
		references: {
			model: sequelize.models.User,
			key: 'id',
		}
	},
	data: DataTypes.TEXT,
})


/**
 * Exports
 */
module.exports = {
	// _sequelize: sequelize,
	Log: 		sequelize.models.Log,
	User:		require('./models/user')(sequelize),
	Message:	sequelize.models.Message
}

// Relations between models
sequelize.models.Message.belongsTo(sequelize.models.User)
sequelize.models.User.hasMany(sequelize.models.Message)

/*
class Error extends Model {}
Error.init({
	id: _db_template_id,
	error: DataTypes.TEXT,
	// Data? stringify exception?
}, {
	sequelize,
	timestamps: true,
	updatedAt: false,
})*/

// Sincronizamos la DB, por ahora solo porque estamos en testing. 
//sequelize.sync({ alter: true })