import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
        responseMimeType: "application/json"
    }
});

export async function generateSlides(
    topic,
    grade,
    slides
) {

    const prompt = `
Generate a classroom presentation.

Topic: ${topic}
Grade: ${grade}
Number of Slides: ${slides}

Return ONLY valid JSON.

Format:
{
  "slides": [
    {
      "title": "",
      "bullets": ["", "", ""]
    }
  ]
}

Rules:
- concise bullets
- educational tone
- no markdown
- no explanation outside JSON
`;

    try {

        const result = await model.generateContent(prompt);

        const response = result.response.text();

        // Remove markdown code blocks if Gemini adds them
        const cleaned = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);

    } catch (error) {

        console.log("Gemini Error:", error);

        throw error;
    }
}