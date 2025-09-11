
// File: api/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import type { ContentType, ProductInfo } from '../types';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set on the server.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Response Schemas ---
const productDescriptionSchema = {
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
        metaTitle: { type: Type.STRING, description: "An SEO-optimized meta title." },
        metaDescription: { type: Type.STRING, description: "An SEO-optimized meta description." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of relevant SEO keywords." },
      },
      required: ["metaTitle", "metaDescription", "keywords"],
    },
    featureBullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 compelling bullet points highlighting key features and benefits." },
    targetAudience: { type: Type.STRING, description: "A brief description of the ideal target audience." },
    callToActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 strong call-to-action phrases." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant social media hashtags, without the '#' symbol." }
  },
  required: ["descriptions", "seo", "featureBullets", "targetAudience", "callToActions", "hashtags"],
};

const socialMediaPostSchema = {
    type: Type.OBJECT,
    properties: {
        socialMediaPosts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 2-3 distinct and engaging social media posts about the product."
        }
    },
    required: ["socialMediaPosts"],
};

// --- Main Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { productName, description, tone, language, contentType, imageData, imageMimeType } = req.body as ProductInfo;

    if (!productName || !description || !tone || !language || !contentType) {
        return res.status(400).json({ error: "Missing required product information." });
    }
    
    let prompt: string;
    let schema;
    let modelContents: any; // Can be string or array of parts

    switch (contentType) {
      case 'social_media_post':
        prompt = `
          You are a professional social media manager specializing in e-commerce.
          Your task is to create engaging social media posts for a product.

          Product Information:
          - Product Name: ${productName}
          - Details/Keywords: ${description}

          Instructions:
          1.  Generate 2-3 short, catchy, and distinct social media posts.
          2.  Incorporate relevant emojis and a call-to-action in each post.
          3.  Adopt a '${tone}' tone of voice.
          4.  Ensure all content is in the specified language: '${language}'.
        `;
        schema = socialMediaPostSchema;
        modelContents = prompt;
        break;

      case 'product_description':
      default:
        prompt = `
          You are an expert e-commerce copywriter, SEO specialist, and marketing strategist.
          Your task is to analyze product information (and an optional image) to generate a complete marketing kit.

          Analyze this product:
          - Product Name: ${productName}
          - Existing Description / Details / Keywords: ${description}
          ${imageData ? '- An image of the product is also provided for visual analysis.' : ''}

          Instructions:
          1.  **Product Descriptions:** Generate 2-3 distinct and engaging product descriptions.
          2.  **SEO Metadata:** Create an SEO-friendly meta title, meta description, and keywords list.
          3.  **Feature Bullets:** Write 3-5 compelling bullet points, linking features to benefits.
          4.  **Target Audience:** Briefly describe the ideal customer.
          5.  **Call to Actions (CTAs):** Suggest 2-3 strong, action-oriented phrases.
          6.  **Social Media Hashtags:** Provide relevant hashtags (without the '#').
          7.  **Tone and Language:** Adopt a '${tone}' tone and write everything in '${language}'.
        `;
        schema = productDescriptionSchema;
        
        if (imageData && imageMimeType) {
            const imagePart = { inlineData: { mimeType: imageMimeType, data: imageData } };
            const textPart = { text: prompt };
            modelContents = { parts: [textPart, imagePart] };
        } else {
            modelContents = prompt;
        }
        break;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: modelContents,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
    
    const text = response.text.trim();
    const data = JSON.parse(text);

    return res.status(200).json(data);

  } catch (error) {
    console.error("Error in Vercel function calling Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate content from the backend.";
    return res.status(500).json({ error: errorMessage });
  }
}
