const fs = require('fs');
const { connect, placeBet, onResult } = require('./services/rouletteClient');
const { getSecurityToken, getMetaData } = require('./services/authClient');

let { bets } = require('./bets.json');
let { currentBetIndex } = require('./betCache.json');

onResult(function(result) {
  console.log(result);
  console.log('Result:', result.coin);
  if (result.coin !== 'bonus') {
    currentBetIndex++;
  } else {
    console.log("WON!");
    currentBetIndex = 0;
  }

  fs.writeFileSync('./betCache.json', JSON.stringify({ currentBetIndex }));

  setTimeout(() => {
    placeBet('bonus', bets[currentBetIndex], result.nextRound);
  }, 15000);
});

(async function () {
  console.log("Getting meta data...");
  const metaData = await getMetaData();

  console.log("Getting security token...");
  const securityToken = await getSecurityToken();
  
  console.log("Connecting...");
  connect(metaData, securityToken);
})();