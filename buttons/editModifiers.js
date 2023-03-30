const { SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,  PermissionFlagsBits, ModalBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: {name:"editModifiers"},
	async execute(interaction, sequelize, models, metadata) {
		try {
			let job = await models.jobs.findByPk(parseInt(metadata.id))
			let character= await models.characters.findOne({where:{guildid:interaction.guildId, charname:interaction.message.embeds[0].author.name}, attributes:["owner"]})
			if(character.owner!=interaction.user.id){
				return interaction.reply({content:"Not your job thingy, my guy! You can check out the pinned message in this channel to find where to make your own.", ephemeral:true})
			}
			const modal= new ModalBuilder()
				.setCustomId(JSON.stringify(metadata))
				.setTitle("Setting modifiers")
				.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("mod1")
							.setLabel(job.roll1name)
							.setStyle(TextInputStyle.Short)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("mod2")
							.setLabel(job.roll2name)
							.setStyle(TextInputStyle.Short),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("mod3")
							.setLabel(job.roll3name)
							.setStyle(TextInputStyle.Short),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("modrep")
							.setLabel(job.replacementname)
							.setStyle(TextInputStyle.Short),
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId("hitdie")
							.setLabel("Hit die")
							.setStyle(TextInputStyle.Short),
					)
				)
			interaction.showModal(modal)
			
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with editing the modifiers.', ephemeral:true});
		}
	},
};