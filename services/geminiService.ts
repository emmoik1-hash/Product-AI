
import type { GenerateApiResponse, ProductInfo } from "../types";

/**
 * Sends product information to our secure backend API proxy, which then calls the Gemini API.
 * This function handles different content types and optional image data.
 * @param contentInfo - The product and content generation data.
 * @returns A promise that resolves to the generated content.
 */
export async function generateContent(
  contentInfo: ProductInfo
): Promise<GenerateApiResponse> {

  try {
    // Call our own API endpoint, which acts as a secure proxy.
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentInfo),
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
    if (typeof data !== 'object' || data === null) {
        throw new Error("Invalid response structure from our API proxy.");
    }

    return data as GenerateApiResponse;

  } catch (error) {
    console.error("Error calling our API proxy:", error);
    // Re-throw the error so it can be caught by the UI component and displayed to the user.
    let friendlyMessage = "An unknown error occurred while contacting our server.";
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        friendlyMessage = "Network error: Could not connect to the server. Please check your internet connection and try again.";
    } else if (error instanceof Error) {
        friendlyMessage = error.message;
    }
    throw new Error(friendlyMessage);
  }
}