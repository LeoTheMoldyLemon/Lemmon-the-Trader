const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")

const { Op } = require("sequelize");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('register-short-name')
		.setDescription('DEPRECATED. Assign a short name to a character that only you can use instead of their full name.')
		.addStringOption(option =>
			option.setName('character-name-short')
				.setDescription('The full or short name of your character.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('short-name')
				.setDescription('The short name you want to asign.')
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let character = await models.characters.findOne({where:{
				[Op.or]:[
					{charname:await interaction.options.getString("character-name-short").trim()}, 
					{shortname:await interaction.options.getString("character-name-short").trim()},],
				owner: interaction.user.id.toString(),
				guildid:interaction.guildId,
			}})
			if(character == null){
				return interaction.editReply({content:`You don't own a character with the name *${await interaction.options.getString("character-name-short").trim()}*.` , ephemeral:true});
			}
			//let rows=await models.characters.update({shortname: await interaction.options.getString("short-name").trim()},{where: {charname:character.charname}})
			if(await models.characters.findOne({where:{
				shortname:await interaction.options.getString("short-name").trim(), 
				owner: interaction.user.id.toString(),
				guildid:interaction.guildId,
			}})!=null){
				return interaction.editReply({content:`You already own a character with the shortname *${await interaction.options.getString("short-name").trim()}*.` , ephemeral:true});
			}
			
			character.shortname=await interaction.options.getString("short-name").trim()
			let rows=1
			character.save()
			if(rows==0){
				return interaction.editReply({content:`Failed to set *${character.shortname}* as the shortname of *${character.charname}*.`, ephemeral:true});
			}
			return interaction.editReply({content:`Successfully set *${character.shortname}* as the shortname of *${character.charname}*.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with registering the short name.', ephemeral:true});
		}
	},
};