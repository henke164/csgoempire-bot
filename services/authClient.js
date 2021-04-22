const fetch = require('node-fetch');
const credentials = require('../credentials.json');

async function getSecurityToken() {
  const res = await fetch('https://csgoempire.com/api/v2/user/security/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
      ...credentials
    },
    body: JSON.stringify({
      code: "0000",
      uuid: credentials['x-empire-device-identifier']
    })
  });

  const metaData = await res.json();
  return metaData.token;
}

async function getMetaData() {
  const res = await fetch('https://csgoempire.com/api/v2/metadata', {
    headers: {
      'content-type': 'application/json',
      'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
      ...credentials
    }
  });

  const metaData = await res.json();
  return metaData;
}

module.exports = {
  getMetaData,
  getSecurityToken,
};