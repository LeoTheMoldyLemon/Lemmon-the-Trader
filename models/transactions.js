module.exports = (sequelize, DataTypes) => {
	return sequelize.define('transactions', {
		buyername: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		sellername: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		itemname: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		guildid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},{updatedAt: false,});
};