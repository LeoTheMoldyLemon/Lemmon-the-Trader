const { SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-job')
		.setDescription('Create a new job players can use to earn money during downtime.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			
			let btns1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'editJobName'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Edit name and description`),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'editJobRollDescription'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Edit description of rolls`),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'editJobExtraDie'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Edit extra die types`),
				)
			let btns2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify({name:'confirmJob'}))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Create new job`),
				)
				
				
			let embed={"fields":[{"name":"Name:","value":"New Job","inline":false},{"name":"Description:","value":"None.","inline":false},{"name":"Description of 1st roll:","value":"Ability (skill)","inline":false},{"name":"Type of extra die of 1st roll:","value":"none","inline":false},{"name":"Description of 2nd roll:","value":"Ability (skill)","inline":false},{"name":"Type of extra die of 2nd roll:","value":"none","inline":false},{"name":"Description of 3rd roll:","value":"Ability (skill)","inline":false},{"name":"Type of extra die of 3rd roll:","value":"none","inline":false},{"name":"Description of replacement roll:","value":"Ability + prof.","inline":false}],"title":"Creating a new job","color":15615}	
			
			return interaction.reply({embeds:[embed], components: [btns1, btns2], ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the sell post.', ephemeral:true});
		}
	},
};