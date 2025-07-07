import { Router, Request, Response } from 'express';
import {authenticateToken} from '../middleware/authenticateToken';
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';

const router = Router();

// Initialize VertexAI.
// When running on GCP (like Cloud Run), authentication is handled automatically
// via the service account's permissions. For local development, you can
// authenticate by running `gcloud auth application-default login` in your terminal.
const vertexAI: VertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'gcp-app-464623',
  location: process.env.GCP_LOCATION || 'us-central1',
});

// Instantiate the Gemini 1.5 Flash model
const generativeModel: GenerativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash-001',
});

// This route is authenticated.
// It expects a POST request with a JSON body like: { "prompt": "Your prompt here" }
router.post('/prompt', authenticateToken, async (req: Request, res: Response) => {
  // Define the type for the destructured request body property
  const { prompt }: { prompt: string } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'A "prompt" is required in the request body.' });
  }

  try {
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);
    
    // It's safer to check for the existence of the response data
    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Received an empty or invalid response from the Gemini API.");
    }

    res.json({ response: responseText });
  } catch (error: any) {
    console.error('Error calling Vertex AI Gemini API:', error);
    res.status(500).json({ error: 'Failed to get a response from the Gemini API.' });
  }
});

export default router;