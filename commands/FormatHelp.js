const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits,AttachmentBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help-format')
		.setDescription("View the format guide for entering currency.")
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			const file = new AttachmentBuilder('./format.png');

			let embed={
			    "type": "rich",
			    "title": `Format Guide`,
			    "description": `When asked to enter a price or amount of money, you can refer to the following format examples:\n\n`,
			    "color": 0x003cff,
				image: {
					url: 'attachment://format.png',
				},
			}
			return interaction.reply({embeds:[embed], files:[file], ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the help command.', ephemeral:true});
		}
	},
};