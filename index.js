const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const Track = require('./models/track');
const app = express();
const port = 9090;

if (!process.env.DISCOGS_API_TOKEN) {
    console.error('Error: DISCOGS_API_TOKEN is not set in the environment variables.');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

app.use(express.json());

app.get('/', async (req, res) => {
    try {
        const tracks = await Track.find();
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving tracks' });
    }
});

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
        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data.message });
        } else if (error.request) {
            res.status(500).json({ error: 'No response received from Discogs API' });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching data from Discogs API' });
        }
    }
});

app.post('/save-track', async (req, res) => {
    const { artist, title, year, genre, image, video } = req.body;

    if (!artist || !title) {
        return res.status(400).json({ error: 'Artist and title are required' });
    }

    const track = new Track({ artist, title, year, genre, image, video });

    try {
        await track.save();
        res.status(201).json({ message: 'Track saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while saving the track' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
