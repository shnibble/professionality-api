const getPugs = (req, res, connection) => {
    connection.query('SELECT * FROM `users` WHERE `member` = FALSE AND `officer` = FALSE ORDER BY `nickname`', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            let final_results = []
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
    connection.query('SELECT * FROM `users` WHERE `member` = TRUE AND `officer` = FALSE ORDER BY `nickname`', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            let final_results = []
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

const getOfficers = (req, res, connection) => {
    connection.query('SELECT * FROM `users` WHERE `member` = TRUE AND `officer` = TRUE ORDER BY `nickname`', (err, results, fields) => {
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

module.exports = {
    getPugs,
    getMembers,
    getOfficers
}
