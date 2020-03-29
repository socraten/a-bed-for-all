require('dotenv').config()

const Telegraf = require('telegraf')
const session = require('telegraf/session')

const accounts = {}
const allPatients = {
    4: [{
        id: '4--123456',
        age: 55,
        gender: 'male',
        health: ['smoker', 'sick'],
        notes: 'is very sick'
    }, {
        id: '4--123457',
        age: 75,
        gender: 'male',
        health: ['sick'],
        notes: 'is very sick'
    }, {
        id: '4--123458',
        age: 25,
        gender: 'male',
        health: ['smoker', 'sick'],
        notes: 'is very very sick'
    }]
}
const allBeds = {
    level1: {}, // Very High Level ER
    level2: {} // High Level ER
}

const hospitals = require('./hospitals')

const BOT_TOKEN = process.env.BOT_TOKEN;

let bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session())

if (process.env.NODE_ENV === 'production') {
    const port = process.env.PORT || 3000;
    const HEROKU_URL = process.env.HEROKU_URL;

    bot.telegram.setWebhook(`${HEROKU_URL}/bot${BOT_TOKEN}`);
    bot.startWebhook(`/bot${BOT_TOKEN}`, null, port);
}

function mainMenu(ctx) {
    console.log(ctx.message.from)
    const user = ctx.message.from.username || ctx.message.from.first_name || 'anonimous'
    ctx.reply(`
Wellcome ${user}, how can I help you?
Following the list of task I can do: 
`, Telegraf.Extra.HTML().markup(m => {
            let actions = [
                [m.callbackButton('Add Beds', `bed_add ${ctx.message.from.id}`)],
                [m.callbackButton('Add Patient', 'patient_add')],
                [m.callbackButton('Remove Patient', 'patient_remove')],
                [m.callbackButton('Patients List', `list_patient ${ctx.message.from.id}`)],
                [m.callbackButton('Beds List', `list_bed ${ctx.message.from.id}`)]
            ]

            if (!accounts[ctx.message.from.id]) {
                actions = [m.callbackButton('Register', 'register')]
            }

            return m.inlineKeyboard(actions)
        })
    )
}

bot.start(mainMenu)
bot.help(mainMenu)

bot.action(/^register$/, ctx => {
    ctx.session.record_hospital = true
    ctx.reply('For which hospital you want to be register in?')
});

bot.action(/^patient_add$/, ctx => {
    ctx.session.adding_patient = MakeEmptyPatient()
    ctx.reply('Can you tell me the patient\'s id?')
})

bot.action(/^list_patient ([0-9]+)$/, ctx => {
    const hospitalId = accounts[+ctx.match[1]]
    const patients = allPatients[hospitalId]
    if (patients && patients.length) {
        ctx.reply(patients.map(p => [hospitals[hospitalId]].concat(printPatient(p))).join('\n-----\n'))
    } else {
        ctx.reply('Sorry I don\'t have patients from you hospital')
    }
})

bot.action(/^bed_add ([0-9]+)$/, ctx => {
    console.log('bot add', ctx.match[1])
    const hospitalId = accounts[+ctx.match[1]]

    ctx.reply('Which kind of bed do you want to add?',
        Telegraf.Extra.HTML().markup(m =>
            m.inlineKeyboard([
                [m.callbackButton('Level 1 ER', `bed_add_for_kind ${hospitalId} 1`)],
                [m.callbackButton('Level 2 ER', `bed_add_for_kind ${hospitalId} 2`)]
            ])
        )
    )
})

bot.action(/^bed_add_for_kind ([0-9]+) ([0-9]+)$/, ctx => {
    const hospitalId = accounts[+ctx.match[1]]
    const erLevel = +ctx.match[2] === 1 ? 'level1' : 'level2'
    ctx.session.adding_beds = {
        hospitalId, erLevel
    }

    const edLevelNumber = erLevel.replace(/^level/, '')

    ctx.reply(`How many beds of ER Level ${edLevelNumber} do you wanto to add?`)
})

bot.action(/^list_bed ([0-9]+)$/, ctx => {
    const hospitalId = accounts[+ctx.match[1]]
    const beds = allBeds[hospitalId]
    if (beds && beds.length) {
        ctx.reply(beds.map(p => [hospitals[hospitalId]].concat(printPatient(p))).join('\n-----\n'))
    } else {
        ctx.reply('Sorry I don\'t have available beds from you hospital')
    }
})

bot.on('text', ctx => {
    const message = ctx.message.text
    if (ctx.session.record_hospital) {
        const hospitalId = hospitals.indexOf(message.toLowerCase())
        if (hospitalId === -1) {
            ctx.reply('This hospital is unknown')
            return;
        }
        
        accounts[ctx.message.from.id] = hospitalId
        ctx.reply('Thanks!', '/help')
        ctx.session.record_hospital = false
    } else if (ctx.session.adding_patient) {
        if (!ctx.session.adding_patient.id) {
            ctx.session.adding_patient.id = `${hospitals[ctx.message.from.id]}--${message}`
            ctx.reply('Can you tell me the patient\'s age?')
        } else if (!ctx.session.adding_patient.age) {
            ctx.session.adding_patient.age = +message
            ctx.reply('Can you tell me the patient\'s gender?')
        } else if (!ctx.session.adding_patient.gender) {
            ctx.session.adding_patient.gender = message
            ctx.reply('Can you describe the patient\'s health conditions?')
        } else if (!ctx.session.adding_patient.health) {
            ctx.session.adding_patient.health = message

            if (patientIsValid(ctx.session.adding_patient)) {
                const patient = clonePatient(ctx.session.adding_patient)
                const hospitalId = accounts[ctx.message.from.id]
                if (!allPatients[hospitalId]) {
                    allPatients[hospitalId] = []
                }
                console.log('add patient', hospitalId)
                allPatients[hospitalId].push(patient)
                delete ctx.session.adding_patient
                ctx.reply('Patient added, thanks!')
            } else {
                ctx.reply('You did something wrong...sorry')
            }
        } else {
            console.log('oops patient!')
        }
    } else if (ctx.session.adding_beds) {
        const beds = +message
        const { hospitalId, erLevel } = ctx.session.adding_beds

        allBeds[hospitalId][erLevel] = beds
        
        delete ctx.session.adding_beds
        ctx.reply('Bed added, thanks!')
    } else {
        console.log('oops')
    }
})

function MakeEmptyPatient() {
    return {
        id: null,
        age: null,
        gender: null,
        health: null,
        notes: null
    }
}

function patientIsValid(patient) {
    return true
}

function clonePatient(patient) {
    return { ...patient }
}

function printPatient(patient) {
    return `${patient.id.replace(/^.+--/, '')}, ${patient.age}, ${patient.gender || ''},\n${patient.health},\n${patient.notes || ''}`
}

if (process.env.NODE_ENV !== 'production') {
    bot.launch()
}
