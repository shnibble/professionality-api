const JWT = require('../util/jwt')

const get = (req, res, connection) => {
    const discord_user_id = req.query.discord_user_id || null
    const limit = req.query.limit || 1000
    const offset = req.query.offset || 0

    connection.execute( 
        `
        SELECT e.*, a.signed_up, a.called_out, a.character_id, a.role_id, a.tentative, a.late, a.note,
		(SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL) 
            AS total_sign_ups, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND called_out IS NOT NULL) 
            AS total_call_outs, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL 
            AND role_id = 1) 
            AS total_casters, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL AND role_id = 2) 
            AS total_fighters, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL 
            AND role_id = 3) 
            AS total_healers, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL 
            AND role_id = 4) 
            AS total_tanks 
        FROM events e 
        LEFT JOIN attendance a
        	ON e.id =  a.event_id AND a.discord_user_id = ?
        WHERE e.start >= NOW() ORDER BY e.start LIMIT ? OFFSET ?
        `,
        [discord_user_id, limit, offset], (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

const getPast = (req, res, connection) => {
    const limit = req.query.limit || 1000
    const offset = req.query.offset || 0

    connection.execute( 
        `
        SELECT e.*,
		(SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL) 
            AS total_sign_ups, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND called_out IS NOT NULL) 
            AS total_call_outs, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL 
            AND role_id = 1) 
            AS total_casters, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL AND role_id = 2) 
            AS total_fighters, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL 
            AND role_id = 3) 
            AS total_healers, 
        (SELECT COUNT(*) FROM attendance 
            WHERE event_id = e.id 
            AND discord_user_id IN (SELECT discord_user_id FROM users) 
            AND signed_up IS NOT NULL 
            AND role_id = 4) 
            AS total_tanks 
        FROM events e WHERE e.start < NOW() ORDER BY e.start DESC LIMIT ? OFFSET ?
        `,
        [limit, offset], (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

const add = (req, res, connection, bot) => {

    // validate parameters
    const { jwt, title, start, primary } = req.body
    let { raid_leader, soft_res } = req.body
    if (typeof jwt === 'undefined' || typeof title === 'undefined' || typeof start === 'undefined' || typeof primary === 'undefined' || typeof raid_leader === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        if (raid_leader === '' || raid_leader === 'null' || raid_leader === 'NULL') {
            raid_leader = null
        }

        if (soft_res === '' || soft_res === 'null' || soft_res === 'NULL') {
            soft_res = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (jwt_data.body.is_officer) {

                // insert event
                connection.execute('INSERT INTO `events` (title, start, primary_raid, raid_leader, soft_res) VALUES (?, ?, ?, ?, ?)', [title, start, primary, raid_leader, soft_res], (err, result, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
                        const event = {
                            id: result.insertId,
                            title,
                            start,
                            soft_res
                        }
                        bot.postNewCalendarEvent(event)
                        res.status(200).send('Success')
                    }
                })
            }
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const update = (req, res, connection, bot) => {

    // validate parameters
    const { jwt, event_id, title, start, primary } = req.body
    let { raid_leader, soft_res } = req.body
    if (typeof jwt === 'undefined' || typeof event_id === 'undefined' || typeof title === 'undefined' || typeof start === 'undefined' || typeof primary === 'undefined' || typeof raid_leader === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        if (raid_leader === '' || raid_leader === 'null' || raid_leader === 'NULL') {
            raid_leader = null
        }

        if (soft_res === '' || soft_res === 'null' || soft_res === 'NULL') {
            soft_res = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (jwt_data.body.is_officer) {

                // update event
                connection.execute('UPDATE `events` SET title = ?, start = ?, primary_raid = ?, raid_leader = ?, soft_res = ? WHERE id = ?', [title, start, primary, raid_leader, soft_res, event_id], (err, result, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
                        bot.updateCalendarEvent2(event_id)
                        res.status(200).send('Success')
                    }
                })
            }
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const deleteEvent = (req, res, connection, bot) => {

    // validate parameters
    const { jwt, event_id } = req.body
    if (typeof jwt === 'undefined' || typeof event_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {
        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (jwt_data.body.is_officer) {

                // confirm event exists
                connection.execute('SELECT * FROM `events` WHERE id = ?', [event_id], (err, result, fields) => {
                    if (err) {
                        res.status(400).send('Bad request')
                    } else {
                        const message_id = result[0].message_id
                        
                        // delete event
                        connection.execute('DELETE FROM `events` WHERE id = ?', [event_id], (err, results, fields) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send('Server error')
                            } else {

                                // if message_id was found then send directive to bot to delete the event message
                                if (message_id) {
                                    bot.deleteCalendarEventMessage(message_id)
                                }                                    
                                res.status(200).send('Success')
                            }
                        })
                    }
                })
            }
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

module.exports = {
    get,
    getPast,
    add,
    update,
    deleteEvent
}