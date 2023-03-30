const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config = require("../config.json")
const fs = require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-balance')
		.setDescription('Change the balance of the character. (negative values are supported.)')
		
		.addStringOption(option =>
			option.setName('balance')
				.setDescription('The change in the balance of each character listed. (`/help-format` to see accepted coin formats)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for the balance change. Keep it short, a few words max.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('character-name1')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('character-name2')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('character-name3')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('character-name4')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('character-name5')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('character-name6')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('character-name7')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('character-name8')
				.setDescription('The name of the character whose balance you want to change.')
				.setAutocomplete(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let bal=toInt(await interaction.options.getString("balance"))
			if (bal.error){
				return interaction.editReply({content:bal.error, ephemeral:true});
			}
			let characters=[]
			let reason=interaction.options.getString("reason")
			for(let i=1;i<=8;i++){
				let name=await interaction.options.getString("character-name"+i.toString())
				if(name==null){
					continue
				}
				name=name.trim()
				let character=await models.characters.findOne({where:{
					charname:name,
					guildid:interaction.guildId,
				}})
				if(character==null){
					return interaction.editReply({content:`No character with the name ${name} exists.` , ephemeral:true});
				}
				characters.push(character)
			}
			for(let character of characters){
				character.balance+=bal.value
				await character.save()
				config.servers[interaction.guildId].earnedCounter+=bal.value
				await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
					.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
					.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
				await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
				await models.transactions.create({
					sellername: character.charname,
					buyername: "GM",
					itemname: reason,
					price: bal.value,
					guildid:interaction.guildId,
				})
				let warning=""
				if(character.owner==interaction.user.id){
					warning=" **This character belongs to the GM who made this transaction.**"
				}
				await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
				.then(async (channel)=>{await channel.send({content:`${interaction.user.username} gave ${character.charname} ${toGold(bal.value)}. Reason: ${reason}`+warning})})
				try{
					await interaction.client.users.fetch(character.owner)
						.then(async(user)=>{await user.send(`A GM gave ${character.charname} ${toGold(bal.value)}. Reason: ${reason}. New balance: ${toGold(character.balance)}.`)})
				}catch(e){
					console.log(e)
				}
			}
			
			
			return interaction.editReply({content:`Updated characters: *${characters.map(cha=>cha.charname).toString().replace("[", "").replace("]", "").replaceAll(",", ", ")}*; added ${toGold(bal.value)}. Reason: ${reason}.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with updating the characters.', ephemeral:true});
		}
	},
};