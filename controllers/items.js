const parser = require('fast-xml-parser')
const axios = require('axios')

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

const get = (req, res, connection) => {
    const search = req.query.search || ''
    const fullSearch = '%' + search + '%'

    connection.execute(`SELECT * FROM items WHERE name LIKE ? ORDER BY name LIMIT 20`, [fullSearch], (err, results, fields) => {
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

module.exports = {
    get
}