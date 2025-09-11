import React from 'react';
import { FeedbackIcon } from './icons/FeedbackIcon';

export const FeedbackButton: React.FC = () => {
  // QUAN TRỌNG: Hãy thay thế đường link bên dưới bằng link Google Form của bạn.
  const googleFormUrl = 'https://forms.gle/YOUR_FORM_LINK_HERE';

  return (
    <a
      href={googleFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Gửi phản hồi"
      className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-primary-light"
      aria-label="Gửi phản hồi về ứng dụng"
    >
      <FeedbackIcon />
    </a>
  );
};
