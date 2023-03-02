const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete-character')
		.setDescription('Delete a character. (All their transactions records will remain.)')
		.addStringOption(option =>
			option.setName('character-name')
				.setDescription('The name of the character you want to delete.')
				.setAutocomplete(true)
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let character=await models.characters.findOne({where:{
				charname:await interaction.options.getString("character-name").trim(),
				guildid:interaction.guildId,
			}})
			if(character==null){
				return interaction.reply({content:`No character with the name *${await interaction.options.getString("character-name").trim()}* exists.` , ephemeral:true});
			}
			await character.destroy()
			return interaction.reply({content:`Deleted character named *${character.charname}*.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with removing the character.', ephemeral:true});
		}
	},
};