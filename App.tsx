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
                <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 3.375c-1.426 0-2.693.422-3.834 1.148m13.097 4.5c-.317-.052-.64-.092-1.002-.102m-11.5 0c-.362.01-.72.05-1.002.102m13.5 0c.373 0 .74.018 1.102.052m-13.5 0c-.362-.034-.72-.052-1.102-.052m12.397 0c.317.052.64.092 1.002.102M3.375 9.75c.01.362.034.72.052 1.102m0 0c0 .373-.018.74-.052 1.102m0 0c-.052.317-.092.64-.102 1.002m0 0c.01.362.034.72.052 1.102m0 0c.034.362.052.72.052 1.102m0 0c.052.317.092.64.102 1.002m11.5 0c.362-.01.72-.05 1.002-.102m-13.5 0c-.373 0-.74-.018-1.102-.052m13.5 0c.362.034.72.052 1.102.052m-12.397 0c-.317-.052-.64-.092-1.002-.102m11.5 0c-.362.01-.72.05-1.002.102M12 4.5c-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5-3.358-7.5-7.5-7.5Z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Product Descriptions AI</h1>
          </div>
          <span className="text-sm text-gray-400">Powered by Gemini</span>
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

        {mode === 'single' ? renderSingleMode() : <BulkUpload />}
      </main>
    </div>
  );
};

export default App;