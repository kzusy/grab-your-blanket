const request = require('request');

class TemperatureReader {
	constructor(url) {
		this.url = url;
	}

	/**
	 * Get the most recent temperature for the device id
	 * @return {Promise} Resolve with the temperature, reject if there was an error
	 */
	getTemperature(deviceId) {
		return new Promise((resolve, reject) => {
			request(this.url, (err, response, body) => {
				if (err) {
					reject(err);
					return;
				}

				try {
					const res = JSON.parse(body);
					const temp = Math.floor(res[0].payload.d.ambientTemp);
					resolve(temp)
				} catch(e) {
					reject(e);
				}
			})
		});
	}
}

module.exports = TemperatureReader;