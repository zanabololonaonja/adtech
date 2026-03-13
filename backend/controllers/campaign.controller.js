const Campaign = require('../models/campaign.model');
const { ObjectId } = require('mongodb');
const logger = require('../utils/logger');

// Helper: calcul du statut
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

exports.createCampaign = async (req, res) => {
  logger.info('POST /campaigns', { body: req.body });
  try {
    const { name, advertiser, startDate, endDate, budget, targetCountries } = req.body;

    if (!name || !advertiser || !startDate || !endDate || !budget || !targetCountries) {
      logger.warn('Missing required fields for campaign creation', { body: req.body });
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

    const result = await Campaign.insertOne(campaign);
    logger.info('Campaign created successfully', { campaignId: result.insertedId });
    res.status(201).json({ ...campaign, id: result.insertedId });
  } catch (err) {
    logger.error('Error creating campaign', err);
    res.status(500).json({ error: 'Error creating campaign' });
  }
};

exports.getCampaigns = async (req, res) => {
  logger.info('GET /campaigns', { query: req.query });
  try {
    const { status, advertiser, country } = req.query;
    const query = {};
    if (advertiser) query.advertiser = advertiser;
    if (country) query.targetCountries = { $in: [country] };

    const list = await Campaign.find(query);

    let campaignsWithStatus = list.map(c => ({
      ...c,
      status: getStatus(c),
      id: c._id.toString(),
      budget: Number(c.budget),
      impressionsServed: c.impressionsServed || 0
    }));

    if (status) {
      campaignsWithStatus = campaignsWithStatus.filter(c =>
        c.status.toLowerCase() === status.toLowerCase()
      );
    }

    res.json(campaignsWithStatus);
  } catch (err) {
    logger.error('Error fetching campaigns', err);
    res.status(500).json({ error: 'Error fetching campaigns' });
  }
};

exports.serveAd = async (req, res) => {
  logger.info('POST /serve-ad', { body: req.body });
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

    const campaign = await Campaign.findOne(query);

    if (!campaign) {
      logger.warn('No eligible campaign found', { query });
      return res.status(404).json({ error: 'No eligible campaign (insufficient budget or inactive)' });
    }

    await Campaign.updateOne(
      { _id: campaign._id },
      { $inc: { impressionsServed: 1, budget: -10 } }
    );

    const updatedCampaign = await Campaign.findOne({ _id: campaign._id });
    logger.info('Ad served successfully', { campaignId: updatedCampaign._id });
    res.json({
      ...updatedCampaign,
      id: updatedCampaign._id.toString(),
      status: getStatus(updatedCampaign)
    });
  } catch (err) {
    logger.error('Internal server error during ad serving', err);
    res.status(500).json({ error: 'Internal server error during ad serving' });
  }
};

exports.getStats = async (req, res) => {
  logger.info('GET /stats');
  try {
    const all = await Campaign.find();
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
  } catch (err) {
    logger.error('Error fetching stats', err);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

exports.updateCampaignStatus = async (req, res) => {
  logger.info('PATCH /campaigns/:id', { id: req.params.id, body: req.body });
  try {
    const { status } = req.body;
    if (!['active', 'paused', 'ended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await Campaign.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
    logger.info('Campaign updated successfully', { id: req.params.id, status });
    res.json({ success: true });
  } catch (err) {
    logger.error('Error updating campaign', err, { id: req.params.id });
    res.status(500).json({ error: 'Error updating campaign' });
  }
};
