
import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface DescriptionCardProps {
  title: string;
  text: string;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({ title, text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-300">{title}</h4>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1.5 text-xs px-2 py-1 rounded ${
            copied
              ? 'bg-green-600/20 text-green-400'
              : 'bg-neutral-700 hover:bg-neutral-600 text-gray-300'
          } transition-all`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <p className="text-gray-400 whitespace-pre-wrap">{text}</p>
    </div>
  );
};
