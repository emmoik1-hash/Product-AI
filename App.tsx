import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { BulkUpload } from './components/BulkUpload';
import { generateProductDescriptions } from './services/geminiService';
import type { GenerateApiResponse, ProductInfo } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerateApiResponse | null>(null);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  const handleGenerate = useCallback(async (productInfo: ProductInfo) => {
    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    try {
      const result = await generateProductDescriptions(productInfo);
      setGeneratedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderSingleMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-neutral-800 p-6 rounded-xl shadow-lg">
        <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
      </div>
      <div className="bg-neutral-800 p-6 rounded-xl shadow-lg sticky top-8">
        <OutputDisplay 
          data={generatedData} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      <header className="py-6 px-4 md:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM12 12V3m0 9H3m9 0h9" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Product Descriptions AI</h1>
          </div>
           <div className="font-semibold text-sm bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
             Powered by Gemini
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg max-w-xs mx-auto md:max-w-sm">
            <button
              onClick={() => setMode('single')}
              className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-200 
                ${mode === 'single' ? 'bg-primary text-white shadow' : 'text-gray-300 hover:bg-white/[0.12] hover:text-white'}`}
            >
              Single Product
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-200 
                ${mode === 'bulk' ? 'bg-primary text-white shadow' : 'text-gray-300 hover:bg-white/[0.12] hover:text-white'}`}
            >
              Bulk Upload
            </button>
          </div>
        </div>
        <div key={mode} className="animate-fade-in">
          {mode === 'single' ? renderSingleMode() : <BulkUpload />}
        </div>
      </main>
    </div>
  );
};

export default App;