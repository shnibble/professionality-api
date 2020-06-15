const Discord = require('discord.js')
const moment = require('moment')
const connection = require('../db/connect')
const token = process.env.DISCORD_BOT_TOKEN
const server_id = process.env.DISCORD_SERVER_ID
const member_role_id = process.env.DISCORD_MEMBER_ROLE_ID
const officer_role_id = process.env.DISCORD_OFFICER_ROLE_ID
const officer_channel_id = process.env.DISCORD_OFFICER_CHANNEL_ID

class Bot {
    constructor(connection) {
        this.connection = connection
        this.#login()

        // the bot's message prefix when typing into the discord server chat
        this.PREFIX = 'pb!'
    }

    #login = () => {
        console.log('Professionality Discord bot is attempting to login...')
        this.bot = new Discord.Client()

        this.bot.login(token)
            .then(() => {
                console.log('Professionality Discord bot has successfully logged in!')
                this.#messages()
                this.#listeners()
            })
            .catch((err) => {
                console.log('Professionality Discord bot failed to login!')
                console.error(err)

                // exit the node instance due to failed bot login
                // this is because many features of the API rely on the bot being active
                // no bot = no API
                process.exit()
            })

        this.bot.on('ready', () => {
            console.log('Professionality Discord bot is ready!')
        })
    }

    #listeners = () => {
        console.log('Professionality Discord bot is initiating listeners.')

        // guild member update event listener
        this.bot.on('guildMemberUpdate', member => {
            const discord_user_id = member.user.id

            const is_member = this.checkIfUserIsMember(discord_user_id)
            const is_officer = this.checkIfUserIsOfficer(discord_user_id)
            const nickname = this.getUserNickname(discord_user_id)

            connection.execute('UPDATE `users` SET `member` = ?, `officer` = ?, `nickname` = ? WHERE `discord_user_id` = ?', [is_member, is_officer, nickname, discord_user_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {
                    console.log(`User ${discord_user_id} (${nickname}) updated.`)
                }
            })
            
        })

        // guild member left server event listener
        this.bot.on('guildMemberRemove', member => {
            const discord_user_id = member.user.id
            const discord_username = member.user.username
            const discord_discriminator = member.user.discriminator
            
            connection.execute('DELETE FROM `users` WHERE `discord_user_id` = ?', [discord_user_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // report leave in server log
                    console.log(`User ${discord_user_id} (${discord_username}#${discord_discriminator}) left the Discord server and has been deleted from the database.`)

                    // report leave in discord officer channel
                    this.bot.channels.cache.get(officer_channel_id).send(`User ${discord_user_id} (${discord_username}#${discord_discriminator}) left the Discord server.`)
                }
            })
        })


    }

    #messages = () => {
        console.log('Professionality Discord bot is initiating message commands.')
        const PREFIX = this.PREFIX

        // bot message commands
        this.bot.on('message', message => {

            // check message for bot's prefix    
            const prefix = message.content.substring(0, PREFIX.length)
            if (prefix === PREFIX) {

                // split arguments
                let args = message.content.substring(PREFIX.length).split(' ')

                switch(args[0]) {

                    // ping bot
                    case 'ping':
                    case 'Ping':
                        message.reply('Professionality bot is online and working!')
                        break

                    // display calendar
                    case 'events':
                    case 'Events':
                    case 'calendar':
                    case 'Calendar':
                        this.getNextThreeEvents(message)
                        break

                    default:
                        message.reply('Unrecognized command :slight_frown:')
                        break
                }

                // delete command message
                message.delete()
            }
        })

    }

    // pulls the next three future events from db and displays them in an embeded reply to user
    getNextThreeEvents = (message) => {
        this.connection.query('SELECT * FROM `events` WHERE `start` > NOW() ORDER BY `start` LIMIT 3', (err, results, fields) => {

            if (err) {
                console.error(err)
                message.reply('Sorry! Something went wrong and I couldn\'t find any events.')
            } else {

                if (results.length === 0) {
                    message.reply('There are no future events on the calendar right now.')
                } else {
                    const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')

                    results.forEach(event => {
                        const date = moment(event.start)
                        embed.addField(`${event.title} - ${date.format('dddd MM/DD @ h:mm a')}`, `https://professionality.app/event/${event.id}`)
                    })
                            
                    message.reply('Here are the next three events on the calendar:')
                    message.channel.send(embed)
                }
            }
        })
    }

    // check if user exists on the Professionality Discord server
    checkIfUserExists = (user_id) => {
        const guild = this.bot.guilds.cache.get(server_id)
    
        const member = guild.member(user_id)
        if (member) {
            return true
        } else {
            return false
        }
    }
    
    // check if a user has the @member role
    checkIfUserIsMember = (user_id) => {
        const guild = this.bot.guilds.cache.get(server_id)

        const member = guild.member(user_id)
        if (member) {
            if (member._roles.indexOf(member_role_id) > -1) {
                return true
            }
        }
        return false
    }

    // check if a user has the @officer role
    checkIfUserIsOfficer = (user_id) => {
        const guild = this.bot.guilds.cache.get(server_id)

        const member = guild.member(user_id)
        if (member) {
            if (member._roles.indexOf(officer_role_id) > -1) {
                return true
            }
        }
        return false
    }

    // get discord member nickname
    getUserNickname = (user_id) => {
        const guild = this.bot.guilds.cache.get(server_id)

        const member = guild.member(user_id)
        if (member) {
            let nickname = member.nickname
            if (nickname === null) {
                nickname = member.user.username
            }
            return nickname
        }
        return false
    }
}

module.exports = Bot