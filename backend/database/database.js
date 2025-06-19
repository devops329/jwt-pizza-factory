const mysql = require('mysql2/promise');
const config = require('../config');
const dbModel = require('./dbModel');

class DB {
  constructor() {
    this.initialized = this.initializeDatabase();
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

  async addVendor(vendor) {
    const connection = await this.getConnection();
    try {
      await this.query(connection, `INSERT INTO vendor (apiKey, netId, body) VALUES (?, ?, ?)`, [vendor.apiKey, vendor.id, JSON.stringify(vendor)]);
    } finally {
      connection.end();
    }
  }

  async updateVendor(vendor, changes) {
    if (!vendor) {
      return null;
    }
    if (changes && Object.keys(changes).length > 0) {
      for (const key in changes) {
        if (changes[key] === null) {
          delete vendor[key];
        } else {
          vendor[key] = changes[key];
        }
      }

      await this.writeVendor(vendor.apiKey, vendor);
    }
    return this.getVendorByNetId(vendor.id);
  }

  async updateVendorByApiKey(apiKey, changes) {
    const vendor = await this.getVendorByApiKey(apiKey);
    return this.updateVendor(vendor, changes);
  }

  async updateVendorByNetId(netId, changes) {
    const vendor = await this.getVendorByNetId(netId);
    return this.updateVendor(vendor, changes);
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

  async getVendors() {
    const connection = await this.getConnection();
    try {
      const result = await this.query(connection, `SELECT body FROM vendor`);
      const vendors = [];
      for (const row of result) {
        const vendor = JSON.parse(row.body);
        vendors.push(await this.joinVendorInfo(vendor));
      }
      return vendors;
    } finally {
      connection.end();
    }
  }

  async getVendorByApiKey(apiKey) {
    return this.getVendorWithQuery(`SELECT body FROM vendor WHERE apiKey=?`, [apiKey]);
  }

  async getVendorByNetId(netId) {
    return this.getVendorWithQuery(`SELECT body FROM vendor WHERE netId=?`, [netId]);
  }

  async getVendorWithQuery(query, params) {
    const connection = await this.getConnection();
    try {
      const vendorResult = await this.query(connection, query, params);
      if (vendorResult.length === 0) {
        return null;
      }
      const vendor = JSON.parse(vendorResult[0].body);
      return this.joinVendorInfo(vendor);
    } finally {
      connection.end();
    }
  }

  async joinVendorInfo(vendor) {
    const chaos = await this.getChaosByNetId(vendor.id);
    if (chaos) {
      vendor.chaos = chaos;
    }
    vendor.roles = await this.getRoles(vendor.id);
    return vendor;
  }

  async getChaosByNetId(netId) {
    const connection = await this.getConnection();
    try {
      const chaosResult = await this.query(connection, `SELECT body FROM chaos WHERE netId=?`, [netId]);
      if (chaosResult.length === 0) {
        return null;
      }
      return JSON.parse(chaosResult[0].body);
    } finally {
      connection.end();
    }
  }

  async addChaos(netId, chaos) {
    const connection = await this.getConnection();
    try {
      await this.query(connection, `INSERT INTO chaos (netId, state, body) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE body = VALUES(body)`, [netId, chaos.type, JSON.stringify(chaos)]);
    } finally {
      connection.end();
    }
  }

  async removeChaos(netId) {
    const connection = await this.getConnection();
    try {
      const chaos = await this.getChaosByNetId(netId);
      chaos.type = 'none';
      delete chaos.fixCode;
      chaos.fixDate = new Date().toISOString();
      await this.query(connection, `UPDATE chaos SET state=?, body=? WHERE netId=?`, ['none', JSON.stringify(chaos), netId]);
    } finally {
      connection.end();
    }
  }

  async requestVendorConnection(vendor, purpose) {
    const connection = await this.getConnection();

    try {
      // Make sure the vendor is marked as wanting a connection
      if (!vendor.connections || !vendor.connections[purpose]) {
        await this.query(connection, `INSERT INTO connect (vendor1, vendor2, purpose) VALUES (?, ?, ?)`, [vendor.id, null, purpose]);
        vendor = await this.updateVendorConnection(vendor.id, purpose, null);
      }

      await connection.beginTransaction();
      try {
        // If no connection yet then try to find one
        if (vendor.connections && vendor.connections[purpose] && !vendor.connections[purpose].id) {
          const openVendors = await this.query(connection, `SELECT vendor1 FROM connect WHERE vendor1 != ? AND vendor2 IS NULL AND purpose=?`, [vendor.id, purpose]);
          if (openVendors.length > 0) {
            const connectedVendorId = openVendors[0].vendor1;
            await this.query(connection, `UPDATE connect SET vendor2=? WHERE vendor1=?`, [vendor.id, connectedVendorId]);
            await this.query(connection, `UPDATE connect SET vendor2=? WHERE vendor1=?`, [connectedVendorId, vendor.id]);

            vendor = await this.updateVendorConnection(vendor.id, purpose, connectedVendorId);
            await this.updateVendorConnection(connectedVendorId, purpose, vendor.id);

            await connection.commit();
            return vendor;
          }
        }
        await connection.rollback();
        return vendor;
      } catch (err) {
        await connection.rollback();
        throw err;
      }
    } finally {
      connection.end();
    }
  }

  async updateVendorConnection(vendorId, purpose, connectedVendorId) {
    const vendor = await this.getVendorByNetId(vendorId);
    const connections = vendor.connections || {};
    connections[purpose] = { id: null, purpose };
    if (connectedVendorId) {
      const connectedVendor = await this.getVendorByNetId(connectedVendorId);
      if (connectedVendor) {
        connections[purpose] = {
          id: connectedVendor.id,
          name: connectedVendor.name,
          phone: connectedVendor.phone,
          email: connectedVendor.email,
          website: connectedVendor.website,
          purpose,
        };
      }
    }
    return this.updateVendorByNetId(vendor.id, { connections });
  }

  async assignRole(netId, role, add) {
    const connection = await this.getConnection();
    try {
      if (add) {
        await connection.query(`INSERT INTO role (netId, role) VALUES (?, ?) ON DUPLICATE KEY UPDATE netId=netId`, [netId, role]);
      } else {
        await connection.query(`DELETE FROM role WHERE netId=? AND role=?`, [netId, role]);
      }
    } finally {
      connection.end();
    }
  }

  async getRoles(netId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.query(`SELECT role FROM role WHERE netId=?`, [netId]);
      const roles = [];
      for (const row of result[0]) {
        roles.push(row.role);
      }
      roles.push('vendor');
      return roles;
    } finally {
      connection.end();
    }
  }

  async verifyRole(netId, role) {
    const connection = await this.getConnection();
    try {
      const result = await connection.query(`SELECT role FROM role where netId=? AND role=?`, [netId, role]);
      return result[0].length > 0;
    } finally {
      connection.end();
    }
  }

  async deleteVendor(netId) {
    const connection = await this.getConnection();
    try {
      await connection.query(`DELETE FROM vendor WHERE netId=?`, [netId]);
      await connection.query(`DELETE FROM authCode WHERE netId=?`, [netId]);
      await connection.query(`DELETE FROM connect WHERE vendor1=? OR vendor2=?`, [netId, netId]);
      await connection.query(`DELETE FROM chaos WHERE netId=?`, [netId]);
      await connection.query(`DELETE FROM role WHERE netId=?`, [netId]);
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
          if (config.defaultAdmin?.id) {
            this.addVendor({ ...config.defaultAdmin, apiKey: Math.random().toString(36).substring(2, 18) });
            this.assignRole(config.defaultAdmin.id, 'admin');
          }
        }
      } finally {
        connection.end();
      }
    } catch (err) {
      console.error(
        JSON.stringify({
          message: 'Error initializing database',
          exception: err.message,
          connection: config.db.connection,
        })
      );
    }
  }

  async checkDatabaseExists(connection) {
    const [rows] = await connection.execute(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [config.db.connection.database]);
    return rows.length > 0;
  }
}

const db = new DB();
module.exports = db;
