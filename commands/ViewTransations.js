const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits,StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view-transactions')
		.setDescription("Filter through the transaction log. (Unless you're a GM, you can only see your own transactions.)")
		.addStringOption(option =>
			option.setName('buyer-name-filter')
				.setDescription('The full name of the buyer character.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('seller-name-filter')
				.setDescription('The full name of the seller character.')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('item-filter')
				.setDescription('The full or partial name of the item/service/reason.'))
		.addStringOption(option =>
			option.setName('price-upper-limit-filter')
				.setDescription('The upper limit of the price range you want to filter.'))
		.addStringOption(option =>
			option.setName('price-lower-limit-filter')
				.setDescription('The lower limit of the price range you want to filter.'))
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			await interaction.deferReply({ephemeral:true})
			let buyer = interaction.options.getString('buyer-name-filter')
			let seller = interaction.options.getString('seller-name-filter')
			let ordertostring={"createdAt,DESC":"Date - descending","createdAt,ASC":"Date - ascending","price,DESC":"Price - descending","price,ASC":"Price - ascending",}
			let stringtoorder={"Date - descending":["createdAt", "DESC"],"Date - ascending":["createdAt", "ASC"],"Price - descending":["price", "DESC"],"Price - ascending":["price", "ASC"],}
			
			let item = interaction.options.getString('item-filter')
			let priceu = interaction.options.getString('price-upper-limit-filter')
			let pricel = interaction.options.getString('price-lower-limit-filter')
			let filters={"guildid":interaction.guildId}
			if(!(await interaction.memberPermissions.has(PermissionFlagsBits.ManageEvents))){
				let bufferarray=[]
				let chars=await models.characters.findAll({attributes:["charname"], where:{owner: await interaction.user.id.toString(), guildid:interaction.guildId}})
				for(ch of chars){
					bufferarray.push({"buyername": ch.charname})
					bufferarray.push({"sellername": ch.charname})
				}
				filters={...filters, ...{[Op.or]:bufferarray}}
			}
			
			let order=["createdAt", "DESC"]
			let page=0
			let filterstrings=[{"name":"Page: ", "value":(page+1).toString()},{"name":"Sort: ", "value":ordertostring[order.toString()]}, {"name":"Filters", "value":""}]
			if(buyer){
				filterstrings.push({name:"buyer:", value:buyer.trim()})
				filters.buyername=buyer.trim()
			}
			if(seller){
				filterstrings.push({name:"seller:", value:seller.trim()})
				filters.sellername=seller.trim()
			}
			if(item){
				filterstrings.push({name:"reason:", value:item})
				filters.itemname={[Op.like]: "%"+item+"%"}
			}
			if(priceu){
				let balu=toInt(priceu)
				filterstrings.push({name:"upper price limit:", value:toGold(balu.value)})
				if (balu.error){
					return interaction.editReply({content:balu.error, ephemeral:true});
				}
				filters.price={[Op.lte]:balu.value}
			}
			if(pricel){
				let ball=toInt(pricel)
				filterstrings.push({name:"lower price limit:", value:toGold(ball.value)})
				if (ball.error){
					return interaction.editReply({content:ball.error, ephemeral:true});
				}
				if(filters.price){
					filters.price={...filters.price, ...{[Op.gte]:ball.value}}
				}else{
					filters.price={[Op.gte]:ball.value}
				}
			}
			let trans = await models.transactions.findAll({where:filters,order:[order],limit:20, offset: page*20})
			let desc=""
			let embeds=[]
			for(tra of trans){
				let date=Math.floor(tra.createdAt.valueOf()/1000)
				let nextdesc=`<t:${date}:D> -<t:${date}:R>- ${tra.buyername} gave ${tra.sellername} ${toGold(tra.price)}. Reason: ${tra.itemname}.\n\n`
				if((desc+nextdesc).length>4000){
					embeds.push({
						"type": "rich",
						"description":desc,
						"title": `Transaction log`,
						"color": 0xfbff00,
					})
					desc=nextdesc
				}else{
					desc+=nextdesc
				}
			}
			if (desc=="" && embeds.length==0){
				desc+="No transactions matching the chosen filters were found."
			}
			embeds.push({
				"type": "rich",
				"description":desc,
				"fields":filterstrings,
				"title": `Transaction log`,
				"color": 0xfbff00,
			})
			let btns = new ActionRowBuilder();
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId('{"name":"logPrevious"}')
					.setStyle(ButtonStyle.Primary)
					.setLabel(`<<< Previous Page`),
			);
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId('{"name":"logReload"}')
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Reload Page`),
			);
			btns.addComponents(
				new ButtonBuilder()
					.setCustomId('{"name":"logNext"}')
					.setStyle(ButtonStyle.Primary)
					.setLabel(`Next Page >>>`),
			);
			let selectmenu = new ActionRowBuilder();
			selectmenu.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('{"name":"logSort"}')
					.addOptions(
						{
							label: 'Date - descending',
							value: 'Date - descending',
						},
						{
							label: 'Date - ascending',
							value: 'Date - ascending',
						},
						{
							label: 'Price - descending',
							value: 'Price - descending',
						},
						{
							label: 'Price - ascending',
							value: 'Price - ascending',
						},
						
					),
			)
			

			return interaction.editReply({embeds:embeds, components:[btns, selectmenu], ephemeral:true});
			
		}
		catch (error) {
			console.error(error)
			return interaction.editReply({content:'Something went wrong with displaying the transaction log.', ephemeral:true});
		}
	},
};