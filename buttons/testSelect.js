const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"testSelect"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			
			if(interaction.values[0]=="test1"){
				return interaction.reply({content:'TEST', ephemeral:true});
			}
			return interaction.reply({content:'TEST', ephemeral:false});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with denying the request.', ephemeral:true});
		}
	},
};