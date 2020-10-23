require('dotenv').config()
const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const childProcess = require('child_process')
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET
const port = 3000

// controllers
const accountController = require('./controllers/account')
const adminController = require('./controllers/admin')
const attendanceController = require('./controllers/attendance')
const availabilityController = require('./controllers/availability')
const bankController = require('./controllers/bank')
const calendarController = require('./controllers/calendar')
const characterController = require('./controllers/character')
const encountersContoller = require('./controllers/encounters')
const eventController = require('./controllers/event')
const itemsController = require('./controllers/items')
const lootController = require('./controllers/loot')
const pugepgpController = require('./controllers/pugepgp')
const rosterController = require('./controllers/roster')


// initialize db connection
const connection = require('./db/connect')

// initialize discord bot
const Bot = require('./bot/bot')
const bot = new Bot(connection)

// initialize github webhook
const GithubWebHook = require('express-github-webhook')
const availability = require('./controllers/availability')
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

// admin
app.post('/admin/roles/get', (req, res) => adminController.getRoles(req, res, connection))
app.post('/admin/roles/add', (req, res) => adminController.addRole(req, res, connection))
app.post('/admin/roles/delete', (req, res) => adminController.deleteRole(req, res, connection))
app.post('/admin/officerRole/add', (req, res) => adminController.addOfficerRole(req, res, connection))
app.post('/admin/officerRole/delete', (req, res) => adminController.deleteOfficerRole(req, res, connection))


// attendance
app.post('/attendance/signup', (req, res) => attendanceController.signup(req, res, connection, bot))
app.post('/attendance/callout', (req, res) => attendanceController.callout(req, res, connection, bot))
app.post('/attendance/cancel', (req, res) => attendanceController.cancel(req, res, connection, bot))

// availability
app.post('/availability/update', (req, res) => availabilityController.update(req, res, connection))

// bank
app.get('/bank/goals/get', (req, res) => bankController.getGoals(req, res, connection))
app.post('/bank/goals/add', (req, res) => bankController.addGoal(req, res, connection))
app.post('/bank/goals/delete', (req, res) => bankController.deleteGoal(req, res, connection))
app.post('/bank/goals/update', (req, res) => bankController.updateGoal(req, res, connection))
app.get('/bank/inventory/get', (req, res) => bankController.getInventory(req, res, connection))
app.post('/bank/inventory/add', (req, res) => bankController.addInventory(req, res, connection))
app.post('/bank/inventory/delete', (req, res) => bankController.deleteInventory(req, res, connection))
app.post('/bank/inventory/update', (req, res) => bankController.updateInventory(req, res, connection))
app.get('/bank/requests/getActive', (req, res) => bankController.getActiveRequests(req, res, connection))
app.get('/bank/requests/get', (req, res) => bankController.getRequests(req, res, connection))
app.post('/bank/requests/add', (req, res) => bankController.addRequest(req, res, connection, bot))
app.post('/bank/requests/cancel', (req, res) => bankController.cancelRequest(req, res, connection))
app.post('/bank/requests/delete', (req, res) => bankController.deleteRequest(req, res, connection))
app.post('/bank/requests/complete', (req, res) => bankController.completeRequest(req, res, connection))
app.post('/bank/requests/reject', (req, res) => bankController.rejectRequest(req, res, connection))
app.post('/bank/requests/comment/add', (req, res) => bankController.addRequestComment(req, res, connection))

// calendar
app.get('/calendar/get', (req, res) => calendarController.get(req, res, connection))
app.get('/calendar/past', (req, res) => calendarController.getPast(req, res, connection))
app.post('/calendar/add', (req, res) => calendarController.add(req, res, connection, bot))
app.post('/calendar/delete', (req, res) => calendarController.deleteEvent(req, res, connection, bot))

// character
app.get('/character/getActive', (req, res) => characterController.getActive(req, res, connection))
app.post('/character/add', (req, res) => characterController.add(req, res, connection))
app.post('/character/add', (req, res) => characterController.add(req, res, connection))
app.post('/character/delete', (req, res) => characterController.deleteCharacter(req, res, connection))
app.post('/character/edit/race', (req, res) => characterController.editRace(req, res, connection))
app.post('/character/edit/class', (req, res) => characterController.editClass(req, res, connection))
app.post('/character/edit/role', (req, res) => characterController.editRole(req, res, connection))
app.post('/character/edit/attunements', (req, res) => characterController.editAttunements(req, res, connection))
app.post('/character/edit/professions', (req, res) => characterController.editProfessions(req, res, connection))
app.post('/character/edit/sort', (req, res) => characterController.updateSortOrder(req, res, connection))

