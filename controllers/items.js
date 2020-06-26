const get = (req, res, connection) => {
    const search = req.query.search || ''
    const fullSearch = '%' + search + '%'

    connection.execute(`SELECT * FROM items WHERE name LIKE ? ORDER BY name LIMIT 20`, [fullSearch], (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {
            res.status(200).json(results)
        }
    })
}

module.exports = {
    get
}