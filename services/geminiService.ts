import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateApiResponse, ProductInfo } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
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

export async function generateProductDescriptions(
  productInfo: ProductInfo
): Promise<GenerateApiResponse> {
  const { productName, description, tone, language } = productInfo;

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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const text = response.text.trim();
    const data = JSON.parse(text);

    // Basic validation
    if (!data.descriptions || !data.seo) {
        throw new Error("Invalid response structure from API.");
    }

    return data as GenerateApiResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      "Failed to generate descriptions. The AI model may be temporarily unavailable."
    );
  }
}
