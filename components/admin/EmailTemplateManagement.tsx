import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { EmailTemplate } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

const EmptyState: React.FC<{ message: string; buttonText?: string; onButtonClick?: () => void; }> = ({ message, buttonText, onButtonClick }) => (
    <div className="text-center py-16 border-t">
      <Icon name="envelope-open-text" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
      {buttonText && onButtonClick && (
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
          <Icon name="plus" /> {buttonText}
        </button>
      )}
    </div>
);

const TemplateForm: React.FC<{ template?: EmailTemplate; onSave: (template: Omit<EmailTemplate, 'id'>, id?: string) => void; onCancel: () => void; }> = ({ template, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>(template ? { ...template } : {
        name: '', subject: '', body: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, template?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Template Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required placeholder="e.g., New Job Alert" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Email Body *</label>
                <textarea name="body" value={formData.body} onChange={handleChange} rows={8} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>

            <div className="text-sm p-3 bg-gray-50 rounded-md border">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Icon name="info-circle" /> Placeholder Guide</h4>
                <p className="text-gray-600">Use placeholders to insert dynamic content. They will be replaced automatically when an email is sent.</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                    <li><code>{`{{siteName}}`}</code> - Your website's title.</li>
                    <li><code>{`{{subscriberName}}`}</code> - The subscriber's name (e.g., "John Doe" from "john.doe@email.com").</li>
                    <li><code>{`{{subscriberEmail}}`}</code> - The subscriber's full email address.</li>
                    <li className="pt-1 mt-1 border-t"><strong>For Job Alerts:</strong> <code>{`{{jobTitle}}`}</code>, <code>{`{{jobDepartment}}`}</code>, <code>{`{{jobLastDate}}`}</code>, <code>{`{{jobLink}}`}</code>.</li>
                </ul>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save Template</button>
            </div>
        </form>
    );
};

const EmailTemplateManagement: React.FC = () => {
    const { emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate, demoUserSettings } = useData();
    const { isDemoUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | undefined>(undefined);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

    const canManage = !isDemoUser || demoUserSettings.canSendEmails;

    const handleSave = (templateData: Omit<EmailTemplate, 'id'>, id?: string) => {
        if (!canManage) return;
        if (id) {
            updateEmailTemplate({ ...templateData, id });
        } else {
            addEmailTemplate(templateData);
        }
        setIsModalOpen(false);
        setEditingTemplate(undefined);
    };

    const handleEdit = (template: EmailTemplate) => {
        if (!canManage) return;
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (template: EmailTemplate) => {
        if (!canManage) return;
        setTemplateToDelete(template);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (templateToDelete) {
            deleteEmailTemplate(templateToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setTemplateToDelete(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Email Templates</h2>
                {canManage && (
                    <button onClick={() => { setEditingTemplate(undefined); setIsModalOpen(true); }} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90">
                        <Icon name="plus" /> Create Template
                    </button>
                )}
            </div>
            {emailTemplates.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Template Name</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emailTemplates.map(template => (
                            <tr key={template.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Name" className="px-6 py-4 font-medium text-gray-900">{template.name}</td>
                                <td data-label="Subject" className="px-6 py-4">{template.subject}</td>
                                <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                    {canManage && (
                                        <>
                                            <button onClick={() => handleEdit(template)} className="text-yellow-500 hover:text-yellow-700" aria-label={`Edit template: ${template.name}`}><Icon name="edit" /></button>
                                            <button onClick={() => handleDeleteRequest(template)} className="text-red-500 hover:text-red-700" aria-label={`Delete template: ${template.name}`}><Icon name="trash" /></button>
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
                    message="No email templates have been created yet."
                    buttonText={canManage ? "Create Template" : undefined}
                    onButtonClick={canManage ? () => { setEditingTemplate(undefined); setIsModalOpen(true); } : undefined}
                />
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}>
                <TemplateForm template={editingTemplate} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={<>Are you sure you want to delete the template: <strong>"{templateToDelete?.name}"</strong>?</>}
                confirmText="Delete"
            />
        </div>
    );
};

export default EmailTemplateManagement;