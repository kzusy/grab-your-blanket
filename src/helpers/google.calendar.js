const fs = require('fs');
const google = require('googleapis').google;
const readline = require('readline');

const CALENDAR_VERSION = 'v3';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function getSavedToken(tokenFile) {
	return new Promise((resolve, reject) => {
		fs.readFile(tokenFile, (err, token) => {
			if (err) {
				if (err.code === 'ENOENT') {
					resolve();
					return;
				}

				reject(err);
				return;
			}

			try {
				resolve(JSON.parse(token));
			} catch (e) {
				reject(e);
			}
		})
	});
}

function saveToken(token, tokenFile) {
	return new Promise((resolve, reject) => {
		fs.writeFile(tokenFile, JSON.stringify(token), (err) => {
			if (err) {
				reject(err);
				return;
			}

			resolve();
		});
	});
}

function getAccessToken(authClient) {
	return new Promise((resolve, reject) => {
		const authUrl = authClient.generateAuthUrl({
			scope: SCOPES
		});

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		console.log('Authorize this app by visiting this url: ' + authUrl);

		rl.question('Enter the code from that page here: ', (code) => {
			rl.close();

			authClient.getToken(code, (err, token) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(token);
			});
		});
	});
}

function getSummaryMessageForTemp(temp) {
	if (temp < 70) {
		return `(${formatTemp(temp)} - GYB!)`;
	}

	return `(${formatTemp(temp)})`;
}

function getSummary(summary, temp) {
	return `${summary} ${getSummaryMessageForTemp(temp)}`;
}

function getDescMessageForTemp(temp) {
	if (temp < 70) {
		return 'Grab your blanket!';
	}

	if (temp > 75) {
		return `It's going to be a hot one...`;
	}

	return 'Looking good!';
}

function formatTemp(temp) {
	return `${temp}F`;
}

function getDescription(description, temp) {
	description = description || '';

	if (description) {
		description += '\n\n';
	}

	return `${description}${formatTemp(temp)} - ${getDescMessageForTemp(temp)}`;
}

class GoogleCalendar {
	constructor(credentials) {
		this.authClient = new google.auth.OAuth2(
			credentials.clientId,
			credentials.clientSecret,
			credentials.redirectUri
		);
	}

	authenticate(tokenFile) {
		let _token;

		return getSavedToken(tokenFile)
			.then((token) => {
				if (token) {
					this.authClient.setCredentials(token);
					return;
				}

				return getAccessToken(this.authClient)
					.then((token) => {
						this.authClient.setCredentials(token);

						return saveToken(token, tokenFile);
					});
			});
	}

	getCalendar() {
		return google.calendar({
			version: CALENDAR_VERSION,
			auth: this.authClient
		});
	}

	/**
	 * Get the meetings within the next 10 minutes for the given room
	 * 
	 * @param {String} startTime Zulu date time string for the start time to look at
	 * @param {String} endTime   Zulu date time string for the end time to look at
	 * @param {String} timeZone  The google timezone string to use
	 * 
	 * @return {Promise} Resolves with a meeting matching the criteria, null if none
	 * found, rejects if there was an error
	 */
	getMeetingWithinTimeframe(startTime, endTime, timeZone) {
		return new Promise((resolve, reject) => {
			const calendar = this.getCalendar();
			calendar.events.list({
				calendarId: 'ehconferenceroom@gmail.com',
				timeMin: startTime,
				timeMax: endTime,
				timeZone: timeZone,
				singleEvents: true,
				orderBy: 'startTime'
			}, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(res.data.items);
			});
		});
	}

	/**
	 * Update the invite with the given data
	 * 
	 * @param {String} eventId The event id
	 * @param {String} temp    The temperature data to update the event with
	 * 
	 * @return {Promise} Resolves with the updated data, rejects if there was an error
	 */
	updateEvent(event, temp) {
		console.log('updating event: ' + event.summary);

		return new Promise((resolve, reject) => {
			const calendar = this.getCalendar();

			return calendar.events.patch({
				calendarId: 'primary',
				eventId: event.id,
				resource: {
					summary: getSummary(event.summary, temp),
					description: getDescription(event.description, temp)
				}
			}, (err, res) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(res);
			});
		});
	}
}

module.exports = GoogleCalendar;