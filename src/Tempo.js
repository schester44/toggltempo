const axios = require('axios')

const { format } = require('date-fns')
const chalk = require('chalk')
const baseURL = 'https://api.tempo.io/core/3/'
const { log, secondsToHms, createEntryGroup, getEntryMeta } = require('./utils')

const { markEntriesAsDone, entryExists, getWeeklyTimeLog, updateWeeklyTimeLog } = require('./db')

class Tempo {
	constructor({ apiKey } = {}) {
		this.axios = axios.create({
			baseURL,
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		})
	}

	get(endpoint, params) {
		if (!params) {
			return this.request('GET', endpoint)
		}

		return this.request('GET', `${endpoint}?${params}`)
	}

	buildEntries({ workerId, entries }) {
		let worklog = {}

		for (let entry of entries) {
			const { issueKey, description } = getEntryMeta(entry)

			if (entryExists(entry.guid)) {
				log.warning(`Skipping an existing entry for "${issueKey}".`)
				continue
			}

			if (!issueKey) {
				log.warning('Skipping an entry that does not have an issue key.')
				continue
			}

			if (!worklog[description]) {
				worklog[description] = createEntryGroup({
					description,
					workerId,
					issueKey,
					start: entry.start,
				})
			}

			worklog[description].entries.push(entry.guid)
			worklog[description].log.timeSpentSeconds += parseInt(entry.duration, 10)
		}

		return Object.values(worklog)
	}

	async ingest({ workerId, entries, isDryRun = false, dayOfWeek = new Date() }) {
		let totalSeconds = 0

		const worklog = this.buildEntries({ workerId, entries })

		for (let work of worklog) {
			try {
				if (!isDryRun) {
					await this.create(work.log)

					markEntriesAsDone(work.entries)
				}

				totalSeconds += work.log.timeSpentSeconds

				log.success(`Worklog created for "${work.log.description}"`)
			} catch (error) {
				const message =
					error.response && error.response.data && error.response.data.errors
						? error.response.data.errors[0].message
						: error.message

				if (process.env.DEBUG) {
					console.log(error)
				}

				log.error(`Failed to create a worklog for "${work.log.description}" (${message})`)
			}
		}

		const timeSpentThisWeek = getWeeklyTimeLog(dayOfWeek) + totalSeconds

		if (!isDryRun) {
			updateWeeklyTimeLog(dayOfWeek, timeSpentThisWeek)
		}

		log.info(
			`Logged ${secondsToHms(totalSeconds)} of time for ${format(dayOfWeek, 'yyyy-MM-dd')}`
		)

		log.info(`${secondsToHms(timeSpentThisWeek)} total for the week.`)
	}

	create(log) {
		return this.post('worklogs', log)
	}

	post(endpoint, body) {
		return this.request('POST', endpoint, body)
	}

	async request(method, url, data = {}) {
		return this.axios({ url, method, data }).then(({ data }) => data)
	}
}

module.exports = Tempo
