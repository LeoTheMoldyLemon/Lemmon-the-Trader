const { SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-buy-unlisted-post')
		.setDescription('Create a new shop post from which users can buy items not already listed in other shop posts.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let btns = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'shopPostBuyUnlisted'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Buy Custom Item`),
				);
			let embed={
				  "type": "rich",
				  "title": `Custom Items`,
				  "description": `If an item is not listed here but you know the price you can purchase it using this button. If you need a price for an item please ask in <#855781199069970442>.`,
				  "color": 0x003cff
				}
			let msg= await interaction.channel.send({embeds:[embed], components: [btns]})
			
			return interaction.reply({content:`Added new shop post for buying custom items.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the shop post.', ephemeral:true});
		}
	},
};