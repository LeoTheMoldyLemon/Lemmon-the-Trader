const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-balance')
		.setDescription('Change the balance of the character to a different amount.')
		.addStringOption(option =>
			option.setName('balance')
				.setDescription('The new balance of the character. (`/help-format` to see accepted coin formats)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for the balance change. Keep it short, a few words max.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('character-name')
				.setDescription('The name of the character whos balance you want to set.')
				.setAutocomplete(true)
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let reason=await interaction.options.getString("reason")
			let character=await models.characters.findOne({where:{
				charname:await interaction.options.getString("character-name").trim(),
				guildid:interaction.guildId,
			}})
			if(character==null){
				return interaction.editReply({content:`No character with the name ${await interaction.options.getString("character-name").trim()} exists.` , ephemeral:true});
			}
			let bal=toInt(await interaction.options.getString("balance"))
			if (bal.error){
				return interaction.editReply({content:bal.error, ephemeral:true});
			}
			let balchange=bal.value-character.balance;
			character.balance=bal.value
			await character.save();
			await models.transactions.create({
				sellername: character.charname,
				buyername: "GM",
				itemname: reason,
				price: balchange,
				guildid:interaction.guildId,
			})
			try{
			await interaction.client.users.fetch(character.owner)
				.then(async(user)=>{await user.send(`A GM set the balance of ${character.charname} to ${toGold(bal.value)}. Reason: ${reason}.`)})
			}catch(e){
				console.log(e)
			}
			await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
				.then(async (channel)=>{await channel.send({content:`${interaction.user.username} set the balance of ${character.charname} to ${toGold(bal.value)}. Reason: ${reason}..`})})
			return interaction.editReply({content:`Updated character named *${character.charname}* for/because of ${reason}, new balance is ${toGold(character.balance)}.`, ephemeral:true});
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with updating the character.', ephemeral:true});
		}
	},
};