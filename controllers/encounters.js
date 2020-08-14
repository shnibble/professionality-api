// const JWT = require('../util/jwt')

const get = (req, res, connection) => {
    const instance_id = req.query.instance_id || 1

    // get instance encounters
    connection.execute('SELECT * FROM encounters WHERE instance_id = ? ORDER BY id', [instance_id], (err, results, fields) => {
        if (err) {
            res.status(500).send('Server error')
        } else {
            let encounters = results

            // fetch encounter assignments
            for (let i = 0; i < encounters.length; i++) {
                connection.execute('SELECT * FROM encounter_assignments WHERE encounter_id = ? ORDER BY id', [encounters[i].id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else {
                        encounters[i].assignments = results

                        // fetch assignment supports
                        for (let n = 0; n < encounters[i].assignments.length; n++) {
                            connection.execute('SELECT * FROM assignment_supports WHERE assignment_id = ?', [encounters[i].assignments[n].id], (err, results, fields) => {
                                if (err) {
                                    res.status(500).send('Server error')
                                } else {
                                    encounters[i].assignments[n].supports = results

                                    if (i === encounters.length && n === encounters[i].assignments.length) {
                                        
                                        // return results
                                        res.status(200).json(encounters)
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}

module.exports = {
    get
}
