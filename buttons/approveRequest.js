const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"approveRequest"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			await interaction.deferReply({ephemeral:true})
			if(!(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents))){
				return interaction.editReply({content:'Only a GM can approve or deny a request.', ephemeral:true});
			}
			let embed=interaction.message.embeds[0].toJSON()
			embed.color=3586059
			let typename=embed.title
			let type=0
			if(typename=="Collect Request" || typename=="Sell Request"){
				type=1
			}
			let name=embed.fields[type].value
			let character = await models.characters.findOne({where:{
				charname:name,
				guildid:interaction.guildId
			}})
			if(!character){
				return interaction.editReply({content:'The character '+character.charname+' no longer exists. Either this is an error or the character has been deleted.', ephemeral:true});
			}
			if(type==1){
				character.balance+=toInt(embed.fields[3].value).value
				await character.save()
				config.servers[interaction.guildId].earnedCounter+=toInt(embed.fields[3].value).value
				await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
					.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
					.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
				await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
				
				if(typename=="Collect Request"){
					await interaction.client.users.fetch(character.owner)
						.then(async(user)=>{await user.send(`The request for ${character.charname} to collect ${embed.fields[3].value} due to reason: ${embed.fields[2].value}; has been **approved** by ${interaction.user.username}. (New balance: ${toGold(character.balance)})`)})
					await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
						.then(async (channel)=>{await channel.send({content:`${character.charname} collected ${embed.fields[3].value}. Reason: ${embed.fields[2].value}. `})})
				}
				if(typename=="Sell Request"){
					await interaction.client.users.fetch(character.owner)
						.then(async(user)=>{await user.send(`The request for ${character.charname} to sell ${embed.fields[2].value} to ${embed.fields[0].value} for ${embed.fields[3].value} has been **approved** by ${interaction.user.username}. (New balance: ${toGold(character.balance)})`)})
					await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
						.then(async (channel)=>{await channel.send({content:`${character.charname} sold ${embed.fields[2].value} to ${embed.fields[0].value} for ${embed.fields[3].value}.`})})
				}
				await models.transactions.create({
					sellername: character.charname,
					buyername: embed.fields[0].value,
					itemname: embed.fields[2].value,
					price: toInt(embed.fields[3].value).value,
					guildid: interaction.guildId,
				})
				embed.author={}
				embed.author.name=interaction.user.username
				embed.author.icon_url=await interaction.user.avatarURL(true)
				embed.description="**Approved**"
				await interaction.message.edit({embeds:[embed], components:[]})
				return interaction.editReply({content:'Approved request.', ephemeral:true});
			}else{
				if((character.balance-toInt(embed.fields[3].value))<0){
					if(typename=="Buy Request"){
						await interaction.client.users.fetch(character.owner)
							.then(async(user)=>{await user.send(`The request for ${character.charname} to buy ${embed.fields[2].value} from ${embed.fields[1].value} for ${embed.fields[3].value} **failed** due to lack of coin. An extra ${toInt(embed.fields[3].value)-character.balance} is needed.`)})
						}
					if(typename=="Spend Request"){
						await interaction.client.users.fetch(character.owner)
							.then(async(user)=>{await user.send(`The request for ${character.charname} to spend ${embed.fields[2].value} due to reason: ${embed.fields[3].value}; **failed** due to lack of coin. An extra ${toInt(embed.fields[3].value)-character.balance} is needed.`)})
					}
					embed.color=0xc70101
					embed.author={}
					embed.author.name=interaction.user.username
					embed.author.icon_url=await interaction.user.avatarURL(true)
					embed.description="**Denied**. Reason:\n```Not enough of coin.```"
					await interaction.message.edit({embeds:[embed], components:[]})
					return interaction.editReply({content:'Denied request because the character didn\'t have enough coin.', ephemeral:true});
					
				}
				character.balance-=toInt(embed.fields[3].value).value
				config.servers[interaction.guildId].spentCounter+=toInt(embed.fields[3].value).value
				await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
					.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
					.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
				await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
				await models.transactions.create({
					buyername: character.charname,
					sellername: embed.fields[1].value,
					itemname: embed.fields[2].value,
					price: toInt(embed.fields[3].value).value,
					guildid: interaction.guildId,
				})
				await character.save()
				if(typename=="Buy Request"){
					await interaction.client.users.fetch(character.owner)
						.then(async(user)=>{await user.send(`The request for ${character.charname} to buy ${embed.fields[2].value} from ${embed.fields[1].value} for ${embed.fields[3].value} has been **approved** by ${interaction.user.username}. (Remaining balance: ${toGold(character.balance)})`)})
					await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
						.then(async (channel)=>{await channel.send({content:`${character.charname} bought ${embed.fields[2].value} from ${embed.fields[1].value} for ${embed.fields[3].value}.`})})
				}
				if(typename=="Spend Request"){
					await interaction.client.users.fetch(character.owner)
						.then(async(user)=>{await user.send(`The request for ${character.charname} to spend ${embed.fields[3].value} due to reason: ${embed.fields[2].value} has been **approved** by ${interaction.user.username}. (Remaining balance: ${toGold(character.balance)})`)})
					await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
						.then(async (channel)=>{await channel.send({content:`${character.charname} spent ${embed.fields[3].value}. Reason: ${embed.fields[2].value}. `})})
				}
				embed.author={}
				embed.author.name=interaction.user.username
				embed.author.icon_url=await interaction.user.avatarURL(true)
				embed.description="**Approved**"
				await interaction.message.edit({embeds:[embed], components:[]})
				return interaction.editReply({content:'Approved request.', ephemeral:true});
			}
			
			
			
			
			
			
			
			
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with approving the request.', ephemeral:true});
		}
	},
};