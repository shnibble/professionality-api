const Discord = require('discord.js')
const moment = require('moment')
const connection = require('../db/connect')
const token = process.env.DISCORD_BOT_TOKEN
const server_id = process.env.DISCORD_SERVER_ID
const member_role_id = process.env.DISCORD_MEMBER_ROLE_ID
const officer_role_id = process.env.DISCORD_OFFICER_ROLE_ID
const guild_banker_role_id = process.env.DISCORD_GUILD_BANKER_ROLE_ID
const officer_channel_id = process.env.DISCORD_OFFICER_CHANNEL_ID
const events_channel_id = process.env.DISCORD_EVENTS_CHANNEL_ID
require('moment-timezone')

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

            console.log('Incoming guildMemberUpdate for user id:', discord_user_id)

            const is_member = this.checkIfUserIsMember(discord_user_id)
            const is_officer = this.checkIfUserIsOfficer(discord_user_id)
            const nickname = this.getUserNickname(discord_user_id) || member.user.username

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
                        embed.addField(`${event.title} - ${date.tz('America/New_York').format('dddd MM/DD @ h:mm a')}`, `https://professionality.app/event/${event.id}`)
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

    // post new event
    postNewCalendarEvent = (event) => {
        const date = moment(event.start)
        const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${event.title} - ${date.tz('America/New_York').format('dddd MM/DD @ h:mm a')} (server time)`)
        .setDescription(`Sign up or call out here: https://professionality.app/event/${event.id}`)
        .addField('Sign Ups:', '0', true)
        .addField('Call Outs:', '0', true)

        this.bot.channels.cache.get(events_channel_id).send(embed)
        .then(message => {
            const message_id = message.id
            this.connection.execute('UPDATE `events` SET message_id = ? WHERE id = ?', [message_id, event.id], (err, result, fields) => {
                if (err) {
                    console.error(err)
                }
            })
        })
    }

    // delete event
    deleteCalendarEventMessage = (message_id) => {
        this.bot.channels.cache.get(events_channel_id).messages.fetch(message_id)
        .then(message => {
            message.delete()
        })
        .catch(err => {
            console.error(err)
        })
    }

    updateCalendarEvent = (event_id) => {
        this.connection.execute(`SELECT e.id, e.title, e.start, e.message_id, (SELECT COUNT(*) FROM attendance WHERE event_id = e.id AND signed_up IS NOT NULL AND discord_user_id IN (SELECT discord_user_id FROM users)) as total_sign_ups, (SELECT COUNT(*) FROM attendance WHERE event_id = e.id AND called_out IS NOT NULL AND discord_user_id IN (SELECT discord_user_id FROM users)) as total_call_outs FROM events e WHERE e.id = ?`, [event_id], (err, result, fields) => {
            if (err || result.length === 0) {
                console.error('Event not found to update')
            } else {
                const event = result[0]
                const date = moment(event.start)
                const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${event.title} - ${date.tz('America/New_York').format('dddd MM/DD @ h:mm a')} (server time)`)
                .setDescription(`Sign up or call out here: https://professionality.app/event/${event.id}`)
                .addField('Sign Ups:', event.total_sign_ups, true)
                .addField('Call Outs:', event.total_call_outs, true)

                this.bot.channels.cache.get(events_channel_id).messages.fetch(event.message_id)
                .then(message => {
                    message.edit(embed)
                })
                .catch(err => {
                    console.error(err)
                })
            }
        })   
    }

    formatAttendanceField = (characters) => {
        let result = ""
        
        characters.forEach((character, index) => {
            result += character.name
            if (index < characters.length - 1) {
                result += "\n"
            }
        })

        return result
    }

    updateCalendarEvent2 = (event_id) => {
        this.connection.execute(`SELECT e.id, e.title, e.start, e.message_id, (SELECT COUNT(*) FROM attendance WHERE event_id = e.id AND signed_up IS NOT NULL AND discord_user_id IN (SELECT discord_user_id FROM users)) as total_sign_ups, (SELECT COUNT(*) FROM attendance WHERE event_id = e.id AND called_out IS NOT NULL AND discord_user_id IN (SELECT discord_user_id FROM users)) as total_call_outs FROM events e WHERE e.id = ?`, [event_id], (err, result, fields) => {
            if (err || result.length === 0) {
                console.error('Event not found to update')
            } else {

                const event = result[0]

                this.connection.execute(`
                    SELECT a.signed_up, a.called_out, a.role_id, a.tentative, a.late, c.name, c.class_id, u.nickname
                    FROM attendance a
                        LEFT JOIN characters c
                        ON c.id = a.character_id
                        INNER JOIN users u
                        ON u.discord_user_id = a.discord_user_id
                    WHERE a.event_id = ? AND a.discord_user_id IN (SELECT discord_user_id FROM users)
                `, [event_id], (err, results, fields) => {
                    if (err) {
                        console.error('Server error')
                    } else {

                        const attendance = results
                        const date = moment(event.start)
                        const tanks = attendance.filter(att => att.signed_up && att.role_id === 4)
                        const hunters = attendance.filter(att => att.signed_up && att.rolde_id !== 4 && att.class_id === 3)
                        const priests = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 5)
                        const warriors = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 1)
                        const mages = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 8)
                        const paladins = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 2)
                        const rogues = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 4)
                        const warlocks = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 9)
                        const druids = attendance.filter(att => att.signed_up && att.role_id !== 4 && att.class_id === 11)
                        const tentative = attendance.filter(att => att.signed_up && att.tentative)
                        const late = attendance.filter(att => att.signed_up && att.late)

                        const embed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`${event.title} - ${date.tz('America/New_York').format('dddd MM/DD @ h:mm a')} (server time)`)
                        .setDescription(`Sign up or call out here: https://professionality.app/event/${event.id}`)
                        .addField('Tanks', this.formatAttendanceField(tanks), true)
                        .addField('Hunters', this.formatAttendanceField(hunters), true)
                        .addField('Priests', this.formatAttendanceField(priests), true)
                        .addField('Warriors', this.formatAttendanceField(warriors), true)
                        .addField('Mages', this.formatAttendanceField(mages), true)
                        .addField('Paladins', this.formatAttendanceField(paladins), true)
                        .addField('Rogues', this.formatAttendanceField(rogues), true)
                        .addField('Warlocks', this.formatAttendanceField(warlocks), true)
                        .addField('Druids', this.formatAttendanceField(druids), true)
                        .addField('Signed Up | Called Out', `${event.total_sign_ups} | ${event.total_call_outs}`, true)
                        .addField('Tentative', this.formatAttendanceField(tentative), true)
                        .addField('Late', this.formatAttendanceField(late), true)

                        this.bot.channels.cache.get(events_channel_id).messages.fetch(event.message_id)
                        .then(message => {
                            message.edit(embed)
                        })
                        .catch(err => {
                            console.error(err)
                        })
                    }
                })
            }
        })
    }

    // post new bank request
    postNewBankRequest = () => {
        this.bot.channels.cache.get(officer_channel_id).send(`<@&${guild_banker_role_id}> new bank request posted.`)
    }
}

module.exports = Bot
