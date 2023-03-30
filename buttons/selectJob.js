const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"selectJob"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			interaction.message.edit({})
			let characters=await models.characters.findAll({where:{owner:interaction.user.id, guildid:interaction.guildId}, attributes:["charname", "balance"]})
			let options=[]
			await characters.forEach(cha=>options.push({label:cha.charname, value:cha.charname, description:toGold(cha.balance)}))
			metadata.name="selectJobName"
			metadata.id=parseInt(interaction.values[0])
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
			return interaction.reply({content:'Something went wrong with processing the job.', ephemeral:true});
		}
	},
};