const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view-all-characters')
		.setDescription("View a list of all characters and their balance on this server.")
		.addStringOption(option =>
			option.setName('search-query')
				.setDescription('Type in part of the name of the character. (case insensitive)'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let where={guildid:interaction.guildId}
			let query=await interaction.options.getString("search-query")
			if(query){
				query=query.toLowerCase()
				where={[Op.and]: [where, sequelize.where(sequelize.fn('lower', sequelize.col('charname')), {[Op.like]:`%${query}%`})]}
			}
			let chars = await models.characters.findAll({where:where,attributes:["charname", "balance", "owner"]})
			let owners={}
			let page=0
			let total=0
			for (ch of chars){
				if(!owners[ch.owner]){
					owners[ch.owner]=""
				}else{
					owners[ch.owner]+="\n"
				}
				total+=ch.balance
				owners[ch.owner]+=`${ch.charname} - ${toGold(ch.balance)}`
			}
			let fields=[]
			let embeds=[]
			let ordowners = owners
			owners={}
			for(let ow in ordowners){
				let own="Unknown User"
				try{
					own = await interaction.guild.members.fetch(ow).then(member=>member.displayName)
				}catch{
					try{
					own = await interaction.client.users.fetch(ow).then(user=>user.username)
					}catch{}
				}
				if(owners[own]){
					owners[own]+="\n"+ordowners[ow]
					continue;
				}
				owners[own]=ordowners[ow]
			}
			ordowners = Object.keys(owners).sort().reduce(
			  (obj, key) => { 
				obj[key] = owners[key]; 
				return obj;
			  }, 
			  {}
			);
			owners=ordowners
			for(let ow in owners){
				fields.push({"name":ow, "value":owners[ow]})
				if(fields.length>5){
					fields.push({"name":"Page:", "value":(page+1).toString()})
					if(query)fields.push({"name":"Search query:", "value":query})
					embeds.push({
						"type": "rich",
						"description": "Total balance of all characters: "+toGold(total),
						"title": `Character table`,
						"color": 0xfbff00,
						"fields": fields
					})
					fields=[]
				}
			}
			if(fields.length!=0){
				fields.push({"name":"Page:", "value":(page+1).toString()})
				if(query)fields.push({"name":"Search query:", "value":query})
				embeds.push({
					"type": "rich",
					"description": "Total balance of all characters: "+toGold(total),
					"title": `Character table`,
					"color": 0xfbff00,
					"fields": fields
				})
			}
			if(embeds.length==0){
				if(query){
					embeds.push({
						"type": "rich",
						"title": `Character table`,
						"color": 0xfbff00,
						"description":"No characters match the search query."
					})
				}else{
					embeds.push({
						"type": "rich",
						"title": `Character table`,
						"color": 0xfbff00,
						"description":"No characters registered in this server. Yet."
					})
				}
			}
			let btns = new ActionRowBuilder();
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId('{"name":"listAllPrevious"}')
					.setStyle(ButtonStyle.Primary)
					.setLabel(`<<< Previous Page`),
			);
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId('{"name":"listAllReload"}')
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Reload Page`),
			);
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId('{"name":"listAllNext"}')
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Next Page >>>`),
			);
			
			return interaction.editReply({embeds:[embeds[page]], components:[btns], ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with displaying the table.', ephemeral:true});
		}
	},
};