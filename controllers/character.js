const JWT = require('../util/jwt')

const editRace = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id, race_id } = req.body
    if (typeof jwt === 'undefined' || typeof character_id === 'undefined' || typeof race_id === 'undefined') {
        res.status(400).send('Bad request 1')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // get character discord user id
                connection.execute('SELECT `discord_user_id` FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {

                        // confirm character exists
                        if (results.length === 0) {
                            res.status(400).send('Bad request 2')
                        } else {

                            // confirm character belongs to user
                            if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                                res.status(400).send('Bad request 3') 
                            } else {

                                // update character
                                connection.execute('UPDATE `characters` SET `race_id` = ? WHERE id = ?', [race_id, character_id], (err, results, fields) => {
                                    if (err) {
                                        console.error(err)
                                        res.status(500).send('Server error')
                                    } else {
                                        res.status(200).send('Success')
                                    }
                                })
                            }
                        }
                    }
                })
            }
        })
    }
}

module.exports = {
    editRace
}
