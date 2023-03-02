const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer')
		.setDescription('Send coin to another character.')
		.addStringOption(option =>
			option.setName('character-name-short')
				.setDescription('The full or short name of your character.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('target-name')
				.setDescription('The name of the character you want to send the coin to.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('The amount you want to send. (`/help-format` to see accepted coin formats)')
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
			let target=await models.characters.findByPk(await interaction.options.getString("target-name").trim())
			if(target==null){
				return interaction.editReply({content:`No character with the name ${await interaction.options.getString("target-name").trim()} exists.` , ephemeral:true});
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
			if (target.charname==character.charname){
				return interaction.editReply({content:`A character can't transfer coin to himself.`, ephemeral:true});
			}
			let reason= await interaction.options.getString("reason")
			
			await models.transactions.create({
					buyername: character.charname,
					sellername: target.charname,
					itemname: reason,
					price: bal.value,
					guildid: interaction.guildId,
				})
			
			character.balance-=bal.value
			target.balance+=bal.value
			
			await character.save()
			await target.save()
			try{
				await interaction.client.users.fetch(target.owner)
				.then(async(user)=>{await user.send(`${character.charname} gave ${target.charname} ${toGold(bal.value)}. Reason: ${reason}.`)})
			}catch(e){
				console.log(e)
			}
		await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
		.then(async (channel)=>{await channel.send({content:`${character.charname} gave ${target.charname} ${toGold(bal.value)}. Reason: ${reason}.` + ((character.owner==target.owner) ? " **Both of these characters belong to the same player.**":"")})})
			return interaction.editReply({content:`${character.charname} sent ${toGold(bal.value)} to ${target.charname}. (remainining balance: ${toGold(character.balance)})`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with transfering the coin.', ephemeral:true});
		}
	},
};