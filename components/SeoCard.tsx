
import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SeoCardProps {
  title: string;
  content: string;
}

export const SeoCard: React.FC<SeoCardProps> = ({ title, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-medium text-gray-400">{title}</h5>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1.5 text-xs px-2 py-1 rounded ${
            copied
              ? 'bg-green-600/20 text-green-400'
              : 'bg-neutral-700 hover:bg-neutral-600 text-gray-300'
          } transition-all`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <p className="text-gray-200">{content}</p>
    </div>
  );
};