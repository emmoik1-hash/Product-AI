import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { BulkUpload } from './components/BulkUpload';
import { generateContent } from './services/geminiService';
import type { GenerateApiResponse, ProductInfo } from './types';
import { FeedbackButton } from './components/FeedbackButton';
import { ContactForm } from './components/ContactForm';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';

const USAGE_LIMIT = 3;

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerateApiResponse | null>(null);
  const [mode, setMode] = useState<'single' | 'bulk' | 'contact'>('single');

  const { profile, signOut, incrementUsage, loading: isAuthLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isLimitReached = profile ? profile.usage_count >= USAGE_LIMIT : true;

  const handleGenerate = useCallback(async (productInfo: ProductInfo) => {
    if (!profile) {
      setError("Please log in to generate content.");
      return;
    }
    if (isLimitReached) {
      setError("You have reached your free usage limit for this account.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedData(null);
    try {
      const result = await generateContent(productInfo);
      setGeneratedData(result);
      incrementUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [profile, isLimitReached, incrementUsage]);

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
  
  const AuthButtons: React.FC = () => {
    if (isAuthLoading) {
      return <div className="text-sm text-gray-400 w-40 text-right">Loading...</div>;
    }
    if (profile) {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 hidden sm:inline" title={profile.email}>{profile.email}</span>
          <span className="text-sm font-semibold text-gray-400 bg-neutral-700/50 px-2 py-1 rounded-md">
            {profile.usage_count}/{USAGE_LIMIT} uses
          </span>
          <button onClick={signOut} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log Out
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setIsAuthModalOpen(true)} 
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
       {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
      <header className="py-6 px-4 md:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM12 12V3m0 9H3m9 0h9" />
                </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Product Descriptions AI</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="font-semibold text-sm bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent hidden md:block">
              Powered by Gemini
            </div>
            <AuthButtons />
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
              Contact
            </button>
          </div>
        </div>
        <div key={mode} className="animate-fade-in relative">
          {!profile && !isAuthLoading && mode !== 'contact' && (
            <div className="absolute inset-0 bg-neutral-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg p-4">
                <h3 className="text-2xl font-bold mb-4">Get Started</h3>
                <p className="text-gray-300 mb-6 text-center max-w-sm">Please sign up or log in to generate content.</p>
                <div className="flex space-x-4">
                    <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 font-semibold rounded-md bg-primary hover:bg-primary-hover text-white transition-colors">
                        Sign Up / Log In
                    </button>
                </div>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
      <FeedbackButton />
    </div>
  );
};

export default App;