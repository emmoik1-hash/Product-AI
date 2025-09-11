// services/geminiService.ts
import type { GenerateApiResponse, ProductInfo } from "../types";

/**
 * Sends product information to our secure backend API proxy, which then calls the Gemini API.
 * This function no longer calls the Gemini API directly, protecting the API key.
 * @param productInfo - The product data to be sent for description generation.
 * @returns A promise that resolves to the generated descriptions and SEO data.
 */
export async function generateProductDescriptions(
  productInfo: ProductInfo
): Promise<GenerateApiResponse> {

  try {
    // Call our own API endpoint, which acts as a secure proxy.
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productInfo),
    });

    if (!response.ok) {
      // The server responded with an error status code.
      // We try to parse the response body for a specific error message.
      let errorMessage = `API request failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        // If the backend provided a specific error message, use it.
        if (errorData && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
      } catch (jsonError) {
        // Response was not JSON or was empty. The status code is the best info we have.
        console.warn("Could not parse JSON from error response.", jsonError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Basic validation on the response from our proxy.
    if (!data.descriptions || !data.seo) {
        throw new Error("Invalid response structure from our API proxy.");
    }

    return data as GenerateApiResponse;

  } catch (error) {
    console.error("Error calling our API proxy:", error);
    // Re-throw the error so it can be caught by the UI component and displayed to the user.
    const friendlyMessage = error instanceof Error ? error.message : "An unknown error occurred while contacting our server.";
    throw new Error(friendlyMessage);
  }
}