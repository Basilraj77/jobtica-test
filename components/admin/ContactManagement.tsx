import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { ContactSubmission } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
import ConfirmationModal from './ConfirmationModal.tsx';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData

const ITEMS_PER_PAGE = 10;

const EmptyState: React.FC<{ message: string; }> = ({ message }) => (
    <div className="text-center py-16 border-t">
      <Icon name="envelope-open-text" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
    </div>
);

const ContactManagement: React.FC = () => {
    const { contacts, deleteContact, demoUserSettings, securitySettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<ContactSubmission | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const canManage = !isDemoUser || demoUserSettings.canManageAudience;

    // Sort contacts by most recent first
    const sortedContacts = [...contacts].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedContacts, { itemsPerPage: ITEMS_PER_PAGE });

    const handlePageChange = (page: number) => {
        goToPage(page);
        containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleViewMessage = (contact: ContactSubmission) => {
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (contact: ContactSubmission) => {
        if (!canManage) return;
        setContactToDelete(contact);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (contactToDelete) {
            deleteContact(contactToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setContactToDelete(null);
    };

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Contact Form Submissions</h2>
            {contacts.length > 0 ? (
            <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Submitted At</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(contact => (
                            <tr key={contact.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Name" className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                                <td data-label="Email" className="px-6 py-4">{contact.email}</td>
                                <td data-label="Subject" className="px-6 py-4">{contact.subject}</td>
                                <td data-label="Submitted" className="px-6 py-4">{new Date(contact.submittedAt).toLocaleString()}</td>
                                <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                    <button onClick={() => handleViewMessage(contact)} className="text-blue-500 hover:text-blue-700" aria-label={`View message from ${contact.name}`}>
                                        <Icon name="eye" />
                                    </button>
                                    {canManage && (
                                        <button onClick={() => handleDeleteRequest(contact)} className="text-red-500 hover:text-red-700" aria-label={`Delete message from ${contact.name}`}>
                                            <Icon name="trash" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
            ) : (
                <EmptyState message="No contact messages have been received yet." />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Message from ${selectedContact?.name}`}>
                {selectedContact && (
                    <div className="space-y-4">
                        <div>
                            <strong className="block text-sm text-gray-500">From:</strong>
                            <p>{selectedContact.name} &lt;{selectedContact.email}&gt;</p>
                        </div>
                        <div>
                            <strong className="block text-sm text-gray-500">Date:</strong>
                            <p>{new Date(selectedContact.submittedAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <strong className="block text-sm text-gray-500">Subject:</strong>
                            <p>{selectedContact.subject}</p>
                        </div>
                        <div>
                            <strong className="block text-sm text-gray-500">Message:</strong>
                            <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md mt-1">{selectedContact.message}</p>
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
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={<>Are you sure you want to delete the message with subject: <strong>"{contactToDelete?.subject}"</strong>?</>}
                confirmText="Delete"
            />
        </div>
    );
};

export default ContactManagement;