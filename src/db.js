const { format, startOfWeek } = require('date-fns')
const path = require('path')

const dbSaveLocation = path.resolve(__dirname, '..')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const entries = low(new FileSync(`${dbSaveLocation}/entries.json`))
const credentials = low(new FileSync(`${dbSaveLocation}/creds.json`))

const Credentials = {
	WORKER_ID: 'workerId',
	TOGGL_API_TOKEN: 'apiToken',
	TEMPO_API_TOKEN: 'tempoApiToken',
}

// Set some defaults (required if your JSON file is empty)
entries.defaults({ entries: {}, weeklyTimeLog: {} }).write()

credentials
	.defaults({
		[Credentials.TOGGL_API_TOKEN]: undefined,
		[Credentials.WORKER_ID]: undefined,
		[Credentials.TEMPO_API_TOKEN]: undefined,
	})
	.write()

function entryExists(guid) {
	return !!entries.get(`entries.${guid}`).value()
}

function getWeeklyTimeLog(dayOfWeek) {
	const sunday = format(startOfWeek(dayOfWeek), 'yyyy-MM-dd')

	return entries.get(`weeklyTimeLog.${sunday}`).value() || 0
}

function updateWeeklyTimeLog(dayOfWeek, timeSpent) {
	const sunday = format(startOfWeek(dayOfWeek), 'yyyy-MM-dd')

	return entries.set(`weeklyTimeLog.${sunday}`, timeSpent).write()
}

function markEntriesAsDone(entriesToMark) {
	entriesToMark.forEach((entry) => {
		entries.set(`entries.${entry}`, true).write()
	})
}

function getCredentials(key) {
	return credentials.get(key).value()
}

function saveCredentials(key, value) {
	return credentials.set(key, value).write()
}

module.exports = {
	Credentials,
	getCredentials,
	saveCredentials,
	getWeeklyTimeLog,
	updateWeeklyTimeLog,
	entryExists,
	markEntriesAsDone,
}
