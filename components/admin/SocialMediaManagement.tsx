

import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { SocialMediaSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { initialSocialMediaSettings } from '../../constants.ts';

const SocialMediaManagement: React.FC = () => {
    const { socialMediaSettings, updateSocialMediaSettings } = useData();
    const [formData, setFormData] = useState<SocialMediaSettings>(socialMediaSettings || initialSocialMediaSettings);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setFormData(socialMediaSettings || initialSocialMediaSettings);
    }, [socialMediaSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSocialMediaSettings(formData);
        setMessage('Social media links updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-700 mb-6">Manage Social Media Links</h2>
            <p className="text-sm text-gray-600 mb-4">Enter the full URLs for your social media profiles. The corresponding icon will appear in the website footer. Leave a field blank to hide the icon.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">Facebook URL</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Icon prefix="fab" name="facebook-f" className="w-5 text-center" />
                        </span>
                        <input
                            type="url"
                            id="facebook"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300"
                            placeholder="https://facebook.com/your-page"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram URL</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Icon prefix="fab" name="instagram" className="w-5 text-center" />
                        </span>
                        <input
                            type="url"
                            id="instagram"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300"
                            placeholder="https://instagram.com/your-profile"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="telegram" className="block text-sm font-medium text-gray-700">Telegram Channel URL</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Icon prefix="fab" name="telegram-plane" className="w-5 text-center" />
                        </span>
                        <input
                            type="url"
                            id="telegram"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300"
                            placeholder="https://t.me/your-channel"
                        />
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="telegramGroup" className="block text-sm font-medium text-gray-700">Telegram Group URL</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                             <input
                                type="url"
                                id="telegramGroup"
                                name="telegramGroup"
                                value={formData.telegramGroup}
                                onChange={handleChange}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300"
                                placeholder="https://t.me/joinchat/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="telegramGroupIcon" className="block text-sm font-medium text-gray-700">Group Icon</label>
                         <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                id="telegramGroupIcon"
                                name="telegramGroupIcon"
                                value={formData.telegramGroupIcon}
                                onChange={handleChange}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border-gray-300"
                                placeholder="e.g., users"
                            />
                        </div>
                         <p className="text-xs text-gray-500 mt-1">Font Awesome icon name.</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp URL</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Icon prefix="fab" name="whatsapp" className="w-5 text-center" />
                        </span>
                        <input
                            type="url"
                            id="whatsapp"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300"
                            placeholder="https://wa.me/your-number"
                        />
                    </div>
                </div>

                {message && (
                    <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">
                        {message}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t mt-6">
                    <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                        <Icon name="save" /> Save Links
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialMediaManagement;