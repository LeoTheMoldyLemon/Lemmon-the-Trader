const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test-message')
		.setDescription('If you can see this, Leo made a mistake. Scold him for being a bad dev.')
		.addStringOption(option =>
			option.setName('msg-id')
				.setDescription('id of message')
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let msg= await interaction.channel.messages.fetch(interaction.options.getString("msg-id"))
			let btns1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'testButton1'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Test1`),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'testButton2'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Test2`),
				)
			let options=[]
			options.push({label:"test1", value:"test1", description:"Ephemeral"})
			options.push({label:"test2", value:"test2", description:"Not ephemeral"})
			const row=new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify({name:"testSelect"}))
						.setPlaceholder("select")
						.addOptions(options)
				)
				
			
			await msg.edit({components:[btns1, row]})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the message.', ephemeral:true});
		}
	},
};