const JWT = require('../util/jwt')

const getOfficerRoles = (req, res, connection) => {
    // validate parameters
    const { jwt} = req.body

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

                // get officer roles
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

module.exports = {
    getOfficerRoles
}
