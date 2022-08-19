require('dotenv').config()
module.exports = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URI: 'http://localhost:3000/callback',
  SCOPE: 'user-read-private user-read-email',
  STATE_KEY: 'spotify_auth_state',
}
