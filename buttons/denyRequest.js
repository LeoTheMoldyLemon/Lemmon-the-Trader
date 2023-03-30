const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"denyRequest"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let embed=interaction.message.embeds[0].toJSON()
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
				return interaction.reply({content:'The character '+character.charname+' no longer exists. Either this is an error or the character has been deleted.', ephemeral:true});
			}
			if(interaction.user.id==character.owner){
				let reason="The request was cancelled by the owner of the character."
				embed.color=0xc70101
				embed.author={}
				embed.author.name=interaction.member.displayName
				embed.author.icon_url=await interaction.user.avatarURL(true)
				embed.description="**Cancelled**. Reason:\n```"+reason+"```"
				await interaction.message.edit({embeds:[embed], components:[]})
				return interaction.reply({content:'Cancelled request.', ephemeral:true});
				
				
			}
			
			if(!(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents))){
				return interaction.reply({content:'Only a GM can approve or deny a request.', ephemeral:true});
			}
			
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Denying Request")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("reason")
							.setLabel("The reason for the denial:")
							.setStyle(TextInputStyle.Paragraph)
					)
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with denying the request.', ephemeral:true});
		}
	},
};