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
    connection.query('SELECT bi.*, bc.name as category_name FROM bank_inventory bi INNER JOIN bank_categories bc ON bi.category_id = bc.id ORDER BY category_name, bi.name', (err, results, fields) => {
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
    let { category_id, random_enchantment } = req.body

    if (typeof jwt === 'undefined' || typeof item_id === 'undefined' || typeof name === 'undefined' || typeof quality === 'undefined' || typeof icon === 'undefined' ) {
        res.status(400).send('Bad request')
    } else {

        // clean up parameters
        if (typeof category_id === 'undefined' || category_id === null) {
            category_id = 1
        }
        if (typeof random_enchantment === 'undefined') {
            random_enchantment = null
        }

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
                    connection.execute(`INSERT INTO bank_inventory (item_id, name, quality, icon, category_id, random_enchantment) VALUES (?, ?, ?, ?, ?, ?)`, [item_id, name, quality, icon, category_id, random_enchantment], (err, results, fields) => {
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

const updateInventory = (req, res, connection) => {

    // validate parameters
    const { jwt, inventory_id, category_id } = req.body

    if (typeof jwt === 'undefined' || typeof inventory_id === 'undefined' || typeof category_id === 'undefined') {
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

                                // update inventory
                                connection.execute(`UPDATE bank_inventory SET category_id = ? WHERE id = ?`, [category_id, inventory_id], (err, results, fields) => {
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

const getActiveRequests = (req, res, connection) => {
    connection.query(
        `
        SELECT br.*, u.nickname 
        FROM bank_requests br 
            INNER JOIN users u
            ON br.discord_user_id = u.discord_user_id        
        ORDER BY br.created DESC 
        WHERE br.completed IS NULL AND br.rejected IS NULL AND br.cancelled IS NULL
        `, (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {

            // fetch comments for request
            let final_results = []
            let pending = results.length

            results.map(row => {
                connection.execute(
                    `
                    SELECT brc.*, u.nickname  
                    FROM bank_request_comments brc 
                        INNER JOIN users u
                        ON brc.discord_user_id = u.discord_user_id 
                    WHERE brc.bank_request_id = ? ORDER BY brc.timestamp
                    `, [row.id], (err, result, fields) => {
                    row.comments = result
                    final_results.push(row)

                    if (0 === --pending) {
                        res.status(200).json(final_results)
                    }
                })
            })
        }
    })
}

const getRequests = (req, res, connection) => {
    connection.query(
        `
        SELECT br.*, u.nickname 
        FROM bank_requests br 
            INNER JOIN users u
            ON br.discord_user_id = u.discord_user_id        
        ORDER BY br.created DESC
        `, (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {

            // fetch comments for request
            let final_results = []
            let pending = results.length

            results.map(row => {
                connection.execute(
                    `
                    SELECT brc.*, u.nickname  
                    FROM bank_request_comments brc 
                        INNER JOIN users u
                        ON brc.discord_user_id = u.discord_user_id 
                    WHERE brc.bank_request_id = ? ORDER BY brc.timestamp
                    `, [row.id], (err, result, fields) => {
                    row.comments = result
                    final_results.push(row)

                    if (0 === --pending) {
                        res.status(200).json(final_results)
                    }
                })
            })
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
                    connection.execute('INSERT INTO bank_requests (message, timeframe, discord_user_id) VALUES (?, ?, ?)', [message, timeframe, jwt_data.body.discord_user_id], (err, results, fields) => {
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

const cancelRequest = (req, res, connection) => {
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

                            // confirm user who created request
                            if (!jwt_data.body.discord_user_id === results[0].discord_user_id) {
                                res.status(403).send('Forbidden')
                            } else {

                                // cancel request
                                connection.execute('UPDATE bank_requests SET cancelled = NOW() WHERE id = ?', [request_id], (err, results, fields) => {
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

                            // confirm officer rank
                            if (!jwt_data.body.is_officer) {
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

const addRequestComment = (req, res, connection) => {
    // validate parameters
    const { jwt, request_id, message } = req.body

    if (typeof jwt === 'undefined' || typeof request_id === 'undefined' || typeof message === 'undefined') {
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

                            // confirm officer rank or creator of the request
                            if (!jwt_data.body.is_officer && !jwt_data.body.discord_user_id === results[0].discord_user_id) {
                                res.status(403).send('Forbidden')
                            } else {

                                // add comment
                                connection.execute('INSERT INTO bank_request_comments (bank_request_id, discord_user_id, message) VALUES (?, ?, ?)', [request_id, jwt_data.body.discord_user_id, message], (err, results, fields) => {
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
    updateInventory,
    getActiveRequests,
    getRequests,
    addRequest,
    cancelRequest,
    deleteRequest,
    completeRequest,
    rejectRequest,
    addRequestComment
}