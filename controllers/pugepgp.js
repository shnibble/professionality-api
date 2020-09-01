const JWT = require('../util/jwt')
const connection = require('../db/connect')
const MINIMUM_GP = 20
const TRANSACTION_LIMIT = 20
const DECAY_RATE = 0.2

const get = (req, res, connection) => {
    connection.query('SELECT id, name, ep, gp, (ep/gp) as pr FROM pug_epgp WHERE active = TRUE ORDER BY name', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            const active = results
            connection.query('SELECT id, name, ep, gp, (ep/gp) as pr FROM pug_epgp WHERE active = FALSE ORDER BY name', (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {
                    const inactive = results
                    const data = {
                        active: active,
                        inactive: inactive
                    }

                    // get transactions
                    let final_data = {
                        active: [],
                        inactive: []
                    }
                    let pending = data.active.length + data.inactive.length

                    if (pending === 0) {
                        res.status(200).json(final_data)
                    }

                    data.active.map(row => {
                        connection.execute('SELECT * FROM pug_epgp_transactions WHERE pug_id = ? ORDER BY timestamp DESC LIMIT ?', [row.id, TRANSACTION_LIMIT], (err, results, fields) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send('Server error')
                            } else {
                                row.transactions = results
                                final_data.active.push(row)

                                if (0 === --pending) {
                                    res.status(200).json(final_data)
                                }
                            }
                        })
                    })

                    data.inactive.map(row => {
                        connection.execute('SELECT * FROM pug_epgp_transactions WHERE pug_id = ? ORDER BY timestamp DESC LIMIT ?', [row.id, TRANSACTION_LIMIT], (err, results, fields) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send('Server error')
                            } else {
                                row.transactions = results
                                final_data.inactive.push(row)

                                if (0 === --pending) {
                                    res.status(200).json(final_data)
                                }
                            }
                        })
                    })
                }
            })
        }
    })
}

