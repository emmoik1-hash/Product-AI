import React, { useState, useCallback, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { BulkUpload } from './components/BulkUpload';
import { generateProductDescriptions } from './services/geminiService';
import type { GenerateApiResponse, ProductInfo } from './types';
import { FeedbackButton } from './components/FeedbackButton';
import { ContactForm } from './components/ContactForm';

const USAGE_LIMIT = 3;
const USAGE_COUNT_KEY = 'productAiUsageCount';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerateApiResponse | null>(null);
  const [mode, setMode] = useState<'single' | 'bulk' | 'contact'>('single');
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    try {
      const storedCount = localStorage.getItem(USAGE_COUNT_KEY);
      setUsageCount(storedCount ? parseInt(storedCount, 10) : 0);
    } catch (e) {
      console.error("Could not read usage count from localStorage", e);
      setUsageCount(0);
    }
  }, []);

  const isLimitReached = usageCount >= USAGE_LIMIT;

  const handleGenerate = useCallback(async (productInfo: ProductInfo) => {
    if (isLimitReached) {
      setError("Bạn đã hết lượt dùng thử. Vui lòng đăng ký để tiếp tục.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    try {
      const result = await generateProductDescriptions(productInfo);
      setGeneratedData(result);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem(USAGE_COUNT_KEY, newCount.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [usageCount, isLimitReached]);

  const renderSingleMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-neutral-800 p-6 rounded-xl shadow-lg">
        <InputForm 
          onGenerate={handleGenerate} 
          isLoading={isLoading} 
          isLimitReached={isLimitReached} 
        />
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

  const renderContent = () => {
    switch(mode) {
      case 'single':
        return renderSingleMode();
      case 'bulk':
        return <BulkUpload isLimitReached={isLimitReached} />;
      case 'contact':
        return <ContactForm />;
      default:
        return renderSingleMode();
    }
  }

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
          <div className="flex space-x-1 bg-neutral-800 p-1 rounded-lg max-w-md mx-auto">
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
            <button
              onClick={() => setMode('contact')}
              className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors duration-200 
                ${mode === 'contact' ? 'bg-primary text-white shadow' : 'text-gray-300 hover:bg-white/[0.12] hover:text-white'}`}
            >
              Liên hệ
            </button>
          </div>
        </div>
        <div key={mode} className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
      <FeedbackButton />
    </div>
  );
};

export default App;