const { format } = require('date-fns')
const chalk = require('chalk')
const chrono = require('chrono-node')

const logLevels = {
	info: 'blue',
	warning: 'yellow',
	success: 'green',
	error: 'red',
	default: 'white',
}

function logger(level = 'info', ...args) {
	return console.log(chalk[logLevels[level]](...args))
}

const log = {
	warning: (...args) => logger('warning', ...args),
	info: (...args) => logger('info', ...args),
	success: (...args) => logger('success', ...args),
	error: (...args) => logger('error', ...args),
	clear: (...args) => logger('default', ...args),
}

function createEntryGroup({ description, workerId, start, issueKey }) {
	const startDay = new Date(start)

	const startTime = format(startDay, 'HH:MM:SS')
	const startDate = format(startDay, 'yyyy-MM-dd')

	return {
		entries: [],
		date: startDay,
		log: {
			issueKey,
			description,
			startTime,
			startDate,
			authorAccountId: workerId,
			timeSpentSeconds: 0,
		},
	}
}

function getEntryMeta(entry) {
	let [issueKey, description] = (entry.description || '').split(' ')

	if (description) {
		description = entry.description.trim()
	}

	description = description || issueKey

	return { issueKey, description }
}

function secondsToHms(d) {
	d = Number(d)

	if (d === 0) return '0 seconds'

	var h = Math.floor(d / 3600)
	var m = Math.floor((d % 3600) / 60)
	var s = Math.floor((d % 3600) % 60)

	var hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '0 hours '
	var mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '0 minutes '
	var sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '0 seconds '
	return hDisplay + mDisplay + sDisplay
}

const parseDateArgument = (arg) => {
	let reg = /([0-9]*-[0-9]*)\w+/

	let isDate = String(arg).match(reg)

	// Poorly named variable, we're checking if the format is something like 2020-06-09 or even just 06-09
	if (isDate) {
		const argParts = arg.split('-')

		// if there's only 2 parts then we're assuming this arg is missing its year. (eg, 6-9) So we prepend the current year if the first value is less than the current month. If its after the current month then it must be in the past, so we use the previous year. (since you would never log future work)
		if (argParts.length === 2) {
			const today = new Date()
			let year = parseInt(today.getFullYear())

			if (parseInt(argParts[0]) > today.getMonth() + 1) {
				--year
			}

			return `${year}-${arg}`
		} else {
			return arg
		}
	}

	return chrono.parseDate(arg)
}

module.exports = {
	log,
	createEntryGroup,
	getEntryMeta,
	secondsToHms,
	parseDateArgument,
}
