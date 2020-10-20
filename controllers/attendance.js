const JWT = require('../util/jwt')

const signup = (req, res, connection, bot) => {
    
    // validate parameters
    const { jwt, event_id, character_id, role_id, note } = req.body
    let { tentative, late } = req.body

    // clean up boolean values
    if (tentative === true || tentative === 'true') {
        tentative = true
    } else {
        tentative = false
    }
    if (late === true || late === 'true') {
        late = true
    } else {
        late = false
    }

    if (typeof jwt === 'undefined' || typeof event_id === 'undefined'  || typeof character_id === 'undefined' || typeof role_id === 'undefined' || typeof tentative === 'undefined' || typeof late === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // verify character belongs to user and is enabled
            connection.execute('SELECT * FROM `characters` WHERE id = ? AND discord_user_id = ? AND enabled = TRUE', [character_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {
                    if (results.length !== 1) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm event exists
                        connection.execute('SELECT * FROM `events` WHERE id = ?', [event_id], (err, results, fields) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send('Server error')
                            } else {
                        
                                // if length is zero then the event doesn't exist
                                if (results.length === 0) {
                                    res.status(400).send('Bad request')
                                } else {

                                    // confirm event start date/time is still in the future
                                    const startDate = new Date(results[0].start)
                                    const now = new Date()
                                    if (startDate < now) {
                                        res.status(400).send('Bad request')
                                    } else {

                                        // check if a attendance record exists already
                                        connection.execute('SELECT * FROM `attendance` WHERE event_id = ? AND discord_user_id = ?', [event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                            if (err) {
                                                console.error(err)
                                                res.status(500).send('Server error')
                                            } else {
                                                if (results.length > 0) {

                                                    // update sign up
                                                    connection.execute('UPDATE `attendance` SET signed_up = NOW(), called_out = NULL, character_id = ?, role_id = ?, tentative = ?, late = ?, note = ? WHERE event_id = ? AND discord_user_id = ?', [character_id, role_id, tentative, late, note, event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                                        if (err) {
                                                            console.error(err)
                                                            res.status(500).send('Server error')
                                                        } else {
                                                            res.status(200).send('Success')

                                                            // update discord message via bot
                                                            bot.updateCalendarEvent2(event_id)
                                                        }
                                                    })

                                                } else {

                                                    // insert sign up
                                                    connection.execute('INSERT INTO `attendance` (event_id, discord_user_id, signed_up, called_out, character_id, role_id, tentative, late, note) VALUES (?, ?, NOW(), NULL, ?, ?, ?, ?, ?)', [event_id, jwt_data.body.discord_user_id, character_id, role_id, tentative, late, note], (err, results, fields) => {
                                                        if (err) {
                                                            console.error(err)
                                                            res.status(500).send('Server error')
                                                        } else {
                                                            res.status(200).send('Success')

                                                            // update discord message via bot
                                                            bot.updateCalendarEvent2(event_id)
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        }) 
                    }
                }
            })
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const callout = (req, res, connection, bot) => {
    
    // validate parameters
    const { jwt, event_id } = req.body
    if (typeof jwt === 'undefined' || typeof event_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm event exists
            connection.execute('SELECT * FROM `events` WHERE id = ?', [event_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // if length is zero then the event doesn't exist
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm event start date/time is still in the future
                        const startDate = new Date(results[0].start)
                        const now = new Date()
                        if (startDate < now) {
                            res.status(400).send('Bad request')
                        } else {

                            // check if a attendance record exists already
                            connection.execute('SELECT * FROM `attendance` WHERE event_id = ? AND discord_user_id = ?', [event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                if (err) {
                                    console.error(err)
                                    res.status(500).send('Server error')
                                } else {
                                    if (results.length > 0) {

                                        // update call out
                                        connection.execute('UPDATE `attendance` SET signed_up = NULL, called_out = NOW(), character_id = NULL, role_id = NULL, tentative = FALSE, late = FALSE, note = NULL WHERE event_id = ? AND discord_user_id = ?', [event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                            if (err) {
                                                console.error(err)
                                                res.status(500).send('Server error')
                                            } else {
                                                res.status(200).send('Success')

                                                // update discord message via bot
                                                bot.updateCalendarEvent2(event_id)
                                            }
                                        })

                                    } else {

                                        // insert call out
                                        connection.execute('INSERT INTO `attendance` (event_id, discord_user_id, signed_up, called_out, character_id, role_id, tentative, late, note) VALUES (?, ?, NULL, NOW(), NULL, NULL, FALSE, FALSE, NULL)', [event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                            if (err) {
                                                console.error(err)
                                                res.status(500).send('Server error')
                                            } else {
                                                res.status(200).send('Success')

                                                // update discord message via bot
                                                bot.updateCalendarEvent2(event_id)
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            })
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}


const cancel = (req, res, connection, bot) => {
    
    // validate parameters
    const { jwt, event_id } = req.body
    if (typeof jwt === 'undefined' || typeof event_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm event exists
            connection.execute('SELECT * FROM `events` WHERE id = ?', [event_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // if length is zero then the event doesn't exist
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm event start date/time is still in the future
                        const startDate = new Date(results[0].start)
                        const now = new Date()
                        if (startDate < now) {
                            res.status(400).send('Bad request')
                        } else {

                            // check if a attendance record exists
                            connection.execute('SELECT * FROM `attendance` WHERE event_id = ? AND discord_user_id = ?', [event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                if (err) {
                                    console.error(err)
                                    res.status(500).send('Server error')
                                } else {
                                    
                                    // delete attendance record
                                    connection.execute('DELETE FROM `attendance` WHERE event_id = ? AND discord_user_id = ?', [event_id, jwt_data.body.discord_user_id], (err, results, fields) => {
                                        if (err) {
                                            console.error(err)
                                            res.status(500).send('Server error')
                                        } else {
                                            res.status(200).send('Success')

                                            // update discord message via bot
                                            bot.updateCalendarEvent2(event_id)
                                        }
                                    })
                                }
                            })
                        }
                    }
                }
            })
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

module.exports = {
    signup,
    callout,
    cancel
}