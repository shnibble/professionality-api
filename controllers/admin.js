const JWT = require('../util/jwt')

const getRoles = (req, res, connection) => {
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

                // get roles
                connection.execute('SELECT * FROM officer_roles', (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else {
                        res.status(200).json(results)
                    }
                })
            }
        })
        .catch(err => {
            res.status(400).send('Invalid token')
        })
    }
}

const addrole = (req, res, connection) => {
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

                // add role
                connection.execute('INSERT INTO officer_roles (name) VALUES (?)', [name], (err, results, fields) => {
                    if (err) {
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

const deleteRole = (req, res, connection) => {
    // validate parameters
    const { jwt, role_id } = req.body

    if (typeof jwt === 'undefined' || typeof role_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // add role
                connection.execute('DELETE FROM officer_roles WHERE id = ?', [role_id], (err, results, fields) => {
                    if (err) {
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
    getRoles,
    addrole,
    deleteRole
}
