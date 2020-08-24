const prompt = require('prompt')
const chalk = require('chalk')

const schema = {
	properties: {
		token: {
			description: chalk.magenta('Enter your Tempo API token'),
			type: 'string',
			required: true,
		},
	},
}

module.exports = () => {
	prompt.start()

	return new Promise((resolve) => {
		prompt.get(schema, (err, result) => resolve(result))
	})
}
