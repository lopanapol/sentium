
const express = require('express');
const router = express.Router();
const sentiumService = require('../services/sentiumService');

router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const reply = await sentiumService.generateChatReply(message);
        res.json({ reply });
    } catch (error) {
        console.error('Error generating chat reply:', error);
        res.status(500).json({ error: 'Failed to generate chat reply' });
    }
});

module.exports = router;
