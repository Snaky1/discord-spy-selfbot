// Импортируем всё что нам нужно
const { Client, WebhookClient, MessageEmbed } = require('discord.js-selfbot-v13');
const client = new Client({checkUpdate: false});
const config = require('./config.json')

// Создаём вебхук
const webhook = new WebhookClient({ url: config.logwebhook}, { allowedMentions: { parse: [], users: [], roles: [] }});

// Ловим ошибки чтобы бот не падал
process.on('unhandledRejection', error => {
	console.error('Фатальная ошибка:', error);
});

client.on('error', error => {
    console.error(error)
})

// Заходим в аккаунт
client.on('ready', async () => {
  console.log(`Вы зашли в аккаунт ${client.user.username}#${client.user.discriminator}(${client.user.id})`);
})

client.on('messageCreate', async (msg) => {

if(msg.guildId !== config.guild) return; // Не выполняем код ниже, если айди сервера с которого пришло сообщение не равен айди указанному в конфиге

if(config.returnbots) { 
    if(msg.author.bot) return;
} // Если config.returnbots равен true - игнорировать ботов

// Создаём эмбед
let emb = new MessageEmbed()
    .setAuthor({iconURL: msg.author.avatarURL(), name: `${msg.author.tag} (${msg.author.id})`, inline: true})
    .setDescription(msg.content)
    .setColor('#534be4')
    .setFooter({text: `Selfbot by @rxiteel || ovinu#0135`})
    
    if (msg.attachments.size > 0) {
        emb.setImage(msg.attachments.map(a=>a.url)[0])
    } // Если в сообщении есть вложение - добавить его в эмбед
    
    if (msg.embeds.length > 0) {// Если в сообщении есть эмбеды
        for (let i = 0; i <= msg.embeds.length; i++) {
            const embed = msg.embeds[i]
            await webhook.send({
                content: `Бот (${msg.author.tag} (${msg.author.id})) отправил сообщение с эмбедом\n${msg.content}`,
		embeds: [embed],
 		username: `${client.guilds.cache.get(config.guild).name} / #${msg.channel.name}`,
		avatarURL: `${(client.guilds.cache.get(config.guild).iconURL() !== null) ? client.guilds.cache.get(config.guild).iconURL() : "https://www.kindpng.com/imgv/ixJomm_no-avatar-png-circle-transparent-png/"}`
            })
        }
    } 

    if(msg.reference) { // Если сообщение реплай(или закрепление, но на это забейте оно не работает)
        const repliedTo = await msg.fetchReference()
        emb.addField(`> В ответ пользователю ${repliedTo.author.username}#${repliedTo.author.discriminator}`,`\`${repliedTo}\``)
    }


    // Отправляем сообщение вебхуком
    webhook.send({
        embeds: [emb],
        username: `${client.guilds.cache.get(config.guild).name} / #${msg.channel.name}`,
        avatarURL: `${(client.guilds.cache.get(config.guild).iconURL() !== null) ? client.guilds.cache.get(config.guild).iconURL() : "https://www.kindpng.com/imgv/ixJomm_no-avatar-png-circle-transparent-png/"}`
    })
})

client.login(config.token);
