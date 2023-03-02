const discord = require('discord.js');
const { join } = require('path');
const { token, db_username, db_password, lastBackup, backupTime, deleteThreshold } = require('./config.json');
const client = new discord.Client({ intents: 65339 });
const sequelize = require('sequelize');
const { toInt, toGold } = require("./utils.js")
const { Op } = require("sequelize");
const fs=require("fs")


const seq = new sequelize('production', db_username, db_password, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'production.sqlite',
})


const {ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Events,
  GatewayIntentBits,
  InteractionType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Collection,
  AttachmentBuilder, 
  StringSelectMenuBuilder,
  EmbedBuilder  } = require('discord.js')
  
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

  
  //loading in all the models from ./models/ for sequelize
client.models={}
for(let file of fs.readdirSync('./models').filter(file => file.endsWith('.js'))){
	client.models[file.replace(".js", "")]=require("./models/"+file)(seq, sequelize.DataTypes)
}

//loads in buttons and select menus from the folder ./buttons/
client.buttons = new Collection();
for (const file of fs.readdirSync("./buttons").filter(file => file.endsWith('.js'))) {
	const btn = require("./buttons/"+file);
	if ('data' in btn && 'execute' in btn) {
		client.buttons.set(btn.data.name, btn);
	} else {
		console.log(`[WARNING] The button at ${file} is missing a required "data" or "execute" property.`);
	}
}

//loads in modals from the folder ./modals/
client.modals = new Collection();
for (const file of fs.readdirSync("./modals").filter(file => file.endsWith('.js'))) {
	const modal = require("./modals/"+file);
	if ('data' in modal && 'execute' in modal) {
		client.modals.set(modal.data.name, modal);
	} else {
		console.log(`[WARNING] The modal at ${file} is missing a required "data" or "execute" property.`);
	}
}

//loads in commands from the folder ./commands/
client.commands = new Collection();
for (const file of fs.readdirSync("./commands").filter(file => file.endsWith('.js'))) {
	const command = require("./commands/"+file);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
	}
}

//logging and error handling
client.once('ready', () => {
	client.user.setActivity("/help-player, /help-gm");
	seq.sync()
	console.log(new Date().toUTCString()+"> "+'Ready!');
	let diff=(new Date())-convertTZ(new Date(), "Europe/London")
	let scheduled=new Date()
	scheduled.setHours(backupTime)
	scheduled.setMinutes(0)
	scheduled.setSeconds(0)
	scheduled=new Date(scheduled.valueOf()+diff)
	if(scheduled<=new Date()){
		console.log(new Date().toUTCString()+"> "+"Backup time already passed today, scheduling for tomorrow.")
		scheduled.setUTCDate(scheduled.getDate()+1)
	}
	console.log(new Date().toUTCString()+"> "+"Scheduled next backup on "+scheduled.toString()+", in "+(scheduled.valueOf()-(new Date()).valueOf()).toString())
	setTimeout(dailyCheckup, scheduled.valueOf()-(new Date()).valueOf())
	//setTimeout(sendNotification, 1000*60*60*10)
});
client.on('debug', data => {
    debug_file.write(new Date().toUTCString()+"> "+data+"\n");
});

client.on('warn', e => {
    console.error(new Date().toUTCString()+"> "+'Warning:', e);
});
client.on('invalidated', () => {
    console.error(new Date().toUTCString()+"> "+'The current session has been invalidated. Attempting reconnect in a minute.');
	setTimeout(()=>{client.login(token)}, 60000)
});


client.on('error', e => {
    console.error(new Date().toUTCString()+"> "+'The WebSocket encountered an error:', e);
});

async function sendNotification(){
	try{
		await client.users.fetch("215949566636195843")
			.then(async(user)=>{await user.send(`You told me to send you a reminder to "make a map". So there. Make a map.`)})
	}catch(e){
		console.error(e)
	}
}



// the daily checkup function uses the time defined in config.json to backup the database daily (2 backups exist) and delete rows in shops whose messages are no longer accesible. rows in transactions are deleted if they are old (number od days is defined in config.json). TODO: instead of deleteing old transactions after a certain date, delete them when a certain size is reached instead.
async function dailyCheckup(){
	console.log(new Date().toUTCString()+"> "+"Starting backup.")
	await fs.copyFile("backup1.sqlite", "backup2.sqlite", (e)=>{if(e)console.log(e)})
	await fs.copyFile("production.sqlite", "backup1.sqlite", (e)=>{if(e)console.log(e)})
	console.log(new Date().toUTCString()+"> "+"Performing daily checkup, deleting old shops and transaction logs.")
	let shoplist=await client.models.shops.findAll({attributes:["id", "channelid", "msgid", "restock"]})
	let deletedcounter=0
	let checkedcounter=0
	let restockcounter=0
	for(let shop of shoplist){
		checkedcounter++
		try{
			let msg={}
			await client.channels.fetch(shop.channelid).then(async (channel)=>{msg=await channel.messages.fetch(shop.msgid)}) //if the message can't be fetched, discord returns an error, meaning the message is non-existant or inaccesible to the bot.
			
			if(msg.components.length==0){
				await shop.destroy()
				deletedcounter++
			}
			
			if(shop.restock!=0){
				restockcounter++
				let embed=msg.embeds[0]
				embed.fields[0].value=(parseInt(embed.fields[0].value)+shop.restock).toString()
				await msg.edit({embeds:[embed]})
			}
		}catch(e){
			await shop.destroy()
			deletedcounter++
		}
	}
	console.log(new Date().toUTCString()+"> "+`Checked ${checkedcounter} shop posts, deleted ${deletedcounter}, restocked ${restockcounter}.`)
	let rows=await client.models.transactions.destroy({where:{
		createdAt: {
			[Op.lt]: new Date(new Date() - (deleteThreshold*24 * 60 * 60 * 1000))
		}
	}})
	console.log(new Date().toUTCString()+"> "+"Deleted "+rows.toString()+" transactions.")
	
	let diff=(new Date())-convertTZ(new Date(), "Europe/London")
	let scheduled=new Date()
	scheduled.setHours(backupTime)
	scheduled.setMinutes(0)
	scheduled.setSeconds(0)
	scheduled=new Date(scheduled.valueOf()+diff)
	scheduled.setUTCDate(scheduled.getUTCDate()+1)
	console.log(new Date().toUTCString()+"> "+"Scheduled next backup on "+scheduled.toString()+", in "+(scheduled.valueOf()-(new Date()).valueOf()).toString())
	setTimeout(dailyCheckup, scheduled.valueOf()-(new Date()).valueOf())

}

