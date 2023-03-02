const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view-balance')
		.setDescription("View the balance of one of your characters.")
		.addStringOption(option =>
			option.setName('character-name-short')
				.setDescription('The full or short name of your character.')
				.setAutocomplete(true)
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let name=await interaction.options.getString("character-name-short").trim()
			let character = await models.characters.findOne({where:{
				[Op.or]:[
					{charname:name},
					{shortname:name},
					], 
				owner: interaction.user.id.toString(),
				guildid:interaction.guildId,
				},
				attributes:["charname", "balance"]})
			if(character == null){
				return interaction.editReply({content:`You don't own a character with the name *${name}*.` , ephemeral:true});
			}
			//let rows=await models.characters.update({shortname: await interaction.options.getString("short-name").trim()},{where: {charname:character.charname}})

			return interaction.editReply({content:`**${character.charname}** - ${toGold(character.balance)}.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with registering the short name.', ephemeral:true});
		}
	},
};