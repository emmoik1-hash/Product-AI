import React, { useState } from 'react';
import { LANGUAGES, TONES } from '../constants';
import type { ProductInfo } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface InputFormProps {
  onGenerate: (productInfo: ProductInfo) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tone, setTone] = useState<string>(TONES[0].value);
  const [language, setLanguage] = useState<string>(LANGUAGES[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !description.trim()) {
      alert("Please provide a product name and a description/details for the AI to analyze.");
      return;
    }
    onGenerate({
      productName: productName.trim(),
      description: description.trim(),
      tone,
      language,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-2">
          Product Name
        </label>
        <input
          id="productName"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g., Smart Thermos Bottle"
          className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Existing Description / Product Details
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste your existing product description, features, or bullet points here. The AI will analyze this text to generate new versions."
          className="w-full h-36 bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary resize-y"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-300 mb-2">
            Tone of Voice
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-gray-500 disabled:cursor-wait"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <SparklesIcon />
            <span>Generate Descriptions</span>
          </>
        )}
      </button>
    </form>
  );
};
