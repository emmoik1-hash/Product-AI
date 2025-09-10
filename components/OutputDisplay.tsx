
import React from 'react';
import type { GenerateApiResponse } from '../types';
import { DescriptionCard } from './DescriptionCard';
import { SeoCard } from './SeoCard';
import { DownloadIcon } from './icons/DownloadIcon';

interface OutputDisplayProps {
  data: GenerateApiResponse | null;
  isLoading: boolean;
  error: string | null;
}

const Placeholder = () => (
    <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-300">Awaiting Input</h3>
        <p className="mt-1">Your generated content will appear here once you fill out the form and click "Generate".</p>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-300">Generating content, please wait...</p>
    </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg flex flex-col items-center justify-center h-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.007H12v-.007Z" />
        </svg>
        <h3 className="font-semibold">An Error Occurred</h3>
        <p>{message}</p>
    </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ data, isLoading, error }) => {
  const handleExport = () => {
    if (!data) return;

    const headers = "type,content\n";
    let csvContent = headers;

    data.descriptions.forEach((desc, i) => {
        csvContent += `"description_${i + 1}","${desc.replace(/"/g, '""')}"\n`;
    });

    csvContent += `"meta_title","${data.seo.metaTitle.replace(/"/g, '""')}"\n`;
    csvContent += `"meta_description","${data.seo.metaDescription.replace(/"/g, '""')}"\n`;
    csvContent += `"keywords","${data.seo.keywords.join(', ').replace(/"/g, '""')}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "product_descriptions.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!data) return <Placeholder />;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generated Descriptions</h3>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 text-sm bg-neutral-700 hover:bg-neutral-600 text-gray-200 font-medium py-2 px-3 rounded-md transition-colors"
                >
                <DownloadIcon />
                <span>Export CSV</span>
              </button>
          </div>
          <div className="space-y-4">
            {data.descriptions.map((desc, index) => (
              <DescriptionCard key={index} text={desc} title={`Version ${index + 1}`} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">SEO Suggestions</h3>
          <div className="grid grid-cols-1 gap-4">
            <SeoCard title="Meta Title" content={data.seo.metaTitle} />
            <SeoCard title="Meta Description" content={data.seo.metaDescription} />
            <SeoCard title="Keywords" content={data.seo.keywords.join(', ')} />
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-[400px] max-h-[80vh] overflow-y-auto p-1 pr-4">
        {renderContent()}
    </div>
  );
};
