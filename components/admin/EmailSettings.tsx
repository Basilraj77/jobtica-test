

import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { SMTPSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { initialSmtpSettings } from '../../constants.ts';

const EmailSettings: React.FC = () => {
    const { smtpSettings, updateSmtpSettings } = useData();
    const [formData, setFormData] = useState<SMTPSettings>(smtpSettings || initialSmtpSettings);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setFormData(smtpSettings || initialSmtpSettings);
    }, [smtpSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSmtpSettings(formData);
        setMessage('SMTP settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-700">Email (SMTP) Settings</h2>
            <p className="text-sm text-gray-600">
                Configure your SMTP server to send email notifications to subscribers. If not configured, emails will be simulated (logged in history but not sent).
            </p>

            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 border mt-2">
                <input type="checkbox" name="configured" checked={formData.configured} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                <span className="font-medium text-gray-700">SMTP is Configured & Active</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                    <input type="text" name="host" value={formData.host} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                    <input type="number" name="port" value={formData.port} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP User</label>
                    <input type="text" name="user" value={formData.user} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
                    <input type="password" name="pass" value={formData.pass} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">From Email</label>
                    <input type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">From Name</label>
                    <input type="text" name="fromName" value={formData.fromName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            
            <div className="pt-2">
                <label className="flex items-center gap-2">
                    <input type="checkbox" name="secure" checked={formData.secure} onChange={handleChange} />
                    <span className="text-sm font-medium text-gray-700">Use SSL/TLS</span>
                </label>
            </div>

            {message && <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">{message}</div>}
             <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                    <Icon name="save" /> Save SMTP Settings
                </button>
            </div>
        </form>
    );
};

export default EmailSettings;