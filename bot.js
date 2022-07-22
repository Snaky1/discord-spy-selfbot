// Импортируем всё что нам нужно
const { Client, WebhookClient, MessageEmbed, Message } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });
const config = require('./config.json')

// Создаём вебхук
const webhook = new WebhookClient({ url: config.logwebhook }, { allowedMentions: { parse: [], users: [], roles: [] } });

// Ловим ошибки чтобы бот не падал
process.on('unhandledRejection', error => {
    console.error('Фатальная ошибка:', error);
});

client.on('error', error => {
    console.error(error)
})

// Заходим в аккаунт
client.on('ready', async () => {
    console.log(`Вы зашли в аккаунт ${client.user.username}#${client.user.discriminator}(${client.user.id})`)
})

client.on('messageCreate', async (msg) => {

    if (msg.guildId !== config.guild) return; // Не выполняем код ниже, если айди сервера с которого пришло сообщение не равен айди указанному в конфиге
    if (config.nobots && msg.authorbot) return; // Если config.nobots равен true - игнорировать ботов
    if (config.nowebhooks && msg.weebhookId) return; // Если config.nowebhooks равен true - игнорировать вебхуки
    // зан иди нахуй

    client.on('messageUpdate', async (oldMessage, newMessage) => { // мне лень дальше писать комменты
        if(msg.author.bot || msg.webhookId) return; // пришлось извините
    
        if (oldMessage.content === newMessage.content) return;
    
            const original = oldMessage.content.slice(0, 1950) + (oldMessage.content.length > 1950 ? '...' : '')
            const edited = newMessage.content.slice(0, 1950) + (newMessage.content.length > 1950 ? '...' : '')
    
            var embed = new MessageEmbed()
            .setAuthor({ iconURL: msg.author.avatarURL(), name: `${msg.author.tag} (${msg.author.id})`})
            .setTimestamp()
            .setColor('GREEN')
            .addFields(
                {name: 'Старое:',value: original},
                {name: 'Новое:', value: edited});
                await webhook.send({
                    content: `Юзер (${msg.author.tag} (${msg.author.id})) отредактировал сообщение`,
                    embeds: [embed],
                    username: `${client.guilds.cache.get(config.guild).name} / #${msg.channel.name}`,
                    avatarURL: `${(client.guilds.cache.get(config.guild).iconURL() !== null) ? client.guilds.cache.get(config.guild).iconURL() : "https://www.kindpng.com/picc/m/22-223863_no-avatar-png-circle-transparent-png.png"}`
                })
    })

    // Создаём эмбед
    let emb = new MessageEmbed()
        .setAuthor({ iconURL: msg.author.avatarURL(), name: `${msg.author.tag} (${msg.author.id})`})
        .setDescription(msg.content)
        .setColor('#534be4')
        .setFooter({ text: `Selfbot by @rxiteel || ovinu#0135` })

     
        let embedphoto = new MessageEmbed()
        .setAuthor({
            iconURL: msg.author.avatarURL(),
            name: msg.author.tag,
            inline: true
        })
        .setDescription("Все остальные картинки из сообщения")
        .setColor('#534be4')
        .setFooter({text: `Selfbot by @rxiteel || ovinu#0135`})

        if (msg.attachments) {
            // emb.setImage(msg.attachments.map(a => a.url)[0])
            if (msg.attachments.size > 1) {
                let attachments_string = ""
                let attachments_f_desc = ""
                for (let i = 1; i <= msg.attachments.size; i++) {
                    try {
                        // await webhook.send({content: "test", files: [msg.attachments.map(m => m.url)][i]})
                        attachments_string += `${(msg.attachments.map(m => m.url)[i] !== undefined) ? msg.attachments.map(m => m.url)[i] + '\n' : ''}`
                    } catch (err) {
                        console.log(err)
                    }
                }
                if (attachments_string !== '') {
                    if (attachments_string.split('\n').length === 1) {
                        embedphoto.setImage(attachments_string)
                    } else {
                        let index = attachments_string.split('\n').shift()
                        emb.setImage(index)
                        for (let attach of attachments_string.split('\n')) {
                            attachments_f_desc += `${attach}\n`
                        }
                        embedphoto.setDescription(attachments_f_desc)
                    }
    
                } else {
                }
            } else embedphoto.setImage(msg.attachments.map(a => a.url)[0])
        }
    // Если в сообщении есть вложение - добавить его в эмбед

    if (msg.embeds.length > 0 && msg.author.bot) {// Если в сообщении есть эмбеды
        for (let i = 0; i <= msg.embeds.length; i++) {
            const embed = msg.embeds[i]
                await webhook.send({
                    content: `Бот (${msg.author.tag} (${msg.author.id})) отправил сообщение с эмбедом\n${msg.content}`,
                    embeds: [embed],
                    username: `${client.guilds.cache.get(config.guild).name} / #${msg.channel.name}`,
                    avatarURL: `${(client.guilds.cache.get(config.guild).iconURL() !== null) ? client.guilds.cache.get(config.guild).iconURL() : "https://www.kindpng.com/picc/m/22-223863_no-avatar-png-circle-transparent-png.png"}`
            })
        }
    }

    if (msg.reference) { // Если сообщение реплай(или закрепление, но на это забейте оно не работает)
        const repliedTo = await msg.fetchReference()
        emb.addField(`> В ответ пользователю ${repliedTo.author.username}#${repliedTo.author.discriminator}`, `\`${repliedTo}\``)
    }


    // Отправляем сообщение вебхуком
    webhook.send({
        embeds: [emb, embedphoto],
        username: `${client.guilds.cache.get(config.guild).name} / #${msg.channel.name}`,
        avatarURL: `${(client.guilds.cache.get(config.guild).iconURL() !== null) ? client.guilds.cache.get(config.guild).iconURL() : "https://www.kindpng.com/picc/m/22-223863_no-avatar-png-circle-transparent-png.png"}`
    })
})



client.login(config.token);
