const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create-shop-post')
		.setDescription('Create a new shop post from which users can buy an item in the specified thread.')
		.addStringOption(option =>
			option.setName('item-name')
				.setDescription('The name of the item/service this post will sell. Keep it short, a few words max.')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('price')
				.setDescription('The price of the item/service. (`/help-format` to see accepted coin formats)')
				.setRequired(true))
		.addBooleanOption(option => 
			option.setName('multiple-button')
				.setDescription('Include a "Buy multiple" button, useful for items that are often purchased in bulk. (default false)'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let price=toInt(interaction.options.getString("price"))
			if (price.error){
				return interaction.reply({content:price.error, ephemeral:true});
			}
			let name=await interaction.options.getString("item-name")
			let btns = new ActionRowBuilder();
			let shop=await models.shops.create({
				item:name,
				seller:interaction.channel.name,
				playercreated:false,
				price:price.value,
				guildid:interaction.guildId,
			})
			
			
			let btnData={name:'shopPostBuyOne', id:shop.id}
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify(btnData))
					.setStyle(ButtonStyle.Primary)
					.setLabel(`${name} - ${toGold(price.value)}`),
			);
			if(await interaction.options.getBoolean("multiple-button")){
				btnData.name='shopPostBuyMultiple'
				btns.addComponents(
					new ButtonBuilder()
						.setCustomId(JSON.stringify(btnData))
						.setStyle(ButtonStyle.Primary)
						.setLabel(`Buy multiple`),
				);
			}
			
			let msg= await interaction.channel.send({components: [btns]})
			shop.channelid=msg.channelId
			shop.msgid=msg.id
			shop.save()
			
			return interaction.reply({content:`Added new shop post which sells *${name}* at ${toGold(price.value)}`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with adding the shop post.', ephemeral:true});
		}
	},
};