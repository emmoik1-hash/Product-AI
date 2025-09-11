
import React from 'react';
import { FeedbackIcon } from './icons/FeedbackIcon';

export const FeedbackButton: React.FC = () => {
  // IMPORTANT: Replace the link below with your actual Google Form link.
  const googleFormUrl = 'https://forms.gle/YOUR_FORM_LINK_HERE';

  return (
    <a
      href={googleFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Send Feedback"
      className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-primary-light"
      aria-label="Send feedback about the application"
    >
      <FeedbackIcon />
    </a>
  );
};