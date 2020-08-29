const JWT = require('../util/jwt')

const get = (req, res, connection) => {
    connection.query('SELECT id, name, ep, gp, (ep/gp) as pr FROM pug_epgp WHERE active = TRUE ORDER BY name', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            let active = results
            connection.query('SELECT id, name, ep, gp, (ep/gp) as pr FROM pug_epgp WHERE active = FALSE ORDER BY name', (err, results, fields) => {
                if (err) {
                    console.error(err)
                    res.status(500).send('Server error')
                } else {
                    let inactive = results
                    const data = {
                        active: active,
                        inactive: inactive
                    }
                    res.status(200).json(data)
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
                            new_ep = previous_ep + ep_amount
                        }
                        if (gp_amount) {
                            new_gp = previous_gp + gp_amount
                        }

                        // update epgp and record transaction
                        connection.execute('UPDATE pug_epgp SET ep = ?, gp = ? WHERE id = ?', [new_ep, new_gp, id], (err, results, fields) => {
                            if (err) {
                                console.error(err)
                                res.status(500).send('Server error')
                            } else {
                                connection.execute('INSERT INTO epgp_transactions (pug_id, ep_amount, gp_amount, note, previous_ep, previous_gp) VALUES (?, ?, ?, ? ,?, ?)', [id, ep_amount, gp_amount, note, previous_ep, previous_gp], (err, results, fields) => {
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

}

const applyDecay = (req, res, connection) => {

}

const addCharacter = (req, res, connnection) => {

}

const deleteCharacter = (req, res, connection) => {

}

const activateCharacter = (req, res, connection) => {

}

const deactivateCharacter = (req, res, connection) => {

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