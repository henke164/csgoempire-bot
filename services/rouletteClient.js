const { getRank } = require('./rankProvider');
const credentials = require('../credentials.json');

let sid = "";
let joined = false;
let onResultCallback;
let onDisconnectedCallback;
let connection;
let authenticated = false;

let reconnectAt;
let securityToken;
let meta;

function identify() {
  var identificationObj = {
    authorizationToken: meta.socket_token,
    model: meta.user,
    signature: meta.socket_signature,
    uid: meta.user.id,
    uuid: credentials['x-empire-device-identifier']
  };

  console.log("Identifying...");
  connection.sendUTF(`42/roulette,["identify",${JSON.stringify(identificationObj)}]`);
}

function ping() {
  connection.sendUTF('2');
  setTimeout(ping, 60000);
}

function placeBet(coin, amount, round) {
  if (!authenticated) {
    console.log("Not authenticated!");
    return;
  }

  const { user } = meta;

  const betObj = {
    amount,
    avatar: user.avatar,
    coin,
    lvl: user.level,
    name: user.steam_name,
    rank: getRank(user.level),
    round,
    security_token: securityToken,
    steam_name: user.steam_name,
    ts: Date.now(),
    uid: user.id,
    user_id: user.id
  };

  console.log(`Betting ${amount} on ${coin}`);
  connection.sendUTF(`42/roulette,["place bet",${JSON.stringify(betObj)}]`);

  if (Date.now() > reconnectAt && onDisconnectedCallback) {
    onDisconnectedCallback();
  }
}

function onResult(callback) {
  onResultCallback = callback;
}

function onDisconnected(callback) {
  onDisconnectedCallback = callback;
}

function handleRoulettePackage(key, value) {
  if (key === 'roll' && onResultCallback) {
    onResultCallback(value);
  }

  if (key === 'init') {
    if (!authenticated) {
      identify();
    } else {
      console.log("Socket successfully authenticated!");
    }
    authenticated = value.authenticated;
  }
}

function connect(metaData, token) {
  meta = metaData;
  securityToken = token;

  const WebSocketClient = require('websocket').client;

  const client = new WebSocketClient();

  client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
  });
  
  client.on('connect', function (conn) {
    connection = conn;
  
    console.log('Client Connected');
  
    connection.on('error', function (error) {
      console.log("Connection Error: " + error.toString());
    });
  
    connection.on('close', function () {
      console.log('Connection Closed');
      if (onDisconnectedCallback) {
        onDisconnectedCallback();
      }
    });
  
    connection.on('message', function (message) {
      var resp = message.utf8Data;
      if (!sid) {
        var json = JSON.parse(resp.substr(1, resp.length - 1));
        sid = json.sid;
        console.log(sid);
      }
  
      if (!joined) {
        joined = true;
        connection.sendUTF('40/roulette,');
      }
  
      if (resp.indexOf('42/roulette,') === 0) {
        const package = JSON.parse(resp.replace('42/roulette,', ''));
        handleRoulettePackage(package[0], package[1]);
      }
    });
  
    ping();
  });
  
  client.connect('wss://roulette.csgoempire.com/s/?EIO=3&transport=websocket', 'echo-protocol', 'https://csgoempire.com', {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
    'Host': 'roulette.csgoempire.com'
  });

  reconnectAt = Date.now() + 60000 * 5;
}

module.exports = {
  connect,
  placeBet,
  onResult,
  onDisconnected,
}