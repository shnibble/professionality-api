const get = (req, res, connection) => {

    // validate parameters
    const { event_id } = req.query
    const discord_user_id = req.query.discord_user_id || null
    if (typeof event_id === 'undefined' || event_id === '' || event_id === null) {
        res.status(400).send('Bad request')
    } else {

        let event = {}

        // fetch event details
        connection.execute(
            `
            SELECT e.*, a.signed_up, a.called_out, a.character_id, a.role_id, a.tentative, a.late, a.note,
            (SELECT COUNT(*) FROM attendance 
                WHERE event_id = e.id 
                AND discord_user_id IN (SELECT discord_user_id FROM users) 
                AND signed_up IS NOT NULL) 
                AS total_sign_ups, 
            (SELECT COUNT(*) FROM attendance 
                WHERE event_id = e.id 
                AND discord_user_id IN (SELECT discord_user_id FROM users) 
                AND called_out IS NOT NULL) 
                AS total_call_outs, 
            (SELECT COUNT(*) FROM attendance 
                WHERE event_id = e.id 
                AND discord_user_id IN (SELECT discord_user_id FROM users) 
                AND signed_up IS NOT NULL 
                AND role_id = 1) 
                AS total_casters, 
            (SELECT COUNT(*) FROM attendance 
                WHERE event_id = e.id 
                AND discord_user_id IN (SELECT discord_user_id FROM users) 
                AND signed_up IS NOT NULL AND role_id = 2) 
                AS total_fighters, 
            (SELECT COUNT(*) FROM attendance 
                WHERE event_id = e.id 
                AND discord_user_id IN (SELECT discord_user_id FROM users) 
                AND signed_up IS NOT NULL 
                AND role_id = 3) 
                AS total_healers, 
            (SELECT COUNT(*) FROM attendance 
                WHERE event_id = e.id 
                AND discord_user_id IN (SELECT discord_user_id FROM users) 
                AND signed_up IS NOT NULL 
                AND role_id = 4) 
                AS total_tanks 
            FROM events e 
            LEFT JOIN attendance a
                ON e.id =  a.event_id AND a.discord_user_id = ?
            WHERE e.id = ?
            `,
            [discord_user_id, event_id], (err, results, fields) => {
            if (err) {
                res.status(500).send('Server error')
            } else {

                if (results.length === 0) {
                    res.status(400).send('Bad request')
                } else {
                    event = results[0]

                    // fetch attendance for event
                    connection.execute(
                        `
                        SELECT a.*, u.nickname, c.name as character_name, c.class_id as character_class_id
                        FROM attendance a
                        INNER JOIN users u
                            ON a.discord_user_id = u.discord_user_id
                        INNER JOIN characters c
                            ON a.character_id = c.id
                        WHERE a.event_id = ? AND a.discord_user_id IN (SELECT discord_user_id FROM users) 
                        `, [event_id], (err, results, fields) => {
                        if (err) {
                            res.status(500).send('Server error')
                        } else {
                            event.attendance = results
                            res.status(200).json(event)
                        }
                    })
                }
            }
        })
    }
}

module.exports = {
    get
}
