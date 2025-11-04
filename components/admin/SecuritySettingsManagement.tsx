

import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { SecuritySettings, DemoUserSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { initialSecuritySettings, initialDemoUserSettings } from '../../constants.ts';

const FAKE_QR_CODE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj48cGF0aCBmaWxsPSJibGFjayIgZD0iTTAgMGgyNTB2MjUwSDB6bTIwIDIwaDIxMHYyMTBIMjB6Ii8+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik01MCA1MGgxNTB2MTUwSDUwek02MCAxMDBoMzB2MzBINjB6TTEwMCAxMDBoMzB2MzBIMTAwek0xNDAgMTAwaDMwdjMwSDE0MHpNODAgMTQwaDMwdjMwSDgwek0xMjAgMTQwaDMwdjMwSDEyMHpNNjAgNjBoMzB2MzBINjB6TTEwMCA2MGgzMHYzMEgxMDB6TTE0MCA2MGgzMHYzMEgxNDB6Ii8+PHBhdGggZmlsbD0iYmxhY2siIGQ9Ik03MCA3MGgxMHYxMEg3MHpNMTEwIDcwaDEwdjEwSDExMHpNMTUwIDcwaDEwdjEwSDE1MHpNNzAgOTBoMTB2MTBINzB6TTEzMCA5MGgxMHYxMEgxMzB6TTE3MCA5MGgxMHYxMEgxNzB6TTcwIDExMGgxMHYxMEg3MHpNOTAgMTMwaDEwdjEwSDkwelpNMTUwIDEzMGgxMHYxMEgxNTB6TTcwIDE1MGgxMHYxMEg3MHpNMTEwIDE1MGgxMHYxMEgxMTB6TTE1MCAxNzBoMTB2MTBIMTUweiIvPjwvc3ZnPg==";

const PermissionCheckbox: React.FC<{ name: keyof DemoUserSettings; label: string; settings: DemoUserSettings; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ name, label, settings, onChange }) => (
    <label className="flex items-center gap-2 text-sm">
        <input 
            type="checkbox"
            name={name}
            checked={settings[name]}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300"
        />
        <span>{label}</span>
    </label>
);

