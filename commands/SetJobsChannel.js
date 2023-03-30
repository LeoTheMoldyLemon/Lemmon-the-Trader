const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-jobs-channel')
		.setDescription('Sets the channel in which the player rolls for temporary work will show up.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			if(!config.servers[interaction.guildId]){
				config.servers[interaction.guildId]={}
			}
			config.servers[interaction.guildId]["jobLogChannelId"]=interaction.channelId
			
			await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			return interaction.reply({content:'Set jobs channel.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with registering the channel.', ephemeral:true});
		}
	},
};