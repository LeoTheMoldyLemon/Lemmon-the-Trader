const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-shop-header')
		.setDescription('Creates a shop.')
		.addStringOption(option =>
			option.setName('shop-id')
				.setDescription('The message id of the shop you want to edit.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('header-embed')
				.setDescription('Embed used as the header of the shop.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let header=interaction.options.getString("header-embed")
			let embeds=[]
			try{
				embeds.push(JSON.parse(header))
			}catch{
				return interaction.reply({content:'That is not a valid embed. Use the Carl-bot embed maker to create a valid embed. (just create the embed you want and paste the raw JSON)', ephemeral:true})
			}
			let msgid=await interaction.options.getString("shop-id")
			let msg={}
			try{
				msg = await interaction.channel.messages.fetch(msgid)
			}catch{
				return interaction.reply({content:'No valid collections with that id exist in this channel.', ephemeral:true});
			}
			msg.edit({embeds:embeds})
			return interaction.reply({content:'Registered new shop.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};