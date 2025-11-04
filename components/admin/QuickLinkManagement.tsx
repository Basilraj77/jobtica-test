import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { QuickLink } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData

const EmptyState: React.FC<{ message: string; buttonText?: string; onButtonClick?: () => void; }> = ({ message, buttonText, onButtonClick }) => (
    <div className="text-center py-16 border-t">
      <Icon name="link-slash" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
      {buttonText && onButtonClick && (
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
          <Icon name="plus" /> {buttonText}
        </button>
      )}
    </div>
);

const QuickLinkForm: React.FC<{ link?: QuickLink; onSave: (link: Omit<QuickLink, 'id'>, id?: string) => void; onCancel: () => void; uniqueCategories: string[]; }> = ({ link, onSave, onCancel, uniqueCategories }) => {
    const [formData, setFormData] = useState<Omit<QuickLink, 'id'>>(link ? { ...link } : {
        title: '',
        category: '',
        url: '',
        description: '',
        status: 'active'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, link?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Link Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Link URL *</label>
                    <input type="url" name="url" value={formData.url} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        list="ql-category-list"
                    />
                    <datalist id="ql-category-list">
                        {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save Link</button>
            </div>
        </form>
    );
};

const QuickLinkManagement: React.FC = () => {
    const { quickLinks, addQuickLink, updateQuickLink, deleteQuickLink, securitySettings, demoUserSettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<QuickLink | undefined>(undefined);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmProps, setConfirmProps] = useState<{title: string, message: React.ReactNode, onConfirm: () => void, confirmText?: string, confirmButtonClass?: string}>({
        title: '', message: '', onConfirm: () => {}
    });

    const canManage = !isDemoUser || demoUserSettings.canManageLinks;

    const uniqueCategories = useMemo(() => [...new Set(quickLinks.map(l => l.category).filter(Boolean))].sort(), [quickLinks]);

    const openConfirmModal = (props: Partial<typeof confirmProps>) => {
        setConfirmProps(prev => ({ ...prev, ...props }));
        setIsConfirmModalOpen(true);
    };

    const handleSave = (linkData: Omit<QuickLink, 'id'>, id?: string) => {
        if (!canManage) return;
        if (id) {
            updateQuickLink({ ...linkData, id });
        } else {
            addQuickLink(linkData);
        }
        setIsModalOpen(false);
        setEditingLink(undefined);
    };

    const handleEdit = (link: QuickLink) => {
        if (!canManage) return;
        setEditingLink(link);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (link: QuickLink) => {
        if (!canManage) return;
        openConfirmModal({
            title: 'Confirm Deletion',
            message: <>Are you sure you want to delete the link: <strong>"{link.title}"</strong>?</>,
            onConfirm: () => {
                deleteQuickLink(link.id);
                setIsConfirmModalOpen(false);
            },
            confirmText: 'Delete',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700'
        });
    };

    const handleExternalLinkClick = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        if (securitySettings.warnOnExternalLink) {
            openConfirmModal({
                title: 'External Link Warning',
                message: <>You are about to navigate to an external website: <strong>{url}</strong>. Do you wish to continue?</>,
                onConfirm: () => {
                    window.open(url, '_blank', 'noopener,noreferrer');
                    setIsConfirmModalOpen(false);
                },
                confirmText: 'Proceed',
                confirmButtonClass: 'bg-[var(--primary-color)] filter hover:brightness-90'
            });
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Quick Links</h2>
                {canManage && (
                    <button onClick={() => { setEditingLink(undefined); setIsModalOpen(true); }} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90">
                        <Icon name="plus" /> Add New Link
                    </button>
                )}
            </div>
            {quickLinks.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">URL</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quickLinks.map(link => (
                            <tr key={link.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Title" className="px-6 py-4 font-medium text-gray-900">{link.title}</td>
                                <td data-label="Category" className="px-6 py-4">{link.category}</td>
                                <td data-label="URL" className="px-6 py-4 truncate max-w-xs"><a href={link.url} onClick={(e) => handleExternalLinkClick(e, link.url)} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-color)] hover:underline">{link.url}</a></td>
                                <td data-label="Status" className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${link.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{link.status}</span>
                                </td>
                                <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                    {canManage && (
                                        <>
                                            <button onClick={() => handleEdit(link)} className="text-yellow-500 hover:text-yellow-700" aria-label={`Edit link: ${link.title}`}><Icon name="edit" /></button>
                                            <button onClick={() => handleDeleteRequest(link)} className="text-red-500 hover:text-red-700" aria-label={`Delete link: ${link.title}`}><Icon name="trash" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            ) : (
                <EmptyState 
                    message="No quick links have been added yet."
                    buttonText={canManage ? "Add New Link" : undefined}
                    onButtonClick={canManage ? () => { setEditingLink(undefined); setIsModalOpen(true); } : undefined}
                />
            )}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLink ? 'Edit Quick Link' : 'Add New Quick Link'}>
                <QuickLinkForm link={editingLink} onSave={handleSave} onCancel={() => setIsModalOpen(false)} uniqueCategories={uniqueCategories} />
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                {...confirmProps}
            />
        </div>
    );
};

export default QuickLinkManagement;