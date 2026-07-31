import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load curriculum data
const curriculumData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "data", "curriculum.json"),
    "utf8"
  )
);

// Load country data
const countryData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "data", "countryData.json"),
    "utf8"
  )
);

function buildSystemPrompt(userProfile) {
  const profileLine = userProfile
    ? `The user is ${userProfile.age || "a teenager"}, interested in ${
        userProfile.interest || "general financial literacy"
      }, on the ${userProfile.track || "standard"} track.`
    : "No user profile provided yet. Keep answers general but friendly.";

  return `
You are MoneyQuest, an AI financial mentor for teenagers.

${profileLine}

Use ONLY the information provided below.

CURRICULUM:
${JSON.stringify(curriculumData)}

COUNTRY DATA:
${JSON.stringify(countryData)}

Rules:
- Explain things simply.
- Be encouraging.
- Give real-world examples.
- Don't invent financial facts.
- If the answer isn't in the provided data, clearly say so.
- End with a small question to test understanding when appropriate.
`;
}

router.post("/", async (req, res) => {
  try {
    const { message, userProfile, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required",
      });
    }

   const response = await fetch(
  "https://api.featherless.ai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FEATHERLESS_API_KEY}`,
    },
    body: JSON.stringify({
      model: "Qwen/Qwen2.5-7B-Instruct", // Change to your preferred Featherless model
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(userProfile),
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  }
);

if (!response.ok) {
  const errText = await response.text();
  console.error("Featherless API error:", errText);

  return res.status(502).json({
    error: "AI provider error",
  });
}

const data = await response.json();

return res.json({
  reply: data.choices[0].message.content,
});
  } catch (err) {
    console.error("Chat Route Error:", err);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

export default router;
