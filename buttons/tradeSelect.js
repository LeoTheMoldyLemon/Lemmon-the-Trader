const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"tradeSelect"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			interaction.message.edit({})
			if(isNaN(parseInt(interaction.values[0]))){
				return interaction.reply({content:`Can't buy the placeholder.`, ephemeral:true});
			}
			let shop=await models.shops.findByPk(parseInt(interaction.values[0]))
			if(shop==null){
				return interaction.reply({content:`Trade is not recognized internally, this is either an error or the trade is extremely outdated, ask a GM for help.`, ephemeral:true});
			}
			let btnData={name:'shopPostBuyOne', id:shop.id}
			let btns = new ActionRowBuilder();
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btnData))
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Buy one`),
			);
			btnData.name='shopPostBuyMultiple'
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btnData))
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Buy multiple`),
			);
			return interaction.reply({content:`**Item:** ${shop.item}\n**Price:** ${toGold(shop.price)}`+ ((shop.description)? (`\n**Description:**\n${shop.description}`):("")), components:[btns], ephemeral:true});
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with buying the item.', ephemeral:true});
		}
	},
};