import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import Icon from '../Icon.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { Subscriber } from '../../types.ts';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData

const EmptyState: React.FC<{ message: string; }> = ({ message }) => (
    <div className="text-center py-16 border-t">
      <Icon name="users" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
    </div>
);

const SubscriberManagement: React.FC = () => {
    const { subscribers, deleteSubscriber, demoUserSettings, securitySettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

    const canManage = !isDemoUser || demoUserSettings.canManageAudience;

    const handleDeleteRequest = (subscriber: Subscriber) => {
        if (!canManage) return;
        setSubscriberToDelete(subscriber);
        setIsConfirmModalOpen(true);
    };
    
    const confirmDelete = () => {
        if (subscriberToDelete) {
            deleteSubscriber(subscriberToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setSubscriberToDelete(null);
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) {
            alert('No subscribers to export.');
            return;
        }

        const headers = ['id', 'email', 'subscriptionDate', 'status'];
        const csvRows = [
            headers.join(','),
            ...subscribers.map(sub => 
                [sub.id, sub.email, sub.subscriptionDate, sub.status].join(',')
            )
        ];
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'subscribers.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-700">All Subscribers ({subscribers.length})</h2>
                 <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700">
                    <Icon name="file-csv" /> Export CSV
                </button>
            </div>
            {subscribers.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Subscription Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map(sub => (
                             <tr key={sub.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Email" className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                                <td data-label="Subscribed On" className="px-6 py-4">{sub.subscriptionDate}</td>
                                <td data-label="Status" className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{sub.status}</span></td>
                                <td data-label="Actions" className="px-6 py-4 actions-cell">
                                     {canManage && (
                                        <button onClick={() => handleDeleteRequest(sub)} className="text-red-500 hover:text-red-700" aria-label={`Delete subscriber: ${sub.email}`}>
                                            <Icon name="trash" />
                                        </button>
                                     )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            ) : (
                <EmptyState message="There are no subscribers yet." />
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={<>Are you sure you want to delete the subscriber: <strong>"{subscriberToDelete?.email}"</strong>?</>}
                confirmText="Delete"
            />
        </div>
    );
};

export default SubscriberManagement;