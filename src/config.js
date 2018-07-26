module.exports = {
	/**
	 * The device id for the temperature sensor that we're using
	 * @type {String}
	 */
	sensorDeviceId: process.env.SENSOR_DEVICE_ID,

	/**
	 * The conference room id for google calendar
	 * @type {String}
	 */
	conferenceRoom: {
		id: process.env.CONFERENCE_ROOM_ID
	},

	timeZone: 'America/New_York'
};