const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-transaction-channel')
		.setDescription('Sets this channel as the channel in which transaction logs will be shown.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			if(!config.servers[interaction.guildId]){
				config.servers[interaction.guildId]={}
			}
			config.servers[interaction.guildId]["transactionChannelId"]=interaction.channelId
			await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			return interaction.reply({content:'Registered this channel as the transaction log channel. All further transaction logs will be sent here.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with setting the channel.', ephemeral:true});
		}
	},
};