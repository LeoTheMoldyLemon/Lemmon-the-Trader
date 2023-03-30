

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('jobs', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		guildid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		roll1name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		roll2name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		roll3name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		roll1dice: {
			type: DataTypes.INTEGER,
		},
		roll2dice: {
			type: DataTypes.INTEGER,
		},
		roll3dice: {
			type: DataTypes.INTEGER,
		},
		replacementname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};