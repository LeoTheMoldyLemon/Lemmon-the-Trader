const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config = require("../config.json")
const fs = require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register-character')
		.setDescription('Create a new character and connect it to a user.')
		.addStringOption(option =>
			option.setName('character-name')
				.setDescription('The name of the character you want to create.')
				.setRequired(true))
		.addUserOption(option => 
			option.setName('user')
				.setDescription('The user you want to attach the character to.')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('balance')
				.setDescription('The starting balance of the character (default 0). (`/help-format` to see accepted coin formats)'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let bal={}
			bal.value=0
			if(interaction.options.getString("balance")){
				bal=toInt(interaction.options.getString("balance"))
			}
			if (bal.error){
				return interaction.editReply({content:bal.error, ephemeral:true});
			}
			let name=await interaction.options.getString("character-name").trim()
			let user=await interaction.options.getUser("user").id.toString()
			let character = await models.characters.create({
				charname: name,
				owner: user,
				balance: bal.value,
				guildid: interaction.guildId,
			});
			await models.transactions.create({
					buyername: "GM",
					sellername: character.charname,
					itemname: "register-character",
					price: bal.value,
					guildid:interaction.guildId,
				})
			let target={}
			await interaction.client.guilds.fetch(interaction.guildId).then(async (guild)=>{target= await guild.members.fetch(character.owner)})
			await interaction.client.channels.fetch(config.servers[interaction.guildId].transactionChannelId)
				.then(async (channel)=>{await channel.send({content:`${character.charname} was created by ${interaction.user.username} for ${target.user.username} with a balance of ${toGold(bal.value)}.`})})
			config.servers[interaction.guildId].earnedCounter+=bal.value
			try{
				await interaction.client.users.fetch(character.owner)
					.then(async(user)=>{await user.send(`A GM has registered a new character: ${character.charname} with a balance of ${toGold(bal.value)}.`)})
			}catch(e){
				console.log(e)
			}
			await interaction.client.channels.fetch(config.servers[interaction.guildId].counterChannelId)
				.then(async (channel)=>{channel.messages.fetch(config.servers[interaction.guildId].counterMsgId)
				.then(async (msg)=>(await msg.edit({content: `**Total amount spent by players**\n${toGold(config.servers[interaction.guildId].spentCounter)}\n\n**Total amount earned by players**\n${toGold(config.servers[interaction.guildId].earnedCounter)}`})))})
			await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			return interaction.editReply({content:`Added new character named *${name}* with ${toGold(bal.value)}`, ephemeral:true});
		}
		catch (error) {
			
			console.error(error)
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.editReply({content:'A character with that name already exists.', ephemeral:true});
			}
			
			return interaction.editReply({content:'Something went wrong with adding the character.', ephemeral:true});
		}
	},
};