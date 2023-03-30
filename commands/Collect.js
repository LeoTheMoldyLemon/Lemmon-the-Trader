const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('collect')
		.setDescription('Collect coins for something. (Try to use only when selling to shops is not applicable.)')
		.addStringOption(option =>
			option.setName('character-name-short')
				.setDescription('The full or short name of your character.')
				.setAutocomplete(true)
				.setRequired(true))
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('The amount you want to collect. (`/help-format` to see accepted coin formats)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('The reason for collecting the coin.')
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
			let reason= await interaction.options.getString("reason")
			let embed={
				title:"Collect Request",
				fields:[
					{name:"From:", value:"The Void"},
					{name:"For:", value:character.charname},
					{name:"Reason:", value:reason},
					{name:"Price:", value:toGold(bal.value)},
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
			return interaction.editReply({content:`Request was sent to the GMs in <#${config.servers[interaction.guildId].requestChannelId}> for ${character.charname} to collect ${toGold(bal.value)}. You can cancel it by pressing "Deny" on the request.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with transfering the coin.', ephemeral:true});
		}
	},
};