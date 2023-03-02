const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-counter-message')
		.setDescription('Displays the message which shows the total amount earned and spent by all players')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			if(!config.servers[interaction.guildId]){
				config.servers[interaction.guildId]={}
			}
			if(!config.servers[interaction.guildId].spentCounter){
				config.servers[interaction.guildId].spentCounter=0
			}
			if(!config.servers[interaction.guildId].earnedCounter){
				config.servers[interaction.guildId].earnedCounter=0
			}
			if(config.servers[interaction.guildId].counterMsgId){
				interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
				.then(async (channel)=>{await channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
				.then(async (msg)=>{await msg.delete()})
				})
			}
			let msg= await interaction.channel.send({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})
			config.servers[interaction.guildId]["counterMsgId"]=msg.id
			config.servers[interaction.guildId]["counterChannelId"]=msg.channelId
			await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			return interaction.reply({content:'Registered counter message.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};