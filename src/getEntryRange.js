const prompt = require('prompt')
const chalk = require('chalk')
const { format, eachDayOfInterval } = require('date-fns')

const schema = {
	properties: {
		date: {
			description: chalk.magenta('Which day of worklogs should I ingest? eg (2020-03-17)'),
			type: 'string',
			required: true,
			default: format(new Date(), 'yyyy-MM-dd'),
		},
	},
}

module.exports = ({ date, start, end }) => {
	console.log(date, start, end)
	return new Promise((resolve) => {
		if (!date && !start && !end) {
			// The user hasn't provided any CLI arguments so prompt for input
			prompt.start()
			prompt.get(schema, (err, result) => resolve([new Date(result.date)]))
		} else {
			resolve(start ? eachDayOfInterval({ start, end }) : [date])
		}
	})
}
