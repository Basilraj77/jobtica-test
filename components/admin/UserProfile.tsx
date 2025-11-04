import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import Icon from '../Icon.tsx';

const UserProfile: React.FC = () => {
    const { updateCredentials, userEmail } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!currentPassword || !newUsername || !newPassword) {
            setMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }

        const success = await updateCredentials(currentPassword, newUsername, newPassword);

        if (success) {
            setMessage({ type: 'success', text: 'Credentials updated successfully!' });
            // Clear fields after successful update
            setCurrentPassword('');
            setNewUsername('');
            setNewPassword('');
        } else {
            setMessage({ type: 'error', text: 'Incorrect current password.' });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Update Admin Credentials</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Email (for OTP)</label>
                    <input
                        type="email"
                        value={userEmail || ''}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password *</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Username *</label>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password *</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-md text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                        <Icon name="save" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;