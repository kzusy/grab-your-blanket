const _ = require('lodash');
const moment = require('moment');
const config = require('./config');
const GoogleCalendar = require('./helpers/google.calendar');
const TemperatureReader = require('./helpers/temperature.reader');
const googleCalendar = new GoogleCalendar();
const temperatureReader = new TemperatureReader();

/*function getMeetings() {
	const now = moment();
	const currentTime = now.toISOString();
	const tenMinutesFromNow = now.clone().add(10, 'm').toISOString();

	return googleCalendar.getMeetingWithinTimeframe(
		config.conferenceRoom.id,
		currentTime,
		tenMinutesFromNow,
		config.timeZone
	);
}

function getTemperature() {
	return temperatureReader.read(config.sensorDeviceId);
}

function outputTemp(meeting, ) {

}

getMeetings()
	.then(function(meetings) {
		if (meetings.length > 0) {
			return getTemperature()
				.then(_.partial());
		}
	})
	.catch(function(err) {

	});*/
