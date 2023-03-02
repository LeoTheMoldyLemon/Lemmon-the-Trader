module.exports = (sequelize, DataTypes) => {
	return sequelize.define('shop', {
		item: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		seller: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		playercreated: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		guildid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		channelid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		msgid: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		restock: {
			type: DataTypes.INTEGER,
			defaultValue:0,
			allowNull: false,
		},
		
	}, {
		timestamps: false,
	});
};