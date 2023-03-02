const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-post-in-collection')
		.setDescription('Remove a shop post in a shop collection.')
		.addStringOption(option =>
			option.setName('collection-id')
				.setDescription('The message ID of the collection in which the post you want to remove is.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('post-number')
				.setDescription('The ordinal number of the post in the collection. (The number of the top post is 1)')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			
			let msgid=await interaction.options.getString("collection-id")
			let msg={}
			try{
				msg = await interaction.channel.messages.fetch(msgid)
			}catch{
				return interaction.reply({content:"No valid collections with that ID exist in this channel.", ephemeral:true})
			}
			
			let ord=parseInt(await interaction.options.getString("post-number"))

			
			if ( isNaN(ord)){
				return interaction.reply({content:"Invalid post number.", ephemeral:true})
			}
			let row=msg.components[ord-1]
			if (!row){
				return interaction.reply({content:"Invalid post number.", ephemeral:true})
			}
			msg.components.splice(ord-1,1)
			try{
				let shop = await models.shops.findByPk(JSON.parse(row.components[0].customId).id)
				shop.destroy()
			}catch{}
			let content=""
			if(msg.components.length==0){
				content="This is an empty shop collection. Add new shop posts using `/add-post-to-collection`."
			}
			await msg.edit({embeds:msg.embeds, components:msg.components, content:content})
			
			return interaction.reply({content:`Removed shop post.`, ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with removing the shop post.', ephemeral:true});
		}
	},
};