const updateEpgp = (req, res, connection) => {

    // validate parameters
    const { jwt, id} = req.body
    let { ep_amount, gp_amount, note } = req.body

    if (typeof jwt === 'undefined' || typeof id === 'undefined' || typeof ep_amount === '' || typeof gp_amount === '' || typeof note === '') {
        res.status(400).send('Bad request')
    } else {

        // cleanup variables
        if (ep_amount === '' || ep_amount === 0 || ep_amount === '0') {
            ep_amount = null
        }
        if (gp_amount === '' || gp_amount === 0 || gp_amount === '0') {
            gp_amount = null
        }
        if (note === '') {
            note = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // get pug
                connection.execute('SELECT * FROM pug_epgp WHERE id = ?', [id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {
                        
                        // calculations
                        const previous_ep = results[0].ep
                        const previous_gp = results[0].gp

                        let new_ep = previous_ep
                        let new_gp = previous_gp

                        if (ep_amount) {
                            new_ep = Number.parseFloat(previous_ep) + Number.parseFloat(ep_amount)

                            if (new_ep < 0) {
                                new_ep = 0
                            }
                        }
                        if (gp_amount) {
                            new_gp = Number.parseFloat(previous_gp) + Number.parseFloat(gp_amount)

                            if (new_gp < MINIMUM_GP) {
                                new_gp = MINIMUM_GP
                            }
                        }

                        // update epgp and record transaction
                        connection.execute('UPDATE pug_epgp SET ep = ?, gp = ? WHERE id = ?', [new_ep, new_gp, id], (err, results, fields) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send('Server error')
                            } else {
                                connection.execute('INSERT INTO pug_epgp_transactions (pug_id, ep_amount, gp_amount, note, previous_ep, previous_gp) VALUES (?, ?, ?, ? ,?, ?)', [id, ep_amount, gp_amount, note, previous_ep, previous_gp], (err, results, fields) => {
                                    if (err) {
                                        console.error(err)
                                        res.status(500).send('Server error')
                                    } else {
                                        res.status(200).send('Success')
                                    }
                                })
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

const updateActiveEp = (req, res, connection) => {

    // validate parameters
    const { jwt, ep_amount } = req.body
    let { note } = req.body

    if (typeof jwt === 'undefined' || typeof ep_amount === '' || typeof note === '') {
        res.status(400).send('Bad request')
    } else {

        // cleanup variables
        if (note === '') {
            note = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {
                
                // get active pugs
                connection.query('SELECT * FROM pug_epgp WHERE active = TRUE', (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {

                        // iterate through active pugs
                        let pending = results.length

                        results.map(row => {

                            // calculations
                            const previous_ep = row.ep
    
                            let new_ep = previous_ep
    
                            if (ep_amount) {
                                new_ep = Number.parseFloat(previous_ep) + Number.parseFloat(ep_amount)
    
                                if (new_ep < 0) {
                                    new_ep = 0
                                }
                            }

                            // update ep and record transaction
                            connection.execute('UPDATE pug_epgp SET ep = ? WHERE id = ?', [new_ep, row.id], (err, results, fieldS) => {
                                if (err) {
                                    console.error(err)
                                    res.status(500).send('Server error')
                                } else {
                                    connection.execute('INSERT INTO pug_epgp_transactions (pug_id, ep_amount, gp_amount, note, previous_ep, previous_gp) VALUES (?, ?, ?, ? ,?, ?)', [row.id, ep_amount, null, note, previous_ep, row.gp], (err, results, fields) => {
                                        if (err) {
                                            console.error(err)
                                            res.status(500).send('Server error')
                                        } else {
                                            if (0 === --pending) {
                                                res.status(200).send('Success')
                                            }
                                        }
                                    })
                                }
                            })

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

const applyDecay = (req, res, connection) => {

    // validate parameters
    const { jwt } = req.body

    if (typeof jwt === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {
                
                // get all pugs
                connection.query('SELECT * FROM pug_epgp', (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {

                        // iterate through pugs
                        let pending = results.length

                        results.map(row => {

                            // calculations
                            const previous_ep = row.ep
                            const previous_gp = row.gp

                            let new_ep = previous_ep
                            let new_gp = previous_gp

                            const ep_decay_amount = new_ep * DECAY_RATE * -1
                            const gp_decay_amount = new_gp * DECAY_RATE * -1

                            new_ep = Number.parseFloat(previous_ep) + Number.parseFloat(ep_decay_amount)

                            if (new_ep < 0) {
                                new_ep = 0
                            }
                            new_gp = Number.parseFloat(previous_gp) + Number.parseFloat(gp_decay_amount)

                            if (new_gp < MINIMUM_GP) {
                                new_gp = MINIMUM_GP
                            }

                            // update epgp and record transaction
                            connection.execute('UPDATE pug_epgp SET ep = ?, gp = ? WHERE id = ?', [new_ep, new_gp, row.id], (err, results, fieldS) => {
                                if (err) {
                                    console.error(err)
                                    res.status(500).send('Server error')
                                } else {
                                    connection.execute('INSERT INTO pug_epgp_transactions (pug_id, ep_amount, gp_amount, note, previous_ep, previous_gp) VALUES (?, ?, ?, "Decay applied.",?, ?)', [row.id, ep_decay_amount, gp_decay_amount, previous_ep, previous_gp], (err, results, fields) => {
                                        if (err) {
                                            console.error(err)
                                            res.status(500).send('Server error')
                                        } else {
                                            if (0 === --pending) {
                                                res.status(200).send('Success')
                                            }
                                        }
                                    })
                                }
                            })

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

const addCharacter = (req, res, connnection) => {
    
    // validate parameters
    const { jwt, name } = req.body

    if (typeof jwt === 'undefined' || typeof name === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // add character
                connection.execute('INSERT INTO pug_epgp (name) VALUES (?)', [name], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
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

const deleteCharacter = (req, res, connection) => {

    // validate parameters
    const { jwt, id } = req.body

    if (typeof jwt === 'undefined' || typeof id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // delete character
                connection.execute('DELETE FROM pug_epgp WHERE id = ?', [id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
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

const activateCharacter = (req, res, connection) => {

    // validate parameters
    const { jwt, id } = req.body

    if (typeof jwt === 'undefined' || typeof id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // update character
                connection.execute('UPDATE pug_epgp SET active = TRUE WHERE id = ?', [id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
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

const deactivateCharacter = (req, res, connection) => {

    // validate parameters
    const { jwt, id } = req.body

    if (typeof jwt === 'undefined' || typeof id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // update character
                connection.execute('UPDATE pug_epgp SET active = FALSE WHERE id = ?', [id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
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

module.exports = {
    get,
    updateEpgp,
    updateActiveEp,
    applyDecay,
    addCharacter,
    deleteCharacter,
    activateCharacter,
    deactivateCharacter
}
