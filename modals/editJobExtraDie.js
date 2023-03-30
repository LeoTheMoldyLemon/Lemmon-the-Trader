const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"editJobExtraDie"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg=interaction.message
			let embed=msg.embeds[0]
			let rolls=[]
			rolls.push(interaction.fields.getTextInputValue("roll1"))
			rolls.push(interaction.fields.getTextInputValue("roll2"))
			rolls.push(interaction.fields.getTextInputValue("roll3"))
			for(let i=0;i<rolls.length;i++){
				if(!isNaN(parseInt(rolls[i].replace("d", ""))) || rolls[i]=="none" || rolls[i]=="" || rolls[i]=="hit die"){
					if(rolls[i]==""){
						rolls[i]="none"
					}else if(!isNaN(parseInt(rolls[i].replace("d", "")))){
						rolls[i]="d"+rolls[i].replace("d", "")
					}
				}else{
					return interaction.reply({content:rolls[i]+" is not a valid die type.", ephemeral:true})
				}
			}
			embed.fields.forEach(field=>{
				
				if(field.name=="Type of extra die of 1st roll:"){
					field.value=rolls[0]
				}else if(field.name=="Type of extra die of 2nd roll:"){
					field.value=rolls[1]
				}else if(field.name=="Type of extra die of 3rd roll:"){
					field.value=rolls[2]
				}
			})
			return interaction.update({embeds:[embed]})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the job.', ephemeral:true});
		}
	},
};