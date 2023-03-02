const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help-player')
		.setDescription("View the player guide for using this bot.")
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let embed={
			    "type": "rich",
			    "title": `Player Guide`,
				"description": "This bot is used for tracking the balance and transactions of characters and creating shops and markets.\n\nOnly a GM can register a character, you can ask in the appropriate channel for a new character.\n\nSome commands require message or channel IDs as inputs. You can get these IDs by going into your discord user settings and enabling **Developer Mode** under the \"Advanced\" tab and then right-clicking on any message or channel and selecting \"Copy ID\". \n\n**The following feature is deprecated, it should still work but it is entirely unnecessary.**\nYou can register the short name of your character using `/register-short-name`.\n\nNPC shops contain \"shop posts\" - buttons and drop-down menus labeled with the name of the item/service you can buy and its price. Pressing the button and selecting a character creates a transaction log and updates the character's balance.\nIf you want to spend or collect money for some reason not applicable to selling or buying from shops, you can use `/spend` and `/collect`. Note: Using `/collect`, selling and buying unlisted items requires GM permission first. You can see your request in <#"+config.servers[interaction.guildId].requestChannelId+">\n\nA character can also `/transfer` money to another character.\n\nYou can use `/view-balance` to view the current balance of a character.\n\nYou can view the transaction log using `/view-transactions`. This command only shows transactions in which one of your characters participated. You can filter the log by the name of the buyer, seller, the reason for the transaction, and the price. Applying any filter is optional.\n\nYour characters can create their own market posts for selling items using `/create-market-post`. Market posts can be edited and removed using `/remove-market post` and `/edit-market-post`. Market posts can also be set to automatically restock (daily at 3AM London time) using `/restock-market-post`.\n\nIf you are the owner of a thread, you may use `/pin-message` to pin any message in that thread.\n\nThe bot creates backups and executes cleanups daily at 3 AM London time, and thus may be slower or unavailable for a few minutes at that time.\n\n If you notice any bugs, errors or have questions or suggestions for this bot, feel free to contact <@821854204904603658>.",
				"color": 0x003cff
			}
			return interaction.reply({embeds:[embed], ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the help command.', ephemeral:true});
		}
	},
};
