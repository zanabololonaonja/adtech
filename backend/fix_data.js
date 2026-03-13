const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function fixData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const campaigns = db.collection('campaigns');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 7);
    
    // Update LORA to be active
    const result = await campaigns.updateOne(
      { name: 'LORA' },
      { 
        $set: { 
          startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24), // Hier
          endDate: tomorrow,
          budget: 500,
          status: 'active'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('Updated LORA campaign to be active.');
    } else {
      console.log('LORA campaign not found.');
      // Update any FR campaign
      await campaigns.updateOne(
        { targetCountries: 'FR' },
        { 
          $set: { 
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24),
            endDate: tomorrow,
            budget: 1000,
            status: 'active'
          } 
        }
      );
      console.log('Updated an arbitrary FR campaign to be active.');
    }
  } finally {
    await client.close();
  }
}

fixData();
