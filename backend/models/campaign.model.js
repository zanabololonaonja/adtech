const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

class Campaign {
  static getCollection() {
    return getDB().collection('campaigns');
  }

  static async find(query = {}) {
    return await this.getCollection().find(query).toArray();
  }

  static async findOne(query = {}) {
    return await this.getCollection().findOne(query);
  }

  static async insertOne(data) {
    return await this.getCollection().insertOne(data);
  }

  static async updateOne(query, update) {
    return await this.getCollection().updateOne(query, update);
  }
}

module.exports = Campaign;
