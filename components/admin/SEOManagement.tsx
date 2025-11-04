

import React, { useState, useEffect, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { SEOSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { initialSeoSettings } from '../../constants.ts';

const AccordionSection: React.FC<{ title: string; children: ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b">
        <button
            type="button"
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50"
            onClick={onToggle}
        >
            {title}
            <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="transition-transform" />
        </button>
        {isOpen && (
            <div className="p-6 bg-gray-50 border-t">
                {children}
            </div>
        )}
    </div>
);

const SEOManagement: React.FC = () => {
    const { seoSettings, updateSEOSettings } = useData();
    const [formData, setFormData] = useState<SEOSettings>(seoSettings || initialSeoSettings);
    const [activeSection, setActiveSection] = useState<string>('global');

    useEffect(() => {
        setFormData(seoSettings || initialSeoSettings);
    }, [seoSettings]);

    const handleToggleSection = (section: string) => {
        setActiveSection(prev => prev === section ? '' : section);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section as keyof SEOSettings], [field]: value }
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        const [section, field] = name.split('.');

        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section as keyof SEOSettings], [field]: checked }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSEOSettings(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">

            <AccordionSection title="Global Meta Tags" isOpen={activeSection === 'global'} onToggle={() => handleToggleSection('global')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Site Title</label>
                        <input type="text" name="global.siteTitle" value={formData.global.siteTitle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">Appears in the browser tab and search engine results.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                        <textarea name="global.metaDescription" value={formData.global.metaDescription} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">A brief summary of your site for search engines (approx. 160 characters).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
                        <input type="text" name="global.metaKeywords" value={formData.global.metaKeywords} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated keywords relevant to your site.</p>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection title="Social Media Preview (Open Graph)" isOpen={activeSection === 'social'} onToggle={() => handleToggleSection('social')}>
                <p className="text-sm text-gray-600 mb-4">Configure how your site appears when shared on social media like Facebook or WhatsApp.</p>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">OG Title</label>
                        <input type="text" name="social.ogTitle" value={formData.social.ogTitle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">OG Description</label>
                        <textarea name="social.ogDescription" value={formData.social.ogDescription} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">OG Image URL</label>
                        <input type="url" name="social.ogImageUrl" value={formData.social.ogImageUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://example.com/image.jpg" />
                        <p className="text-xs text-gray-500 mt-1">A direct link to an image (recommended size: 1200x630px).</p>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection title="Structured Data (Schema)" isOpen={activeSection === 'structured'} onToggle={() => handleToggleSection('structured')}>
                 <p className="text-sm text-gray-600 mb-4">Helps search engines understand the content on your site, which can lead to rich results.</p>
                 <div className="space-y-4">
                     <label className="flex items-center gap-3 p-3 bg-white rounded-md border">
                        <input 
                            type="checkbox" 
                            name="structuredData.jobPostingSchemaEnabled" 
                            checked={formData.structuredData.jobPostingSchemaEnabled} 
                            onChange={handleCheckboxChange} 
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <div>
                           <span className="font-medium">Enable JobPosting Schema</span>
                           <p className="text-xs text-gray-500">Automatically add structured data to job listings to improve their visibility in search results (e.g., Google for Jobs).</p>
                        </div>
                    </label>
                 </div>
            </AccordionSection>

            <div className="flex justify-end mt-6 p-4 border-t bg-gray-50">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 text-base font-semibold flex items-center gap-2">
                    <Icon name="save" /> Save SEO Settings
                </button>
            </div>
        </form>
    );
};

export default SEOManagement;