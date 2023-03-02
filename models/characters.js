

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('characters', {
		charname: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		shortname: DataTypes.STRING,
		owner: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		balance: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		guildid: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
	}, {
		paranoid: true,
	});
};