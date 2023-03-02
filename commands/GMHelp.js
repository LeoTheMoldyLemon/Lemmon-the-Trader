const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help-gm')
		.setDescription("View the GM guide for using this bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let embed1={"title":"GM Guide","description":"This bot is used for tracking the balance and transactions of characters and creating shops and markets.\n\nSome commands require message or channel IDs as inputs. You can get these IDs by going into your discord user settings and enabling **Developer Mode** under the \"Advanced\" tab and then right-clicking on any message or channel and selecting \"Copy ID\".\n\nA GM can register a character and connect it to a user using `/register-character`.\n\nA GM can change the balance of multiple characters using `/add-balance` or set the balance of a single character using `/set-balance`.\n\nA GM can create NPC shop posts using `/create-shop-post`. Creating a shop post for buying custom items/services is possible using `/create-buy-unlisted-post`. Posts for selling items can be created using `/create-sell-post`.\n\nAll transactions are posted to a channel you can designate using `/set-transaction-channel`.\n\nThe bot also generates a message which contains the counter for total money earned and spent by players. This message can be moved to a new channel using `/set-counter-message`.\n\nYou can view and filter the transaction log using `/view-transactions`.\n\nYou can also view a table containing all characters, their balance and the player that owns them using `/view-characters`.\n\n You can delete a character so that it doesn't show up in autocomplete and `/view-characters` using `/delete-character`. A deleted character also cannot be used by its player. The character is never truly deleted (because of this, it's not possible to create a new character with the same name as a deleted character) and can be recovered using `/recover-character`.\n\n**NOTE: collections are deprecated, try using shops with drop-down menus instead.**\nIf you want to create a large number of shop posts you can use `/create-shop-collection`, `/add-post-to-collection`, `/edit-post-in-collection`, `/edit-collection-header`, and `/remove-post-in-collection` to create a collection of shop posts and add/remove/edit posts to/in that collection. You can even create and edit the header of the collection, which is displayed using an embed (which you can create using the embed builder tool of the Carl-bot dashboard.) Regular shop posts count as collections as well.","color":15615}
			let embed2={"title":"GM Guide","description":"You can use `/create-shop` to create an empty shop with a drop-down menu. You can then use `/add-trade`, `/remove-trade` and `/edit-trade` to configure the trades you want the shop to have. You can also add a title header in the form of an embed (you can make an embed using the Carl-bot dashboard) to a shop and edit it using `/edit-shop-header`. Since setting up a shop takes a while and relocating a shop is sometimes necessary, you can use `/copy-shop` to copy an entire shop with all its trades into another channel (but not another server).\n\n Some player transactions require GM approval, in <#"+config.servers[interaction.guildId].requestChannelId+"> you can find current and past requests for approval. Try not to approve your own requests.\n\nThe bot creates backups and executes cleanups daily at 3 AM London time, and thus may be slower or unavailable for a few minutes at that time. \n\n If you notice any bugs, errors or have questions or suggestions for this bot, feel free to contact <@821854204904603658>.","color":15615}
			
			return interaction.reply({embeds:[embed1, embed2], ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the help command.', ephemeral:true});
		}
	},
};