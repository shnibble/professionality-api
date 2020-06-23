const JWT = require('../util/jwt')

const get = (req, res, connection) => {

    const discord_user_id = req.query.discord_user_id || null

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
        WHERE e.start >= NOW() ORDER BY e.start
        `
        [discord_user_id], (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

const add = (req, res, connection) => {

    // validate parameters
    const { jwt, title, start } = req.body
    if (typeof jwt === 'undefined' || typeof title === 'undefined', typeof start === 'undefined') {
        res.status(400).send('Bad request')
    } else {
        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm officer rank
                if (jwt_data.body.is_officer) {

                    // insert event
                    connection.execute('INSERT INTO `events` (title, start) VALUES (?, ?)', [title, start], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            res.status(200).send('Success')
                        }
                    })
                }
            }
        })
    }
}

const deleteEvent = (req, res, connection) => {

    // validate parameters
    const { jwt, event_id } = req.body
    if (typeof jwt === 'undefined' || typeof event_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {
        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm officer rank
                if (jwt_data.body.is_officer) {

                    // insert event
                    connection.execute('DELETE FROM `events` WHERE id = ?', [event_id], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            res.status(200).send('Success')
                        }
                    })
                }
            }
        })
    }
}

module.exports = {
    get,
    add,
    deleteEvent
}