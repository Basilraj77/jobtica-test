
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { AlertSettings } from '../../types.ts';
import Icon from '../Icon.tsx';
import { initialAlertSettings } from '../../constants.ts';

const AlertSettingsManagement: React.FC = () => {
    const { alertSettings, updateAlertSettings } = useData();
    const [formData, setFormData] = useState<AlertSettings>(alertSettings || initialAlertSettings);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setFormData(alertSettings || initialAlertSettings);
    }, [alertSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const [section, field] = name.split('.');
        
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof AlertSettings],
                [field]: type === 'checkbox' ? checked : value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAlertSettings(formData);
        setMessage('Alert settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div className="relative p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="absolute top-0 right-0 -mt-3 mr-3 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                    Coming Soon
                </div>
                <fieldset disabled className="opacity-60 space-y-4">
                    {/* WhatsApp Settings */}
                    <div className="pt-2">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Icon prefix="fab" name="whatsapp" className="text-green-500" /> WhatsApp Alerts
                        </h3>
                        <label className="flex items-center gap-3 p-2 mt-2">
                            <input type="checkbox" name="whatsApp.enabled" checked={formData.whatsApp.enabled} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                            <span className="font-medium text-gray-700">Enable WhatsApp Notifications</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">WhatsApp Business API Key</label>
                                <input type="password" name="whatsApp.apiKey" value={formData.whatsApp.apiKey} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Sender Phone Number</label>
                                <input type="text" name="whatsApp.senderNumber" value={formData.whatsApp.senderNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                        </div>
                    </div>

                    {/* SMS Settings */}
                     <div className="pt-4 border-t">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Icon name="sms" className="text-blue-500" /> SMS Alerts (Twilio)
                        </h3>
                         <label className="flex items-center gap-3 p-2 mt-2">
                            <input type="checkbox" name="sms.enabled" checked={formData.sms.enabled} onChange={handleChange} className="h-4 w-4 rounded border-gray-300"/>
                            <span className="font-medium text-gray-700">Enable SMS Notifications</span>
                        </label>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Twilio Account SID</label>
                                <input type="password" name="sms.twilioSid" value={formData.sms.twilioSid} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Twilio Auth Token</label>
                                <input type="password" name="sms.twilioToken" value={formData.sms.twilioToken} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Twilio Phone Number</label>
                                <input type="text" name="sms.twilioNumber" value={formData.sms.twilioNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
            
            {message && <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">{message}</div>}
             <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2" disabled>
                    <Icon name="save" /> Save Alert Settings
                </button>
            </div>
        </form>
    );
};

export default AlertSettingsManagement;