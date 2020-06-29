const JWT = require('../util/jwt')
const parser = require('fast-xml-parser')
const axios = require('axios')

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

const getInventoryItemDetails = (item_id) => {
    axios.get(`https://classic.wowhead.com/item=${item_id}&xml`)
    .then(response => {
        return(parser.parse(response.data))
    })
    .catch(err => {
        console.error(err)
        return false
    })
}

const getInventory = (req, res, connection) => {
    connection.query('SELECT * FROM bank_inventory ORDER BY name', (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {

            let n = 0
            results.forEach(async row => {
                const data = await getInventoryItemDetails(row.item_id)
                results[n].name = data.wowhead.item.name || 'Item Not Found'
                results[n].quality = data.wowhead.item.quality || 'Poor'
                results[n].icon = data.wowhead.item.icon || 'classic_temp'

                n++

                if (n === results.length) {
                    res.status(200).json(results)
                }
            })
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

module.exports = {
    getGoals,
    addGoal,
    deleteGoal,
    updateGoal,
    getInventory,
    addInventory,
    deleteInventory,
    // getRequests,
    // addRequest,
    // deleteRequest,
    // completeRequest,
    // rejectRequest
}