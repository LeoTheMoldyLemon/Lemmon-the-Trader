const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, ButtonBuilder, ButtonStyle, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold, rollDice } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"sendJob"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let job = await models.jobs.findByPk(parseInt(metadata.id))
			let character= await models.characters.findOne({where:{guildid:interaction.guildId, charname:interaction.message.embeds[0].author.name}})
			if(character.owner!=interaction.user.id){
				return interaction.reply({content:"Not your job thingy, my guy! You can check out the pinned message in this channel to find where to make your own.", ephemeral:true})
			}
			let msg=interaction.message
			let embed=msg.embeds[0]
			let newfields=[]
			let hitdie=parseInt(embed.fields[7].value.replace("d", ""))
			let money=[0, 5000, 10000, 20000]
			let successes=0
			let DCs=[]
			let rolls=[]
			let extrarolls=[]
			let mods=[]
			for(let i=0;i<3;i++){
				DCs.push(parseInt(embed.fields[i].value))
				rolls.push(rollDice(20))
				if(i==parseInt(interaction.values[0])){
					extrarolls.push(0)
					mods.push(parseInt(embed.fields[6].value))
					if(rolls[i]+extrarolls[i]+mods[i]>=DCs[i]){
						successes++
						newfields.push({name:job.replacementname, value:"**SUCCESS** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+mods[i]+"  [d20+mods])"})
					}else{
						newfields.push({name:job.replacementname, value:"**FAILURE** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+mods[i]+"  [d20+mods])"})
					}
				}else{
					mods.push(parseInt(embed.fields[i+3].value))
					if(job["roll"+(i+1)+"dice"]==0){
						job["roll"+(i+1)+"name"]+=" + hit die"
					}else if(job["roll"+(i+1)+"dice"]){
						job["roll"+(i+1)+"name"]+=" + 1d"+job["roll"+(i+1)+"dice"]
					}
					if(job["roll"+(i+1)+"dice"]==null){
						extrarolls.push(0)
						if(rolls[i]+extrarolls[i]+mods[i]>=DCs[i]){
							successes++
							newfields.push({name:job["roll"+(i+1)+"name"], value:"**SUCCESS** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+mods[i]+"  [d20+mods])"})
						}else{
							newfields.push({name:job["roll"+(i+1)+"name"], value:"**FAILURE** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+mods[i]+"  [d20+mods])"})
						}
					}else if(job["roll"+(i+1)+"dice"]==0){
						extrarolls.push(rollDice(hitdie))
						if(rolls[i]+extrarolls[i]+mods[i]>=DCs[i]){
							successes++
							newfields.push({name:job["roll"+(i+1)+"name"], value:"**SUCCESS** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+extrarolls[i]+"+"+mods[i]+"  [d20+d"+hitdie+"+mods])"})
						}else{
							newfields.push({name:job["roll"+(i+1)+"name"], value:"**FAILURE** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+extrarolls[i]+"+"+mods[i]+"  [d20+d"+hitdie+"+mods])"})
						}
					}else{
						extrarolls.push(rollDice(job["roll"+(i+1)+"dice"]))
						if(rolls[i]+extrarolls[i]+mods[i]>=DCs[i]){
							successes++
							newfields.push({name:job["roll"+(i+1)+"name"], value:"**SUCCESS** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+extrarolls[i]+"+"+mods[i]+"  [d20+d"+job["roll"+(i+1)+"dice"]+"+mods])"})
						}else{
							newfields.push({name:job["roll"+(i+1)+"name"], value:"**FAILURE** -  DC"+DCs[i]+"  - rolled **"+(rolls[i]+extrarolls[i]+mods[i])+"** ("+rolls[i]+"+"+extrarolls[i]+"+"+mods[i]+"  [d20+d"+job["roll"+(i+1)+"dice"]+"+mods])"})
						}
					}
				}
			}
			await models.modifiers.upsert({
				jobid:job.id,
				charname:character.charname,
				roll1:parseInt(embed.fields[3].value),
				roll2:parseInt(embed.fields[4].value),
				roll3:parseInt(embed.fields[5].value),
				rollreplacement:parseInt(embed.fields[6].value),
			})
			character.hitdie=hitdie
			await character.save()
			newfields.push({name:"Earned:", value:toGold(money[successes])})
			let newembed={fields:newfields, author:{name:character.charname}, title:embed.title, color:3586059, description:""}
			await msg.edit({embeds:[newembed], components:[]})
			if(money[successes]==0){
				return interaction.reply({content:"No money earned, better luck next time!", ephemeral:true})
			}
			
			let reason= "Temporary work during downtime - "+msg.url
			embed={
				title:"Collect Request",
				fields:[
					{name:"From:", value:"The Void"},
					{name:"For:", value:character.charname},
					{name:"Reason:", value:reason},
					{name:"Price:", value:toGold(money[successes])},
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
			return interaction.reply({content:"Sent a collect request to <#"+config.servers[interaction.guildId].requestChannelId+">.", ephemeral:true})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with sending the job.', ephemeral:true});
		}
	},
};