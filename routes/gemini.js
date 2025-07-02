const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize VertexAI.
// When running on GCP (like Cloud Run), authentication is handled automatically
// via the service account's permissions. For local development, you can
// authenticate by running `gcloud auth application-default login` in your terminal.
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'gcp-app-464623',
  location: process.env.GCP_LOCATION || 'us-central1',
});

// Instantiate the Gemini 1.5 Flash model
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash-001',
});

// This route is authenticated.
// It expects a POST request with a JSON body like: { "prompt": "Your prompt here" }
router.post('/prompt', authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'A "prompt" is required in the request body.' });
  }

  try {
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);
    const responseText = result.response.candidates[0].content.parts[0].text;

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error calling Vertex AI Gemini API:', error);
    res.status(500).json({ error: 'Failed to get a response from the Gemini API.' });
  }
});

module.exports = router;