const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold,rollDice } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"questAddCharacterName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg={}
			try{
				msg=await interaction.channel.messages.fetch(metadata.id)
			}catch{
				return interaction.reply({content:'Quest no longer exists.', ephemeral:true})
			}
			if(msg.embeds[0].fields[0].value!="")msg.embeds[0].fields[0].value+="\n"
			msg.embeds[0].fields[0].value+=interaction.values[0]
			await msg.edit({embeds:msg.embeds})
			return interaction.update({content:'Added character to quest.', components:[], ephemeral:true})
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the character.', ephemeral:true});
		}
	},
};