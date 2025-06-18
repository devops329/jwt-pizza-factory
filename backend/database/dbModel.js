const tableCreateStatements = [
  `CREATE TABLE IF NOT EXISTS auth (
    token VARCHAR(512) PRIMARY KEY
  )`,

  `CREATE TABLE IF NOT EXISTS vendor (
    apiKey VARCHAR(255) PRIMARY KEY,
    netId VARCHAR(255) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    body TEXT NOT NULL,
    INDEX(apiKey)
  )`,

  `CREATE TABLE IF NOT EXISTS chaos (
    netId VARCHAR(255) PRIMARY KEY,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state VARCHAR(64) NOT NULL,
    body TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS connect (
    vendor1 VARCHAR(255) PRIMARY KEY,
    vendor2 VARCHAR(255),
    purpose VARCHAR(64) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(vendor2)
  )`,

  `CREATE TABLE IF NOT EXISTS authCode (
    netId VARCHAR(255) PRIMARY KEY,
    code VARCHAR(255) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(netId)
  )`,
];

module.exports = { tableCreateStatements };
