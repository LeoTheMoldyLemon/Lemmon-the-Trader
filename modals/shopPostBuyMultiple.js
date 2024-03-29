const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"shopPostBuyMultiple"},
	async execute(interaction, sequelize, models, btndata) {
		try {
			await interaction.deferUpdate({ephemeral:true})
			let name=btndata.charname
			let character = await models.characters.findOne({where:{
				[Op.or]:[
					{charname:name},
					{shortname:name},
				],
				owner:interaction.user.id.toString(),
				guildid:interaction.guildId
			}})
			let metadata = await models.shops.findByPk(btndata.id)
			if(metadata==null){
				return interaction.editReply({content:`Shop is not found internaly.`, ephemeral:true})
			}
			let num=await interaction.fields.getTextInputValue("amount")
			let amount=parseInt(num)
			if(!(/^[0-9]+$/.test(num)) || isNaN(amount) || amount<=0){
				return interaction.editReply({content:`${num} is not a valid number.`, ephemeral:true})
			}
			if(character==null){
				return interaction.editReply({content:`You don't have a character named ${name}.`, ephemeral:true})
			}
			if(character.balance-(metadata.price*amount)<0){
				return interaction.editReply({content:`Not enough coin to buy ${metadata.item}, missing ${toGold(amount*metadata.price-character.balance)}.`, ephemeral:true});
			}
			let warning=""
			if(metadata.playercreated){
				let btns = new ActionRowBuilder();
				target = await models.characters.findOne({where:{
					charname:metadata.seller,
					guildid:interaction.guildId
				}})
				if(target==null){
					return interaction.editReply({content:"This seller no longer exists.", ephemeral:true})
				}
				if(target.charname==character.charname){
					return interaction.editReply({content:"Can't buy from yourself.", ephemeral:true})
				}
				if(target.owner==character.owner){
					warning=" **Both of these characters belong to the same player.**"
				}
				let msg={}
				try{
					await interaction.client.channels.fetch(metadata.channelid).then(async (channel)=>msg=await channel.messages.fetch(metadata.msgid))
				}catch{
					return interaction.editReply({content:"This shop no longer exists.", components:[], ephemeral:true})
				}
				let embed=msg.embeds[0]
				if(embed.fields.length>0){
					if(parseInt(embed.fields[0].value)<amount){
						return interaction.editReply({content:"That amount is not available.", ephemeral:true})
					}
					embed.fields[0].value=(parseInt(embed.fields[0].value)-amount).toString()
					let btn_metadata={name:'shopPostBuyOne', id:metadata.id}
			
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
					if(parseInt(embed.fields[0].value)<=1){
						btns.components[1].setDisabled(true)
					}
					if(parseInt(embed.fields[0].value)<=0){
						btns.components[0].setDisabled(true)
						embed = EmbedBuilder.from(embed).setColor(0xc70101)
					}
				}else{
					let btn_metadata={name:'shopPostBuyOne', id:metadata.id}
			
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
				}
				metadata.item+=" ("+msg.url+")"
				await msg.edit({embeds:[embed], components:[btns]})
				try{
					await interaction.client.users.fetch(target.owner)
						.then(async(user)=>{await user.send(`${character.charname} bought ${amount} of ${metadata.item} from ${target.charname} for ${toGold(metadata.price*amount)}. New balance: ${toGold(target.balance)}`)})
				}catch(e){
					console.log(e)
				}
				target.balance+=metadata.price*amount
				target.save()
			
			}else{
				config.servers[interaction.guildId].spentCounter+=metadata.price*amount
				await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
					.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
					.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
				await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			}
			character.balance-=metadata.price*amount
			character.save()
			await models.transactions.create({
				buyername: character.charname,
				sellername: metadata.seller,
				itemname: amount.toString()+"x "+metadata.item,
				price: metadata.price*amount,
				guildid: interaction.guildId,
			})
			await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
				.then(async (channel)=>{await channel.send({content:`${character.charname} bought ${amount} of ${metadata.item} from ${metadata.seller} for ${toGold(amount*metadata.price)} (${toGold(metadata.price)} for one).` + warning})})
			return interaction.editReply({content:`${character.charname} bought ${amount} of ${metadata.item} for ${toGold(amount*metadata.price)}. (remainining balance: ${toGold(character.balance)})`, ephemeral:true})
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with buying the item.', ephemeral:true});
		}
	},
};