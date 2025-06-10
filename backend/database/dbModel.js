const tableCreateStatements = [
  `CREATE TABLE IF NOT EXISTS auth (
    token VARCHAR(512) PRIMARY KEY
  )`,

  `CREATE TABLE IF NOT EXISTS vendor (
    apiKey VARCHAR(255) PRIMARY KEY,
    netId VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    INDEX(apiKey)
  )`,

  `CREATE TABLE IF NOT EXISTS authCode (
    code VARCHAR(255) PRIMARY KEY,
    netId VARCHAR(255) NOT NULL,
    INDEX(netId)
  )`,
];

module.exports = { tableCreateStatements };
