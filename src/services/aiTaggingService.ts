import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function analyzeProductImage(imageUrl: string): Promise<any> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment.");
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: imageResponse.headers.get("content-type") || "image/jpeg"
        }
      },
      `Analyze this product image. Parse and extract:
1. Product Name (name of the product)
2. Brand (e.g. Purina, Royal Canin, Wild One, etc.)
3. Category (e.g. food, treats, toys, beds, collars, bowls, accessories)
4. Weight in lbs (a number, or null if not applicable)
5. Color (primary color(s), or null if not applicable)
6. Pet Type (dog, cat, or both)

You MUST respond with a valid JSON matching this schema:
{
  "productName": string,
  "brand": string,
  "category": "dogs" | "cats" | "eco-friendly" | "essentials",
  "weightLbs": number | null,
  "color": string | null,
  "petType": "dog" | "cat" | "both"
}
Ensure the output is ONLY the JSON block. Do not include markdown code fence formatting.`
    ],
    config: {
      temperature: 0.1,
      topP: 0.95,
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Received empty response from Gemini API");
  }

  return JSON.parse(text);
}
