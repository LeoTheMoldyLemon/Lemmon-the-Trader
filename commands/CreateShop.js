const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-shop')
		.setDescription('Creates a shop.')
		.addStringOption(option =>
			option.setName('header-embed')
				.setDescription('Embed used as the header of the shop.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let header=interaction.options.getString("header-embed")
			let embeds=[]
			let content=""
			if(header!=null){
				try{
					embeds.push(JSON.parse(header))
				}catch{
					return interaction.reply({content:'That is not a valid embed. Use the Carl-bot embed maker to create a valid embed. (just create the embed you want and paste the raw JSON)', ephemeral:true})
				}
			}
			
			const row = new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('{"name":"tradeSelect"}')
						.setPlaceholder('Select the item you want to buy.')
						.addOptions(
							{
								label: 'Placeholder',
								description: 'Add new trades using `/add-trade`',
								value: "NaN",
							},
						),
				);
			
			let msg= await interaction.channel.send({content:content, embeds:embeds,components:[row]})
			
			return interaction.reply({content:'Registered new shop.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};