const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"createMarketPost"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let price=toInt(await interaction.fields.getTextInputValue("price"))
			if(price.error){
				return interaction.reply({content:price.error, ephemeral:true})
			}
			let item=await interaction.fields.getTextInputValue("item-name")
			let description="```"+await interaction.fields.getTextInputValue("description")+"```"
			let amount=0
			let title=await interaction.fields.getTextInputValue("title")
			let num=await interaction.fields.getTextInputValue("amount")
			let embed={}
			if(num.toLowerCase()=="infinite"){
				amount=Infinity
				embed={
					"type": "rich",
					"color": 0x003cff,
					"description": `**Seller:** ${metadata.seller}\n**Item/service name:** ${item}\n**Price:** ${toGold(price.value)}\n\n**Description:**\n${description}\n`,
				}	
			}else{
				amount=parseInt(num)
				if(!(/^[0-9]+$/.test(num)) || isNaN(amount) || amount<0){
					return interaction.reply({content:`${num} is not a valid number.`, ephemeral:true})
				}
				embed={
					"type": "rich",
					"color": 0x003cff,
					"description": `**Seller:** ${metadata.seller}\n**Item/service name:** ${item}\n**Price:** ${toGold(price.value)}\n\n**Description:**\n${description}\n`,
					"fields":[{name:`Number available:`, value:`${amount}`}]
				}	
			}
			if(title.toLowerCase()!="blank"){
				embed.title=title
			}
			let msg= await interaction.channel.send({ embeds:[embed]})
			
			let shop=await models.shops.create({
				item:item,
				seller:metadata.seller,
				playercreated:true,
				price:price.value,
				guildid:interaction.guildId,
				channelid:interaction.channelId,
				description:description,
				msgid:msg.id,
			})
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
			
			
			await msg.edit({components:[btns]})
			
			return interaction.reply({content:`Created post selling ${item} for ${toGold(price.value)}.`, ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with selling the item.', ephemeral:true});
		}
	},
};