

import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { EmailNotification } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
import ConfirmationModal from './ConfirmationModal.tsx';

const ITEMS_PER_PAGE = 10;

const EmptyState: React.FC<{ message: string; }> = ({ message }) => (
    <div className="text-center py-16 border-t">
        <Icon name="history" className="text-5xl text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
    </div>
);

const NotificationHistory: React.FC = () => {
    const { emailNotifications, deleteEmailNotification, clearAllEmailNotifications } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null); // 'all' or an id
    const containerRef = useRef<HTMLDivElement>(null);

    const sortedNotifications = [...emailNotifications].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedNotifications, { itemsPerPage: ITEMS_PER_PAGE });

    const handlePageChange = (page: number) => {
        goToPage(page);
        containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleViewNotification = (notification: EmailNotification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);
    };
    
    const handleDeleteRequest = (id: string) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const handleClearAllRequest = () => {
        setItemToDelete('all');
        setIsConfirmModalOpen(true);
    };

    const confirmDeletion = () => {
        if (itemToDelete === 'all') {
            clearAllEmailNotifications();
        } else if (itemToDelete) {
            deleteEmailNotification(itemToDelete);
        }
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };
    
    const getConfirmMessage = () => {
        if (itemToDelete === 'all') {
            return 'Are you sure you want to delete all notification records? This action cannot be undone.';
        }
        const notif = emailNotifications.find(n => n.id === itemToDelete);
        return <>Are you sure you want to delete the notification record for <strong>{notif?.recipient}</strong> with subject: <strong>"{notif?.subject}"</strong>?</>;
    };

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-700">Notification History ({emailNotifications.length})</h2>
                {emailNotifications.length > 0 && (
                    <button onClick={handleClearAllRequest} className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700">
                        <Icon name="trash" /> Clear All History
                    </button>
                )}
            </div>
            {paginatedData.length > 0 ? (
            <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Recipient</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Sent At</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(notification => (
                            <tr key={notification.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Recipient" className="px-6 py-4 font-medium text-gray-900">{notification.recipient}</td>
                                <td data-label="Subject" className="px-6 py-4 truncate max-w-sm">{notification.subject}</td>
                                <td data-label="Sent At" className="px-6 py-4">{new Date(notification.sentAt).toLocaleString()}</td>
                                <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                    <button onClick={() => handleViewNotification(notification)} className="text-blue-500 hover:text-blue-700" aria-label={`View notification to ${notification.recipient}`}>
                                        <Icon name="eye" />
                                    </button>
                                    <button onClick={() => handleDeleteRequest(notification.id)} className="text-red-500 hover:text-red-700" aria-label={`Delete notification to ${notification.recipient}`}>
                                        <Icon name="trash" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
            ) : (
                <EmptyState message="No notifications have been sent yet." />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Notification Details`}>
                {selectedNotification && (
                    <div className="space-y-4">
                        <div>
                            <strong className="block text-sm text-gray-500">To:</strong>
                            <p>{selectedNotification.recipient}</p>
                        </div>
                        <div>
                            <strong className="block text-sm text-gray-500">Subject:</strong>
                            <p>{selectedNotification.subject}</p>
                        </div>
                        <div>
                            <strong className="block text-sm text-gray-500">Sent:</strong>
                            <p>{new Date(selectedNotification.sentAt).toLocaleString()}</p>
                        </div>
                        <hr/>
                        <div>
                            <strong className="block text-sm text-gray-500">Email Body:</strong>
                            <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md mt-1">{selectedNotification.body}</p>
                        </div>
                         <div className="flex justify-end pt-4">
                             <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDeletion}
                title="Confirm Deletion"
                message={getConfirmMessage()}
                confirmText="Delete"
            />
        </div>
    );
};

export default NotificationHistory;