require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const port = 3000
const childProcess = require('child_process')
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

// initialize discord bot
const Bot = require('./bot')
const bot = new Bot()

// initialize github webhook
const GithubWebHook = require('express-github-webhook')
const webhookHandler = GithubWebHook({ path: '/webhooks/github', secret: GITHUB_WEBHOOK_SECRET })

// initialize express
const app = express()
app.use(bodyParser.json())
app.use(webhookHandler)

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

app.get('/', (req, res) => res.send('Hello World v21'))
app.get('/test', (req, res) => res.send('Test is okay.'))

app.listen(port, () => console.log(`Professionality-api is listening on port ${port}.`))
