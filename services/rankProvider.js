function getRank(level) {
  if (level <= 19) {
    return "rust";
  }
  
  if (level <= 39) {
    return "bronze";
  }
  
  if (level <= 59) {
    return "silver";
  }

  if (level <= 79) {
    return "gold";
  }

  if (level <= 99) {
    return "diamond";
  }
  
  if (level < 120) {
    return "uranium";
  }
  
  return "unbreakable";
}

module.exports = {
  getRank,
}