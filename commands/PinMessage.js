const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pin-message')
		.setDescription("Pins a message in a thread. Can only be used by the owner of the thread.")
		.addStringOption(option =>
			option.setName('message-id')
				.setDescription('The message id of the message you would like to pin.')
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let msg={}
			try{
				msg=await interaction.channel.messages.fetch(interaction.options.getString("message-id"))
			}catch{
				return interaction.reply({content:"A message with that id does not exist in this channel.", ephemeral:true})
			}
			if(!(await interaction.channel.isThread())){
				return interaction.reply({content:"This command can only be used in a thread.", ephemeral:true})
			}
			if(interaction.user.id!=interaction.channel.ownerId){
				return interaction.reply({content:"This command can only be used in a thread you created.", ephemeral:true})
			}
			await msg.pin()
			try{
				if(interaction.channel.lastMessage.type==6) await interaction.channel.lastMessage.delete()
			}catch{}
			return interaction.reply({content:"Successfully pinned the message.", ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with pinning the message.', ephemeral:true});
		}
	},
};