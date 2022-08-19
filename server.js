const express = require('express')
const request = require('request')
var cors = require('cors')
var querystring = require('querystring')
var cookieParser = require('cookie-parser')
const config = require('./config')
const helpers = require('./helpers')

const client_id = config.CLIENT_ID
const client_secret = config.CLIENT_SECRET
const redirect_uri = config.REDIRECT_URI
const stateKey = config.STATE_KEY
const scope = config.SCOPE

const app = express()
const port = 3000

app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser())

/*****************
    ROOT
*****************/
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

/*****************
    LOGIN
*****************/
app.get('/login', (req, res) => {
  const state = helpers.generateRandomString(16)
  res.cookie(stateKey, state)

  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id,
        scope,
        redirect_uri,
        state,
      })
  )
})

/*****************************
    CALLBACK + ACCESS TOKEN 
******************************/
app.get('/callback', (req, res) => {
  const code = req.query.code || null
  const state = req.query.state || null
  const storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        new URLSearchParams({
          error: 'state_mismatch',
        })
    )
  } else {
    res.clearCookie(stateKey)
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    }

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token
        const refresh_token = body.refresh_token

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: `Bearer ${access_token}` },
          json: true,
        }

        request.get(options, (error, response, body) => {
          
        })

        res.redirect(
          '/#' +
            new URLSearchParams({
              access_token,
              refresh_token,
            })
        )
      } else {
        res.redirect(
          '/#' +
            new URLSearchParams({
              error: 'invalid_token',
            })
        )
      }
    })
  }
})

/********************
    REFRESH TOKEN 
*********************/
app.get('/refresh_token', (req, res) => {
  const refresh_token = req.query.refresh_token
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token,
    },
    json: true,
  }

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token
      res.send({
        access_token,
      })
    }
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
