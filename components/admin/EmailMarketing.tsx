import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { CustomEmail } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData

const ITEMS_PER_PAGE = 5;

const EmailMarketing: React.FC = () => {
    const { customEmails, sendCustomEmail, deleteCustomEmail, subscribers, smtpSettings, demoUserSettings, emailTemplates, generalSettings, securitySettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<CustomEmail | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const canManage = !isDemoUser || demoUserSettings.canSendEmails;
    
    const sortedEmails = [...customEmails].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedEmails, { itemsPerPage: ITEMS_PER_PAGE });

    const handlePageChange = (page: number) => {
        goToPage(page);
        const mainContent = document.getElementById('admin-main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;
        if (!subject || !body) {
            alert('Please fill in both subject and body.');
            return;
        }
        if (window.confirm(`Are you sure you want to send this email to all ${subscribers.filter(s => s.status === 'active').length} active subscribers?`)) {
            sendCustomEmail(subject, body);
            setSubject('');
            setBody('');
        }
    };

    const handleViewEmail = (email: CustomEmail) => {
        setSelectedEmail(email);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!canManage) return;
        if (window.confirm('Are you sure you want to delete this email record?')) {
            deleteCustomEmail(id);
        }
    };

    const handleLoadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        if (templateId) {
            const template = emailTemplates.find(t => t.id === templateId);
            if (template) {
                const siteNameRegex = /{{siteName}}/g;
                setSubject(template.subject.replace(siteNameRegex, generalSettings.siteTitle));
                setBody(template.body.replace(siteNameRegex, generalSettings.siteTitle));
            }
        }
        e.target.value = ''; // Reset dropdown after loading
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Composer */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Compose Email Campaign</h2>
                {!smtpSettings.configured && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <p className="text-sm text-yellow-700">
                            <strong>Warning:</strong> Email server is not configured. Emails will be simulated and added to history but <strong className="font-semibold">will not be sent</strong>.
                        </p>
                    </div>
                )}
                {canManage ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                             <div className="flex justify-between items-center">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Email Subject</label>
                                <select
                                    onChange={handleLoadTemplate}
                                    className="text-sm border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100"
                                    aria-label="Load an email template"
                                >
                                    <option value="">Load Template...</option>
                                    {emailTemplates.map(template => (
                                        <option key={template.id} value={template.id}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700">Email Body</label>
                            <textarea
                                id="body"
                                rows={10}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Write your email content here. HTML is not supported."
                                required
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2">
                                <Icon name="paper-plane" /> Send to All Subscribers
                            </button>
                        </div>
                    </form>
                ) : (
                     <div className="text-center py-10 border-dashed border-2 rounded-lg">
                        <Icon name="lock" className="text-4xl text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">Email campaigns are disabled in demo mode.</p>
                    </div>
                )}
            </div>

            {/* Sent Emails History */}
            <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm">
                 <h2 className="text-xl font-bold text-gray-700 mb-4">Sent Campaigns History</h2>
                 {paginatedData.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {paginatedData.map(email => (
                                <div key={email.id} className="border p-3 rounded-md hover:bg-gray-50 flex justify-between items-center gap-2">
                                    <div>
                                        <p className="font-semibold text-gray-800">{email.subject}</p>
                                        <p className="text-xs text-gray-500">Sent: {new Date(email.sentAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-3">
                                        <button onClick={() => handleViewEmail(email)} className="text-blue-500 hover:text-blue-700" title="View Email"><Icon name="eye" /></button>
                                        {canManage && <button onClick={() => handleDelete(email.id)} className="text-red-500 hover:text-red-700" title="Delete Record"><Icon name="trash" /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                 ) : (
                    <div className="text-center py-10">
                        <Icon name="history" className="text-4xl text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">No custom emails have been sent yet.</p>
                    </div>
                 )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sent Email Details">
                {selectedEmail && (
                    <div className="space-y-4">
                        <div>
                            <strong className="block text-sm text-gray-500">Subject:</strong>
                            <p>{selectedEmail.subject}</p>
                        </div>
                        <div>
                            <strong className="block text-sm text-gray-500">Sent:</strong>
                            <p>{new Date(selectedEmail.sentAt).toLocaleString()}</p>
                        </div>
                        <hr/>
                        <div>
                            <strong className="block text-sm text-gray-500">Email Body:</strong>
                            <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md mt-1">{selectedEmail.body}</p>
                        </div>
                         <div className="flex justify-end pt-4">
                             <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmailMarketing;