require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const childProcess = require('child_process')
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET
const port = 3000

// controllers
const accountController = require('./controllers/account')

// initialize db connection
const connection = require('./db/connect')

// initialize discord bot
const Bot = require('./bot/bot')
const bot = new Bot(connection)





// TESTING
// setTimeout(() => {
//     if(bot.checkIfUserExists('261539339878662146')) {
//         console.log('Users does exist')
//     } else {
//         console.log('User does not exist')
//     }
// }, 1000)

// setTimeout(() => {
//     if(bot.checkIfUserIsMember('261539339878662146')) {
//         console.log('Users is a @member')
//     } else {
//         console.log('User is not a @member')
//     }
// }, 2000)

// setTimeout(() => {
//     if(bot.checkIfUserIsOfficer('261539339878662146')) {
//         console.log('Users is a @officer')
//     } else {
//         console.log('User is not a @officer')
//     }
// }, 3000)

// setTimeout(() => {
//     const nickname = bot.getUserNickname('261539339878662146')
//     console.log('User nickname is:', nickname)

// }, 4000)
// TESTING






// initialize github webhook
const GithubWebHook = require('express-github-webhook')
const webhookHandler = GithubWebHook({ path: '/webhooks/github', secret: GITHUB_WEBHOOK_SECRET })

// initialize express
const app = express()
app.use(bodyParser.urlencoded())
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

app.get('/', (req, res) => res.send('Professionality API v1'))

// account
app.post('/account/login', (req, res) => accountController.login(req, res, connection, bot))

app.listen(port, () => console.log(`Professionality-api is listening on port ${port}.`))
