const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"shopPostBuyMultipleName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let shopinfo=await models.shops.findByPk(metadata.id)
			metadata.charname=interaction.values[0]
			metadata.name="shopPostBuyMultiple"
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Buying multiple items for "+toGold(shopinfo.price))
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("amount")
							.setLabel("Number of items/services you want to buy:")
							.setStyle(TextInputStyle.Short)
					),
					
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with buying the items.', ephemeral:true});
		}
	},
};