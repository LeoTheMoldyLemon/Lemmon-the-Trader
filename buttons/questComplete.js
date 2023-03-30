const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold,rollDice } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"questComplete"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			if(!(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents))){
				return interaction.reply({content:'Only a GM can declare that a quest is complete.', ephemeral:true});
			}
			metadata={}
			metadata.name="questCompleteMoney"
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Completeing quest")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("balance")
							.setLabel("Reward for the characters:")
							.setStyle(TextInputStyle.Short)
					),
					
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with completeing the quest.', ephemeral:true});
		}
	},
};