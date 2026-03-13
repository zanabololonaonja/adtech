const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');

router.post('/campaigns', campaignController.createCampaign);
router.get('/campaigns', campaignController.getCampaigns);
router.patch('/campaigns/:id', campaignController.updateCampaignStatus);

router.post('/serve-ad', campaignController.serveAd);
router.get('/stats', campaignController.getStats);

module.exports = router;
