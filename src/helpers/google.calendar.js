class GoogleCalendar {
	/**
	 * Get the meetings within the next 10 minutes for the given room
	 * 
	 * @param {String} roomId The room id that we want events for
	 * @param {String} startTime Zulu date time string for the start time to look at
	 * @param {String} endTime   Zulu date time string for the end time to look at
	 * @param {String} timeZone  The google timezone string to use
	 * 
	 * @return {Promise} Resolves with a meeting matching the criteria, null if none
	 * found, rejects if there was an error
	 */
	getMeetingWithinTimeframe(roomId, startTime, endTime, timeZone) {

	}

	/**
	 * Update the invite with the given data
	 * 
	 * @param {String} eventId The event id
	 * @param {Object} data    Data to update the invite with
	 * 
	 * @return {Promise} Resolves with the updated data, rejects if there was an error
	 */
	updateInvite(eventId, data) {

	}
}

module.exports = GoogleCalendar;