import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, GenerateContentRequest, GenerationConfig } from '@google/generative-ai';
import 'dotenv/config';
import {authenticateToken} from '../middleware/authenticateToken';

// --- HELPER FUNCTIONS FOR DATE CALCULATION ---

/**
 * Gets the date for the most recent Monday.
 * @param d The date to start from.
 * @returns A string in YYYY-MM-DD format.
 */
const getMonday = (d: Date): string => { //wrong
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

/**
 * Gets the date for the upcoming Saturday.
 * @param d The date to start from.
 * @returns A string in YYYY-MM-DD format.
 */
const getNextMonday = (d: Date): string => {
    const monday = new Date(getMonday(d));
    const nextMonday = new Date(monday.setDate(monday.getDate() + 7));
    return nextMonday.toISOString().split('T')[0];
}


// --- API KEY AND GEMINI CLIENT SETUP ---

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}
const genAI = new GoogleGenerativeAI(apiKey);


// --- API ROUTER ---

const catalystRouter = Router();

catalystRouter.get('/sector/:sector', authenticateToken, async (req: Request, res: Response) => {
    const { sector } = req.params;
    const today = new Date();
    const monday = getMonday(today);
    const nextMonday = getNextMonday(today);
    const dateRange = `${monday} to ${nextMonday}`;
    const todayString = today.toISOString().split('T')[0]; // Get today's date as a string

    console.log(`Request received for sector: "${sector}" for the week: ${dateRange}`);

    try {
        // This is a powerful model for complex instruction-following and JSON output
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        // This prompt is a command that strictly defines the desired output format.
    const prompt = `
        Act as a meticulous financial analyst. Your knowledge is current as of ${todayString}.
        Your task is to identify major, specific, publicly-known financial catalysts for the "${sector}" industry that are scheduled to occur in the upcoming week: ${dateRange}.
        
        Crucially, all events MUST have an "eventDate" that falls on or between ${monday} and ${nextMonday}. Do not include any events from past weeks.
        
        Your sole output MUST be a single, valid JSON array of objects. Do not include any text, markdown, or commentary before or after the JSON array.
        
        If you cannot find at least 10 real, scheduled events for this exact timeframe, provide only the ones you can confirm and do not invent catalysts to meet the count.
        
        Each object in the array represents a single catalyst and must conform to the following schema:
        {
            "eventDate": "YYYY-MM-DD",
            "eventName": "A concise name for the event.",
            "impactedCompanies": [
                { "name": "Company Name", "ticker": "TICKER" }
            ],
            "potentialImpact": {
                "direction": "Positive, Negative, or Neutral",
                "magnitudePercentage": "A numerical string representing the potential stock price move, e.g., '+10', '-5', '0'. Provide a realistic estimate.",
                "reasoning": "A brief but specific explanation for why this event is a catalyst and the reasoning behind the potential impact."
            }
        }
    `;


        const generationConfig: GenerationConfig = {
            responseMimeType: "application/json",
        };

        const request: GenerateContentRequest = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig, // generationConfig is a top-level property of the request
            // You can also add safetySettings here if needed
        };

        const result = await model.generateContent(request);
        const responseText = result.response.text();
        
        console.log("Received response from Gemini API: ", responseText);

        // Parse the JSON string from the model into a JavaScript object
        const parsedCatalysts = JSON.parse(responseText);

        // Send the structured data back to the client
        res.status(200).json(parsedCatalysts);

    } catch (error)
    {
        console.error("Error calling Gemini API or processing its response:", error);
        res.status(500).json({ error: "Failed to retrieve catalyst data." });
    }
});

export default catalystRouter;