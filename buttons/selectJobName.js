const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold,rollDice } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"selectJobName"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			interaction.deferUpdate({})
			let charname=interaction.values[0]
			let character = await models.characters.findOne({where:{charname:charname, guildid:interaction.guildId}})
			if(!character){
				return interaction.editReply({content:'That character no longer exists.', ephemeral:true});
			}
			let job = await models.jobs.findByPk(parseInt(metadata.id))
			if(!job){
				return interaction.editReply({content:'That job no longer exists.', ephemeral:true});
			}
			let DCs=[]
			for(let i=0;i<3;i++){
				DCs.push(rollDice(10)+rollDice(10)+5)
			}
			let rolldice=[job.roll1name, job.roll2name, job.roll3name,]
			if(job.roll1dice!=null){
				if(job.roll1dice==0){
					rolldice[0]+=" + hit die"
				}else{
					rolldice[0]+=" + 1d"+job.roll1dice
				}
			}
			if(job.roll2dice!=null){
				if(job.roll2dice==0){
					rolldice[1]+=" + hit die"
				}else{
					rolldice[1]+=" + 1d"+job.roll2dice
				}
			}
			if(job.roll3dice!=null){
				
				if(job.roll3dice==0){
					rolldice[2]+=" + hit die"
				}else{
					rolldice[2]+=" + 1d"+job.roll3dice
				}
			}
			let mods=["+0", "+0", "+0", "+0"]
			let jobmod=await models.modifiers.findOne({where:{
				jobid:job.id,
				charname:character.charname,
			}})
			if(jobmod){
				for(let i=0;i<3;i++){
					if(jobmod["roll"+(i+1)]>=0){
						mods[i]="+"+jobmod["roll"+(i+1)]
					}else{
						mods[i]=jobmod["roll"+(i+1)].toString()
					}
				}
				if(jobmod["rollreplacement"]>=0){
					mods[3]="+"+jobmod["rollreplacement"]
				}else{
					mods[3]=jobmod["rollreplacement"].toString()
				}
			}
			let embed={
				"fields":[
					{"name":rolldice[0]+" DC (1st check):","value":DCs[0].toString(),"inline":false},
					{"name":rolldice[1]+" DC (2nd check):","value":DCs[1].toString(),"inline":false},
					{"name":rolldice[2]+" DC (3rd check):","value":DCs[2].toString(),"inline":false},
					{"name":"Your "+job.roll1name+" modifier (1st check):","value":mods[0],"inline":false},
					{"name":"Your "+job.roll2name+" modifier (2nd check):","value":mods[1],"inline":false},
					{"name":"Your "+job.roll3name+" modifier (3rd check):","value":mods[2],"inline":false},
					{"name":"Your "+job.replacementname+" modifier (replacement check):","value":mods[3],"inline":false},
					{"name":"Your hit die type:","value":"d"+character.hitdie,"inline":false}
				],"title":"Temporary work: "+job.name,
				"description":job.description+"\n\n**INSTRUCTIONS**\nAll the DCs [2d10+5] have already been rolled (as you can see below). First, click \"Edit Modifiers\" to input your current character's correct modifiers and hit die. If you used this job with this character before, the modifiers are auto-filled from last time. Even after you entered them or after they have been auto-filled, please **double-check that they are correct** before selecting the \"roll\" or \"replace then roll\" options. ",
				"author":{"name":character.charname},"color":26367,
				"footer":""
				}
			let btns = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'editModifiers', id:parseInt(metadata.id)}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Edit modifiers`),
				)
			const row=new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(JSON.stringify({name:"sendJob", id:metadata.id}))
						.setPlaceholder("How do you want to roll?")
						.addOptions([
							{label:"Just roll", value:"nan"},
							{label:"Replace 1st check then roll", value:"0"},
							{label:"Replace 2nd check then roll", value:"1"},
							{label:"Replace 3rd check then roll", value:"2"},
						])
				)
			await interaction.client.channels.fetch(config.servers[interaction.guildId].jobLogChannelId).then(async (channel)=>{
				await channel.send({embeds:[embed], components:[btns, row]})
			})
			interaction.editReply({content: "A message for setting up your modifiers is available in: <#"+config.servers[interaction.guildId].jobLogChannelId+">", components:[]})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with processing the job.', ephemeral:true});
		}
	},
};