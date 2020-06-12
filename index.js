const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const childProcess = require('child_process')
const GITHUB_WEBHOOK_SECRET = 'fD8xTzB6D42tAG4g432GQ#43g#$gq34g#Q%GQ35g3#%Gq2g365hQH'
const GithubWebHook = require('express-github-webhook')
const webhookHandler = GithubWebHook({ path: '/webhooks/github', secret: GITHUB_WEBHOOK_SECRET })

app.use(bodyParser.json())
app.use(webhookHandler)

app.get('/', (req, res) => res.send('Hello World v10'))

webhookHandler.on('*', (event, repo, data) => {
    console.log('Incoming webhook event from Github.')

    if (event === 'push' && data.ref === 'refs/heads/master') {
        deploy()
    }
})

const deploy = () => {
    childProcess.exec('cd ~/scripts && ./deploy.sh', (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
            console.log('Successfully updated repo')
        }
        
    })
}

app.listen(port, () => console.log(`App is listening on port ${port}.`))
