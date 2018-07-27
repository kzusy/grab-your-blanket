module.exports = {
	tempUrl: process.env.TEMP_URI,

	timeZone: 'America/New_York',

	googleCredentials: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  	clientSecret:process.env.GOOGLE_SECRET_ID,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
	}
};