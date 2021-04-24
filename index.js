const fs = require('fs');
const { connect, placeBet, onResult, onDisconnected } = require('./services/rouletteClient');
const { getSecurityToken, getMetaData } = require('./services/authClient');

let { bets } = require('./bets.json');
let { currentBetIndex } = require('./betCache.json');

const MULTIPLIER = 2;

onDisconnected(function() {
  process.exit(1);
});

onResult(function(result) {
  console.log('Result:', result.coin);
  if (result.coin !== 'bonus') {
    currentBetIndex++;
  } else {
    console.log("WON!");
    currentBetIndex = 0;
  }

  fs.writeFileSync('./betCache.json', JSON.stringify({ currentBetIndex }));

  setTimeout(() => {
    placeBet('bonus', bets[currentBetIndex] * MULTIPLIER, result.nextRound);
  }, 15000);
});

async function run() {
  console.log("Getting meta data...");
  const metaData = await getMetaData();

  console.log("Getting security token...");
  const securityToken = await getSecurityToken();
  
  console.log("Connecting...");
  connect(metaData, securityToken);
}

run();