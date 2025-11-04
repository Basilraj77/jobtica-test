import React, { useState, useEffect, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { AdSettings, ABTest, GeoTargetedAd, PlacementSetting } from '../../types.ts';
import Icon from '../Icon.tsx';
import { initialAdSettings } from '../../constants.ts';

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

const AdManagement: React.FC = () => {
    const { adSettings, updateAdSettings } = useData();
    const [formData, setFormData] = useState<AdSettings>(adSettings || initialAdSettings);
    const [activeSection, setActiveSection] = useState<string>('placements');
    const [message, setMessage] = useState('');
    
    // Ensure local form data is synced if context data changes externally
    useEffect(() => {
        setFormData(adSettings || initialAdSettings);
    }, [adSettings]);

    const handleToggleSection = (section: string) => {
        setActiveSection(prev => prev === section ? '' : section);
    };

    const handleNestedChange = (path: (string | number)[], value: any) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy for safety
            let current: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newState;
        });
    };

    const handleAddCustomAd = () => {
        handleNestedChange(['customAds', 'codes'], [...formData.customAds.codes, '']);
    };
    const handleRemoveCustomAd = (index: number) => {
        handleNestedChange(['customAds', 'codes'], formData.customAds.codes.filter((_, i) => i !== index));
    };

    const handleAddGeoRule = () => {
        const newRule: GeoTargetedAd = { id: Date.now().toString(), country: 'IN', code: '' };
        handleNestedChange(['geoTargeting', 'rules'], [...formData.geoTargeting.rules, newRule]);
    };
    const handleRemoveGeoRule = (id: string) => {
        handleNestedChange(['geoTargeting', 'rules'], formData.geoTargeting.rules.filter(rule => rule.id !== id));
    };

    const calculateCTR = (clicks: number, impressions: number) => {
        if (impressions === 0) return '0.00%';
        return ((clicks / impressions) * 100).toFixed(2) + '%';
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateAdSettings(formData);
        setMessage('Ad settings saved successfully!');
        window.scrollTo(0, 0);
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    };

    const AdNetworkInput: React.FC<{ networkKey: keyof AdSettings['adNetworks']; label: string; icon?: string; iconPrefix?: 'fab' | 'fas' }> = ({ networkKey, label, icon, iconPrefix = 'fab' }) => (
        <div className="p-4 border rounded-lg bg-white">
            <h4 className="text-lg font-semibold flex items-center gap-2 mb-2">
                {icon && <Icon prefix={iconPrefix} name={icon} />} {label}
            </h4>
            <div className="space-y-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ad Code / Script</label>
                    <textarea 
                        value={formData.adNetworks[networkKey]?.code || ''} 
                        onChange={e => handleNestedChange(['adNetworks', networkKey, 'code'], e.target.value)}
                        rows={4} 
                        className="mt-1 block w-full font-mono text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <input 
                        type="text"
                        value={formData.adNetworks[networkKey]?.notes || ''} 
                        onChange={e => handleNestedChange(['adNetworks', networkKey, 'notes'], e.target.value)}
                        className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                        placeholder="e.g., '300x250 sidebar unit'"
                    />
                </div>
            </div>
        </div>
    );

    type PlacementKey = keyof Pick<AdSettings, 'headerAd' | 'sidebarAd' | 'footerAd' | 'inFeedJobsAd' | 'inFeedBlogAd' | 'jobDetailTopAd' | 'blogDetailTopAd'>;

    const PlacementEditor: React.FC<{
        placementKey: PlacementKey;
        label: string;
    }> = ({ placementKey, label }) => {
        const placement = formData[placementKey] as PlacementSetting || { enabled: false, type: 'network', networkKey: '', customCode: '' };
        
        const handlePlacementChange = (field: keyof PlacementSetting, value: any) => {
            handleNestedChange([placementKey, field], value);
        };
        
        return (
            <div>
                <label className="flex items-center gap-3 mb-2">
                    <input
                        type="checkbox"
                        checked={placement.enabled}
                        onChange={(e) => handlePlacementChange('enabled', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="font-medium text-gray-700">{label}</span>
                </label>
                <div className={`pl-7 space-y-2 ${!placement.enabled ? 'opacity-50' : ''}`}>
                    <select
                        value={placement.type}
                        onChange={(e) => handlePlacementChange('type', e.target.value)}
                        disabled={!placement.enabled}
                        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    >
                        <option value="custom">Custom Code</option>
                        <option value="network">From Ad Code Library</option>
                    </select>
                    
                    {placement.type === 'network' ? (
                        <select
                            value={placement.networkKey}
                            onChange={(e) => handlePlacementChange('networkKey', e.target.value)}
                            disabled={!placement.enabled}
                            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        >
                            <option value="">-- Select an Ad Network --</option>
                            {Object.keys(formData.adNetworks).map((key) => {
                                const networkKey = key as keyof AdSettings['adNetworks'];
                                const value = formData.adNetworks[networkKey];
                                return (
                                <option key={key} value={key}>
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    {value.notes ? ` (${value.notes})` : ''}
                                </option>
                                );
                            })}
                        </select>
                    ) : (
                        <textarea
                            value={placement.customCode}
                            onChange={(e) => handlePlacementChange('customCode', e.target.value)}
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                            disabled={!placement.enabled}
                            placeholder="Paste your ad code here"
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-700">Ad Settings</h2>
                {message && <div className="text-sm text-green-600 font-medium flex items-center gap-2"><Icon name="check-circle" /> {message}</div>}
            </div>
            
            <AccordionSection title="Ad Placements" isOpen={activeSection === 'placements'} onToggle={() => handleToggleSection('placements')}>
                <div className="space-y-6">
                    <PlacementEditor placementKey="headerAd" label="Header Ad" />
                    <PlacementEditor placementKey="sidebarAd" label="Sidebar Ad" />
                    <PlacementEditor placementKey="footerAd" label="Footer Ad" />
                    <PlacementEditor placementKey="inFeedJobsAd" label="In-Feed Job List Ad" />
                    <PlacementEditor placementKey="inFeedBlogAd" label="In-Feed Blog List Ad" />
                    <PlacementEditor placementKey="jobDetailTopAd" label="Ad on Top of Job Detail Page" />
                    <PlacementEditor placementKey="blogDetailTopAd" label="Ad on Top of Blog Detail Page" />
                </div>
            </AccordionSection>
            
            <AccordionSection title="Ad Code Library" isOpen={activeSection === 'ad_networks'} onToggle={() => handleToggleSection('ad_networks')}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Use this section as a central library to store your ad codes from different networks. You can then select these codes in the "Ad Placements" section above.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AdNetworkInput networkKey="googleAdSense" label="Google AdSense" icon="google" />
                        <AdNetworkInput networkKey="adsterra" label="Adsterra" />
                        <AdNetworkInput networkKey="mediaNet" label="Media.net" />
                        <AdNetworkInput networkKey="ezoic" label="Ezoic" />
                        <AdNetworkInput networkKey="propellerAds" label="PropellerAds" />
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection title="Global Display Settings" isOpen={activeSection === 'display'} onToggle={() => handleToggleSection('display')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ad Frequency (In-Feed)</label>
                        <select name="adFrequency" value={formData.adFrequency} onChange={e => handleNestedChange(['adFrequency'], e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ad Scheduling</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="time" name="adStartTime" value={formData.adStartTime} onChange={e => handleNestedChange(['adStartTime'], e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <span>to</span>
                            <input type="time" name="adEndTime" value={formData.adEndTime} onChange={e => handleNestedChange(['adEndTime'], e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Ad Types to Show</label>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                            <label className="flex items-center gap-2"><input type="checkbox" name="bannerAds" checked={formData.bannerAds} onChange={e => handleNestedChange(['bannerAds'], e.target.checked)} /> Banner Ads</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="squareAds" checked={formData.squareAds} onChange={e => handleNestedChange(['squareAds'], e.target.checked)} /> Square Ads</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="skyscraperAds" checked={formData.skyscraperAds} onChange={e => handleNestedChange(['skyscraperAds'], e.target.checked)} /> Skyscraper Ads</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="popupAds" checked={formData.popupAds} onChange={e => handleNestedChange(['popupAds'], e.target.checked)} /> Popup Ads</label>
                        </div>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection title="A/B Testing" isOpen={activeSection === 'abtesting'} onToggle={() => handleToggleSection('abtesting')}>
                <p className="text-sm text-gray-600 mb-6">Run tests to see which ad variations perform better. The stats below are for demonstration purposes.</p>
                <div className="space-y-8">
                    {formData.abTests.map((test, index) => (
                        <div key={test.id} className="p-4 border rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold">{test.placement} Ad Test</h4>
                                 <label className="flex items-center gap-2 text-sm font-medium">
                                    <input type="checkbox" checked={test.enabled} onChange={e => handleNestedChange(['abTests', index, 'enabled'], e.target.checked)} className="h-4 w-4 rounded border-gray-300"/>
                                    Enable Test
                                </label>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Variation A Code</label>
                                    <textarea value={test.codeA} onChange={e => handleNestedChange(['abTests', index, 'codeA'], e.target.value)} rows={4} className="mt-1 block w-full font-mono text-sm border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Variation B Code</label>
                                    <textarea value={test.codeB} onChange={e => handleNestedChange(['abTests', index, 'codeB'], e.target.value)} rows={4} className="mt-1 block w-full font-mono text-sm border-gray-300 rounded-md"/>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-md">
                                <h5 className="font-semibold mb-3">Performance (Simulated)</h5>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="font-medium text-gray-500">Metric</div>
                                    <div className="grid grid-cols-2 gap-4 font-medium text-gray-500"><div className="text-center">Variation A</div><div className="text-center">Variation B</div></div>
                                    
                                    <div className="text-gray-800">Impressions</div>
                                    <div className="grid grid-cols-2 gap-4"><div className="text-center">{test.stats.impressionsA.toLocaleString()}</div><div className="text-center">{test.stats.impressionsB.toLocaleString()}</div></div>
                                    
                                    <div className="text-gray-800">Clicks</div>
                                    <div className="grid grid-cols-2 gap-4"><div className="text-center">{test.stats.clicksA.toLocaleString()}</div><div className="text-center">{test.stats.clicksB.toLocaleString()}</div></div>
                                    
                                    <div className="text-gray-800 font-bold">CTR</div>
                                    <div className="grid grid-cols-2 gap-4 font-bold"><div className="text-center text-green-600">{calculateCTR(test.stats.clicksA, test.stats.impressionsA)}</div><div className="text-center text-green-600">{calculateCTR(test.stats.clicksB, test.stats.impressionsB)}</div></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionSection>

            <AccordionSection title="Advanced Targeting (Simulation)" isOpen={activeSection === 'targeting'} onToggle={() => handleToggleSection('targeting')}>
                 <div className="space-y-6">
                    {/* Device Targeting */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Targeting</h3>
                        <label className="flex items-center gap-3 mb-4">
                            <input type="checkbox" checked={formData.deviceTargeting.enabled} onChange={e => handleNestedChange(['deviceTargeting', 'enabled'], e.target.checked)} className="h-4 w-4 rounded border-gray-300"/>
                            <span>Enable Device-Specific Ads</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Desktop Ad Code</label>
                                <textarea value={formData.deviceTargeting.desktopCode} onChange={e => handleNestedChange(['deviceTargeting', 'desktopCode'], e.target.value)} rows={3} className="mt-1 block w-full font-mono text-sm border-gray-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile Ad Code</label>
                                <textarea value={formData.deviceTargeting.mobileCode} onChange={e => handleNestedChange(['deviceTargeting', 'mobileCode'], e.target.value)} rows={3} className="mt-1 block w-full font-mono text-sm border-gray-300 rounded-md"/>
                            </div>
                        </div>
                    </div>
                     {/* Geo Targeting */}
                    <div className="border-t pt-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Geo Targeting</h3>
                          <label className="flex items-center gap-3 mb-4">
                            <input type="checkbox" checked={formData.geoTargeting.enabled} onChange={e => handleNestedChange(['geoTargeting', 'enabled'], e.target.checked)} className="h-4 w-4 rounded border-gray-300"/>
                            <span>Enable Geo-Targeted Ads</span>
                        </label>
                        <div className="space-y-4">
                            {formData.geoTargeting.rules.map((rule, index) => (
                                <div key={rule.id} className="flex items-end gap-2 p-3 bg-gray-100 rounded-md">
                                    <div className="w-1/4">
                                        <label className="block text-sm font-medium text-gray-700">Country</label>
                                        <select value={rule.country} onChange={e => handleNestedChange(['geoTargeting', 'rules', index, 'country'], e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md">
                                            <option value="IN">India</option>
                                            <option value="US">United States</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="CA">Canada</option>
                                        </select>
                                    </div>
                                    <div className="flex-grow">
                                        <label className="block text-sm font-medium text-gray-700">Ad Code</label>
                                        <textarea value={rule.code} onChange={e => handleNestedChange(['geoTargeting', 'rules', index, 'code'], e.target.value)} rows={2} className="mt-1 block w-full font-mono text-sm border-gray-300 rounded-md"/>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveGeoRule(rule.id)} className="text-red-500 hover:text-red-700 p-2"><Icon name="trash" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddGeoRule} className="mt-2 text-sm text-indigo-600 hover:underline flex items-center gap-1"><Icon name="plus-circle"/> Add Geo Rule</button>
                    </div>
                 </div>
            </AccordionSection>

             <div className="flex justify-end mt-6 p-4 border-t bg-gray-50">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 text-base font-semibold flex items-center gap-2">
                    <Icon name="save" /> Save Ad Settings
                </button>
            </div>
        </form>
    );
};

export default AdManagement;