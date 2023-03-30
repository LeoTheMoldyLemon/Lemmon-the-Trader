const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")
const { Op } = require("sequelize");

module.exports = {
	data: {name:"editModifiers"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let msg=interaction.message
			let embed=msg.embeds[0]
			let rolls=[interaction.fields.getTextInputValue("mod1"), interaction.fields.getTextInputValue("mod2"), interaction.fields.getTextInputValue("mod3"), interaction.fields.getTextInputValue("modrep"),]
			for(let i=0;i<4;i++){
				
				if(isNaN(parseInt(rolls[i]))){
					return interaction.reply({content:rolls[i]+' is not a valid number.', ephemeral:true});
				}
				rolls[i]=parseInt(rolls[i])
				if(rolls[i]>=0){
					rolls[i]="+"+rolls[i].toString()
				}else{
					rolls[i]=rolls[i].toString()
				}
				embed.fields[i+3].value=rolls[i]
			}
			let hitnum=parseInt(interaction.fields.getTextInputValue("hitdie").replace("1d", "").replace("d", ""))
			if(isNaN(hitnum)){
				return interaction.reply({content:interaction.fields.getTextInputValue("hitdie")+' is not a valid number.', ephemeral:true});
			}
			hitnum="d"+hitnum
			embed.fields[7].value=hitnum
			return interaction.update({embeds:[embed]})
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the modifiers.', ephemeral:true});
		}
	},
};