const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spend')
		.setDescription('Spend coin on something. (Try to use only when shops and markets are not applicable.)')
		.addStringOption(option =>
			option.setName('character-name-short')
				.setDescription('The full or short name of your character.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('The amount you want to spend. (`/help-format` to see accepted coin formats)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The name of the item/service/reason for purchase. Keep it short, a few words max.')
				.setRequired(true))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let character=await models.characters.findOne({where: {
				[Op.or]:[
					{charname: await interaction.options.getString("character-name-short").trim(),},
					{shortname: await interaction.options.getString("character-name-short").trim(),},
				],
				owner: interaction.user.id.toString(),
				guildid:interaction.guildId,
				}})
			if(character==null){
				return interaction.editReply({content:`You don't own a character with the name ${await interaction.options.getString("character-name-short").trim()}.` , ephemeral:true});
			}
			let bal=toInt(await interaction.options.getString("amount"))
			if (bal.error){
				return interaction.editReply({content:bal.error, ephemeral:true});
			}
			if (bal.value<=0){
				return interaction.editReply({content:"Can only tranfer a positive amount.", ephemeral:true});
			}
			if (bal.value>character.balance){
				return interaction.editReply({content:`${character.charname} doesn't have enough coins, an extra ${toGold(bal.value-character.balance)} is needed.`, ephemeral:true});
			}
			let reason= await interaction.options.getString("reason")
			
			await models.transactions.create({
					buyername: character.charname,
					sellername: "The Void",
					itemname: reason,
					price: bal.value,
					guildid: interaction.guildId,
				})
			config.servers[interaction.guildId].spentCounter+=bal.value
			await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
				.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
				.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
			await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			
			character.balance-=bal.value

			await character.save()
		await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
		.then(async (channel)=>{await channel.send({content:`${character.charname} spent ${toGold(bal.value)}. Reason: ${reason}. `})})
			return interaction.editReply({content:`${character.charname} spent ${toGold(bal.value)}. (remainining balance: ${toGold(character.balance)})`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with transfering the coin.', ephemeral:true});
		}
	},
};