require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI ;
const dbName = process.env.DB_NAME ;
let db, campaigns;

MongoClient.connect(uri)
  .then(client => {
    db = client.db(dbName);
    campaigns = db.collection('campaigns');
    app.listen(3001, () => console.log('API listening on port 3001'));
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Helper: get campaign status
function getStatus(campaign) {
  const now = new Date();
  if (campaign.status === 'paused') return 'paused';
  if (now < new Date(campaign.startDate)) return 'paused';
  if (now > new Date(campaign.endDate)) return 'ended';
  if (campaign.budget <= 0) return 'ended';
  return 'active';
}

// 1. POST /campaigns
app.post('/campaigns', async (req, res) => {
  const { name, advertiser, startDate, endDate, budget, targetCountries } = req.body;
  if (!name || !advertiser || !startDate || !endDate || !budget || !targetCountries) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const campaign = {
    name,
    advertiser,
    startDate,
    endDate,
    budget,
    impressionsServed: 0,
    targetCountries,
    status: 'active',
  };


  const result = await campaigns.insertOne(campaign);

  res.status(201).json({ ...campaign, id: result.insertedId }); 
  console.log("Campaign created:", campaign)
   });



// 2. GET /campaigns
app.get('/campaigns', async (req, res) => {
  const { status, advertiser, country } = req.query;
  const query = {};
  if (status) query.status = status;
  if (advertiser) query.advertiser = advertiser;
  if (country) query.targetCountries = country;
  const list = await campaigns.find(query).toArray();
  res.json(list.map(c => ({ ...c, id: c._id })));
  console.log("Campaigns retrieved:", list);
});

// 3. POST /serve-ad
app.post('/serve-ad', async (req, res) => {
  const { country } = req.body;
  if (!country) return res.status(400).json({ error: 'Country required' });
  const now = new Date();
  const campaign = await campaigns.findOne({
    status: 'active',
    startDate: { $lte: now.toISOString() },
    endDate: { $gte: now.toISOString() },
    targetCountries: country,
    budget: { $gt: 0 },
  });
  if (!campaign) return res.status(404).json({ error: 'No eligible campaign' });
  await campaigns.updateOne({ _id: campaign._id }, { $inc: { impressionsServed: 1 }, $inc: { budget: -1 } });
  res.json({ ...campaign, id: campaign._id });
});

// 4. GET /stats
app.get('/stats', async (req, res) => {
  const all = await campaigns.find().toArray();
  const totalCampaigns = all.length;
  const activeCampaigns = all.filter(c => getStatus(c) === 'active').length;
  const totalImpressions = all.reduce((sum, c) => sum + (c.impressionsServed || 0), 0);
  const advStats = {};
  all.forEach(c => {
    advStats[c.advertiser] = (advStats[c.advertiser] || 0) + (c.impressionsServed || 0);
  });
  const topAdvertiser = Object.entries(advStats).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  res.json({ totalCampaigns, activeCampaigns, totalImpressions, topAdvertiser });
});

// Pause/End campaign (optional)
app.patch('/campaigns/:id', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'paused', 'ended'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  await campaigns.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
  res.json({ success: true });
});

module.exports = app;
