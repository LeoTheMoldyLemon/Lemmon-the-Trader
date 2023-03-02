const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"denyRequest"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			await interaction.deferReply({ephemeral:true})
			if(!(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents))){
				return interaction.editReply({content:'Only a GM can approve or deny a request.', ephemeral:true});
			}
			let reason=await interaction.fields.getTextInputValue("reason")
			let embed=interaction.message.embeds[0].toJSON()
			embed.color=0xc70101
			let typename=embed.title
			let type=0
			if(typename=="Collect Request" || typename=="Sell Request"){
				type=1
			}
			let name=embed.fields[type].value
			let character = await models.characters.findOne({where:{
				charname:name,
				guildid:interaction.guildId
			}})
			if(!character){
				return interaction.editReply({content:'The character '+character.charname+' no longer exists. Either this is an error or the character has been deleted.', ephemeral:true});
			}
			
			if(typename=="Collect Request"){
				await interaction.client.users.fetch(character.owner)
					.then(async(user)=>{await user.send(`The request for ${character.charname} to collect ${embed.fields[3].value} due to reason: ${embed.fields[2].value}; has been **denied** by ${interaction.user.username}. Reason: ${reason}`)})
			}
			if(typename=="Sell Request"){
				await interaction.client.users.fetch(character.owner)
					.then(async(user)=>{await user.send(`The request for ${character.charname} to sell ${embed.fields[2].value} to ${embed.fields[1].value} for ${embed.fields[3].value} has been **denied** by ${interaction.user.username}. Reason: ${reason}`)})
			}
			if(typename=="Buy Request"){
				await interaction.client.users.fetch(character.owner)
					.then(async(user)=>{await user.send(`The request for ${character.charname} to buy ${embed.fields[2].value} from ${embed.fields[1].value} for ${embed.fields[3].value} has been **denied** by ${interaction.user.username}. Reason: ${reason}`)})
			}
			if(typename=="Spend Request"){
				await interaction.client.users.fetch(character.owner)
					.then(async(user)=>{await user.send(`The request for ${character.charname} to spend ${embed.fields[3].value} due to reason: ${embed.fields[2].value} has been **denied** by ${interaction.user.username}. Reason: ${reason}`)})
			}
			embed.author={}
			embed.author.name=interaction.user.username
			embed.author.icon_url=await interaction.user.avatarURL(true)
			embed.description="**Denied**. Reason:\n```"+reason+"```"
			await interaction.message.edit({embeds:[embed], components:[]})
			return interaction.editReply({content:'Denied request.', ephemeral:true});
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with approving the request.', ephemeral:true});
		}
	},
};