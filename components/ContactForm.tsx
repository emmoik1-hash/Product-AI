
import React, { useState } from 'react';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);

    try {
      const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
          throw new Error(data.error || 'Something went wrong on the server.');
      }

      // Submission was successful
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');

      // Hide success message after a while
      setTimeout(() => setIsSubmitted(false), 6000);

    } catch (err) {
      let errorMessage = 'Failed to send message. Please try again.';
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          errorMessage = "Network error: Could not send message. Please check your internet connection.";
      } else if (err instanceof Error) {
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-800 p-6 md:p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Contact Us</h2>
            <p className="text-gray-400 mt-2">We'd love to hear your feedback and questions.</p>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="contactName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="contactMessage" className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            id="contactMessage"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message here..."
            className="w-full h-36 bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary resize-y"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
          ) : (
              <>
                <EnvelopeIcon />
                <span>Send Message</span>
              </>
          )}
        </button>
        
        {isSubmitted && (
            <div className="text-center mt-4 p-3 bg-green-900/50 border border-green-600 text-green-300 rounded-md text-sm animate-fade-in">
                Thank you for your contribution!
            </div>
        )}
        {error && (
            <div className="text-center mt-4 p-3 bg-red-900/50 border border-red-600 text-red-300 rounded-md text-sm animate-fade-in">
                <strong>{`Error: ${error}`}</strong>
            </div>
        )}
      </form>
    </div>
  );
};