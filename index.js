import * as dotenv from 'dotenv'
import { logger } from './utils/logger.js'
import { Client, GatewayIntentBits, Partials, ActivityType, PresenceUpdateStatus } from 'discord.js'

const { User, Channel, GuildMember, Message, Reaction } = Partials
const { Guilds, GuildMembers, GuildMessages, MessageContent, GuildVoiceStates } = GatewayIntentBits

dotenv.config()

const client = new Client({
    partials: [User, Channel, GuildMember, Message, Reaction],
    intents: [Guilds, GuildMembers, GuildMessages, MessageContent, GuildVoiceStates],
    allowedMentions: { parse: ["roles", "users"], repliedUser: false },
    presence: {
        activities: [{
            type: ActivityType[process.env.DISCORD_STATUS_TYPE],
            name: process.env.DISCORD_STATUS
        }],
        status: PresenceUpdateStatus.DoNotDisturb
    }
})

client
    .on('ready', () => {
        logger.info(`Logged in as ${client.user.tag}!`)

        const guildID = '1106467779885944952'
        const guild = client.guilds.cache.get(guildID)
        const commands = guild ? guild.commands : client.application.commands

        commands.create({
            name: 'ping',
            description: 'Reply with pong'
        })
    })

    .on('messageCreate', (message) => {
        if (message.content === 'hello') {
            message.channel.send(`Hey ${message.author.username}! how u doing bro?`)
        }
    })

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName, options } = interaction

    
    if (commandName == 'ping') {
        interaction.reply({
            content: 'pong',
            ephemeral: true
        })
    }
})

client.login(process.env.DISCORD_TOKEN).catch((error) => logger.error(error))