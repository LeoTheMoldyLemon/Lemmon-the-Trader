const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"shopPostSell"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			await interaction.deferUpdate({ephemeral:true})
			let name=metadata.charname
			let character = await models.characters.findOne({where:{
				[Op.or]:[
					{charname:name},
					{shortname:name},
				],
				owner:interaction.user.id.toString(),
				guildid:interaction.guildId
			}})
			let price=toInt(await interaction.fields.getTextInputValue("price"))
			if(price.error){
				return interaction.editReply({content:price.error, ephemeral:true})
			}
			let item=await interaction.fields.getTextInputValue("item-name")
			if(character==null){
				return interaction.editReply({content:`You don't have a character named ${name}.`,components:[], ephemeral:true})
			}
			
			let embed={
				title:"Sell Request",
				fields:[
					{name:"From:", value:interaction.channel.name},
					{name:"For:", value:character.charname},
					{name:"Reason:", value:item},
					{name:"Price:", value:toGold(price.value)},
				],
				color:0x003cff,
				}
				
			let btn_metadata={name:'approveRequest'}
			let btns = new ActionRowBuilder();
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btn_metadata))
					.setStyle(ButtonStyle.Success)
					.setLabel(`Approve`),
			);
			btn_metadata.name='denyRequest'
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btn_metadata))
					.setStyle(ButtonStyle.Danger)
					.setLabel(`Deny`),
			);
			await interaction.client.channels.fetch(config.servers[interaction.guildId].requestChannelId).then(async (channel)=>{await channel.send({embeds:[embed], components:[btns]})})
			return interaction.editReply({content:`Request was sent to the GMs in <#${config.servers[interaction.guildId].requestChannelId}> for ${character.charname} to sell ${item} for ${toGold(price.value)}. You can cancel it by pressing "Deny" on the request.`,components:[], ephemeral:true});
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with selling the item.',components:[], ephemeral:true});
		}
	},
};