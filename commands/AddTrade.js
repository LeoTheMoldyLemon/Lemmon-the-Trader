const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-trade')
		.setDescription('Adds a trade to an existing shop.')
		.addStringOption(option =>
			option.setName('shop-id')
				.setDescription('The message id of the shop you want to add the trade to.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('item-name')
				.setDescription('The name of the item/service this trade will sell. Keep it short, a few words max.')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('price')
				.setDescription('The price of the item/service. (`/help-format` to see accepted coin formats)')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('description')
				.setDescription('The description of the item/service.'))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let header=interaction.options.getString("header-embed")
			let price=toInt(interaction.options.getString("price"))
			if (price.error){
				return interaction.reply({content:price.error, ephemeral:true});
			}
			let name=await interaction.options.getString("item-name")
			let msgid=await interaction.options.getString("shop-id")
			let msg={}
			try{
				msg = await interaction.channel.messages.fetch(msgid)
			}catch{
				return interaction.reply({content:'No valid collections with that id exist in this channel.', ephemeral:true});
			}
			let shop=await models.shops.create({
				item:name,
				seller:interaction.channel.name,
				playercreated:false,
				price:price.value,
				description:await interaction.options.getString("description"),
				guildid:interaction.guildId,
				msgid:msg.id,
				channelid:interaction.channelId,
			})
			let options=[]
			msg.components.forEach(comp=>{options=options.concat(comp.components[0].data.options)})
			options.forEach(opt=>opt.label=opt.label.replace(". ", "split-here").split("split-here")[1])
			options.push({
				label: name,
				description: toGold(price.value),
				value: shop.id.toString(),
			},)
			options.sort((a,b)=>{
				if(a.label<b.label){
					return -1
				}else if(a.label>b.label){
					return 1
				}else{
					return 0
				}
			})
			for(let i=0;i<options.length;i++){
				if(options[i].value=="NaN"){
					options.splice(i, 1)
					i--
				}else{
					options[i].label=(i+1).toString()+". "+options[i].label
				}
			}
			let rows=[]
			for(let i=0; i<=Math.floor((options.length-1)/25);i++){
				let selectmenu=new StringSelectMenuBuilder()
							.setCustomId('{"name":"tradeSelect", '+'"num":"'+i.toString()+'"}')
							.setPlaceholder('Select the item you want to buy.')
							.addOptions(options.slice(i*25, (i+1)*25))
				rows.push(new ActionRowBuilder().addComponents(selectmenu))
				
			}
			msg.edit({components:rows})
			
			return interaction.reply({content:'Added new trade.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};