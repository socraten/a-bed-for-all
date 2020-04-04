const hospitals = require('./hospitals')

const accountsForHospitals = {}

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

module.exports.accountExists = function accountExists(accountId) {
    return (accountId in accountsForHospitals)
}

module.exports.registerAccount = function (accountId, hospitalId) {
    if (accountExists(accountId)) {
        return false
    }

    accountsForHospitals[accountId] = hospitalId

    return true
}

module.exports.findHospitalIdFromAccount = function (accountId) {
    return accountsForHospitals[accountId]
}

module.exports.findHospitalId = function (hospitalName) {
    const foundIndex = hospitals.indexOf(hospitalName.toLowerCase())

    return foundIndex > -1 ? foundIndex : null
}

module.exports.findHospital = function (accountId) {
    const hospitalId = accountsForHospitals[accountId]
    return hospitals[hospitalId]
}

module.exports.findAllPatients = function (accountId) {
    const hospitalId = accountsForHospitals[accountId]
    return allPatients[hospitalId]
}

module.exports.findBeds = function (accountId) {
    if (!allBeds.level1[accountId]) {
        return null
    }

    const accountBeds = {}

    accountBeds.level1 = allBeds.level1[accountId] || 0
    accountBeds.level2 = allBeds.level2[accountId] || 0

    return accountBeds
}

module.exports.addPatient = function (accountId, patient) {
    const hospitalId = accountsForHospitals[accountId]
    if (!allPatients[hospitalId]) {
        allPatients[hospitalId] = []
    }

    if (allPatients.find(({ id }) => id !== patient.id)) {
        return false
    }

    allPatients[hospitalId].push(patient)
    return true
}

module.exports.removePatient = function (accountId, patientCode) {
    const hospitalId = accountsForHospitals[accountId]
    const patientId = patientId(accountId, patientCode)

    const idxToRemove = allPatients[hospitalId].findIndex(({ id }) => id === patientId)
    if (idxToRemove !== -1) {
        allPatients[hospitalId].splice(idxToRemove, 1)
    }
}

module.exports.addBeds = function ({ hospitalId, erLevel }, beds) {
    allBeds[erLevel][hospitalId] = beds
}

module.exports.patientId = function patientId(accountId, patientCode) {
    const hospitalId = accountsForHospitals[accountId]
    return `${hospitals[hospitalId]}--${patientCode}`
}

module.exports.patientCode = function ({ id }) {
    return id.replace(/^.+--/, '')
}
