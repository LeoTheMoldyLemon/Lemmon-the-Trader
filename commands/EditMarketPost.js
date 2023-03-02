const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-market-post')
		.setDescription("Register a playercreated market post in this channel.")
		.addStringOption(option =>
			option.setName('message-id')
				.setDescription('The message id of the market post you would like to edit.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('item-name')
				.setDescription("The name of the item/service."))
		.addStringOption(option =>
			option.setName('description')
				.setDescription("The description of the item/service."))
		.addStringOption(option =>
			option.setName('price')
				.setDescription("The price of the item/service."))
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('Amount of items/services. (you can use "infinite")'))
		.addStringOption(option =>
			option.setName('title')
				.setDescription('Title of the post (use "blank" for no title):'))
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
			let character=await models.characters.findOne({where:{charname:shop.seller, guildid:interaction.guildId}})
			if(character==null){
				return interaction.editReply({content:"The owner of this shop does not exist (anymore at least). If you want this market post gone, ask a GM to delete it for you.", ephemeral:true})
			}
			if(character.owner!=interaction.user.id){
				return interaction.editReply({content:"A market post can only be edited by its creator.", ephemeral:true})
			}
			let pricestring=await interaction.options.getString("price")
			let price={value:shop.price}
			if(pricestring){
				price=toInt(pricestring)
				if(price.error){
					return interaction.editReply({content:price.error, ephemeral:true})
				}
				shop.price=price.value
			}
			let item=await interaction.options.getString("item-name")
			if(item){
				shop.item=item
			}else{
				item=shop.item
			}
			let description=await interaction.options.getString("description")
			if(description){
				description="```"+description+"```"
				shop.description=description
			}else{
				description=shop.description
			}
			let title=await interaction.options.getString("title")
			if(!title){
				title=msg.embeds[0].title
			}
			let amount=0
			let embed={}
			let num=await interaction.options.getString("amount")
			if(!num){
				if(msg.embeds[0].fields.length>0){
					amount=parseInt(msg.embeds[0].fields[0].value)
					embed={
						"type": "rich",
						"color": 0x003cff,
						"description": `**Seller:** ${shop.seller}\n**Item/service name:** ${item}\n**Price:** ${toGold(price.value)}\n\n**Description:**\n${description}\n`,
						"fields":msg.embeds[0].fields
					}	
				}else{
					amount=Infinity
					embed={
						"type": "rich",
						"color": 0x003cff,
						"description": `**Seller:** ${shop.seller}\n**Item/service name:** ${item}\n**Price:** ${toGold(price.value)}\n\n**Description:**\n${description}\n`,
					}
				}
			}else{
				if(num.toLowerCase()=="infinite"){
					amount=Infinity
					shop.restock=0
					embed={
						"type": "rich",
						"color": 0x003cff,
						"description": `**Seller:** ${shop.seller}\n**Item/service name:** ${item}\n**Price:** ${toGold(price.value)}\n\n**Description:**\n${description}\n`,
					}	
				}else{
					amount=parseInt(num)
					if(!(/^[0-9]+$/.test(num)) || isNaN(amount) || amount<0){
						return interaction.editReply({content:`${num} is not a valid number.`, ephemeral:true})
					}
					embed={
						"type": "rich",
						"color": 0x003cff,
						"description": `**Seller:** ${shop.seller}\n**Item/service name:** ${item}\n**Price:** ${toGold(price.value)}\n\n**Description:**\n${description}\n`,
						"fields":[{name:`Number available:`, value:`${amount}`}]
					}	
				}
			}
			if(!title){
				title="blank"
			}
			if(title.toLowerCase()!="blank"){
				embed.title=title
			}
			shop.save()
			let btn_metadata={name:'shopPostBuyOne', id:shop.id}
			
			let btns = new ActionRowBuilder();
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btn_metadata))
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Buy one`),
			);
			btn_metadata.name='shopPostBuyMultiple'
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btn_metadata))
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Buy multiple`),
			);
			if(amount<=1){
				btns.components[1].setDisabled(true)
			}
			if(amount<=0){
				btns.components[0].setDisabled(true)
				embed = EmbedBuilder.from(embed).setColor(0xc70101)
			}
			
			await msg.edit({embeds:[embed],components:[btns]})
			
			return interaction.editReply({content:`Created post selling ${item} for ${toGold(price.value)}.`, ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with creating the market post.', ephemeral:true});
		}
	},
};