const mysql = require('mysql2/promise');
const config = require('../config');
const dbModel = require('./dbModel');
const { v4: uuid } = require('uuid');
class DB {
  constructor() {
    this.initialized = this.initializeDatabase();
  }

  async verifyAuthToken(authToken) {
    const connection = await this.getConnection();
    try {
      const authResult = await this.query(connection, `SELECT * FROM auth WHERE token=?`, [authToken]);
      return authResult.length > 0;
    } finally {
      connection.end();
    }
  }

  async addAuthCode(id, authCode) {
    const connection = await this.getConnection();
    try {
      await this.query(
        connection,
        `INSERT INTO authCode (code, netId) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE code = VALUES(code)`,
        [authCode, id]
      );
    } finally {
      connection.end();
    }
  }

  async validateAuthCode(id, authCode) {
    const connection = await this.getConnection();
    try {
      const validateRes = await this.query(connection, `SELECT code FROM authCode WHERE netId=?`, [id]);
      return validateRes.length > 0 && validateRes[0].code === authCode;
    } finally {
      connection.end();
    }
  }

  async addVendor(apiKey, netId, vendor) {
    const connection = await this.getConnection();
    try {
      await this.query(connection, `INSERT INTO vendor (apiKey, netId, body) VALUES (?, ?, ?)`, [apiKey, netId, JSON.stringify(vendor)]);
    } finally {
      connection.end();
    }
  }

  async updateVendor(apiKey, changes) {
    const vendor = await this.getVendorByApiKey(apiKey);
    if (vendor && changes && Object.keys(changes).length > 0) {
      for (const key in changes) {
        if (changes[key] === null) {
          delete vendor[key];
        } else {
          vendor[key] = changes[key];
        }
      }

      if (changes.chaos && changes.chaos.type !== 'none') {
        vendor.chaos.fixCode = uuid().replace(/-/g, '');
        vendor.chaos.errorDate = new Date().toISOString();
      }

      await this.writeVendor(apiKey, vendor);
    }
    return vendor;
  }

  async writeVendor(apiKey, vendor) {
    const connection = await this.getConnection();
    try {
      const result = await this.query(connection, `UPDATE vendor SET body=? WHERE apiKey=?`, [JSON.stringify(vendor), apiKey]);
      return result.affectedRows > 0;
    } finally {
      connection.end();
    }
  }

  async getVendorByApiKey(apiKey) {
    const connection = await this.getConnection();
    try {
      const vendorResult = await this.query(connection, `SELECT body FROM vendor WHERE apiKey=?`, [apiKey]);
      if (vendorResult.length === 0) {
        return null;
      }
      return JSON.parse(vendorResult[0].body);
    } finally {
      connection.end();
    }
  }

  async getVendorByNetId(netId) {
    const connection = await this.getConnection();
    try {
      const vendorResult = await this.query(connection, `SELECT body FROM vendor WHERE netId=?`, [netId]);
      if (vendorResult.length === 0) {
        return null;
      }
      return JSON.parse(vendorResult[0].body);
    } finally {
      connection.end();
    }
  }

  async query(connection, sql, params) {
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (err) {
      console.error(`Error executing SQL: ${sql} with params: ${JSON.stringify(params)}. Error: ${err.message}`);
      throw err;
    }
  }

  async getConnection() {
    // Make sure the database is initialized before trying to get a connection.
    await this.initialized;
    return this._getConnection();
  }

  async _getConnection(setUse = true) {
    const connection = await mysql.createConnection({
      host: config.db.connection.host,
      user: config.db.connection.user,
      password: config.db.connection.password,
      connectTimeout: config.db.connection.connectTimeout,
      decimalNumbers: true,
    });
    if (setUse) {
      await connection.query(`USE ${config.db.connection.database}`);
    }
    return connection;
  }

  async initializeDatabase() {
    try {
      const connection = await this._getConnection(false);
      try {
        const dbExists = await this.checkDatabaseExists(connection);

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.connection.database}`);
        await connection.query(`USE ${config.db.connection.database}`);

        for (const statement of dbModel.tableCreateStatements) {
          await connection.query(statement);
        }

        if (!dbExists) {
          console.log('Database created');
          const adminAuth = require('crypto').randomBytes(64).toString('hex');
          await connection.query(`INSERT INTO auth (token) VALUES (?)`, [adminAuth]);
        }
      } finally {
        connection.end();
      }
    } catch (err) {
      console.error(JSON.stringify({ message: 'Error initializing database', exception: err.message, connection: config.db.connection }));
    }
  }

  async checkDatabaseExists(connection) {
    const [rows] = await connection.execute(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [config.db.connection.database]);
    return rows.length > 0;
  }

  async createAdminAuthToken() {
    const connection = await this.getConnection();
    try {
      const token = require('crypto').randomBytes(64).toString('hex');
      await connection.query(`INSERT INTO auth (token) VALUES (?)`, [token]);
      return token;
    } finally {
      connection.end();
    }
  }

  async deleteAdminAuthToken(token) {
    const connection = await this.getConnection();
    try {
      await connection.query(`DELETE FROM auth WHERE token=?`, [token]);
    } finally {
      connection.end();
    }
  }
}

const db = new DB();
module.exports = db;