// encounters
app.get('/encounters/get', (req, res) => encountersContoller.get(req, res, connection))
app.post('/encounters/add', (req, res) => encountersContoller.add(req, res, connection))
app.post('/encounters/delete', (req, res) => encountersContoller.deleteEncounter(req, res, connection))
app.post('/encounters/assignment/add', (req, res) => encountersContoller.addAssignment(req, res, connection))
app.post('/encounters/assignment/delete', (req, res) => encountersContoller.deleteAssignment(req, res, connection))
app.post('/encounters/assignment/update/marker', (req, res) => encountersContoller.updateAssignmentMarker(req, res, connection))
app.post('/encounters/assignment/update/task', (req, res) => encountersContoller.updateAssignmentTask(req, res, connection))
app.post('/encounters/assignment/update/character', (req, res) => encountersContoller.updateAssignmentCharacter(req, res, connection))
app.post('/encounters/assignment/support/add', (req, res) => encountersContoller.addAssignmentSupport(req, res, connection))
app.post('/encounters/assignment/support/delete', (req, res) => encountersContoller.deleteAssignmentSupport(req, res, connection))
app.post('/encounters/assignment/support/update/character', (req, res) => encountersContoller.updateAssignmentSupportCharacter(req, res, connection))
app.post('/encounters/assignment/support/update/heal', (req, res) => encountersContoller.updateAssignmentSupportHeal(req, res, connection))
app.post('/encounters/assignment/support/update/dispel', (req, res) => encountersContoller.updateAssignmentSupportDispel(req, res, connection))
app.post('/encounters/assignment/support/update/decurse', (req, res) => encountersContoller.updateAssignmentSupportDecurse(req, res, connection))
app.post('/encounters/healer/add', (req, res) => encountersContoller.addEncounterHealer(req, res, connection))
app.post('/encounters/healer/delete', (req, res) => encountersContoller.deleteEncounterHealer(req, res, connection))
app.post('/encounters/healer/update/character', (req, res) => encountersContoller.updateEncounterHealerCharacter(req, res, connection))
app.post('/encounters/healer/update/task', (req, res) => encountersContoller.updateEncounterHealerTask(req, res, connection))

// event
app.get('/event/get', (req, res) => eventController.get(req, res, connection))

// items
app.get('/items/get', (req, res) => itemsController.get(req, res, connection))
app.get('/items/getDetails', (req, res) => itemsController.getDetails(req, res))

// loot
app.get('/loot/get', (req, res) => lootController.get(req, res, connection))
app.post('/loot/update', (req, res) => lootController.update(req, res, connection))

// pug epgp
app.get('/pugepgp/get', (req, res) => pugepgpController.get(req, res, connection))
app.post('/pugepgp/update', (req, res) => pugepgpController.updateEpgp(req, res, connection))
app.post('/pugepgp/updateActiveEp', (req, res) => pugepgpController.updateActiveEp(req, res, connection))
app.post('/pugepgp/applyDecay', (req, res) => pugepgpController.applyDecay(req, res, connection))
app.post('/pugepgp/character/add', (req, res) => pugepgpController.addCharacter(req, res, connection))
app.post('/pugepgp/character/delete', (req, res) => pugepgpController.deleteCharacter(req, res, connection))
app.post('/pugepgp/character/activate', (req, res) => pugepgpController.activateCharacter(req, res, connection))
app.post('/pugepgp/character/deactivate', (req, res) => pugepgpController.deactivateCharacter(req, res, connection))

// roster
app.get('/roster/pugs', (req, res) => rosterController.getPugs(req, res, connection))
app.get('/roster/members', (req, res) => rosterController.getMembers(req, res, connection))
app.get('/roster/officers', (req, res) => rosterController.getOfficers(req, res, connection))

app.listen(port, () => console.log(`Professionality-api is listening on port ${port}.`))
