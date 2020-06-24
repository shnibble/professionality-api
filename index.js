require('dotenv').config()
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const childProcess = require('child_process')
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET
const port = 3000

// controllers
const accountController = require('./controllers/account')
const attendanceController = require('./controllers/attendance')
const calendarController = require('./controllers/calendar')
const characterController = require('./controllers/character')
const eventController = require('./controllers/event')
const rosterController = require('./controllers/roster')


// initialize db connection
const connection = require('./db/connect')

// initialize discord bot
const Bot = require('./bot/bot')
const bot = new Bot(connection)

// initialize github webhook
const GithubWebHook = require('express-github-webhook')
const webhookHandler = GithubWebHook({ path: '/webhooks/github', secret: GITHUB_WEBHOOK_SECRET })

// initialize express
const app = express()
app.use(cors())
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

app.get('/', (req, res) => res.send('Professionality API v2'))

// account
app.post('/account/login', (req, res) => accountController.login(req, res, connection, bot))
app.post('/account/verify', (req, res) => accountController.verify(req, res))
app.get('/account/get', (req, res) => accountController.get(req, res, connection))

// attendance
app.post('/attendance/signup', (req, res) => attendanceController.signup(req, res, connection))
app.post('/attendance/callout', (req, res) => attendanceController.callout(req, res, connection))
app.post('/attendance/cancel', (req, res) => attendanceController.cancel(req, res, connection))

// calendar
app.get('/calendar/get', (req, res) => calendarController.get(req, res, connection))
app.post('/calendar/add', (req, res) => calendarController.add(req, res, connection))
app.post('/calendar/delete', (req, res) => calendarController.deleteEvent(req, res, connection))

// character
app.post('/character/add', (req, res) => characterController.add(req, res, connection))
app.post('/character/delete', (req, res) => characterController.deleteCharacter(req, res, connection))
app.post('/character/edit/race', (req, res) => characterController.editRace(req, res, connection))
app.post('/character/edit/class', (req, res) => characterController.editClass(req, res, connection))
app.post('/character/edit/role', (req, res) => characterController.editRole(req, res, connection))
app.post('/character/edit/attunements', (req, res) => characterController.editAttunements(req, res, connection))
app.post('/character/edit/professions', (req, res) => characterController.editProfessions(req, res, connection))

// event
app.get('event/get', (req, res) => eventController.get(req, res, connection))

// roster
app.get('/roster/pugs', (req, res) => rosterController.getPugs(req, res, connection))
app.get('/roster/members', (req, res) => rosterController.getMembers(req, res, connection))
app.get('/roster/officers', (req, res) => rosterController.getOfficers(req, res, connection))

app.listen(port, () => console.log(`Professionality-api is listening on port ${port}.`))
