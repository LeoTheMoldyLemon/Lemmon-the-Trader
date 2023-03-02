const { SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-sell-post')
		.setDescription('Create a new shop sell post from which users can sell their items in the specified thread.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			
			let btns = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'shopPostSell'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Sell item`),
				);
				
			let embed={
				  "type": "rich",
				  "title": `Selling Items`,
				  "description": `You can sell items listed in shops for 10% or 50% of their base price, determined by the GM who handed out the item. \n\nIf it is a starter item or item you bought yourself it can be sold for 50%.`,
				  "color": 0x003cff
				}			
			

			let msg= await interaction.channel.send({embeds:[embed], components: [btns]})
			
			return interaction.reply({content:`Added new shop post for selling items.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the sell post.', ephemeral:true});
		}
	},
};