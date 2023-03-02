const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder,StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"shopPostBuyUnlisted"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let characters=await models.characters.findAll({where:{owner:interaction.user.id, guildid:interaction.guildId}, attributes:["charname"]})
			let options=[]
			await characters.forEach(cha=>options.push({label:cha.charname, value:cha.charname}))
			metadata.name="shopPostBuyUnlistedName"
			const row=new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify(metadata))
						.setPlaceholder("Select a character")
						.addOptions(options)
				)
			return interaction.reply({components:[row], ephemeral:true})
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with buying the item.', ephemeral:true});
		}
	},
};