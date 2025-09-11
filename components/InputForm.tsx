
import React, { useState, useRef } from 'react';
import { TONES, CONTENT_TYPES } from '../constants';
import type { ProductInfo, ContentType } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';

interface InputFormProps {
  onGenerate: (productInfo: ProductInfo) => void;
  isLoading: boolean;
  isLimitReached: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, isLimitReached }) => {
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tone, setTone] = useState<string>(TONES[0].value);
  const [contentType, setContentType] = useState<ContentType>(CONTENT_TYPES[0].value);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageData(base64String);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageData(null);
    setImageMimeType(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
        alert("You have reached your free usage limit. Please register to continue.");
        return;
    }
    if (!productName.trim() || !description.trim()) {
      alert("Please provide a product name and some details for the AI to analyze.");
      return;
    }
    const submissionData: ProductInfo = {
      productName: productName.trim(),
      description: description.trim(),
      tone,
      language: 'en', // Default to English
      contentType,
    };
    if (imageData && imageMimeType) {
        submissionData.imageData = imageData;
        submissionData.imageMimeType = imageMimeType;
    }

    onGenerate(submissionData);
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
          Product Details / Keywords
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste your existing product description, features, or keywords here. The AI will analyze this text to generate new content."
          className="w-full h-36 bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:ring-primary focus:border-primary resize-y"
          required
        />
      </div>

      <div>
        <label htmlFor="contentType" className="block text-sm font-medium text-gray-300 mb-2">
            Content Type
        </label>
        <select
            id="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary"
        >
            {CONTENT_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
                {ct.label}
            </option>
            ))}
        </select>
      </div>

      {contentType === 'product_description' && (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Product Image (Optional)
            </label>
            <div className="mt-2 flex items-center space-x-4">
                <div className="flex-grow">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-neutral-700 rounded-md font-medium text-primary-light hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-neutral-800 focus-within:ring-primary p-2 flex items-center justify-center border border-neutral-600">
                        <PhotoIcon />
                        <span className="ml-2">{!imageData ? "Click to upload an image" : "Change Image"}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                    </label>
                </div>
                {imageData && (
                    <div className="flex items-center space-x-2">
                        <img src={`data:${imageMimeType};base64,${imageData}`} alt="Product preview" className="h-10 w-10 rounded-md object-cover" />
                        <button type="button" onClick={handleRemoveImage} className="text-sm text-red-400 hover:text-red-300">
                           Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
      
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

      <button
        type="submit"
        disabled={isLoading || isLimitReached}
        className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
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
            <span>Generate Content</span>
          </>
        )}
      </button>
      {isLimitReached && (
        <div className="text-center mt-4 p-3 bg-amber-900/50 border border-amber-600 text-amber-300 rounded-md text-sm">
          You have reached your free usage limit. Please register to continue.
        </div>
      )}
    </form>
  );
};