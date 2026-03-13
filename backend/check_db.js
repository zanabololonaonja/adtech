const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const campaigns = await db.collection('campaigns').find().toArray();
    console.log('--- Campaigns ---');
    campaigns.forEach(c => {
      console.log({
        id: c._id,
        name: c.name,
        advertiser: c.advertiser,
        status: c.status,
        startDate: c.startDate,
        startDateType: typeof c.startDate,
        endDate: c.endDate,
        endDateType: typeof c.endDate,
        budget: c.budget,
        budgetType: typeof c.budget,
        targetCountries: c.targetCountries,
        impressionsServed: c.impressionsServed
      });
    });
    console.log('--- End ---');
  } finally {
    await client.close();
  }
}

checkDB();
