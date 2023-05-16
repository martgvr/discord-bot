import * as dotenv from 'dotenv'

import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { logger } from './utils/logger.js'
import { Client, GatewayIntentBits, Partials, ActivityType, PresenceUpdateStatus } from 'discord.js'
import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice'

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

client.on('ready', () => {
        logger.info(`Logged in as ${client.user.tag}!`)

        const guildID = '1106467779885944952'
        const guild = client.guilds.cache.get(guildID)
        const commands = guild ? guild.commands : client.application.commands

        commands.create({
            name: 'ping',
            description: 'Reply with pong'
        })
    })

client.on('messageCreate', async (message) => {
        const messageContent = message.content.split(" ")

        if (message.content === '!voice') { 
            let channels = message.guild.channels.cache

            channels.forEach(channel => {
                const voiceChannel = message.guild.channels.cache.get(channel.id)

                if (voiceChannel.type === 2) {
                    message.channel.send("Entrando al canal de voz")

                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                        selfMute: false,
                        selfDeaf: false
                    })

                    connection.on(VoiceConnectionStatus.Ready, () => {
                        logger.info('Connection is in the Ready state!');
                    })
                }
            })
        }

        if (message.content === '!leave') {
            const connection = getVoiceConnection(message.guild.id)

            if(!connection) {
                message.channel.send("Error: No me encuentro en un canal de voz")
            } else {
                message.channel.send("Saliendo del canal")
                connection.destroy()
            }
        }

        if (message.content === '!test') {
            const connection = getVoiceConnection(message.guild.id)

            if(!connection) {
                message.channel.send("Error: No me encuentro en un canal de voz")
            } else {
                try {
                    message.channel.send("Reproduciendo sonido de prueba")
                    const player = createAudioPlayer()

                    const resource = createAudioResource(dirname(fileURLToPath(import.meta.url)) + '/test.mp3')
                    
                    connection.subscribe(player)
                    player.play(resource)   

                    player.on('error', error => logger.error(error))
                    player.on(AudioPlayerStatus.Playing, () => logger.log('Audio player is in the Playing state!'))

                } catch (error) {
                    logger.log(error)
                }
            }
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