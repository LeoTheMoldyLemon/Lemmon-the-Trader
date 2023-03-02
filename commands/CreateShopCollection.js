const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-shop-post-collection')
		.setDescription('Creates an empty collection of shop posts.')
		.addStringOption(option =>
			option.setName('header-embed')
				.setDescription('Embed used as the header of the collection.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let header=interaction.options.getString("header-embed")
			let content="This is an empty shop collection. Add new shop posts using `/add-post-to-collection`."
			let embeds=[]
			if(header!=null){
				try{
					embeds.push(JSON.parse(header))
				}catch{
					return interaction.reply({content:'That is not a valid embed. Use the Carl-bot embed maker to create a valid embed.', ephemeral:true})
				}
			}			
			
			let msg= await interaction.channel.send({content:content, embeds:embeds,})
			

			
			return interaction.reply({content:'Registered new shop collection.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};