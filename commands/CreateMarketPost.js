const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-market-post')
		.setDescription("Register a player-created market post in this channel.")
		.addStringOption(option =>
			option.setName('character-name-short')
				.setDescription('The full or short name of your character.')
				.setAutocomplete(true)
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let name=await interaction.options.getString("character-name-short").trim()
			let character = await models.characters.findOne({where:{
				[Op.or]:[
					{charname:name},
					{shortname:name},
					], 
				owner: interaction.user.id.toString(),
				guildid:interaction.guildId,
				},
				attributes:["charname"]})
			if(character == null){
				return interaction.editReply({content:`You don't own a character with the name *${name}*.` , ephemeral:true});
			}
			//let rows=await models.characters.update({shortname: await interaction.options.getString("short-name").trim()},{where: {charname:character.charname}})
			
			let metadata={name:"createMarketPost", seller:character.charname}
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Creating a market post.")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("item-name")
							.setLabel("The item/service you're selling:")
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("description")
							.setLabel("Description of the items/services:")
							.setStyle(TextInputStyle.Paragraph)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("price")
							.setLabel("Price (for one, not all):")
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("amount")
							.setLabel(`Amount (you can use "infinite"):`)
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("title")
							.setLabel(`Title of the post (use "blank" for no title):`)
							.setStyle(TextInputStyle.Short)
					),
					
				)
			
			
			
			return interaction.showModal(modal)
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with creating the market post.', ephemeral:true});
		}
	},
};