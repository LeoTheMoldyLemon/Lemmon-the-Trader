const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-job')
		.setDescription('Removes a job.')
		.addIntegerOption(option =>
			option.setName('job-number')
				.setDescription('The ordinal number of the job.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let msg={}
			await interaction.client.channels.fetch(config.servers[interaction.guildId].jobsChannelId).then(async (channel)=>{
				await channel.messages.fetch(config.servers[interaction.guildId].jobsMsgId).then((mesg)=>{msg=mesg})
			})
			let num=parseInt(interaction.options.getInteger("job-number"))
			if(isNaN(num)){
				return interaction.reply({content:'Not a valid job number.', ephemeral:true});
			}
			num--
			let options=[]
			options=msg.components[0].components[0].data.options
			let job=await models.jobs.findByPk(parseInt(options[num].value))
			await job.destroy()
			options.splice(num, 1)
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
			
			await msg.edit({components:[row]})
			
			return interaction.reply({content:'Removed job named '+job.name, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with removing the job.', ephemeral:true});
		}
	},
};