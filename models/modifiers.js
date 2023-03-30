

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('modifiers', {
		jobid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey:true,
		},
		charname: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		roll1:{
			type: DataTypes.INTEGER,
			allowNull:false,
		},
		roll2:{
			type: DataTypes.INTEGER,
			allowNull:false,
		},
		roll3:{
			type: DataTypes.INTEGER,
			allowNull:false,
		},
		rollreplacement:{
			type: DataTypes.INTEGER,
			allowNull:false,
		},

	}, {
		timestamps: false,
	});
};