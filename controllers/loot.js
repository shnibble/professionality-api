const JWT = require('../util/jwt')

const get = (req, res, connection) => {
    const instance = req.query.instance
    if (typeof instance === 'undefined') {
        res.status(400).send('Bad request')
    } else {
        connection.execute('SELECT * FROM loot WHERE instance = ? ORDER BY name', [instance], (err, results, fields) => {
            if (err) {
                res.status(500).send('Server error')
            } else if (results.length === 0) {
                res.status(400).send('Bad request')
            } else {
                let final_results = []
                let pending = results.length

                results.map(row => {
                    connection.execute(
                    `
                    SELECT lh.*, u.nickname 
                    FROM loot_history lh
                        INNER JOIN users u
                        ON lh.discord_user_id = u.discord_user_id
                    WHERE lh.loot_id = ? ORDER BY lh.timestamp
                    `, [row.id], (err, result, fields) => {
                        row.history = result
                        final_results.push(row)

                        if (0 === --pending) {
                            res.status(200).json(final_results)
                        }
                    })
                })
            }
        })
    }
}

const update = (req, res, connection) => {
    const { jwt, loot_id, priority } = req.body
    let { comments } = req.body

    // validate parameters
    if (typeof jwt === 'undefined' || typeof loot_id === 'undefined' || typeof priority === 'undefined' || typeof comments === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // set comments to null if empty string
        if (comments === '') {
            comments = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // get loot
                connection.execute('SELECT * FROM loot WHERE id = ?', [loot_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm officer rank
                        if (!jwt_data.body.is_officer) {
                            res.status(403).send('Forbidden')
                        } else {

                            connection.execute('INSERT INTO loot_history (loot_id, discord_user_id, previous_priority, new_priority, previous_comments, new_comments) VALUES (?, ?, ?, ?, ?, ?)', [loot_id, jwt_data.body.discord_user_id, results[0].priority, priority, results[0].comments, comments], (err, results, fields) => {
                                if (err) {
                                    res.status(500).send('Server error')
                                } else {
                                    connection.execute('UPDATE loot SET priority = ?, comments = ? WHERE id = ?', [priority, comments, loot_id], (err, results, fields) => {
                                        if (err) {
                                            res.status(500).send('Server error')
                                        } else {
                                            res.status(200).send('Success')
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    }
}

module.exports = {
    get,
    update
}
