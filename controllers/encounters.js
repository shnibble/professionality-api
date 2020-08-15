const JWT = require('../util/jwt')

const getEncounterHealers = (encounter_id, connection) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            `
            SELECT eh.*, c.name as character_name, c.class_id as character_class_id 
            FROM encounter_healers eh 
            LEFT JOIN characters c
                ON c.id = eh.character_id 
            WHERE eh.encounter_id = ? ORDER BY eh.id
            `, [encounter_id], async (err, results, fields) => {
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
        connection.execute(
            `
            SELECT asup.*, c.name as character_name, c.class_id as character_class_id 
            FROM assignment_supports asup 
                LEFT JOIN characters c
                ON c.id = asup.character_id 
            WHERE asup.assignment_id = ? ORDER BY asup.id
            `, [assignment_id], (err, results, fields) => {
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
        connection.execute(
            `
            SELECT ec.*, c.name as character_name, c.class_id as character_class_id 
            FROM encounter_assignments ec 
                LEFT JOIN characters c
                ON c.id = ec.character_id
            WHERE ec.encounter_id = ? ORDER BY ec.id
            `, [encounter_id], async (err, results, fields) => {
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
            res.status(500).send('Server error 0')
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
                    res.status(500).send('Server error')
                }
            }

            // return results
            res.status(200).json(encounters)
        }
    })
}

const add = (req, res, connection) => {
    // validate parameters
    const { jwt, instance_id, name } = req.body

    if (typeof jwt === 'undefined' || typeof instance_id === 'undefined' || typeof name === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // add encounter
                connection.execute('INSERT INTO encounters (instance_id, name) VALUES (?, ?)', [instance_id, name], (err, results, fields) => {
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

const deleteEncounter = (req, res, connection) => {
    // validate parameters
    const { jwt, encounter_id } = req.body

    if (typeof jwt === 'undefined' || typeof encounter_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // confirm encounter exists
                connection.execute('SELECT * FROM encounters WHERE id = ?', [encounter_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // delete encounter
                        connection.execute('DELETE FROM encounters WHERE id = ?', [encounter_id], (err, results, fields) => {
                            if (err) {
                                res.status(500).send('Server error')
                            } else {
                                res.status(200).send('Success')
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

const addAssignment = (req, res, connection) => {
    // validate parameters
    const { jwt, encounter_id } = req.body

    if (typeof jwt === 'undefined' || typeof encounter_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // confirm encounter exists
                connection.execute('SELECT * FROM encounters WHERE id = ?', [encounter_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // add assignment
                        connection.execute('INSERT INTO encounter_assignments (encounter_id) VALUES (?)', [encounter_id], (err, results, fields) => {
                            if (err) {
                                res.status(500).send('Server error')
                            } else {
                                res.status(200).send('Success')
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

const deleteAssignment = (req, res, connection) => {
    // validate parameters
    const { jwt, assignment_id } = req.body

    if (typeof jwt === 'undefined' || typeof assignment_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // confirm assignment exists
                connection.execute('SELECT * FROM encounter_assignments WHERE id = ?', [assignment_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // delete assignment
                        connection.execute('DELETE FROM encounter_assignments WHERE id = ?', [assignment_id], (err, results, fields) => {
                            if (err) {
                                res.status(500).send('Server error')
                            } else {
                                res.status(200).send('Success')
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

const updateAssignmentMarker = (req, res, connection) => {
    // validate parameters
    const { jwt, assignment_id, raid_marker_id } = req.body

    if (typeof jwt === 'undefined' || typeof assignment_id === 'undefined' || typeof raid_marker_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // cleanup variables
        if (raid_marker_id === '') {
            raid_marker_id = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // confirm assignment exists
                connection.execute('SELECT * FROM encounter_assignments WHERE id = ?', [assignment_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // update assignment
                        connection.execute('UPDATE encounter_assignments SET raid_marker_id = ? WHERE id = ?', [raid_marker_id, assignment_id], (err, results, fields) => {
                            if (err) {
                                res.status(500).send('Server error')
                            } else {
                                res.status(200).send('Success')
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

const updateAssignmentTask = (req, res, connection) => {
    // validate parameters
    const { jwt, assignment_id, task } = req.body

    if (typeof jwt === 'undefined' || typeof assignment_id === 'undefined' || typeof task === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // cleanup variables
        if (task === '') {
            task = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // confirm assignment exists
                connection.execute('SELECT * FROM encounter_assignments WHERE id = ?', [assignment_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // update assignment
                        connection.execute('UPDATE encounter_assignments SET task = ? WHERE id = ?', [task, assignment_id], (err, results, fields) => {
                            if (err) {
                                res.status(500).send('Server error')
                            } else {
                                res.status(200).send('Success')
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

const updateAssignmentCharacter = (req, res, connection) => {
    // validate parameters
    const { jwt, assignment_id } = req.body
    let { character_id } = req.body

    if (typeof jwt === 'undefined' || typeof assignment_id === 'undefined' || typeof character_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // cleanup variables
        if (character_id === '') {
            character_id = null
        }

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // confirm officer rank
            if (!jwt_data.body.is_officer) {
                res.status(403).send('Forbidden')
            } else {

                // confirm assignment exists
                connection.execute('SELECT * FROM encounter_assignments WHERE id = ?', [assignment_id], (err, results, fields) => {
                    if (err) {
                        res.status(500).send('Server error')
                    } else if (results.length === 0) {
                        res.status(400).send('Bad request')
                    } else {

                        // update assignment
                        connection.execute('UPDATE encounter_assignments SET character_id = ? WHERE id = ?', [character_id, assignment_id], (err, results, fields) => {
                            if (err) {
                                res.status(500).send('Server error')
                            } else {
                                res.status(200).send('Success')
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

module.exports = {
    get,
    add,
    deleteEncounter,
    addAssignment,
    deleteAssignment,
    updateAssignmentMarker,
    updateAssignmentTask,
    updateAssignmentCharacter
}
