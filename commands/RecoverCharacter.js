const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recover-character')
		.setDescription('Recover a deleted character.')
		.addStringOption(option =>
			option.setName('character-name')
				.setDescription('The name of the character you want to recover.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let output=await models.characters.restore({where:{
				charname:await interaction.options.getString("character-name"),
				guildid:interaction.guildId,
			}})
			if(output==0){
				return interaction.reply({content:`No deleted character with the name *${await interaction.options.getString("character-name")}* exists.`, ephemeral:true});
			}
			return interaction.reply({content:`Restored character named *${await interaction.options.getString("character-name")}*.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with restoring the character.', ephemeral:true});
		}
	},
};