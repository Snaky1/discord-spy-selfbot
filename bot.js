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
    if (msg.webhookId) return;
} // Если config.returnbots равен true - игнорировать ботов и другие вебхуки

// Создаём эмбед
let emb = new MessageEmbed()
    .setAuthor({iconURL: msg.author.avatarURL(), name: `${msg.author.tag} (${msg.author.id})`, inline: true})
    .setDescription(msg.content)
    .setColor('#534be4')
    .setFooter({text: `Selfbot by @rxiteel || ovinu#0135`})
    
    if (msg.attachments.size > 0) {
        emb.setImage(msg.attachments.map(a=>a.url)[0])
    } // Если в сообщение есть вложение - добавить его в эмбед
    
    // Отправляем сообщение вебхуком
    webhook.send({
        embeds: [emb],
        username: `${client.guilds.cache.get(config.guild).name} / #${msg.channel.name}`,
        avatarURL: `${client.guilds.cache.get(config.guild).iconURL()}`
    })
})

client.login(config.token);