export const SecuritySettingsManagement: React.FC = () => {
    const { securitySettings, updateSecuritySettings, demoUserSettings, updateDemoUserSettings } = useData();
    const [localSecurity, setLocalSecurity] = useState<SecuritySettings>(securitySettings || initialSecuritySettings);
    const [localDemo, setLocalDemo] = useState<DemoUserSettings>(demoUserSettings || initialDemoUserSettings);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setLocalSecurity(securitySettings || initialSecuritySettings);
        setLocalDemo(demoUserSettings || initialDemoUserSettings);
    }, [securitySettings, demoUserSettings]);
    
    const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setLocalSecurity(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'autoLogoutMinutes' || name === 'demoSessionTimeoutMinutes' ? Number(value) : value)
        }));
    };

    const handleDemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLocalDemo(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSecuritySettings(localSecurity);
        updateDemoUserSettings(localDemo);
        setMessage('Security settings saved successfully!');
        window.scrollTo(0, 0);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-700">Security Settings</h2>
                {message && <div className="text-sm text-green-600 font-medium flex items-center gap-2"><Icon name="check-circle" /> {message}</div>}
            </div>
            
            <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border cursor-pointer">
                    <input type="checkbox" name="enableCSP" checked={localSecurity.enableCSP} onChange={handleSecurityChange} className="h-4 w-4 rounded border-gray-300"/>
                    <div>
                        <span className="font-medium text-gray-700">Enable Content Security Policy (CSP)</span>
                        <p className="text-xs text-gray-500">Helps prevent XSS attacks by controlling which resources can be loaded. Recommended to keep enabled.</p>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border cursor-pointer">
                    <input type="checkbox" name="warnOnExternalLink" checked={localSecurity.warnOnExternalLink} onChange={handleSecurityChange} className="h-4 w-4 rounded border-gray-300"/>
                    <div>
                        <span className="font-medium text-gray-700">Warn on External Link Clicks</span>
                        <p className="text-xs text-gray-500">Show a confirmation modal before navigating to external sites from the admin panel.</p>
                    </div>
                </label>
                 <label className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border cursor-pointer">
                    <input type="checkbox" name="preventContentCopy" checked={localSecurity.preventContentCopy} onChange={handleSecurityChange} className="h-4 w-4 rounded border-gray-300"/>
                    <div>
                        <span className="font-medium text-gray-700">Prevent Content Copy & Print (Public Site)</span>
                        <p className="text-xs text-gray-500">Disables text selection, right-click, and printing on the public website to deter content theft.</p>
                    </div>
                </label>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Inactivity Timeout</label>
                    <select name="autoLogoutMinutes" value={localSecurity.autoLogoutMinutes} onChange={handleSecurityChange} className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white">
                        <option value={0}>Never</option>
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                    </select>
                     <p className="text-xs text-gray-500 mt-1">Automatically log out the admin after a period of inactivity for security.</p>
                </div>
            </div>

            <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Factor Authentication (2FA) - Simulation</h3>
                <div className="relative p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="absolute top-0 right-0 -mt-3 mr-3 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                        Simulation
                    </div>
                     <label className="flex items-center gap-3 p-2">
                        <input type="checkbox" name="enable2FASimulation" checked={localSecurity.enable2FASimulation} onChange={handleSecurityChange} className="h-4 w-4 rounded border-gray-300"/>
                        <span className="font-medium text-gray-700">Enable 2FA</span>
                    </label>
                    <div className={`mt-4 space-y-4 ${!localSecurity.enable2FASimulation ? 'opacity-50' : ''}`}>
                        <p className="text-sm text-gray-600">Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the code to verify.</p>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <img src={FAKE_QR_CODE_SVG} alt="Fake QR Code" className="w-32 h-32 border p-1 bg-white" />
                            <div className="w-full sm:w-auto">
                                <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                                <input type="text" placeholder="123456" maxLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" disabled={!localSecurity.enable2FASimulation}/>
                                <button type="button" className="mt-2 bg-gray-600 text-white px-4 py-2 text-sm rounded-md hover:bg-gray-700 w-full" disabled={!localSecurity.enable2FASimulation}>Verify & Activate</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Demo User Mode</h3>
                <label className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border cursor-pointer">
                    <input type="checkbox" name="demoModeEnabled" checked={localSecurity.demoModeEnabled} onChange={handleSecurityChange} className="h-4 w-4 rounded border-gray-300"/>
                    <div>
                        <span className="font-medium text-gray-700">Enable Demo User Login</span>
                        <p className="text-xs text-gray-500">Adds a "Login as Demo User" button on the login page with restricted access.</p>
                    </div>
                </label>
                {localSecurity.demoModeEnabled && (
                    <>
                    <div className="mt-4 pl-4">
                        <label className="block text-sm font-medium text-gray-700">Demo Session Timeout</label>
                        <select name="demoSessionTimeoutMinutes" value={localSecurity.demoSessionTimeoutMinutes} onChange={handleSecurityChange} className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white">
                            <option value={0}>Never</option>
                            <option value={5}>5 Minutes</option>
                            <option value={10}>10 Minutes</option>
                            <option value={15}>15 Minutes</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Automatically log out demo users after a period of inactivity.</p>
                    </div>
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
                        <h4 className="font-medium text-gray-700">Demo User Permissions</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                           <PermissionCheckbox name="canManageJobs" label="Manage Jobs" settings={localDemo} onChange={handleDemoChange} />
                           <PermissionCheckbox name="canManageContent" label="Manage Content" settings={localDemo} onChange={handleDemoChange} />
                           <PermissionCheckbox name="canManageLinks" label="Manage Links" settings={localDemo} onChange={handleDemoChange} />
                           <PermissionCheckbox name="canManageAudience" label="Manage Audience" settings={localDemo} onChange={handleDemoChange} />
                           <PermissionCheckbox name="canSendEmails" label="Send Emails" settings={localDemo} onChange={handleDemoChange} />
                           <PermissionCheckbox name="canManageAds" label="Manage Ads" settings={localDemo} onChange={handleDemoChange} />
                           <PermissionCheckbox name="canChangeTheme" label="Change Theme" settings={localDemo} onChange={handleDemoChange} />
                        </div>
                    </div>
                    </>
                )}
            </div>

            <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                    <Icon name="save" /> Save Security Settings
                </button>
            </div>
        </form>
    );
};