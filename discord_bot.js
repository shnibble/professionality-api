const Discord = require('discord.js')

// create bot
const bot = new Discord.Client()

// token
const token = process.env.DISCORD_BOT_TOKEN

// console log when bot is ready
bot.on('ready', () => {
    console.log('Professionality bot is online!')
})

// set bot prefix
const PREFIX = 'pb!'

// bot message commands
bot.on('message', message => {

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

// bot login
bot.login(token)
