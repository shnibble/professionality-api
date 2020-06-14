const Discord = require('discord.js')
const token = process.env.DISCORD_BOT_TOKEN
const server_id = process.env.DISCORD_SERVER_ID
const member_role_id = process.env.DISCORD_MEMBER_ROLE_ID

class Bot {
    constructor() {
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
                    case 'calendar':
                    case 'Events':
                    case 'Calendar':
                        const embed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .addFields(
                                {
                                    name: 'Molten Core - 06/11/2020 @ 8:00 PM',
                                    value: 'https://professionality.app/event/1'
                                },
                                {
                                    name: 'Onyxia - 06/12/2020 @ 8:00 PM',
                                    value: 'https://professionality.app/event/2'
                                },
                                {
                                    name: 'Zul\'Gurub - 06/12/2020 @ 9:00 PM',
                                    value: 'https://professionality.app/event/3'
                                }
                            )            
                        message.reply('Here are the next few events on the calendar:')
                        message.channel.send(embed)
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

    // check if user exists on the Professionality Discord server
    checkIfUserExists = (user_id) => {
        console.log(`Checking if guild member exists with UID: ${user_id}.`)
        const guild = this.bot.guilds.cache.get(server_id)
    
        const m = guild.member(user_id)
        if (m) {
            console.log('That user exists in this server!')
            this.checkIfUserIsMember(m)
        } else {
            console.log('That user doesn\'t exist on this server!')
        }
    }
    
    // check if a user has the @member role
    checkIfUserIsMember = (member) => {
        if (member._roles.indexOf(member_role_id) > -1) {
            console.log('That user is also a member!')
        } else {
            console.log('That user is not a member!')
        }
    }
}

module.exports = Bot
