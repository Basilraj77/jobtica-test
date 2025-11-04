import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { ThemeSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { initialThemeSettings } from '../../constants.ts';

const ThemeManagement: React.FC = () => {
    const { themeSettings, updateThemeSettings, demoUserSettings } = useData();
    const { isDemoUser } = useAuth();
    const [localTheme, setLocalTheme] = useState<ThemeSettings>(themeSettings || initialThemeSettings);
    const [message, setMessage] = useState('');

    const canManage = !isDemoUser || demoUserSettings.canChangeTheme;

    useEffect(() => {
        setLocalTheme(themeSettings || initialThemeSettings);
    }, [themeSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalTheme(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;
        updateThemeSettings(localTheme);
        setMessage('Theme settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <fieldset disabled={!canManage}>
                <h2 className="text-xl font-bold text-gray-700">Theme Customization</h2>
                <p className="text-sm text-gray-600">
                    Personalize the look and feel of your website by changing the primary and accent colors.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Color Pickers */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Primary Color</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    type="color"
                                    id="primaryColor"
                                    name="primaryColor"
                                    value={localTheme.primaryColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={localTheme.primaryColor}
                                    onChange={handleChange}
                                    name="primaryColor"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and main actions.</p>
                        </div>
                        <div>
                            <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">Accent Color</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    type="color"
                                    id="accentColor"
                                    name="accentColor"
                                    value={localTheme.accentColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={localTheme.accentColor}
                                    onChange={handleChange}
                                    name="accentColor"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Used for tags, highlights, and secondary elements.</p>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">Live Preview</h3>
                        <div className="space-y-4" style={{ '--primary-color': localTheme.primaryColor, '--accent-color': localTheme.accentColor } as React.CSSProperties}>
                            <button type="button" className="w-full text-center bg-[var(--primary-color)] text-white px-4 py-2 rounded-md text-sm font-semibold filter hover:brightness-90 transition-all">
                                Primary Button
                            </button>
                            <div className="text-center">
                                <a href="#" onClick={e => e.preventDefault()} className="text-[var(--primary-color)] hover:underline font-semibold">
                                    This is a primary link
                                </a>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-3 mb-3">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-md flex flex-col items-center justify-center font-bold text-center leading-none flex-shrink-0">
                                        <span className="text-lg">26</span>
                                        <span className="text-xs uppercase">Oct</span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-[var(--accent-color)] uppercase">Category Tag</span>
                                        <p className="font-semibold text-gray-800 leading-tight">An Example Item</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b-2 border-[var(--accent-color)] pb-2">
                                <h4 className="text-lg font-bold text-[#1e3c72]">Section Title</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {message && <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">{message}</div>}
                {canManage && (
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                            <Icon name="save" /> Save Theme
                        </button>
                    </div>
                )}
            </fieldset>
        </form>
    );
};

export default ThemeManagement;