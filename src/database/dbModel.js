const tableCreateStatements = [
  `CREATE TABLE IF NOT EXISTS auth (
    token VARCHAR(512) PRIMARY KEY
  )`,

  `CREATE TABLE IF NOT EXISTS vendor (
    apiKey VARCHAR(255) PRIMARY KEY,
    body TEXT NOT NULL,
    INDEX(apiKey)
  )`,
];

export default { tableCreateStatements };