async function restockMarkets(){
	console.log(new Date().toUTCString()+"> "+"Restocking markets.")
	
}





//event processing for all possible interactions
client.on(Events.InteractionCreate, async interaction =>{
	if (interaction.isChatInputCommand()){//processing for chat commands
		const command = interaction.client.commands.get(interaction.commandName);
		console.log(new Date().toUTCString()+"> "+`[${interaction.guild.name}] ${interaction.user.username}: ${command.data.name}`)
		if (!command) {
			interaction.reply({content:`${command} is not a command.`, ephemeral:true})
			return;
		}
		try {
			await command.execute(interaction, sequelize, client.models);
			if(!["view-transactions", "view-characters", "view-balance", "display-guide", "help-gm", "help-player"].includes(command.data.name))setTimeout(async()=>{try{await interaction.deleteReply()}catch{}}, 60000)//deleting command replies after 1 minute
		} catch (e) {
			console.error(e);
			try{
				await interaction.reply({ content: `There was an error while executing this command!`, ephemeral: true });
			}catch{
				await interaction.editReply({ content: `There was an error while executing this command!`, ephemeral: true });
			}
		}
	} else if(interaction.isButton() || interaction.isStringSelectMenu()){//processing for buttons and select menus
		console.log(new Date().toUTCString()+"> "+`[${interaction.guild.name}] ${interaction.user.username}: pressed ${interaction.customId}`)
		let metadata=JSON.parse(interaction.customId)
		const btn = await interaction.client.buttons.get(metadata.name);
		if (!btn) {
			console.error(new Date().toUTCString()+"> "+`[${interaction.guild.name}] ${interaction.user.username}: button ${interaction.customId} does not exist`);
			return;
		}
		try {
			let msg = await btn.execute(interaction, sequelize, client.models, metadata);
		} catch (e) {
			console.error(e);
			await interaction.reply({ content: `There was an error while processing this button!`, ephemeral: true });
		}
	} else if(interaction.type === InteractionType.ModalSubmit){
		console.log(new Date().toUTCString()+"> "+`[${interaction.guild.name}] ${interaction.user.username}: submitted ${interaction.customId}`)
		let metadata=JSON.parse(interaction.customId)
		const modal = interaction.client.modals.get(metadata.name);
		if (!modal) {
			console.error(new Date().toUTCString()+"> "+`[${interaction.guild.name}] ${interaction.user.username}: modal ${interaction.customId} does not exist`);
			return;
		}
		try {
			let msg=await modal.execute(interaction, sequelize, client.models, metadata);
			setTimeout(async()=>{try{await interaction.deleteReply()}catch{}}, 60000)//deleting modal replies after 1 minute
		} catch (e) {
			console.error(e);
			await interaction.reply({ content: `There was an error while processing this form!`, ephemeral: true });
		}
	}else if (interaction.isAutocomplete()) {//processing for autocomplete
		let focusedOption = interaction.options.getFocused(true);
		let choices=[]
		let options=[]
		if (focusedOption.name== 'character-name-short') {
			options = await client.models.characters.findAll(
				{where: {
					owner: interaction.user.id.toString(),
					guildid:interaction.guildId,},
				attributes:["shortname", "charname"],
				}
			)
			
		}else{
			options = await client.models.characters.findAll(
				{where: {
					guildid:interaction.guildId,},
				attributes:["charname"],
				}
			)
		}
		for(let opt of options){
			choices=choices.concat(Object.values(opt.dataValues))
		}
		let display=[]
		for(let cho of choices){
			if(cho!=null){
				display.push(cho)
			}
		}
		let filtered = display.filter(choice => choice.includes(focusedOption.value)).slice(0, 25);
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
		
	}
})





fs.copyFile("debug.txt", "debug1.txt", async (e)=>{if(e)console.log(e); debug_file=await fs.createWriteStream("./debug.txt", {flags: "w"}); client.login(token);})


