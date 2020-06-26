const get = (req, res, connection) => {
    const search = req.query.search || ''

    connection.execute(`SELECT * FROM items WHERE name LIKE '%?%' ORDER BY name LIMIT 10`, [search], (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            console.log('Results:', results)
            res.status(200).json(results)
        }
    })
}

module.exports = {
    get
}