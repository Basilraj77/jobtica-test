import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { Job, PreparationCourse, PreparationBook } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
// FIX: Corrected import to be extensionless to resolve module issues.
import { getEffectiveJobStatus } from '../../utils/jobUtils';
import JobDetailView from '../JobDetailView.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { slugify } from '../../utils/slugify';
import ConfirmationModal from './ConfirmationModal.tsx';
import NotificationExtractorModal from './NotificationExtractorModal.tsx';
import { basePath } from '../../App.tsx';
import MarkdownToolbar from './MarkdownToolbar.tsx';

const ITEMS_PER_PAGE = 10;

type SortKey = keyof Job;
type SortDirection = 'ascending' | 'descending';

const EmptyState: React.FC<{ message: string; buttonText?: string; onButtonClick?: () => void; }> = ({ message, buttonText, onButtonClick }) => (
    <div className="text-center py-16 border-t">
      <Icon name="folder-open" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
      {buttonText && onButtonClick && (
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
          <Icon name="plus" /> {buttonText}
        </button>
      )}
    </div>
);

const JobForm: React.FC<{ job?: Job; onSave: (job: Omit<Job, 'id' | 'createdAt'>, id?: string, options?: { createNews: boolean; createLink: boolean; sendEmailAlert: boolean; }) => void; onCancel: () => void; isLoading: boolean; uniqueCategories: string[]; }> = ({ job, onSave, onCancel, isLoading, uniqueCategories }) => {
    const [formData, setFormData] = useState<Omit<Job, 'id' | 'createdAt'>>(() => {
        if (job) {
            const { id, createdAt, ...rest } = job;
            return {
                ...rest,
                affiliateCourses: job.affiliateCourses || [],
                affiliateBooks: job.affiliateBooks || [],
            };
        }
        return {
            title: '',
            department: '',
            category: '',
            description: '',
            qualification: '',
            vacancies: '',
            postedDate: new Date().toISOString().split('T')[0],
            lastDate: '',
            applyLink: '',
            status: 'active',
            affiliateCourses: [],
            affiliateBooks: [],
        };
    });
    
    const [createNews, setCreateNews] = useState(true);
    const [createLink, setCreateLink] = useState(true);
    const [sendEmailAlert, setSendEmailAlert] = useState(true);
    const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        titleInputRef.current?.focus();
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleContentChange = (value: string) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleAffiliateChange = (type: 'Courses' | 'Books', index: number, field: string, value: string) => {
        const key = `affiliate${type}` as 'affiliateCourses' | 'affiliateBooks';
        const items = [...(formData[key] || [])];
        // @ts-ignore
        items[index] = { ...items[index], [field]: value };
        setFormData(prev => ({ ...prev, [key]: items }));
    };

    const addAffiliateItem = (type: 'Courses' | 'Books') => {
        const key = `affiliate${type}` as 'affiliateCourses' | 'affiliateBooks';
        const newItem = type === 'Courses' 
            ? { id: crypto.randomUUID(), platform: 'Other', title: '', url: '' }
            : { id: crypto.randomUUID(), title: '', author: '', url: '', imageUrl: '' };
        
        // @ts-ignore
        setFormData(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newItem],
        }));
    };

    const removeAffiliateItem = (type: 'Courses' | 'Books', index: number) => {
        const key = `affiliate${type}` as 'affiliateCourses' | 'affiliateBooks';
        setFormData(prev => ({
            ...prev,
            [key]: (prev[key] || []).filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, job?.id, !job ? { createNews, createLink, sendEmailAlert } : undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                <input ref={titleInputRef} type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Department *</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input 
                        type="text" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                        list="category-list"
                    />
                    <datalist id="category-list">
                        {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Qualification *</label>
                    <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Content *</label>
                <MarkdownToolbar textareaRef={contentRef} onValueChange={handleContentChange} />
                <textarea ref={contentRef} name="description" value={formData.description} onChange={handleChange} rows={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md rounded-t-none" required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Vacancies *</label>
                    <input type="text" name="vacancies" value={formData.vacancies} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Apply Link *</label>
                    <input type="url" name="applyLink" value={formData.applyLink} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Posted Date *</label>
                    <input type="date" name="postedDate" value={formData.postedDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Date to Apply *</label>
                    <input type="date" name="lastDate" value={formData.lastDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                    <option value="active">Active</option>
                    <option value="closing-soon">Closing Soon</option>
                    <option value="expired">Expired</option>
                </select>
            </div>
            
            <div className="border rounded-md">
                <button
                    type="button"
                    onClick={() => setIsAffiliateOpen(v => !v)}
                    className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                >
                    <span>Affiliate Marketing</span>
                    <Icon name={isAffiliateOpen ? 'chevron-up' : 'chevron-down'} />
                </button>
                {isAffiliateOpen && (
                    <div className="p-4 border-t space-y-4">
                        <div className="space-y-2 p-3 border rounded-md bg-gray-50/50">
                            <h4 className="font-semibold text-gray-700">Recommended Courses</h4>
                            {formData.affiliateCourses?.map((course, index) => (
                                <div key={index} className="p-3 border bg-white rounded-md space-y-2 relative">
                                    <button type="button" onClick={() => removeAffiliateItem('Courses', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Icon name="times-circle" /></button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Course Title</label>
                                            <input type="text" value={course.title} onChange={e => handleAffiliateChange('Courses', index, 'title', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Platform</label>
                                            <select value={course.platform} onChange={e => handleAffiliateChange('Courses', index, 'platform', e.target.value)} className="w-full text-sm border-gray-300 rounded-md bg-white">
                                                <option>Udemy</option> <option>Unacademy</option> <option>Coursera</option>
                                                <option>Testbook</option> <option>Adda247</option> <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Affiliate URL</label>
                                        <input type="url" value={course.url} onChange={e => handleAffiliateChange('Courses', index, 'url', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => addAffiliateItem('Courses')} className="text-sm text-indigo-600 hover:underline flex items-center gap-1"><Icon name="plus-circle" /> Add Course</button>
                        </div>

                        <div className="space-y-2 p-3 border rounded-md bg-gray-50/50">
                            <h4 className="font-semibold text-gray-700">Recommended Books</h4>
                            {formData.affiliateBooks?.map((book, index) => (
                                <div key={index} className="p-3 border bg-white rounded-md space-y-2 relative">
                                    <button type="button" onClick={() => removeAffiliateItem('Books', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Icon name="times-circle" /></button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Book Title</label>
                                            <input type="text" value={book.title} onChange={e => handleAffiliateChange('Books', index, 'title', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Author</label>
                                            <input type="text" value={book.author} onChange={e => handleAffiliateChange('Books', index, 'author', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Affiliate URL</label>
                                        <input type="url" value={book.url} onChange={e => handleAffiliateChange('Books', index, 'url', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Image URL (Optional)</label>
                                        <input type="url" value={book.imageUrl || ''} onChange={e => handleAffiliateChange('Books', index, 'imageUrl', e.target.value)} className="w-full text-sm border-gray-300 rounded-md" />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => addAffiliateItem('Books')} className="text-sm text-indigo-600 hover:underline flex items-center gap-1"><Icon name="plus-circle" /> Add Book</button>
                        </div>
                    </div>
                )}
            </div>

            {!job && (
                 <div className="border rounded-md">
                    <button
                        type="button"
                        onClick={() => setIsActionsOpen(v => !v)}
                        className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                    >
                        <span>Automated Actions</span>
                        <Icon name={isActionsOpen ? 'chevron-up' : 'chevron-down'} />
                    </button>
                    {isActionsOpen && (
                        <div className="p-4 border-t">
                            <div className="space-y-2 text-sm text-gray-600">
                                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                                    <input type="checkbox" checked={createNews} onChange={e => setCreateNews(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"/>
                                    <span>Create a "Breaking News" item for this job</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                                    <input type="checkbox" checked={createLink} onChange={e => setCreateLink(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                    <span>Create a "Quick Link" for this job</span>
                                </label>
                                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                                    <input type="checkbox" checked={sendEmailAlert} onChange={e => setSendEmailAlert(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                    <span>Send email alert to all subscribers</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90 w-28 text-center disabled:opacity-75" disabled={isLoading}>
                    {isLoading ? <Icon name="spinner" className="animate-spin mx-auto" /> : 'Save Job'}
                </button>
            </div>
        </form>
    );
};

const BulkUploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, options: { sendEmailAlert: boolean }) => Promise<void>;
    errorMessages: string[];
    isLoading: boolean;
}> = ({ isOpen, onClose, onUpload, errorMessages, isLoading }) => {
    const [file, setFile] = useState<File | null>(null);
    const [sendEmailAlert, setSendEmailAlert] = useState(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (file) {
            await onUpload(file, { sendEmailAlert });
        }
    };

    const handleDownloadSample = () => {
        const headers = ['title', 'department', 'category', 'description', 'qualification', 'vacancies', 'postedDate', 'lastDate', 'applyLink'];
        const exampleRow = [
            '"SSC CGL Recruitment, 2025"', // Example with comma
            'Staff Selection Commission',
            'Central Government',
            '"Combined Graduate Level Examination for various Group B and C posts."',
            'Graduate',
            '5000',
            '2025-12-01',
            '2026-01-15',
            'https://ssc.nic.in'
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + '\n' 
            + exampleRow.join(',');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sample_jobs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bulk Upload Jobs">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Upload a CSV file to add multiple job listings at once. Fields containing commas must be enclosed in double quotes (e.g., "Job description, with a comma"). To include a double quote within a field, escape it with another double quote (e.g., "The job is ""great""").
                </p>
                <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="text-sm text-[var(--primary-color)] hover:underline inline-flex items-center"
                >
                    <Icon name="download" className="mr-2" />
                    Download Sample CSV Template
                </button>
                 {errorMessages.length > 0 && (
                    <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded-md">
                        <p className="font-bold mb-2">Please fix the following errors in your CSV file:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {errorMessages.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV File</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-color)]/10 file:text-[var(--primary-color)] hover:file:bg-[var(--primary-color)]/20"
                    />
                </div>
                 <label className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 mt-4 border">
                    <input type="checkbox" checked={sendEmailAlert} onChange={e => setSendEmailAlert(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                    <span>Send email alert for each new job</span>
                </label>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || isLoading}
                        className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        {isLoading ? <Icon name="spinner" className="animate-spin" /> : <Icon name="upload" />}
                        {isLoading ? 'Uploading...' : 'Upload & Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const parseCsvLine = (line: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    // Escaped quote
                    currentField += '"';
                    i++; // Skip the next quote
                } else {
                    // End of quoted field
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
    }
    fields.push(currentField);
    return fields;
};


const JobManagement: React.FC = () => {
    const { jobs, addJob, updateJob, deleteJob, addMultipleJobs, deleteMultipleJobs, addNews, addQuickLink, sendNewJobAlert, sendBulkJobAlerts, demoUserSettings, securitySettings } = useData();
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<'all' | Job['status']>('all');
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [bulkUploadErrors, setBulkUploadErrors] = useState<string[]>([]);
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('descending');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewJobId, setPreviewJobId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalContent, setConfirmModalContent] = useState<{ title: string; message: React.ReactNode; onConfirm: () => void; }>({ title: '', message: '', onConfirm: () => {} });
    const [isExtractorModalOpen, setIsExtractorModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const canManage = !isDemoUser || demoUserSettings.canManageJobs;

    const uniqueCategories = useMemo(() => [...new Set(jobs.map(j => j.category))].sort(), [jobs]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const openConfirmationModal = (title: string, message: React.ReactNode, onConfirm: () => void) => {
        setConfirmModalContent({ title, message, onConfirm });
        setIsConfirmModalOpen(true);
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
        } else {
            setSortKey(key);
            setSortDirection('ascending');
        }
    };
    
    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === undefined || bValue === undefined) return 0;

            if (sortKey === 'lastDate' || sortKey === 'postedDate' || sortKey === 'createdAt') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortDirection === 'ascending' ? dateA - dateB : dateB - dateA;
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (aValue.toLowerCase() < bValue.toLowerCase()) return sortDirection === 'ascending' ? -1 : 1;
                if (aValue.toLowerCase() > bValue.toLowerCase()) return sortDirection === 'ascending' ? 1 : -1;
            }
            
            return 0;
        });
    }, [jobs, sortKey, sortDirection]);
    
    const filteredJobs = useMemo(() => {
        let jobsToFilter = sortedJobs;

        if (statusFilter !== 'all') {
            jobsToFilter = jobsToFilter.filter(job => getEffectiveJobStatus(job) === statusFilter);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            jobsToFilter = jobsToFilter.filter(job =>
                job.title.toLowerCase().includes(lowercasedQuery) ||
                job.department.toLowerCase().includes(lowercasedQuery)
            );
        }

        return jobsToFilter;
    }, [sortedJobs, statusFilter, searchQuery]);
    
    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(filteredJobs, { itemsPerPage: ITEMS_PER_PAGE });

    const handlePageChange = (page: number) => {
        goToPage(page);
        const mainContent = document.getElementById('admin-main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        setSelectedJobIds([]);
    }, [currentPage, statusFilter, sortKey, sortDirection]);

    const handleSave = async (jobData: Omit<Job, 'id' | 'createdAt'>, id?: string, options?: { createNews: boolean; createLink: boolean; sendEmailAlert: boolean; }) => {
        if (!canManage) return;
        setIsLoading(true);
        try {
            if (id) {
                const originalJob = jobs.find(j => j.id === id);
                if (originalJob) {
                    await updateJob({ ...originalJob, ...jobData, id });
                    showNotification(`Job '${jobData.title}' updated successfully!`);
                }
            } else {
                const newJob = await addJob(jobData); // addJob now returns Job directly
                if (newJob) {
                    showNotification(`Job '${jobData.title}' added successfully!`);
                    
                    if (options?.sendEmailAlert) {
                        await sendNewJobAlert(newJob);
                    }

                    if (options?.createNews) {
                        const newsText = `'${newJob.title}' has been announced. Last date to apply is ${newJob.lastDate}.`;
                        const newsLink = `${basePath}/job/${slugify(newJob.title)}`.replace('//', '/');
                        await addNews({ text: newsText, link: newsLink, status: 'active' });
                    }

                    if (options?.createLink) {
                        const linkUrl = `${basePath}/job/${slugify(newJob.title)}`.replace('//', '/');
                        await addQuickLink({ title: newJob.title, category: newJob.department, url: linkUrl, description: '', status: 'active' });
                    }
                }
            }
            setIsModalOpen(false);
            setEditingJob(undefined);
        } catch (error) {
            showNotification('An error occurred while saving the job.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (job: Job) => {
        if (!canManage) return;
        setEditingJob(job);
        setIsModalOpen(true);
    };
    
    const handlePreview = (jobId: string) => {
        setPreviewJobId(jobId);
        setIsPreviewModalOpen(true);
    };

    const handleDelete = (jobId: string) => {
        if (!canManage) return;
        const jobToDelete = jobs.find(j => j.id === jobId);
        if (!jobToDelete) return;

        openConfirmationModal(
            'Confirm Deletion',
            <>Are you sure you want to delete the job: <strong>"{jobToDelete.title}"</strong>? This action cannot be undone.</>,
            async () => {
                setIsLoading(true);
                try {
                    await deleteJob(jobId);
                    showNotification(`Job '${jobToDelete.title}' deleted successfully.`);
                } catch (error) {
                    showNotification('An error occurred while deleting the job.', 'error');
                } finally {
                    setIsLoading(false);
                    setIsConfirmModalOpen(false);
                }
            }
        );
    };
    
    const handleBulkUpload = async (file: File, options: { sendEmailAlert: boolean }) => {
        if (!canManage) return;
        setBulkUploadErrors([]);
        setIsLoading(true);
        try {
            const text = await file.text();
            if (!text) {
                setBulkUploadErrors(['File is empty or could not be read.']);
                showNotification('Upload failed: File is empty.', 'error');
                return;
            }

            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length <= 1) {
                setBulkUploadErrors(['CSV file must contain a header and at least one data row.']);
                showNotification('Upload failed: CSV is missing data.', 'error');
                return;
            }
            
            const errors: string[] = [];
            const jobsData: Omit<Job, 'id' | 'status' | 'createdAt'>[] = [];
            const headerLine = lines[0];
            const headers = parseCsvLine(headerLine).map(h => h.trim());
            
            const requiredHeaders = ['title', 'department', 'category', 'description', 'qualification', 'vacancies', 'postedDate', 'lastDate', 'applyLink'];
            if (JSON.stringify(headers) !== JSON.stringify(requiredHeaders)) {
                 const errorMsg = `Invalid CSV header. Expected: ${requiredHeaders.join(',')}`;
                 setBulkUploadErrors([errorMsg]);
                 showNotification(errorMsg, 'error');
                 return;
            }

            lines.slice(1).forEach((line, index) => {
                const rowNum = index + 2;
                const values = parseCsvLine(line);

                if (values.length !== headers.length) {
                    errors.push(`Line ${rowNum}: Incorrect number of columns. Expected ${headers.length}, found ${values.length}.`);
                    return;
                }

                const jobEntry = headers.reduce((obj, header, i) => {
                    obj[header as keyof typeof obj] = values[i];
                    return obj;
                }, {} as any);
                
                if (!jobEntry.title) errors.push(`Line ${rowNum}: 'title' is required.`);
                if (!jobEntry.department) errors.push(`Line ${rowNum}: 'department' is required.`);
                if (!jobEntry.category) errors.push(`Line ${rowNum}: 'category' is required.`);
                if (!jobEntry.postedDate || isNaN(new Date(jobEntry.postedDate).getTime())) {
                    errors.push(`Line ${rowNum}: Invalid or missing 'postedDate'. Use YYYY-MM-DD.`);
                }
                if (!jobEntry.lastDate || isNaN(new Date(jobEntry.lastDate).getTime())) {
                    errors.push(`Line ${rowNum}: Invalid or missing 'lastDate'. Use YYYY-MM-DD.`);
                }

                if (errors.length === 0) {
                    jobsData.push(jobEntry);
                }
            });
            
            if (errors.length > 0) {
                setBulkUploadErrors(errors);
                showNotification('Upload failed. Please check the errors below the upload button.', 'error');
            } else {
                const newJobs = await addMultipleJobs(jobsData);
                if (options.sendEmailAlert) {
                    await sendBulkJobAlerts(newJobs);
                }
                showNotification(`${newJobs.length} jobs uploaded successfully.`);
                setIsBulkUploadModalOpen(false);
            }
        } catch (error) {
            const errorMsg = 'Failed to read the file.';
            setBulkUploadErrors([errorMsg]);
            showNotification(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };


    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedJobIds(paginatedData.map(job => job.id));
        } else {
            setSelectedJobIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedJobIds(prev => [...prev, id]);
        } else {
            setSelectedJobIds(prev => prev.filter(jobId => jobId !== id));
        }
    };

    const handleBulkDelete = () => {
        if (!canManage) {
            showNotification('You do not have permission to delete jobs.', 'error');
            return;
        }
        if (selectedJobIds.length === 0) {
            showNotification('Please select at least one job to delete.', 'error');
            return;
        }

        openConfirmationModal(
            'Confirm Bulk Deletion',
            <>Are you sure you want to delete <strong>{selectedJobIds.length}</strong> selected job(s)? This action cannot be undone.</>,
            async () => {
                setIsLoading(true);
                try {
                    const count = selectedJobIds.length;
                    await deleteMultipleJobs(selectedJobIds);
                    setSelectedJobIds([]);
                    showNotification(`${count} job(s) deleted successfully.`);
                } catch (error) {
                    showNotification('An error occurred during bulk deletion.', 'error');
                } finally {
                    setIsLoading(false);
                    setIsConfirmModalOpen(false);
                }
            }
        );
    };

    const jobToPreview = jobs.find(job => job.id === previewJobId);

    const SortableHeader: React.FC<{ columnKey: SortKey; title: string; className?: string }> = ({ columnKey, title, className }) => (
        <th className={`px-6 py-3 cursor-pointer ${className}`} onClick={() => handleSort(columnKey)}>
            <div className="flex items-center gap-2">
                {title}
                {sortKey === columnKey && (
                    <Icon name={sortDirection === 'ascending' ? 'sort-up' : 'sort-down'} />
                )}
            </div>
        </th>
    );

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm">
            {notification && (
                <div
                    className={`p-4 mb-4 text-sm rounded-lg ${
                        notification.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                    role="alert"
                >
                    <span className="font-medium">{notification.type === 'success' ? 'Success!' : 'Error:'}</span> {notification.message}
                </div>
            )}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-700">Job Listings</h2>
                    {selectedJobIds.length > 0 && canManage && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Icon name="trash" /> Delete ({selectedJobIds.length})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search title, department..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="closing-soon">Closing Soon</option>
                        <option value="expired">Expired</option>
                    </select>
                    {canManage && (
                        <>
                            <button onClick={() => setIsExtractorModalOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-teal-700">
                                <Icon name="wand-magic-sparkles" /> Extract Notification
                            </button>
                            <button onClick={() => { setIsBulkUploadModalOpen(true); setBulkUploadErrors([]); }} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700">
                                <Icon name="upload" /> Bulk Upload
                            </button>
                            <button onClick={() => { setEditingJob(undefined); setIsModalOpen(true); }} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90">
                                <Icon name="plus" /> Add New Job
                            </button>
                        </>
                    )}
                </div>
            </div>
            {paginatedData.length > 0 ? (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 responsive-table">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-4 w-4">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedData.length > 0 && selectedJobIds.length === paginatedData.length}
                                        className="w-4 h-4 text-[var(--primary-color)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                    />
                                </th>
                                <SortableHeader columnKey="title" title="Title" />
                                <SortableHeader columnKey="department" title="Department" />
                                <SortableHeader columnKey="category" title="Category" />
                                <SortableHeader columnKey="lastDate" title="Last Date" />
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map(job => {
                                const effectiveStatus = getEffectiveJobStatus(job);
                                return (
                                <tr key={job.id} className={`bg-white hover:bg-gray-50 ${selectedJobIds.includes(job.id) ? 'bg-[var(--primary-color)]/10' : 'border-b'}`}>
                                    <td data-label="Select" className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedJobIds.includes(job.id)}
                                            onChange={(e) => handleSelectOne(e, job.id)}
                                            className="w-4 h-4 text-[var(--primary-color)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                        />
                                    </td>
                                    <td data-label="Title" className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                    <td data-label="Department" className="px-6 py-4">{job.department}</td>
                                    <td data-label="Category" className="px-6 py-4">{job.category}</td>
                                    <td data-label="Last Date" className="px-6 py-4">{job.lastDate}</td>
                                    <td data-label="Status" className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                            effectiveStatus === 'active' ? 'bg-green-100 text-green-800' :
                                            effectiveStatus === 'closing-soon' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {effectiveStatus.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td data-label="Actions" className="px-6 py-4 flex gap-4 items-center actions-cell">
                                        <button onClick={() => handlePreview(job.id)} className="text-blue-500 hover:text-blue-700" aria-label={`Preview job: ${job.title}`}><Icon name="eye" /></button>
                                        {canManage && (
                                            <>
                                                <button onClick={() => handleEdit(job)} className="text-yellow-500 hover:text-yellow-700" aria-label={`Edit job: ${job.title}`}><Icon name="edit" /></button>
                                                <button onClick={() => handleDelete(job.id)} className="text-red-500 hover:text-red-700" aria-label={`Delete job: ${job.title}`}><Icon name="trash" /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            </>
            ) : (
                <EmptyState 
                    message={searchQuery || statusFilter !== 'all' ? "No jobs match your filters." : "No jobs have been added yet."}
                    buttonText={canManage ? "Add New Job" : undefined}
                    onButtonClick={canManage ? () => { setEditingJob(undefined); setIsModalOpen(true); } : undefined}
                />
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJob ? 'Edit Job' : 'Add New Job'}>
                <JobForm job={editingJob} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isLoading={isLoading} uniqueCategories={uniqueCategories} />
            </Modal>
             <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={jobToPreview?.title || "Job Preview"}>
                {jobToPreview && <JobDetailView job={jobToPreview} />}
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalContent.onConfirm}
                title={confirmModalContent.title}
                message={confirmModalContent.message}
                isLoading={isLoading}
                confirmText="Delete"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
            <BulkUploadModal 
                isOpen={isBulkUploadModalOpen} 
                onClose={() => setIsBulkUploadModalOpen(false)} 
                onUpload={handleBulkUpload} 
                errorMessages={bulkUploadErrors}
                isLoading={isLoading}
            />
             <NotificationExtractorModal 
                isOpen={isExtractorModalOpen}
                onClose={() => setIsExtractorModalOpen(false)}
             />
        </div>
    );
};

export default JobManagement;
