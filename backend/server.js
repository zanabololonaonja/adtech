require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./config/db');
const logger = require('./utils/logger');
const campaignRoutes = require('./routes/campaign.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Main function to start everything
const start = async () => {
  try {
    const db = await connectDB();
    const campaigns = db.collection('campaigns');

    logger.info('Running migrations...');
    const cursor = campaigns.find({
      $or: [
        { startDate: { $type: "string" } },
        { endDate: { $type: "string" } },
        { budget: { $type: "string" } }
      ]
    });

    let migratedCount = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const updates = {
        startDate: new Date(doc.startDate),
        endDate: new Date(doc.endDate),
        budget: Number(doc.budget),
        impressionsServed: doc.impressionsServed || 0
      };

      if (doc.targetCountries && !Array.isArray(doc.targetCountries)) {
        updates.targetCountries = doc.targetCountries.split(',').map(s => s.trim());
      }

      await campaigns.updateOne(
        { _id: doc._id },
        { $set: updates }
      );
      migratedCount++;
    }
    if (migratedCount > 0) logger.info(`Migrated ${migratedCount} campaigns to correct data types.`);

    // API Routes
    app.use('/', campaignRoutes);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => logger.info(`API listening on port ${PORT}`, { port: PORT }));
  } catch (err) {
    logger.error('Startup error', err);
  }
};

start();

module.exports = app;
