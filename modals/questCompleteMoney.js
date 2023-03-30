const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"questCompleteMoney"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			await interaction.deferReply({ephemeral:true})
			if(!(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents))){
				return interaction.editReply({content:'Only a GM can declare that a quest is complete.', ephemeral:true});
			}
			let embed=interaction.message.embeds[0].toJSON()
			embed.color=3586059
			embed.author={name:interaction.member.displayName,}
			embed.author.icon_url=await interaction.user.avatarURL(true)
			let bal=toInt(interaction.fields.getTextInputValue("balance"))
			if(bal.error){
				return interaction.editReply({content:bal.error, ephemeral:true});
			}
			embed.fields.push({name:"Reward:", value:toGold(bal.value)})
			let reason="Completed quest: "+embed.title+" - "+interaction.message.url
			let charlist=embed.fields[0].value.split("\n")
			await charlist.forEach(async (charname)=>{
				let character=await models.characters.findOne({where:{charname:charname, guildid:interaction.guildId}})
				if(character){
					character.balance+=bal.value
					try{
						await interaction.client.users.fetch(character.owner)
							.then(async(user)=>{await user.send(`A GM gave ${character.charname} ${toGold(bal.value)}. Reason: ${reason}. New balance: ${toGold(character.balance)}.`)})
					}catch(e){
						console.log(e)
					}
					
					let warning=""
					if(character.owner==interaction.user.id){
						warning=" **This character belongs to the GM who made this transaction.**"
					}
					await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
						.then(async (channel)=>{await channel.send({content:`${interaction.user.username} gave ${character.charname} ${toGold(bal.value)}. Reason: ${reason}`+warning})})
					await models.transactions.create({
						sellername: character.charname,
						buyername: "GM",
						itemname: reason,
						price: bal.value,
						guildid:interaction.guildId,
					})
					config.servers[interaction.guildId].earnedCounter+=bal.value
					await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
						.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
						.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
					await character.save()
				}
			})
			await interaction.message.edit({embeds:[embed], components:[]})
			return interaction.editReply({content:'Quest is complete.', ephemeral:true});
			
			
			
			
			
			
			
			
			
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with approving the request.', ephemeral:true});
		}
	},
};