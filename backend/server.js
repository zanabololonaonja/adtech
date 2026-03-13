require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
let db, campaigns;

MongoClient.connect(uri)
  .then(async client => {
    db = client.db(dbName);
    campaigns = db.collection('campaigns');

    console.log('Connected to MongoDB. Running migrations...');
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
    if (migratedCount > 0) console.log(`Migrated ${migratedCount} campaigns to correct data types.`);

    app.listen(3001, () => console.log('API listening on port 3001'));
  })
  .catch(err => console.error('MongoDB connection error:', err));


function getStatus(campaign) {
  const now = new Date();
  if (campaign.status === 'paused') return 'paused';

  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);

  if (now < start) return 'paused';
  if (now > end) return 'ended';
  if (Number(campaign.budget) < 10) return 'ended';

  return 'active';
}

app.post('/campaigns', async (req, res) => {
  try {
    const { name, advertiser, startDate, endDate, budget, targetCountries } = req.body;

    if (!name || !advertiser || !startDate || !endDate || !budget || !targetCountries) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const campaign = {
      name,
      advertiser,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: Number(budget),
      impressionsServed: 0,
      targetCountries: Array.isArray(targetCountries) ? targetCountries : [targetCountries]
    };


    campaign.status = getStatus(campaign);

    const result = await campaigns.insertOne(campaign);
    res.status(201).json({ ...campaign, id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating campaign' });
  }
});


// 2. GET /campaigns
app.get('/campaigns', async (req, res) => {
  const { status, advertiser, country } = req.query;

  const query = {};
  if (advertiser) query.advertiser = advertiser;
  if (country) query.targetCountries = { $in: [country] };

  let list = await campaigns.find(query).toArray();

  let campaignsWithStatus = list.map(c => ({
    ...c,
    status: getStatus(c),
    id: c._id.toString(),
    budget: Number(c.budget),
    impressionsServed: c.impressionsServed || 0
  }));

  // Filtrer par statut si demandé (car le statut est dynamique)
  if (status) {
    campaignsWithStatus = campaignsWithStatus.filter(c =>
      c.status.toLowerCase() === status.toLowerCase()
    );
  }

  res.json(campaignsWithStatus);
});

app.post('/serve-ad', async (req, res) => {
  try {
    const { country, campaignId } = req.body;


    const now = new Date();
    const query = {
      status: { $ne: 'paused' },
      startDate: { $lte: now },
      endDate: { $gte: now },
      budget: { $gte: 10 },
    };

    if (campaignId) {
      query._id = new ObjectId(campaignId);
    } else if (country) {
      query.targetCountries = country;
    } else {
      return res.status(400).json({ error: 'Country or CampaignId required' });
    }

    const campaign = await campaigns.findOne(query);

    if (!campaign) {
      console.log(`No eligible campaign found for query: ${JSON.stringify(query)} at ${now.toISOString()}`);
      return res.status(404).json({ error: 'No eligible campaign (insufficient budget or inactive)' });
    }

    await campaigns.updateOne(
      { _id: campaign._id },
      { $inc: { impressionsServed: 1, budget: -10 } }
    );

    const updatedCampaign = await campaigns.findOne({ _id: campaign._id });
    res.json({
      ...updatedCampaign,
      id: updatedCampaign._id.toString(),
      status: getStatus(updatedCampaign)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during ad serving' });
  }
});

// 4. GET /stats
app.get('/stats', async (req, res) => {
  const all = await campaigns.find().toArray();
  const totalCampaigns = all.length;
  const activeCampaigns = all.filter(c => getStatus(c) === 'active').length;
  const totalImpressions = all.reduce((sum, c) => sum + (c.impressionsServed || 0), 0);
  const advStats = {};
  all.forEach(c => {
    const served = c.impressionsServed || 0;
    advStats[c.advertiser] = (advStats[c.advertiser] || 0) + served;
  });
  const topAdvertiser = Object.entries(advStats).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  res.json({ totalCampaigns, activeCampaigns, totalImpressions, topAdvertiser });
});

// Pause/End campaign
app.patch('/campaigns/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'ended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await campaigns.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating campaign' });
  }
});

module.exports = app;
