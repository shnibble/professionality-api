const JWT = require('../util/jwt')

const getActive = (req, res, connection) => {
    connection.query('SELECT * FROM characters WHERE enabled = TRUE ORDER BY name', (err, results, fields) => {
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
    const { jwt, character_name, character_race_id, character_class_id, character_role_id } = req.body
    if (typeof jwt === 'undefined' || typeof character_name === 'undefined' || typeof character_race_id === 'undefined' || typeof character_class_id === 'undefined' || typeof character_role_id === 'undefined') {
        res.status(400).send('Bad request')

    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // insert new character
            connection.execute('INSERT INTO characters (`discord_user_id`, `name`, `race_id`, `class_id`, `role_id`) VALUES (?, ?, ?, ?, ?)', [jwt_data.body.discord_user_id, character_name, character_race_id, character_class_id, character_role_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {
                    res.status(200).send('Success')
                }
            })
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}


const deleteCharacter = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id } = req.body
    if (typeof jwt === 'undefined' || typeof character_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // get character discord user id
            connection.execute('SELECT * FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // confirm character exists
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm character belongs to user
                        if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                            res.status(400).send('Bad request')
                        } else {

                            // update character
                            connection.execute('UPDATE `characters` SET `enabled` = FALSE WHERE id = ?', [character_id], (err, results, fields) => {
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
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const editRace = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id, race_id } = req.body
    if (typeof jwt === 'undefined' || typeof character_id === 'undefined' || typeof race_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // get character discord user id
            connection.execute('SELECT * FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // confirm character exists
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm character belongs to user
                        if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                            res.status(400).send('Bad request')
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
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const editClass = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id, class_id } = req.body
    if (typeof jwt === 'undefined' || typeof character_id === 'undefined' || typeof class_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // get character discord user id
            connection.execute('SELECT * FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // confirm character exists
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm character belongs to user
                        if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                            res.status(400).send('Bad request')
                        } else {

                            // update character
                            connection.execute('UPDATE `characters` SET `class_id` = ? WHERE id = ?', [class_id, character_id], (err, results, fields) => {
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
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const editRole = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id, role_id } = req.body
    if (typeof jwt === 'undefined' || typeof character_id === 'undefined' || typeof role_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // get character discord user id
            connection.execute('SELECT * FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // confirm character exists
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm character belongs to user
                        if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                            res.status(400).send('Bad request')
                        } else {

                            // update character
                            connection.execute('UPDATE `characters` SET `role_id` = ? WHERE id = ?', [role_id, character_id], (err, results, fields) => {
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
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const editAttunements = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id, attuned_mc, attuned_ony, attuned_bwl, attuned_naxx } = req.body
    if (typeof jwt === 'undefined' || typeof character_id === 'undefined' || typeof attuned_mc === 'undefined' || typeof attuned_ony === 'undefined' || typeof attuned_bwl === 'undefined' || typeof attuned_naxx === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // get character discord user id
            connection.execute('SELECT * FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // confirm character exists
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm character belongs to user
                        if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                            res.status(400).send('Bad request')
                        } else {

                            // update character
                            connection.execute('UPDATE `characters` SET `attuned_mc` = ?, `attuned_ony` = ?, `attuned_bwl` = ?, `attuned_naxx` = ? WHERE id = ?', [attuned_mc, attuned_ony, attuned_bwl, attuned_naxx, character_id], (err, results, fields) => {
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
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const editProfessions = (req, res, connection) => {

    // validate parameters
    const { jwt, character_id } = req.body
    let { profession_id_one, profession_id_two } = req.body
    
    // cleanup data
    if (typeof profession_id_one === 'undefined' || !profession_id_one || profession_id_one === 'None') {
        profession_id_one = null
    }
    if (typeof profession_id_two === 'undefined' || !profession_id_two || profession_id_two === 'None') {
        profession_id_two = null
    }

    if (typeof jwt === 'undefined' || typeof character_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // get character discord user id
            connection.execute('SELECT * FROM `characters` WHERE `id` = ?', [character_id], (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {

                    // confirm character exists
                    if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // confirm character belongs to user
                        if (jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                            res.status(400).send('Bad request')
                        } else {

                            // update character
                            connection.execute('UPDATE `characters` SET `profession_id_one` = ?, `profession_id_two` = ? WHERE id = ?', [profession_id_one, profession_id_two, character_id], (err, results, fields) => {
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
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

module.exports = {
    getActive,
    add,
    deleteCharacter,
    editRace,
    editClass,
    editRole,
    editAttunements,
    editProfessions
}
