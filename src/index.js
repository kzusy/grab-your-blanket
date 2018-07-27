require('dotenv').config();

const _ = require('lodash');
const moment = require('moment');
const path = require('path');
const config = require('./config');
const GoogleCalendar = require('./helpers/google.calendar');
const TemperatureReader = require('./helpers/temperature.reader');

const googleCalendar = new GoogleCalendar(config.googleCredentials);
const temperatureReader = new TemperatureReader(config.tempUrl);

const INTERVAL_TIME = 5 * 60 * 1000;

const updatedEvents = {};

function getMeetings() {
	const now = moment();
	const currentTime = now.toISOString();
	const tenMinutesFromNow = now.clone().add(10, 'm').toISOString();

	return googleCalendar.getMeetingWithinTimeframe(
		currentTime,
		tenMinutesFromNow,
		config.timeZone
	);
}

function getTemperature() {
	return temperatureReader.getTemperature();
}

function outputTemp(meetings, temp) {
	console.log(`current temp in meeting room is ${temp}`);
	
	let promise = Promise.resolve();

	_.each(meetings, (meeting) => {
		if (!updatedEvents[meeting.id]) {
			promise = promise.then(() => {
				return googleCalendar.updateEvent(meeting, temp)
					.then(function() {
						updatedEvents[meeting.id] = true;
					});
			});
		}
	});

	return promise;
}

function updateMeetingInvites() {
	return getMeetings()
		.then(function(meetings) {
			if (meetings.length > 0) {
				return getTemperature()
					.then(_.partial(outputTemp, meetings));
			}

			console.log('No meetings... Skipping');
		})
		.then(function(res) {
			console.log('Finished updating');
		})
		.catch(function(err) {
			console.error(`Unexpected error: ${err}`);
		});
}

googleCalendar.authenticate(path.join(process.cwd(), 'authtoken'))
	.then(function() {
		updateMeetingInvites();

		setInterval(updateMeetingInvites, INTERVAL_TIME);
	});
