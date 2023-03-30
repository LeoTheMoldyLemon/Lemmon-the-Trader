const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"editJobName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg=interaction.message
			let embed=msg.embeds[0]
			embed.fields.forEach(field=>{
				if(field.name=="Name:"){
					field.value=interaction.fields.getTextInputValue("name")
				}else if(field.name=="Description:"){
					field.value=interaction.fields.getTextInputValue("description")
				}
			})
			return interaction.update({embeds:[embed]})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the job.', ephemeral:true});
		}
	},
};