// File: api/contact.ts
// This is a Vercel serverless function.
// It acts as a secure proxy to submit data to a Google Form.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- GOOGLE FORM CONFIGURATION ---
// IMPORTANT: The URL must end in "/formResponse" to work with POST requests.
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdLDx2MKsh5RpjwYHpVRcD4lEIaT-LgmuzxH3rHExBJBZPFhg/formResponse';
const ENTRY_ID_NAME = 'entry.809904154';
const ENTRY_ID_EMAIL = 'entry.561482795';
const ENTRY_ID_MESSAGE = 'entry.2098362872';
// --- END CONFIGURATION ---

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
    const { name, email, message } = req.body;

    // Basic validation to ensure we have the data we need.
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    // Use URLSearchParams to correctly format the data for the form submission.
    const formData = new URLSearchParams();
    formData.append(ENTRY_ID_NAME, name);
    formData.append(ENTRY_ID_EMAIL, email);
    formData.append(ENTRY_ID_MESSAGE, message);

    // Make the POST request to the Google Form URL.
    const response = await fetch(GOOGLE_FORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // Google Forms usually returns a 200 OK status on successful submission.
    if (!response.ok) {
        throw new Error(`Google Form submission failed with status: ${response.status}`);
    }

    // Send a success response back to the frontend.
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error in contact form submission function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return res.status(500).json({ success: false, error: `Failed to submit form: ${errorMessage}` });
  }
}
