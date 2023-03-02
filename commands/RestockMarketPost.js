const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restock-market-post')
		.setDescription("Set up a daily restock for a market post. Restocks happen daily at midnight.")
		.addStringOption(option =>
			option.setName('message-id')
				.setDescription('The message id of the market post you would like to add a daily restock to.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('Amount of items/services you want to restock daily.')
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let msg={}
			try{
				msg=await interaction.channel.messages.fetch(interaction.options.getString("message-id"))
			}catch{
				return interaction.editReply({content:"A market post with that id does not exist in this channel.", ephemeral:true})
			}
			
			let shopid=JSON.parse(msg.components[0].components[0].customId).id
			let shop=await models.shops.findByPk(shopid)
			if(shop==null){
				return interaction.editReply({content:"This market post is not recognized internally, this is either due to an error or due to the post being really old. Ask a GM to delete it for you.", ephemeral:true})
			}
			if(msg.embeds[0].fields.length==0){
				return interaction.editReply({content:"Can't set up automatic restocks for market posts with infinite stock.", ephemeral:true})
			}
			let character=await models.characters.findOne({where:{charname:shop.seller, guildid:interaction.guildId}})
			if(character==null){
				return interaction.editReply({content:"The owner of this shop does not exist (anymore at least). If you want this market post gone, ask a GM to delete it for you.", ephemeral:true})
			}
			if(character.owner!=interaction.user.id){
				return interaction.editReply({content:"A market post can only be edited by its creator.", ephemeral:true})
			}
			
			let amount=0
			let num=await interaction.options.getString("amount")
			if(!(/^[0-9]+$/.test(num))){
				return interaction.editReply({content:num+ " is not a valid number.", ephemeral:true})
			}
			amount=parseInt(num)
			if(amount<0){
				return interaction.editReply({content:num+ " is not a valid amount.", ephemeral:true})
			}
			shop.restock=amount
			await shop.save()
			let embed=msg.embeds[0]
			if(amount!=0){
				let addedRestock=false
				embed.fields.forEach(field=>{
					if(field.name=="Restocked daily by:"){
						addedRestock=true
						field.value=amount.toString()
					}
				})
				if(!addedRestock){
					embed.fields.push({name:"Restocked daily by:", value:amount.toString()})
				}
			}else{
				embed.fields.forEach(field=>{
					if(field.name=="Restocked daily by:"){
						embed.fields.splice(embed.fields.indexOf(field), 1)
					}
				})
			}
			await msg.edit({embeds:[embed]})
			
			return interaction.editReply({content:`Setup daily restock of ${amount}.`, ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with creating the market post.', ephemeral:true});
		}
	},
};