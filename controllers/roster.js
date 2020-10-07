const getPugs = (req, res, connection) => {
    connection.query('SELECT * FROM `users` WHERE `member` = FALSE AND `officer` = FALSE ORDER BY `nickname`', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            let final_results = []
            let pending = results.length
            
            results.map(row => {
                connection.execute('SELECT * FROM `characters` WHERE `discord_user_id` = ? AND `enabled` = TRUE', [row.discord_user_id], (err, result, fields) => {
                    row.characters = result
                    final_results.push(row)

                    if (0 === --pending) {
                        res.status(200).json(final_results)
                    }
                })
            })
        }
    })
}

const getMembers = (req, res, connection) => {
    connection.query('SELECT id FROM events WHERE primary_raid = TRUE ORDER BY start LIMIT 5', (err, results, fieldS) => {
        if (err) {
            res.status(500).send('Server error')
        } else {
            const primary_raids = results.join()
            
            connection.execute('SELECT u.*, (SELECT COUNT(*) FROM attendance WHERE discord_user_id = u.discord_user_id AND event_id IN (?)) AS attendance FROM users u WHERE u.member = TRUE AND u.officer = FALSE ORDER BY u.nickname', [primary_raids], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {
                    let final_results = []
                    let pending = results.length
        
                    results.map(row => {
                        connection.execute('SELECT * FROM `characters` WHERE `discord_user_id` = ? AND `enabled` = TRUE', [row.discord_user_id], (err, result, fields) => {
                            row.characters = result
                            final_results.push(row)
        
                            if (0 === --pending) {
                                res.status(200).json(final_results)
                            }
                        })
                    })
                }
            })
        }
    })
}

const getOfficers = (req, res, connection) => {
    connection.query('SELECT * FROM `users` WHERE `member` = TRUE AND `officer` = TRUE ORDER BY `nickname`', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            let final_results = []
            let pending = results.length

            if (pending === 0) {
                res.status(200).json(final_results)
            }

            results.map(row => {
                connection.execute('SELECT * FROM `characters` WHERE `discord_user_id` = ? AND `enabled` = TRUE', [row.discord_user_id], (err, result, fields) => {
                    
                    row.characters = result
                    
                    connection.execute(`
                            SELECT uor.id, oroles.name
                            FROM user_officer_roles uor
                                INNER JOIN officer_roles oroles
                                ON oroles.id = uor.officer_role_id
                            WHERE uor.discord_user_id = ?
                        `, [row.discord_user_id], (err, result, fields) => {
                        
                            row.officer_roles = result
                            final_results.push(row)

                            if (0 === --pending) {
                                res.status(200).json(final_results)
                            }
                    })
                })
            })
        }
    })
}

module.exports = {
    getPugs,
    getMembers,
    getOfficers
}
