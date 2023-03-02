const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-market-post')
		.setDescription("Remove a playercreated market post in this channel.")
		.addStringOption(option =>
			option.setName('message-id')
				.setDescription('The message id of the market post you would like to remove.')
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let msg={}
			try{
				msg=await interaction.channel.messages.fetch(interaction.options.getString("message-id"))
			}catch{
				return interaction.reply({content:"A market post with that id does not exist in this channel.", ephemeral:true})
			}
			
			let shopid=JSON.parse(msg.components[0].components[0].customId).id
			let shop=await models.shops.findByPk(shopid)
			if(shop==null){
				return interaction.reply({content:"This market post is not recognized internally, this is either due to an error or due to the post being really old. Ask a GM to delete it for you.", ephemeral:true})
			}
			let character=await models.characters.findOne({where:{charname:shop.seller, guildid:interaction.guildId}})
			if(character==null){
				return interaction.reply({content:"The owner of this shop does not exist (anymore at least). If you want this market post gone, ask a GM to delete it for you.", ephemeral:true})
			}
			if(character.owner==interaction.user.id){
				await msg.delete()
				await shop.destroy()
				return interaction.reply({content:"Removed market post.", ephemeral:true})
			}else{
				return interaction.reply({content:"A market post can only be removed by its creator.", ephemeral:true})
			}
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with removing the market post.', ephemeral:true});
		}
	},
};