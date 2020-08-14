// const JWT = require('../util/jwt')


const getEncounterAssignments = (encounter_id, connection) => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT * FROM encounter_assignments WHERE encounter_id = ? ORDER BY id', [encounter_id], (err, results, fields) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

const get = (req, res, connection) => {
    const instance_id = req.query.instance_id || 1

    // get instance encounters
    connection.execute('SELECT * FROM encounters WHERE instance_id = ? ORDER BY id', [instance_id], async (err, results, fields) => {
        if (err) {
            res.status(500).send('Server error')
        } else {
            let encounters = results

            for (let i = 0; i < encounters.length; i++) {
                try {
                    encounters[i].assignments = await getEncounterAssignments(encounters[i].id, connection)
                } catch(err) {
                    res.status(500).send('Server error')
                }
            }
        }
    })
}

module.exports = {
    get
}
