const Axios = require('axios')
const { log } = require('./utils')

const API_URL = 'https://www.toggl.com/api/v8/'

class Toggl {
	constructor() {
		this.apiToken = undefined
	}

	init({ apiToken }) {
		this.apiToken = apiToken
	}

	async getTimeEntries({ startTime, endTime }) {
		const buff = Buffer.from(`${this.apiToken}:api_token`)
		const key = buff.toString('base64')

		const { data } = await Axios.get(`https://www.toggl.com/api/v8/time_entries`, {
			params: {
				start_date: startTime.toISOString(),
				end_date: endTime.toISOString(),
			},
			headers: {
				Authorization: `Basic ${key}`,
			},
		})

		return data.map(({ id, guid, start, stop, duration, description }) => ({
			id,
			guid,
			start,
			stop,
			duration,
			description,
		}))
	}

	async authenticate(email, password) {
		try {
			const { data } = await Axios.get(`${API_URL}/me`, {
				auth: {
					username: email,
					password,
				},
			}).then(({ data }) => data)

			log.success(`Authenticated with API Key ${data.api_token}`)

			this.apiToken = data.api_token

			return data.api_token
		} catch (error) {
			log.error('Failed to authenticate')
			return false
		}
	}
}

module.exports = Toggl
