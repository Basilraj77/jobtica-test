
import React, { useState } from 'react';
import Icon from '../Icon.tsx';
import AdManagement from './AdManagement.tsx';
import SEOManagement from './SEOManagement.tsx';
import SocialMediaManagement from './SocialMediaManagement.tsx';
import EmailSettings from './EmailSettings.tsx';
import { useData } from '../../contexts/DataContext.tsx';
import AlertSettingsManagement from './AlertSettingsManagement.tsx';
import ThemeManagement from './ThemeManagement.tsx';
import { SecuritySettingsManagement } from './SecuritySettingsManagement.tsx';

type SettingsTab = 'general' | 'seo' | 'ads' | 'social' | 'email' | 'alerts' | 'theme' | 'security' | 'search-console';

const GeneralSettingsManagement: React.FC = () => {
    const { generalSettings, updateGeneralSettings } = useData();
    const [formData, setFormData] = useState(generalSettings);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, siteIconUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, siteIconUrl: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateGeneralSettings(formData);
        setMessage('General settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-700">General Settings</h2>
             <div>
                <label className="block text-sm font-medium text-gray-700">Website Title</label>
                <input type="text" name="siteTitle" value={formData.siteTitle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Website Logo</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.siteIconUrl ? (
                        <img src={formData.siteIconUrl} alt="Current Logo" className="h-16 w-auto max-w-[64px] object-contain rounded-md border p-1 bg-gray-100" loading="lazy" />
                    ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center border">
                            <Icon name="image" className="text-3xl text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Upload Logo
                        </label>
                        {formData.siteIconUrl && (
                             <button type="button" onClick={handleRemoveLogo} className="ml-3 text-sm text-red-600 hover:underline">
                                Remove
                            </button>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Recommended: PNG, SVG, or JPG. Displayed at 64px height.</p>
                    </div>
                </div>
            </div>
             <div className="pt-4 border-t">
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                    <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                    <div>
                        <span className="font-medium text-gray-700">Enable Maintenance Mode</span>
                        <p className="text-xs text-gray-500">When enabled, public visitors will only see the maintenance page.</p>
                    </div>
                </label>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Maintenance Message</label>
                <textarea name="maintenanceMessage" value={formData.maintenanceMessage} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={!formData.maintenanceMode} />
            </div>
             <div className="pt-4 border-t">
                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                    <input type="checkbox" name="emailNotificationsEnabled" checked={formData.emailNotificationsEnabled} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                    <div>
                        <span className="font-medium text-gray-700">Enable Email Notifications</span>
                        <p className="text-xs text-gray-500">Send email alerts to subscribers when new jobs are posted.</p>
                    </div>
                </label>
             </div>
            {message && <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">{message}</div>}
             <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md hover:brightness-90 flex items-center gap-2 filter">
                    <Icon name="save" /> Save General Settings
                </button>
            </div>
        </form>
    )
}

const GoogleSearchConsoleManagement: React.FC = () => {
    const { googleSearchConsoleSettings, updateGoogleSearchConsoleSettings } = useData();
    const [tag, setTag] = useState(googleSearchConsoleSettings.verificationTag);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateGoogleSearchConsoleSettings({ verificationTag: tag });
        setMessage('Search Console settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2"><Icon name="google" prefix="fab" /> Google Search Console</h2>
            <p className="text-sm text-gray-600">
                Verify your site ownership with Google. Paste the entire HTML tag provided by Search Console (e.g., <code>{`<meta name="google-site-verification" content="..." />`}</code>).
            </p>
            <div>
                <label htmlFor="verificationTag" className="block text-sm font-medium text-gray-700">Verification HTML Tag</label>
                <input
                    type="text"
                    id="verificationTag"
                    name="verificationTag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                    placeholder='<meta name="google-site-verification" ... />'
                />
            </div>
            {message && <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">{message}</div>}
            <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md hover:brightness-90 flex items-center gap-2 filter">
                    <Icon name="save" /> Save Verification Tag
                </button>
            </div>
        </form>
    );
};


const SettingsManagement: React.FC<{ defaultTab?: SettingsTab }> = ({ defaultTab = 'general' }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettingsManagement />;
            case 'seo':
                return <SEOManagement />;
            case 'ads':
                return <AdManagement />;
            case 'social':
                return <SocialMediaManagement />;
            case 'email':
                return <EmailSettings />;
            case 'alerts':
                return <AlertSettingsManagement />;
            case 'theme':
                return <ThemeManagement />;
            case 'security':
                return <SecuritySettingsManagement />;
            case 'search-console':
                return <GoogleSearchConsoleManagement />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ tabName: SettingsTab; label: string; icon: string; prefix?: 'fas' | 'fab' | 'far' }> = ({ tabName, label, icon, prefix }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                activeTab === tabName
                    ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon name={icon} prefix={prefix} className="w-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <aside className="md:w-64">
                <nav className="flex flex-row overflow-x-auto md:flex-col gap-1 p-2 bg-gray-50 rounded-lg">
                    <TabButton tabName="general" label="General" icon="cog" />
                    <TabButton tabName="seo" label="SEO" icon="search" />
                    <TabButton tabName="ads" label="Advertisements" icon="ad" />
                    <TabButton tabName="social" label="Social Media" icon="share-alt" />
                    <TabButton tabName="email" label="Email (SMTP)" icon="envelope" />
                    <TabButton tabName="alerts" label="Alerts" icon="bullhorn" />
                    <TabButton tabName="theme" label="Theme" icon="palette" />
                    <TabButton tabName="security" label="Security" icon="shield-alt" />
                    <TabButton tabName="search-console" label="Search Console" icon="google" prefix="fab" />
                </nav>
            </aside>
            <main className="flex-1">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default SettingsManagement;