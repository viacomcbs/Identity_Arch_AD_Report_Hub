const fs = require('fs');
const path = require('path');

function readDomainsConfig() {
  const configPath = path.join(__dirname, '../config/domains.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw);
}

// Returns the forest object whose root matches or is an ancestor of domainName
function getForestForDomain(domainName) {
  if (!domainName) return null;
  const cfg = readDomainsConfig();
  const forests = cfg?.forests || [];
  const normalized = domainName.toLowerCase().trim();
  for (const forest of forests) {
    const root = forest.root.toLowerCase();
    if (normalized === root || normalized.endsWith('.' + root)) {
      return forest;
    }
  }
  return null;
}

function getForestNameForDomain(domainName) {
  return getForestForDomain(domainName)?.id || null;
}

module.exports = {
  readDomainsConfig,
  getForestForDomain,
  getForestNameForDomain,
};
