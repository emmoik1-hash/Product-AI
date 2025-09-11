// File: api/generate.ts
// This is a Vercel serverless function.
// It acts as a secure proxy to the Gemini API.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// The API key is securely accessed from Vercel's environment variables.
// It is NEVER exposed to the client. The name is changed to GEMINI_API_KEY
// to be consistent with Vercel's environment variable settings.
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  // This will cause the function to fail safely if the key is not configured.
  throw new Error("GEMINI_API_KEY environment variable not set on the server.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    descriptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 2-3 different product descriptions.",
    },
    seo: {
      type: Type.OBJECT,
      properties: {
        metaTitle: {
          type: Type.STRING,
          description: "An SEO-optimized meta title for the product page.",
        },
        metaDescription: {
          type: Type.STRING,
          description: "An SEO-optimized meta description for the product page.",
        },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of relevant keywords for SEO.",
        },
      },
      required: ["metaTitle", "metaDescription", "keywords"],
    },
  },
  required: ["descriptions", "seo"],
};


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // We only want to handle POST requests to this endpoint.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { productName, description, tone, language } = req.body;

    // Basic validation to ensure we have the data we need.
    if (!productName || !description || !tone || !language) {
        return res.status(400).json({ error: "Missing required product information." });
    }

    const prompt = `
      You are an expert e-commerce copywriter and SEO specialist.
      Your task is to analyze an existing product description, identify its key features, and then generate improved, compelling product descriptions and SEO metadata.

      Analyze this existing product information:
      - Product Name: ${productName}
      - Existing Description / Details to Analyze: ${description}

      Your goal is to rewrite and improve upon this. Follow these instructions carefully:
      1.  From the provided details, generate 2-3 new, distinct, and engaging product descriptions.
      2.  Adopt the following tone of voice: ${tone}.
      3.  Create a concise, SEO-friendly meta title for the product.
      4.  Write a compelling meta description that encourages clicks.
      5.  Provide a list of relevant keywords based on the product.
      6.  Ensure all generated content is in the specified target language: ${language}.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
    
    const text = response.text.trim();
    // Since the model is configured to return JSON, we parse it before sending.
    const data = JSON.parse(text);

    // Send the successful response back to the frontend.
    return res.status(200).json(data);

  } catch (error) {
    console.error("Error in Vercel function calling Gemini API:", error);
    // Send a generic error message back to the frontend.
    return res.status(500).json({ error: "Failed to generate descriptions from the backend." });
  }
}
