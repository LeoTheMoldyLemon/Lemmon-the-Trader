const { SlashCommandBuilder, ActionRowBuilder,  PermissionFlagsBits } = require('discord.js');
const { toInt, toGold } = require("../utils.js")
const config = require("../config.json")
const { Op } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('display-guide')
		.setDescription("Display the guide message for the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
		.setDMPermission(false),
	async execute(interaction, sequelize, models) {
		try {
			let embed={"fields":[{"name":"`/register-short-name`","value":"Assign a short name to one of your characters that only you can use instead of their full name.","inline":false},{"name":"`/view-balance`","value":"View the balance of one of your characters.","inline":false},{"name":"`/transfer`","value":"Transfer some amount of coin to another character. You may not transfer non-positive amounts.","inline":false},{"name":"`/spend`","value":"Spend some amount of coin. Try using this only when no NPC shops or \"Buy Unlisted\" posts are applicable.","inline":false},{"name":"`/help-player`","value":"Displays a guide similar to this one, but a bit more compact.","inline":false},{"name":"`/help-format`","value":"Displays the guide for formatting coin amounts.","inline":false},{"name":"`/pin-message`","value":"If you are the owner of a thread, you may use this command to pin any message in that thread.","inline":false},{"name":"`/create-market-post`","value":"Register a player-created shop.","inline":false},{"name":"`/remove-market-post`","value":"Remove a market post. You may only use this if you are the owner of the market post.","inline":false},{"name":"`/edit-market-post`","value":"Edit anything in a market post. Description, item/service, title, price, and/or amount. You may use this to restock market posts by editing the amount.","inline":false},{"name":"`/view-transactions`","value":"Lists all the transaction logs. A player may only see the logs in which at least one of their characters participated. You can input any filters as the options of the command.","inline":false}],"title":"Guide","description":"This is a player guide for the economy bot created by <@821854204904603658>. Feel free to contact me with suggestions, problems, bugs, or criticism.\n\nUsing this bot, GMs can create characters and link them to players. Each character has a wallet and all their transactions are tracked. GMs can also create NPC shops, which the players can use for purchasing and selling. All transactions are logged and a player may view any transactions in which their character participated in. GMs may view all transactions on the server.\n\nWhen doing almost anything, since a player can have multiple characters, the player must specify which character they would like to perform the action with. Typing in the full name of your character every time you want to buy something would be annoying, so short names are a thing. You may register a short name for your character, as short as one letter in length, which only you may use instead of your character's name.\n\nPlayers may also create their own shops called market posts. These market posts have most of the functionality of NPC shops, with one added feature: amount. You may specify how much of the item/service you have available for sale, and restock later by editing the market post.\n\nSome commands require message or channel IDs as inputs. You can get these IDs by going into your discord user settings and enabling **Developer Mode** under the \"Advanced\" tab and then right-clicking on any message or channel and selecting \"Copy ID\". \n\nThe bot creates backups and executes cleanups daily at 3 AM UTC, and thus may be slower or unavailable for a few minutes at that time.\n\nHere is a list of the commands available to the players. (For GM commands, use `/help-gm`)","color":14662421}
			await interaction.channel.send({embeds:[embed]});
			return interaction.reply({content:'Created guide.', ephemeral:true});
		}
		catch (error) {
			console.error(error)
			return interaction.reply({content:'Something went wrong with displaying the help command.', ephemeral:true});
		}
	},
};
