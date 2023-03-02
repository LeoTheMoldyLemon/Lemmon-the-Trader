const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits, StringSelectMenuBuilder,ButtonBuilder, ButtonStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
var config=require("../config.json")
const fs=require("fs")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('copy-shop')
		.setDescription('Copies an entire shop including all the trades.')
		.addStringOption(option =>
			option.setName('shop-id')
				.setDescription('The message id of the shop you want to copy.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('channel-id')
				.setDescription('The channel id of the channel in which the shop is.')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let chan={}
			let msg={}
			try{
				chan=await interaction.client.channels.fetch(interaction.options.getString("channel-id"))
			}catch{
				return interaction.reply({content:'Channel with that ID could now be found.', ephemeral:true});
			}
			try{
				msg=await chan.messages.fetch(interaction.options.getString("shop-id"))
			}catch{
				return interaction.reply({content:'Shop with that ID could now be found.', ephemeral:true});
			}
			
			let oldoptions=[]
			let options=[]
			const row = new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('{"name":"tradeSelect"}')
						.setPlaceholder('Select the item you want to buy.')
						.addOptions(
							{
								label: 'Placeholder',
								description: 'Add new trades using `/add-trade`',
								value: "NaN",
							},
						),
				);
			msg.components.forEach(comp=>{oldoptions=oldoptions.concat(comp.components[0].data.options)})
			let newmsg=await interaction.channel.send({embeds:msg.embeds, components:[row]})
			oldoptions.forEach(opt=>opt.label=opt.label.replace(". ", "split-here").split("split-here")[1])
			for(const opt of oldoptions){
				let oldshop=await models.shops.findByPk(parseInt(opt.value))
				let shop=await models.shops.create({
					item:oldshop.item,
					seller:interaction.channel.name,
					playercreated:false,
					price:oldshop.price,
					guildid:interaction.guildId,
					description:oldshop.description,
					msgid:newmsg.id,
					channelid:interaction.channelId,
				})
				
				options.push({
					label: oldshop.item,
					description: toGold(oldshop.price),
					value: shop.id.toString(),
				},)
			}
			
			
			
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
			newmsg.edit({components:rows})
			
			return interaction.reply({content:'Coppied shop.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the message.', ephemeral:true});
		}
	},
};