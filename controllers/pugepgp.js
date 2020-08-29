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