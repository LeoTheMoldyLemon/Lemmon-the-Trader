const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold,rollDice } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"questRemoveCharacterName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg={}
			try{
				msg=await interaction.channel.messages.fetch(metadata.id)
			}catch{
				return interaction.reply({content:'Quest no longer exists.', ephemeral:true})
			}
			let character = await models.characters.findOne({where:{
				charname:interaction.values[0],
				guildid:interaction.guildId
			}})
			
			
			if(character.owner!=interaction.user.id){
				try{
					await interaction.client.users.fetch(character.owner)
						.then(async(user)=>{await user.send(`A GM removed ${character.charname} from the quest: ${msg.embeds[0].title} - ${msg.url}.`)})
				}catch(e){
					console.log(e)
				}
			}
			let chararray=msg.embeds[0].fields[0].value.split("\n")
			chararray.splice(chararray.indexOf(interaction.values[0]), 1)
			msg.embeds[0].fields[0].value=chararray.join("\n")
			await msg.edit({embeds:msg.embeds})
			return interaction.update({content:'Removed character from quest.', components:[], ephemeral:true})
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with removing the character.', ephemeral:true});
		}
	},
};