const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit-post-in-collection')
		.setDescription('Edit a shop post in a shop collection.')
		.addStringOption(option =>
			option.setName('collection-id')
				.setDescription('The message ID of the collection in which the post you want to edit is.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('post-number')
				.setDescription('The ordinal number of the post in the collection. (The number of the top post is 1)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('item-name')
				.setDescription('The name of the item/service this post will sell. Keep it short, a few words max.'))
		.addStringOption(option => 
			option.setName('price')
				.setDescription('The price of the item/service. (`/help-format` to see accepted coin formats)'))
		.addBooleanOption(option => 
			option.setName('multiple-button')
				.setDescription('Include a "Buy multiple" button, useful for items that are often purchased in bulk. (default false)'))
		.addStringOption(option =>
			option.setName('new-post-number')
				.setDescription('The ordinal number of the new position.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			
			let msgid=await interaction.options.getString("collection-id")
			let msg={}
			try{
				msg = await interaction.channel.messages.fetch(msgid)
			}catch{
				return interaction.reply({content:"No valid collections with that ID exist in this channel.", ephemeral:true})
			}
			let ord=parseInt(await interaction.options.getString("post-number"))
			
			let neword=ord
			if(await interaction.options.getString("new-post-number")!=null){
				neword=parseInt(await interaction.options.getString("new-post-number"))
				
			}
			if (isNaN(neword) || isNaN(ord)){
				return interaction.reply({content:"Invalid post number.", ephemeral:true})
			}
			let row=msg.components[ord-1]
			msg.components.splice(ord-1,1)
			let shop=await models.shops.findByPk(JSON.parse(row.components[0].customId).id)
			
			
			let pricestring=await interaction.options.getString("price")
			let price={}
			if (pricestring==null){
				
				price.value=shop.price
			}else{
				price=toInt(pricestring)
				shop.price=price.value
			}
			if (price.error){
				return interaction.reply({content:price.error, ephemeral:true});
			}
			let name=await interaction.options.getString("item-name")
			let btns = new ActionRowBuilder();
			let multiple = await interaction.options.getBoolean("multiple-button")
			if (name==null){
				name=shop.seller
			}else{
				shop.seller=name
			}
			if (multiple==null){
				if(row.components.length==1){
					multiple=false
				}else{
					multiple=true
				}
			}
			
			await shop.save()
			let btnData={name:'shopPostBuyOne', id:shop.id}
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btnData))
					.setStyle(ButtonStyle.Primary)
					.setLabel(`${name} - ${toGold(price.value)}`),
			);
			if(multiple){
				btnData.name='shopPostBuyMultiple'
				btns.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify(btnData))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Buy multiple`),
				);
			}
			msg.components.splice(neword-1,0,btns)
			await msg.edit({embeds:msg.embeds, components:msg.components, content:""})
			
			return interaction.reply({content:`Added new shop post which sells *${name}* at ${toGold(price.value)}`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the shop post.', ephemeral:true});
		}
	},
};