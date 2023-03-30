const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"editJobExtraDie"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Editing job (use \"none\", \"hit die\" or \"dX\")")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("roll1")
							.setLabel("Type of extra die of 1st roll:")
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("roll2")
							.setLabel("Type of extra die of 2nd roll:")
							.setStyle(TextInputStyle.Short),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("roll3")
							.setLabel("Type of extra die of 3rd roll:")
							.setStyle(TextInputStyle.Short),
					),
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the job.', ephemeral:true});
		}
	},
};