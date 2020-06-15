const DiscordOAuth2 = require('discord-oauth2')
const oauth = new DiscordOAuth2()
const JWT = require('../util/jwt')

const login = (req, res, connection, bot) => {

    // validate parameters
    const code = req.body.code
    if (typeof code === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // exchange code for user's access token via oauth2
        oauth.tokenRequest({
            clientId: process.env.DISCORD_APP_CLIENT_ID,
            clientSecret: process.env.DISCORD_APP_CLIENT_SECRET,
            grantType: 'authorization_code',
            redirectUri: 'https://professionality.app/login',
            code: code,
            scope: 'identify'
        })
        .then(response => {

            // exchange access token for user via oauth2
            const access_token = response.access_token
            oauth.getUser(access_token)
            .then(discordUser => {

                // check if user exists in db
                const discord_user_id = discordUser.id
                connection.execute('SELECT `discord_user_id`, `nickname`, `member`, `officer` FROM `users` WHERE `discord_user_id` = ?', [discord_user_id], (err, results, fields) => {

                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {

                        // if new user then use bot to retrieve server-specific information
                        if (results.length === 0) {
                            
                            if (bot.checkIfUserExists(discord_user_id)) {

                                // user exists on the discord server
                                // check if they have the @member role
                                const is_member = bot.checkIfUserIsMember(discord_user_id)

                                // check if they have the @officer role
                                const is_officer = bot.checkIfUserIsOfficer(discord_user_id)

                                // get user nickname
                                const nickname = bot.getUserNickname(discord_user_id)

                                // insert new user into db
                                connection.execute('INSERT INTO `users` (`discord_user_id`, `nickname`, `member`, `officer`) VALUES (?, ?, ?, ?)', [discord_user_id, nickname, is_member, is_officer], (err, results, fields) => {
                                    if (err) {
                                        console.error(err)
                                        res.status(500).send('Server error')
                                    } else {

                                        // declare JWT variables
                                        const claims = {
                                            discord_user_id,
                                            member: is_member,
                                            officer: is_officer,
                                            nickname
                                        }

                                        // create JWT
                                        const jwt = JWT.create(claims)

                                        // return JWT to client
                                        res.status(200).send(jwt)
                                    }
                                })
                            } else {

                                // user does not exist on the discord server
                                // return 403: forbidden
                                res.status(403).send('Forbidden')
                            }
                        } else {

                            // user already exists in the db
                            // declare JWT variables
                            const claims = {
                                discord_user_id,
                                member: results[0].member,
                                officer: results[0].officer,
                                nickname: results[0].nickname
                            }

                            // create JWT
                            const jwt = JWT.create(claims)

                            // return JWT to client
                            res.status(200).send(jwt)
                        }
                    }
                })
            })
            .catch(err => {
                console.error(err)
                res.status(500).send('Server error')
            })
        })
        .catch(err => {
            console.error(err)
            res.status(400).send('Bad request')
        })
    }
}

module.exports = {
    login
}
