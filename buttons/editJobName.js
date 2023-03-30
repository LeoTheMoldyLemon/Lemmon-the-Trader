const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"editJobName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Editing job")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("name")
							.setLabel("Name of the job:")
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("description")
							.setLabel("Description of the job:")
							.setStyle(TextInputStyle.Paragraph),
					)
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the job.', ephemeral:true});
		}
	},
};