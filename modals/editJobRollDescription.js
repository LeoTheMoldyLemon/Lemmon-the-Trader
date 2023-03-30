const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"editJobRollDescription"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg=interaction.message
			let embed=msg.embeds[0]
			embed.fields.forEach(field=>{
				if(field.name=="Description of 1st roll:"){
					field.value=interaction.fields.getTextInputValue("roll1")
				}else if(field.name=="Description of 2nd roll:"){
					field.value=interaction.fields.getTextInputValue("roll2")
				}else if(field.name=="Description of 3rd roll:"){
					field.value=interaction.fields.getTextInputValue("roll3")
				}else if(field.name=="Description of replacement roll:"){
					field.value=interaction.fields.getTextInputValue("rollrep")
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