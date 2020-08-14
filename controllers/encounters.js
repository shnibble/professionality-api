// const JWT = require('../util/jwt')

const getEncounterHealers = (encounter_id, connection) => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT * FROM encounter_healers WHERE encounter_id = ? ORDER BY id', [encounter_id], async (err, results, fields) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

const getAssignmentSupports = (assignment_id, connection) => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT * FROM assignment_supports WHERE assignment_id = ? ORDER BY id', [assignment_id], (err, results, fields) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

const getEncounterAssignments = (encounter_id, connection) => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT * FROM encounter_assignments WHERE encounter_id = ? ORDER BY id', [encounter_id], async (err, results, fields) => {
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
            
            // get encounter assignments
            for (let i = 0; i < encounters.length; i++) {
                try {
                    encounters[i].assignments = await getEncounterAssignments(encounters[i].id, connection)
                } catch(err) {
                    res.status(500).send('Server error')
                }
            }

            // get assignment supports
            for (let i = 0; i < encounters.length; i++) {
                
                for (let n = 0; n < encounters[i].assignments.length; n++) {
                    try {
                        encounters[i].assignments[n].supports = await getAssignmentSupports(encounters[i].assignments[n].id, connection)
                    } catch(err) {
                        res.status(500).send('Server error')
                    }
                }
            }

            // get encounter healers
            for (let i = 0; i < encounters.length; i++) {
                try {
                    encounters[i].healers = await getEncounterHealers(encounters[i].id, connection)
                } catch(err) {
                    res.status(500).send('Server error 1')
                }
            }

            // return results
            res.status(200).json(encounters)
        }
    })
}

module.exports = {
    get
}
