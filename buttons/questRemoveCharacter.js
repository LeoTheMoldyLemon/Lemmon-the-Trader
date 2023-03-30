const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"questRemoveCharacter"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let characters=[]
			if(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents)){
				characters=await models.characters.findAll({where:{guildid:interaction.guildId}, attributes:["charname", "balance"]})
			
			}else{
				characters=await models.characters.findAll({where:{owner:interaction.user.id, guildid:interaction.guildId}, attributes:["charname", "balance"]})
			}
			let options=[]
			await characters.forEach(cha=>{if((interaction.message.embeds[0].fields[0].value.split("\n")).includes(cha.charname))options.push({label:cha.charname, value:cha.charname, description:toGold(cha.balance)})})
			metadata.name="questRemoveCharacterName"
			const row=new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify(metadata))
						.setPlaceholder("Select a character")
						.addOptions(options)
				)
			return interaction.reply({components:[row], ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with removing the character.', ephemeral:true});
		}
	},
};