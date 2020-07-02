const get = (req, res, connection) => {
    const instance = req.query.instance
    if (typeof instance === 'undefined') {
        res.status(400).send('Bad request')
    } else {
        connection.execute('SELECT * FROM loot WHERE instance = ? ORDER BY name', [instance], (err, results, fields) => {
            if (err) {
                res.status(500).send('Server error')
            } else if (results.length === 0) {
                res.status(400).send('Bad request')
            } else {
                res.status(200).json(results)
            }
        })
    }
}

module.exports = {
    get
}
