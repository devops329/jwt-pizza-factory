import mysql from 'mysql2/promise';
import config from '../config.js';
import dbModel from './dbModel.js';
import { v4 as uuid } from 'uuid';
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
    if (vendor) {
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

      if (await this.writeVendor(apiKey, vendor)) {
        return vendor;
      }
    }
    return null;
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

  async getApiKeyByNetId(netId) {
    const connection = await this.getConnection();
    try {
      const vendorResult = await this.query(connection, `SELECT apiKey FROM vendor WHERE netId=?`, [netId]);
      if (vendorResult.length === 0) {
        return null;
      }
      return vendorResult[0].apiKey;
    } finally {
      connection.end();
    }
  }

  async query(connection, sql, params) {
    const [results] = await connection.execute(sql, params);
    return results;
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
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.connection.database}`);
        await connection.query(`USE ${config.db.connection.database}`);

        for (const statement of dbModel.tableCreateStatements) {
          await connection.query(statement);
        }
      } finally {
        connection.end();
      }
    } catch (err) {
      console.error(JSON.stringify({ message: 'Error initializing database', exception: err.message, connection: config.db.connection }));
    }
  }
}

const db = new DB();
export default db;
