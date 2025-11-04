import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { PopupAdSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { initialPopupAdSettings } from '../../constants.ts';

const PopupAdManagement: React.FC = () => {
    const { popupAdSettings, updatePopupAdSettings, demoUserSettings } = useData();
    const { isDemoUser } = useAuth();
    const [formData, setFormData] = useState<PopupAdSettings>(popupAdSettings || initialPopupAdSettings);
    const [message, setMessage] = useState('');

    const canManage = !isDemoUser || demoUserSettings.canManageAds;

    useEffect(() => {
        setFormData(popupAdSettings || initialPopupAdSettings);
    }, [popupAdSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value)
        }));
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;
        updatePopupAdSettings(formData);
        setMessage('Popup Ad settings saved successfully!');
        window.scrollTo(0, 0);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto space-y-6">
            <fieldset disabled={!canManage}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-700">Popup Ad Settings</h2>
                    {message && <div className="text-sm text-green-600 font-medium flex items-center gap-2"><Icon name="check-circle" /> {message}</div>}
                </div>

                <label className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border cursor-pointer">
                    <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                    <div>
                        <span className="font-bold text-gray-800">Enable Popup Ad</span>
                        <p className="text-xs text-gray-500">Show the popup advertisement on the homepage for visitors.</p>
                    </div>
                </label>
                
                <div className={`space-y-6 pt-6 border-t ${!formData.enabled ? 'opacity-50' : ''}`}>
                    <fieldset disabled={!formData.enabled || !canManage} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ad Image</label>
                            <div className="mt-2 flex items-center gap-4">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="h-24 w-auto object-contain rounded-md border p-1 bg-gray-100" />
                                ) : (
                                    <div className="h-24 w-32 bg-gray-100 rounded-md flex items-center justify-center border">
                                        <Icon name="image" className="text-3xl text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <input id="popup-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <label htmlFor="popup-image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Upload Image
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Or paste URL below</p>
                                </div>
                            </div>
                            <input 
                                type="url" 
                                name="imageUrl" 
                                value={formData.imageUrl || ''} 
                                onChange={handleChange} 
                                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                                placeholder="https://example.com/ad.jpg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Destination URL *</label>
                            <input type="url" name="destinationUrl" value={formData.destinationUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="https://example.com/offer" required />
                            <p className="text-xs text-gray-500 mt-1">Where to send users when they click the ad.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Popup Size</label>
                                <select name="size" value={formData.size} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-3 p-2 mt-4 sm:mt-6">
                                <input type="checkbox" name="showOncePerSession" checked={formData.showOncePerSession} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Show Once Per Session</span>
                                    <p className="text-xs text-gray-500">Highly recommended to avoid annoying users.</p>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Open Delay (seconds)</label>
                                <input type="number" name="openDelaySeconds" value={formData.openDelaySeconds} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                <p className="text-xs text-gray-500 mt-1">How long to wait before showing the popup.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Auto-close After (seconds)</label>
                                <input type="number" name="closeAfterSeconds" value={formData.closeAfterSeconds} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                <p className="text-xs text-gray-500 mt-1">Set to 0 to require a manual close.</p>
                            </div>
                        </div>
                    </fieldset>
                </div>
                {canManage && (
                    <div className="flex justify-end pt-6 border-t">
                        <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                            <Icon name="save" /> Save Popup Settings
                        </button>
                    </div>
                )}
            </fieldset>
        </form>
    );
};

export default PopupAdManagement;