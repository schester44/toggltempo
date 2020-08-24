#!/usr/bin/env node

require('dotenv').config()

const { startOfDay, endOfDay, format } = require('date-fns')

const { Credentials, getCredentials, saveCredentials } = require('./db')

const { log, parseDateArgument } = require('./utils')
const getTogglCredentials = require('./getTogglCredentials')
const getTempoToken = require('./getTempoToken')
const getEntryRange = require('./getEntryRange')

const Toggl = require('./Toggl')
const Tempo = require('./Tempo')

const toggl = new Toggl()

const isDryRun = process.env.DRY_RUN

// Swallow any errors when DEBUG != true. This is so we can silently exit the app when inside a Prompt.
process.on('unhandledRejection', (err) => {
	if (process.env.DEBUG) {
		throw err
	}
})

if (isDryRun) {
	log.error('This is a dry run')
}

const argv = require('yargs')
	.alias('d', 'date')
	.describe('d', 'A single date to ingest')
	.coerce('d', parseDateArgument)
	.alias('s', 'start')
	.describe('s', 'The start date of a range of dates to process')
	.coerce('s', parseDateArgument)
	.alias('e', 'end')
	.describe(
		'e',
		'The end date of a range of dates to process. Used in conjunction with the `S` argument. If left blank, toggl will default to todays date.'
	)
	.coerce('e', parseDateArgument).argv

if (argv.start && !argv.end) {
	argv.end = new Date()
}

if (!argv.start && !argv.date && argv._.length === 1) {
	argv.date = parseDateArgument(argv._[0])
}

async function main() {
	const apiToken = getCredentials(Credentials.TOGGL_API_TOKEN)

	if (apiToken) {
		await toggl.init({ apiToken })
		log.clear(`Authenticated using an existing token.`)
	} else {
		const { email, password, workerId } = await getTogglCredentials()

		const apiToken = await toggl.authenticate(email, password)

		saveCredentials(Credentials.TOGGL_API_TOKEN, apiToken)
		saveCredentials(Credentials.WORKER_ID, workerId)
	}

	let tempoApiToken = getCredentials(Credentials.TEMPO_API_TOKEN)

	if (!tempoApiToken) {
		let { token } = await getTempoToken()

		if (!token) {
			log.error('A Tempo API token was not provided but is required to continue.')
			process.exit()
		}

		tempoApiToken = token

		saveCredentials(Credentials.TEMPO_API_TOKEN, tempoApiToken)
	}

	const workerId = getCredentials(Credentials.WORKER_ID)

	const tempo = new Tempo({ apiKey: tempoApiToken })

	const dates = await getEntryRange({ start: argv.start, end: argv.end, date: argv.date })

	for (let dayOfWeek of dates) {
		const entries = await toggl.getTimeEntries({
			startTime: startOfDay(dayOfWeek),
			endTime: endOfDay(dayOfWeek),
		})

		log.success('Logging work for', format(dayOfWeek, 'MMMM do, yyyy'))

		await tempo.ingest({
			dayOfWeek,
			isDryRun,
			workerId,
			entries,
		})
	}

	log.success('My work here is complete 😀')

	process.exit()
}

main()
