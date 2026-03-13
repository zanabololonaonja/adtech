const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let db = null;

const connectDB = async () => {
  if (db) return db;
  try {
    const client = await MongoClient.connect(uri);
    db = client.db(dbName);
    logger.info('Connected to MongoDB successfully', { dbName });
    return db;
  } catch (err) {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
