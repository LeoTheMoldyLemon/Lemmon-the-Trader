const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"confirmJob"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg=interaction.message
			let embed=msg.embeds[0]
			nums=[]
			for(let i=0;i<3;i++){
				if(embed.fields[3+2*i].value=="none"){
					nums.push(null)
					continue
				}
				if(embed.fields[3+2*i].value=="hit die"){
					nums.push(0)
					continue
				}
				nums.push(parseInt(embed.fields[3+2*i].value.replace("d", "")))
			}
			
			await models.jobs.create({
				name:embed.fields[0].value,
				guildid:interaction.guildId,
				description:embed.fields[1].value,
				roll1name:embed.fields[2].value,
				roll1dice:nums[0],
				roll2name:embed.fields[4].value,
				roll2dice:nums[1],
				roll3name:embed.fields[6].value,
				roll3dice:nums[2],
				replacementname:embed.fields[8].value,
			})
			
			let jobs=await models.jobs.findAll({where:{guildid:interaction.guildId}})
			let options=[]
			await jobs.forEach(job=>{
				if(job.description.length>50){
					job.description=job.description.substring(0,47)+"..."
				}
				options.push({label:job.name, value:job.id.toString(), description:job.description})
			})
			options.sort((a,b)=>{
				if(a.label>b.label){
					return 1
				}else if(a.label<b.label){
					return -1
				}else{
					return 0
				}
			})
			if(options.length==0){
				options.push({label:"placeholder", value:"a", description:"No jobs exist yet."})
			}
			const row=new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify({name:"selectJob"}))
						.setPlaceholder("Select a job.")
						.addOptions(options)
				)
			await interaction.client.channels.fetch(config.servers[interaction.guildId].jobsChannelId).then(async (channel)=>{
				await channel.messages.fetch(config.servers[interaction.guildId].jobsMsgId).then(async (msg)=>{await msg.edit({components:[row]})})
			})
			return interaction.reply({content:"Added new job.", ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the job.', ephemeral:true});
		}
	},
};