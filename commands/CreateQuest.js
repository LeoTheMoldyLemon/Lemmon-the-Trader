const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-quest')
		.setDescription('Creates a quest.')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name of the quest.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('description')
				.setDescription('Description of the quest.'))
		.addMentionableOption(option =>
			option.setName('mention')
				.setDescription('The role or member you want to mention/tag with this quest.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let embed={}
			let description=interaction.options.getString("description")
			let name=interaction.options.getString("name")
			if(description){
				embed.description=description
			}
			embed.title=name
			embed.fields=[{name:"Characters:", value:""}]
			embed.color=26367
			
			
			let content=""
			let mentionable=interaction.options.getMentionable("mention")
			if(mentionable){
				if(mentionable.user){
					content="<@"+mentionable.user.id+">"
				}else{
					content="<@&"+mentionable.id+">"
				}
			}
				
			let msg= await interaction.channel.send({content:content, embeds:[embed]})
			
			let btns1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'questAddCharacter', id:msg.id}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Add character`),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'questRemoveCharacter', id:msg.id}))
						.setStyle(ButtonStyle.Danger)
						.setLabel(`Remove character`),
				)
				
			let btns2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'questComplete'}))
						.setStyle(ButtonStyle.Success)
						.setLabel(`Complete quest`),
				)
			
			await msg.edit({components:[btns1, btns2]})
			
			
			
			
			return interaction.reply({content:'Registered new quest.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};