
import React from 'react';
import type { GenerateApiResponse } from '../types';
import { DescriptionCard } from './DescriptionCard';
import { SeoCard } from './SeoCard';
import { ListCard } from './ListCard';
import { InfoCard } from './InfoCard';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { TargetIcon } from './icons/TargetIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { TagIcon } from './icons/TagIcon';

interface OutputDisplayProps {
  data: GenerateApiResponse | null;
  isLoading: boolean;
  error: string | null;
}

const Placeholder: React.FC = () => {
    return (
        <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-300">Awaiting Input</h3>
            <p className="mt-1">Your generated content will appear here once you fill out the form and click "Generate".</p>
        </div>
    );
};

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-300">Generating content, please wait...</p>
        </div>
    );
};

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.007H12v-.007Z" />
            </svg>
            <h3 className="font-semibold">An Error Occurred</h3>
            <p>{message}</p>
        </div>
    );
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ data, isLoading, error }) => {

    const renderProductDescriptionContent = (data: GenerateApiResponse) => (
        <>
            {/* Descriptions */}
            {data.descriptions && data.descriptions.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Generated Descriptions</h3>
                    <div className="space-y-4">
                        {data.descriptions.map((desc, index) => (
                            <DescriptionCard key={index} text={desc} title={`Version ${index + 1}`} />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Marketing Kit */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-4">Marketing Toolkit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.featureBullets && <ListCard title="Feature Bullets" items={data.featureBullets} icon={<ListBulletIcon />} />}
                    {data.callToActions && <ListCard title="Call to Actions" items={data.callToActions} icon={<MegaphoneIcon />} />}
                    {data.targetAudience && <InfoCard title="Target Audience" content={data.targetAudience} icon={<TargetIcon />} />}
                    {data.hashtags && <InfoCard title="Social Media Hashtags" content={data.hashtags.map(h => `#${h}`).join(' ')} icon={<TagIcon />} />}
                </div>
            </div>

            {/* SEO */}
            {data.seo && (
                <div>
                    <h3 className="text-xl font-semibold text-white mb-4">SEO Suggestions</h3>
                    <div className="space-y-4">
                        <SeoCard title="Meta Title" content={data.seo.metaTitle} />
                        <SeoCard title="Meta Description" content={data.seo.metaDescription} />
                        <SeoCard title="Keywords" content={data.seo.keywords.join(', ')} />
                    </div>
                </div>
            )}
        </>
    );

    const renderSocialMediaContent = (data: GenerateApiResponse) => (
         <div>
            <h3 className="text-xl font-semibold text-white mb-4">Generated Social Media Posts</h3>
            <div className="space-y-4">
                {data.socialMediaPosts?.map((post, index) => (
                <DescriptionCard key={index} text={post} title={`Post Option ${index + 1}`} />
                ))}
            </div>
        </div>
    )

    const renderContent = () => {
        if (isLoading) return <LoadingSpinner />;
        if (error) return <ErrorDisplay message={error} />;
        if (!data) return <Placeholder />;

        const hasProductDescriptionResults = data.descriptions && data.descriptions.length > 0;
        const hasSocialMediaResults = data.socialMediaPosts && data.socialMediaPosts.length > 0;

        return (
            <div className="space-y-8 animate-fade-in">
               {hasProductDescriptionResults && renderProductDescriptionContent(data)}
               {hasSocialMediaResults && renderSocialMediaContent(data)}
            </div>
        );
    };

    return (
        <div className="min-h-[400px] max-h-[80vh] overflow-y-auto p-1 pr-4">
            {renderContent()}
        </div>
    );
};