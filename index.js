const password = 'yuler'
const token = 'va_U1EeGXCNzpoBxpeTy'

const { send, json } = require('micro')
const crypto = require('crypto')
const fetch = require('node-fetch')

module.exports = async (req, res) => {
	const signature = req.headers['x-gogs-signature']
	if (!signature) {
    return send(res, 401, 'Unauthorized')
  }

  const computedSignature = crypto.createHmac('sha256', password)
    .update(JSON.stringify(await json(req), null, 2))
    .digest('hex')
  
  if (signature !== computedSignature) {
    return send(res, 401, 'Unauthorized')
  }

  const matcher = /^\/(\d+)/.exec(req.url)
  if (!matcher) { 
    return send(res, 404, 'Not Found')
  }

  const projectId = matcher[1]
  const headers = { 'Private-Token': token }
  const response = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/mirror/pull`, {
    method: 'POST',
    headers
  })
  return await response.json()
}
