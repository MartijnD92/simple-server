/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
  let text = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  _loop(length, _ => {
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  })
  return text
}

const _loop = (times, callback) => {
  for (let i = 0; i < times; i++) {
    callback(i)
  }
}

module.exports = { generateRandomString }
