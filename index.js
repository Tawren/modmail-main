const discord = require("discord.js");
const client = new discord.Client()
const {
    token,
    prefix,
    ServerID
} = require("./config.json")

client.on("ready", () => {
    console.log("Lancé")


    client.user.setActivity("Watching My Dm's :D")
})

client.on("channelDelete", (channel) => {
    if (channel.parentID == channel.guild.channels.cache.find((x) => x.name == "835063339037360148").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if (!person) return;

        let yembed = new discord.MessageEmbed()
            .setAuthor("Ticket Supprimé", client.user.displayAvatarURL())
            .setColor('RED')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription("Votre ticket a été supprimé par un modérateur. Si vous avez encore besoin d'aide, envoyez un message ci-dessous.")
        return person.send(yembed)

    }


})


client.on("message", async message => {
    if (message.author.bot) return;

    let args = message.content.slice(prefix.length).split(' ');
    let command = args.shift().toLowerCase();


    if (message.guild) {
        if (command == "setup") {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Vous avez besoin des permission administrateur pour config le système.")
            }

            if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Le Bot a besoin des permission administrateur afin d'éffectuer cette commande.")
            }


            let role = message.guild.roles.cache.find((x) => x.name == "SUPPORTER")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")

            if (!role) {
                role = await message.guild.roles.create({
                    data: {
                        name: "SUPPORTER",
                        color: "GREEN"
                    },
                    reason: "Rôle requis pour la config."
                })
            }

            await message.guild.channels.create("MODMAIL", {
                type: "category",
                topic: "All the mail will be here",
                permissionOverwrites: [{
                        id: role.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })


            return message.channel.send("Setup is Completed :D")

        } else if (command == "close") {


            if (message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "MODMAIL").id) {

                const person = message.guild.members.cache.get(message.channel.name)

                if (!person) {
                    return message.channel.send("Je ne parviens pas à fermer le ticket. Cette erreur arrive car le nom du ticket est probablement modifié.")
                }

                await message.channel.delete()

                let yembed = new discord.MessageEmbed()
                    .setAuthor("TICKET CLOSED", client.user.displayAvatarURL())
                    .setColor("RED")
                    .setThumbnail(client.user.displayAvatarURL())
                    .setFooter("Ticket fermé par " + message.author.username)
                if (args[0]) yembed.setDescription(args.join(" "))

                return person.send(yembed)

            }
        } else if (command == "open") {
            const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")

            if (!category) {
                return message.channel.send("Moderation system is not setuped in this server, use " + prefix + "setup")
            }

            if (!message.member.roles.cache.find((x) => x.name == "SUPPORTER")) {
                return message.channel.send("You need supporter role to use this command")
            }

            if (isNaN(args[0]) || !args.length) {
                return message.channel.send("Please Give the ID of the person")
            }

            const target = message.guild.members.cache.find((x) => x.id === args[0])

            if (!target) {
                return message.channel.send("Unable to find this person.")
            }


            const channel = await message.guild.channels.create(target.id, {
                type: "text",
                parent: category.id,
                topic: "Ticket ouvert par **" + message.author.username + "** prendre contact avec " + message.author.tag
            })

            let nembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", target.user.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("BLUE")
                .setThumbnail(target.user.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)
                .addField("Nom", target.user.username)
                .addField("Date de création du compte", target.user.createdAt)
                .addField("Direct Contact", "Yes");

            channel.send(nembed)

            let uembed = new discord.MessageEmbed()
                .setAuthor("DIRECT TICKET OUVERT")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("Vous avez été contacté par le support de **" + message.guild.name + "**, Merci d'attentre qu'il vous envoie un autre message !");


            target.send(uembed);

            let newEmbed = new discord.MessageEmbed()
                .setDescription("Ouverture le ticket: <#" + channel + ">")
                .setColor("GREEN");

            return message.channel.send(newEmbed);
        } else if (command == "help") {
            let embed = new discord.MessageEmbed()
                .setAuthor('MODMAIL BOT', client.user.displayAvatarURL())
                .setColor("GREEN")

                .setDescription("Bot fondé par Tawren et Zey.")
                .addField(prefix + "setup", "Setup the modmail system(This is not for multiple server.)", true)

                .addField(prefix + "open", 'Ouvre un ticket avec un identifiant.', true)
                .setThumbnail(client.user.displayAvatarURL())
                .addField(prefix + "close", "Ferme le ticket où a été utilisé cette commande", true);

            return message.channel.send(embed)

        }
    }




    if (message.channel.parentID) {

        const category = message.guild.channels.cache.find((x) => x.name == "MODMAIL")
        if(!category) return;

        if (message.channel.parentID == category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if (!member) return message.channel.send('Unable To Send Message')

            let lembed = new discord.MessageEmbed()
                .setColor("GREEN")
                .setFooter(message.author.username, message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)

            return member.send(lembed)
        }


    }




    if (!message.guild) {
        const guild = await client.guilds.cache.get(ServerID) || await client.guilds.fetch(ServerID).catch(m => {})
        if (!guild) return;
        const category = guild.channels.cache.find((x) => x.name == "MODMAIL")
        if (!category) return;
        const main = guild.channels.cache.find((x) => x.name == message.author.id)


        if (!main) {
            let mx = await guild.channels.create(message.author.id, {
                type: "text",
                parent: category.id,
                topic: "This mail is created for helping  **" + message.author.tag + " **"
            })

            let sembed = new discord.MessageEmbed()
                .setAuthor("MAIN OPENED")
                .setColor("GREEN")
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("La conversation a démarré, vous allez bientot être contacté par un membre du Support !")

            message.author.send(sembed)


            let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setColor("BLUE")
                .setThumbnail(message.author.displayAvatarURL({
                    dynamic: true
                }))
                .setDescription(message.content)
                .addField("Nom", message.author.username)
                .addField("Date de création du compte", message.author.createdAt)
                .addField("Direct Contact", "No")


            return mx.send(eembed)
        }

        let xembed = new discord.MessageEmbed()
            .setColor("YELLOW")
            .setFooter(message.author.tag, message.author.displayAvatarURL({
                dynamic: true
            }))
            .setDescription(message.content)


        main.send(xembed)

    }




})


client.login(token)
