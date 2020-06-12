const express = require('express')
const app = express()
const port = 3000
const childProcess = require('child_process')
const GITHUB_WEBHOOK_SECRET = 'fD8xTzB6D42tAG4g432GQ#43g#$gq34g#Q%GQ35g3#%Gq2g365hQH'
const GITHUB_USER = 'shnibble'

app.get('/', (req, res) => res.send('Hello World v3'))

app.post('/webhooks/github', (req, res) => {
    deploy(res)
})

const deploy = (res) => {
    childProcess.exec('cd ~/scripts && ./deploy.sh', (err, stdout, stderr) => {
        if (err) {
            console.error(err)
            return res.send(500)
        }
        res.send(200)
    })
}

app.listen(port, () => console.log(`App is listening on port ${port}.`))
