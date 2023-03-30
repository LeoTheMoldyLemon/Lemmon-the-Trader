const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-jobs-message')
		.setDescription('Displays the message for .')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			if(!config.servers[interaction.guildId]){
				config.servers[interaction.guildId]={}
			}
			
			if(config.servers[interaction.guildId].jobsMsgId){
				interaction.client.channels.fetch(config.servers[interaction.guildId].jobsChannelId)
				.then(async (channel)=>{await channel.messages.fetch(config.servers[interaction.guildId].jobsMsgId)
				.then(async (msg)=>{await msg.delete()})
				})
			}
			let embed={"title":"Temporary Work","description":"You can use 5 downtime days to do something profitable for a character. You can choose from a list of job types, each requiring a different set of checks.\n\nFor each of the 3 checks a DC is determined by rolling 2d10+5. After this you enter any modifiers you have, decide if you want to replace a check with [ability] + Proficiency and roll. The bot calculates how much coin is earned and immediately creates a Collect Request for your character and the coin is automatically added to their balance after GM approval.\n\n**Select a job ONLY when you are sure you want to go through with it, as the DCs will immediately be rolled** (rerolling should be avoided, as it could be seen as fishing for better DCs). All attempts are immediately made public, to discourage rerolling.\n\nYou can view any extra info and the complete list of jobs, along with their checks [here](https://cdn.discordapp.com/attachments/931601290490961951/931630471236972605/Temporary_Work_DRW_v1.0.pdf).\n","color":15615}
			
			let jobs=await models.jobs.findAll({where:{guildid:interaction.guildId}})
			let options=[]
			await jobs.forEach(job=>{
				if(job.description.length>50){
					job.description=job.description.substring(0,37)+"..."
				}
				options.push({label:job.name, value:job.id.toString(), description:job.description})
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
			
			
			
			let msg= await interaction.channel.send({embeds:[embed], components:[row]})
			await msg.pin()
			
		
			config.servers[interaction.guildId]["jobsMsgId"]=msg.id
			config.servers[interaction.guildId]["jobsChannelId"]=msg.channelId
			
			await fs.writeFile("config.json", JSON.stringify(config), "utf8", (err)=>{if(err)console.error(err)})
			return interaction.reply({content:'Posted jobs message.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};