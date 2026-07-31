import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Featherless Client via OpenAI SDK
const featherless = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY,
  baseURL: process.env.FEATHERLESS_BASE_URL || 'https://api.featherless.ai/v1'
});

const AI_MODEL = process.env.FEATHERLESS_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct';

/**
 * ENDPOINT 1: Dynamic AI Financial Scenario Generator
 */
app.post('/api/generate-scenario', async (req, res) => {
  try {
    const prompt = `You are an expert financial literacy curriculum designer.
Generate a brand-new, realistic personal finance scenario with 3 options.
Return ONLY raw JSON with no Markdown formatting, backticks, or extra commentary.

Format must be exact:
{
  "title": "Short Catchy Title",
  "desc": "Detailed story setting up a financial dilemma using Indian Rupees (₹)...",
  "options": [
    { "text": "Option 1 action", "correct": false, "feedback": "Detailed explanation why this choice is risky or sub-optimal." },
    { "text": "Option 2 action", "correct": true, "feedback": "Detailed explanation why this choice is mathematically and financially sound." },
    { "text": "Option 3 action", "correct": false, "feedback": "Detailed explanation why this choice is incorrect." }
  ]
}`;

    const completion = await featherless.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    const rawContent = completion.choices[0].message.content.trim();
    const cleanJson = rawContent.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/, '').trim();
    const scenarioData = JSON.parse(cleanJson);

    res.json(scenarioData);
  } catch (error) {
    console.error('Featherless AI Scenario Error:', error);
    res.status(500).json({ error: 'Failed to generate scenario via Featherless AI' });
  }
});

/**
 * ENDPOINT 2: Interactive AI Financial Tutor
 */
app.post('/api/tutor', async (req, res) => {
  const { question, topic } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const completion = await featherless.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are WealthQuest AI, a patient, practical, and highly engaging personal finance coach. Explain financial concepts simply, using analogies.'
        },
        {
          role: 'user',
          content: `Topic Context: ${topic || 'General Personal Finance'}\nUser Question: ${question}`
        }
      ],
      temperature: 0.7
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error('Featherless AI Tutor Error:', error);
    res.status(500).json({ error: 'Failed to get answer from AI Tutor' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 WealthQuest Backend running on http://localhost:${PORT}`);
});
