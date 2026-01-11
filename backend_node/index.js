import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;
const PYTHON_API_URL = 'http://127.0.0.1:8000/search';

app.use(cors());
app.use(express.json());

app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Received search query: ${query}`);

    try {
        // Forward request to Python API
        const response = await axios.post(PYTHON_API_URL, { query });
        
        // Forward Python API response back to frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error forwarding to Python API:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(503).json({ error: 'Python API could not be reached' });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Configure multer for file uploads
import multer from 'multer';
import { SpeechmaticsClient } from './speechmatics.js';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

app.post('/api/voice-search', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log(`Received audio file: ${req.file.path}`);

    try {
        const apiKey = process.env.SPEECHMATICS_API_KEY;
        if (!apiKey) {
            throw new Error('SPEECHMATICS_API_KEY is not configured');
        }

        const client = new SpeechmaticsClient(apiKey);
        const transcript = await client.transcribe(req.file.path);

        console.log(`Transcription: ${transcript}`);

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ text: transcript });

    } catch (error) {
        console.error('Error processing voice search:', error);
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Voice processing failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Node.js Server running on http://localhost:${PORT}`);
});
