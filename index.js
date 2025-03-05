const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
const port = 9090;

app.use(express.json());

app.post('/track-info', async (req, res) => {
    const { artist, title } = req.body;

    if (!artist || !title) {
        return res.status(400).json({ error: 'Artist and title are required' });
    }

    try {
        const response = await axios.get('https://api.discogs.com/database/search', {
            params: {
                artist,
                track: title,
                type: 'release',
                token: process.env.DISCOGS_API_TOKEN
            }
        });

        const trackInfo = response.data.results[0];
        if (!trackInfo) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.json(trackInfo);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data from Discogs API' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
