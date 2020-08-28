const JWT = require('../util/jwt')

const update = (req, res, connection) => {

    // validate parameters
    const { jwt, timeframe, available } = req.body
    if (typeof jwt === 'undefined' || typeof timeframe === 'undefined' || typeof available === 'undefined') {
        res.status(400).send('Bad request')
    } else {

        // verify jwt
        JWT.verify(jwt)
        .then(jwt_data => {

            // determine query string
            let query = ''
            let error = false

            switch(timeframe) {
                case 'monday_morning':
                    query = 'UPDATE users SET monday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'monday_evening':
                    query = 'UPDATE users SET monday_evening = ? WHERE discord_user_id = ?'
                    break
                case 'tuesday_morning':
                    query = 'UPDATE users SET tuesday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'tuesday_evening':
                    query = 'UPDATE users SET tuesday_evening = ? WHERE discord_user_id = ?'
                    break
                case 'wednesday_morning':
                    query = 'UPDATE users SET wednesday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'wednesday_evening':
                    query = 'UPDATE users SET wednesday_evening = ? WHERE discord_user_id = ?'
                    break
                case 'thursday_morning':
                    query = 'UPDATE users SET thursday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'thursday_evening':
                    query = 'UPDATE users SET thursday_evening = ? WHERE discord_user_id = ?'
                    break
                case 'friday_morning':
                    query = 'UPDATE users SET friday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'friday_evening':
                    query = 'UPDATE users SET friday_evening = ? WHERE discord_user_id = ?'
                    break
                case 'saturday_morning':
                    query = 'UPDATE users SET saturday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'saturday_evening':
                    query = 'UPDATE users SET saturday_evening = ? WHERE discord_user_id = ?'
                    break
                case 'sunday_morning':
                    query = 'UPDATE users SET sunday_morning = ? WHERE discord_user_id = ?'
                    break
                case 'sunday_evening':
                    query = 'UPDATE users SET sunday_evening = ? WHERE discord_user_id = ?'
                    break
                default: 
                    error = true
                    break
            }

            if (error) {
                res.status(400).send('Bad request')
            } else {

                // update availability
                connection.execute(query, [available, jwt_data.body.discord_user_id], (err, results, fields) => {
                    if (err) {
                        console.error(err)
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
    update
}
