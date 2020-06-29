const JWT = require('../util/jwt')
const ConnectionConfig = require('mysql2/lib/connection_config')
const connection = require('../db/connect')

const getGoals = (req, res, connection) => {
    connection.query('SELECT * FROM bank_goals ORDER BY id', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

const addGoal = (req, res, connection) => {

    // validate parameters
    const jwt = req.body.jwt
    const title = req.body.title
    const description = req.body.description || ''
    const ep_reward = req.body.ep_reward || ''

    if (typeof jwt === 'undefined' || typeof title === 'undefined' || title === '') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm officer rank
                if (!jwt_data.body.is_officer) {
                    res.status(403).send('Forbidden')
                } else {

                    // insert new goal
                    connection.execute(`INSERT INTO bank_goals (title, description, ep_reward) VALUES (?, ?, ?)`, [title, description, ep_reward], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            res.status(200).send('Success')
                        }
                    })
                }
            }
        })
    }
}

const deleteGoal = (req, res, connection) => {

    // validate parameters
    const jwt = req.body.jwt
    const goal_id = req.body.goal_id

    if (typeof jwt === 'undefined' || typeof goal_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm officer rank
                if (!jwt_data.body.is_officer) {
                    res.status(403).send('Forbidden')
                } else {

                    // confirm goal exists
                    connection.execute('SELECT * FROM bank_goals WHERE id = ?', [goal_id], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            if (results.length === 0) {
                                res.status(400).send('Bad request')
                            } else {

                                // delete goal
                                connection.execute(`DELETE FROM bank_goals WHERE id = ?`, [goal_id], (err, results, fields) => {
                                    if (err) {
                                        console.error(err)
                                        res.status(500).send('Server error')
                                    } else {
                                        res.status(200).send('Success')
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
}

const updateGoal = (req, res, connection) => {
     // validate parameters
     const jwt = req.body.jwt
     const goal_id = req.body.goal_id
     const title = req.body.title
     const description = req.body.description || ''
     const ep_reward = req.body.ep_reward || ''
 
     if (typeof jwt === 'undefined' || typeof title === 'undefined' || title === '' || typeof goal_id === 'undefined') {
         res.status(400).send('Bad request')
     } else {
 
         // verify jwt
         JWT.verify(jwt)
         .then(jwt_data => {
 
             // if invalid return 400
             if (!jwt_data) {
                 res.status(400).send('Invalid token')
             } else {
 
                 // confirm officer rank
                 if (!jwt_data.body.is_officer) {
                     res.status(403).send('Forbidden')
                 } else {
                     
                    // confirm goal exists
                    connection.execute('SELECT * FROM bank_goals WHERE id = ?', [goal_id], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            if (results.length === 0) {
                                res.status(400).send('Bad request')
                            } else {

                                // update goal
                                connection.execute('UPDATE bank_goals SET title = ?, description = ?, ep_reward = ? WHERE id = ?', [title, description, ep_reward, goal_id], (err, results, fields) => {
                                    if (err) {
                                        console.error(err) 
                                        res.status(500).send('Server error')
                                    } else {
                                        res.status(200).send('Success')
                                    }
                                })
                            }
                        }
                    })
                 }
             }
         })
     }
}

const getInventory = (req, res, connection) => {
    connection.query('SELECT * FROM bank_inventory ORDER BY name', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

const addInventory = (req, res, connection) => {
    // validate parameters
    const { jwt, item_id, name, quality, icon } = req.body

    if (typeof jwt === 'undefined' || typeof item_id === 'undefined' || typeof name === 'undefined' || typeof quality === 'undefined' || typeof icon === 'undefined' ) {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm officer rank
                if (!jwt_data.body.is_officer) {
                    res.status(403).send('Forbidden')
                } else {

                    // insert new inventory
                    connection.execute(`INSERT INTO bank_inventory (item_id, name, quality, icon) VALUES (?, ?, ?, ?)`, [item_id, name, quality, icon], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            res.status(200).send('Success')
                        }
                    })
                }
            }
        })
    }
}

const deleteInventory = (req, res, connection) => {

    // validate parameters
    const { jwt, inventory_id } = req.body

    if (typeof jwt === 'undefined' || typeof inventory_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm officer rank
                if (!jwt_data.body.is_officer) {
                    res.status(403).send('Forbidden')
                } else {

                    // confirm inventory exists
                    connection.execute('SELECT * FROM bank_inventory WHERE id = ?', [inventory_id], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            if (results.length === 0) {
                                res.status(400).send('Bad request')
                            } else {

                                // delete inventory
                                connection.execute(`DELETE FROM bank_inventory WHERE id = ?`, [inventory_id], (err, results, fields) => {
                                    if (err) {
                                        console.error(err)
                                        res.status(500).send('Server error')
                                    } else {
                                        res.status(200).send('Success')
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
}

const getRequests = (req, res, connection) => {
    connection.query('SELECT * FROM bank_requests ORDER BY created', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

const addRequest = (req, res, Connection) => {
    // validate parameters
    const { jwt, message, timeframe } = req.body

    if (typeof jwt === 'undefined' || typeof message === 'undefined' || typeof timeframe === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm member rank
                if (!jwt_data.body.is_member) {
                    res.status(403).send('Forbidden')
                } else {

                    // insert request
                    connection.execute('INSERT INTO bank_requests (message, timeframe, discord_user_id), VALUES (?, ?, ?)', [message, timeframe, jwt_data.body.discord_user_id], (err, results, fields) => {
                        if (err) {
                            console.error(err)
                            res.status(500).send('Server error')
                        } else {
                            res.status(200).send('Success')
                        }
                    })
                }
            }
        })
    }
}

const deleteRequest = (req, res, connection) => {
    // validate parameters
    const { jwt, request_id } = req.body

    if (typeof jwt === 'undefined' || typeof request_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm request exists
                connection.execute('SELECT * FROM bank_requests WHERE id = ?', [request_id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
                        if (results.length === 0) {
                            res.status(400).send('Bad request')
                        } else {

                            // confirm officer rank or user who created request
                            if (!jwt_data.body.is_officer && jwt_data.body.discord_user_id !== results[0].discord_user_id) {
                                res.status(403).send('Forbidden')
                            } else {

                                // delete request
                                connection.execute('DELETE FROM bank_requests WHERE id = ?', [request_id], (err, results, fields) => {
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
            }
        })
    }
}

const completeRequest = (req, res, connection) => {
    // validate parameters
    const { jwt, request_id } = req.body

    if (typeof jwt === 'undefined' || typeof request_id === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm request exists
                connection.execute('SELECT * FROM bank_requests WHERE id = ?', [request_id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
                        if (results.length === 0) {
                            res.status(400).send('Bad request')
                        } else {

                            // confirm officer rank 
                            if (!jwt_data.body.is_officer) {
                                res.status(403).send('Forbidden')
                            } else {

                                // complete request
                                connection.execute('UPDATE bank_requests SET completed = NOW() WHERE id = ?', [request_id], (err, results, fields) => {
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
            }
        })
    }
}

const rejectRequest = (req, res, connection) => {
    // validate parameters
    const { jwt, request_id, rejected_reason } = req.body

    if (typeof jwt === 'undefined' || typeof request_id === 'undefined' || typeof rejected_reason === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // if invalid return 400
            if (!jwt_data) {
                res.status(400).send('Invalid token')
            } else {

                // confirm request exists
                connection.execute('SELECT * FROM bank_requests WHERE id = ?', [request_id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
                        res.status(500).send('Server error')
                    } else {
                        if (results.length === 0) {
                            res.status(400).send('Bad request')
                        } else {

                            // confirm officer rank 
                            if (!jwt_data.body.is_officer) {
                                res.status(403).send('Forbidden')
                            } else {

                                // complete request
                                connection.execute('UPDATE bank_requests SET rejected = NOW(), rejected_reason = ? WHERE id = ?', [rejected_reason, request_id], (err, results, fields) => {
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
            }
        })
    }
}

module.exports = {
    getGoals,
    addGoal,
    deleteGoal,
    updateGoal,
    getInventory,
    addInventory,
    deleteInventory,
    getRequests,
    addRequest,
    deleteRequest,
    completeRequest,
    rejectRequest
}