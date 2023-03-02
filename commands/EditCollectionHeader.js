const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-collection-header')
		.setDescription('Edit the header of a shop collection.')
		.addStringOption(option =>
			option.setName('collection-id')
				.setDescription('The message ID of the collection in which the post you want to edit is.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('header-embed')
				.setDescription('Embed used as the header of the collection.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let msgid=await interaction.options.getString("collection-id")
			let msg={}
			try{
				msg = await interaction.channel.messages.fetch(msgid)
			}catch{
				return interaction.reply({content:"No valid collections with that ID exist in this channel.", ephemeral:true})
			}
			let header=interaction.options.getString("header-embed")
			let embeds=[]
			if(header!=null){
				try{
					embeds.push(JSON.parse(header))
				}catch{
					return interaction.reply({content:'That is not a valid embed. Use the Carl-bot embed maker to create a valid embed.', ephemeral:true})
				}
			}			
			
			await msg.edit({embeds:embeds,})
			

			
			return interaction.reply({content:'Edited shop collection header.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};