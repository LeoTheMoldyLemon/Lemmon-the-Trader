const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"shopPostSellName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			metadata.name="shopPostSell"
			metadata.charname=interaction.values[0]
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Selling item.")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("price")
							.setLabel("Sell price of the item/service:")
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("item-name")
							.setLabel("Name of the item/service:")
							.setStyle(TextInputStyle.Short)
					),
					
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with selling the item.', ephemeral:true});
		}
	},
};