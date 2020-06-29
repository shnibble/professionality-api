const parser = require('fast-xml-parser')
const axios = require('axios')

const getInventoryItemDetails = (item_id) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://classic.wowhead.com/item=${item_id}&xml`)
        .then(response => {
            const data = parser.parse(response.data)
            resolve(parser.parse(response.data))
        })
        .catch(err => {
            console.error(err)
            reject(err)
        })
    }) 
}

const get = (req, res, connection) => {
    const search = req.query.search || ''
    const fullSearch = '%' + search + '%'

    connection.execute(`SELECT * FROM items WHERE name LIKE ? ORDER BY name LIMIT 20`, [fullSearch], async (err, results, fields) => {
        if (err) {
            console.error(err)
            res.status(500).send('Server error')
        } else {

            for(let n = 0; n < results.length; n++) {
                await getInventoryItemDetails(results[n].item_id)
                .then(data => {
                    results[n].quality = data.wowhead.item.quality || 'Poor'
                    results[n].icon = data.wowhead.item.icon || 'classic_temp'
                })
                .catch(err => {
                    console.error(err)
                    res.status(500).send('Server error')
                })
            }

            res.status(200).json(results)
        }
    })
}

module.exports = {
    get
}