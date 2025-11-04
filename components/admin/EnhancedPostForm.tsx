import React, { useState, useEffect, useRef } from 'react';
import { ContentPost } from '../../types.ts';
import Icon from '../Icon.tsx';
import { useData } from '../../contexts/DataContext.tsx';
import { slugify } from '../../utils/slugify';
import WYSIWYGEditor from './WYSIWYGEditor.tsx';
import ContentScheduler from './ContentScheduler.tsx';

interface EnhancedPostFormProps {
    post?: ContentPost;
    onSave: (post: Omit<ContentPost, 'id' | 'createdAt'>, id?: string) => void;
    onCancel: () => void;
    defaultType: 'posts' | 'exam-notices' | 'results';
}

const SERPPreview: React.FC<{ title: string; description: string; url: string }> = ({ title, description, url }) => (
    <div className="p-4 border rounded-md bg-white">
        <p className="text-sm text-gray-800 truncate">{url}</p>
        <h3 className="text-xl text-[var(--primary-color)] truncate group-hover:underline">{title || 'Your SEO Title Appears Here'}</h3>
        <p className="text-sm text-gray-600">
            {description || 'Your meta description will appear here. Aim for about 155 characters for the best results.'}
        </p>
    </div>
);

const CONTENT_TEMPLATES = [
    {
        id: 'blog-post',
        name: 'Blog Post',
        icon: 'file-alt',
        content: '<h2>Introduction</h2><p>Start with an engaging introduction...</p><h2>Main Content</h2><p>Your main content goes here...</p><h2>Conclusion</h2><p>Wrap up with key takeaways...</p>'
    },
    {
        id: 'announcement',
        name: 'Announcement',
        icon: 'bullhorn',
        content: '<h1>Important Announcement</h1><p><strong>Date:</strong> [Insert Date]</p><p><strong>Subject:</strong> [Insert Subject]</p><p>Details of the announcement...</p><p><strong>Action Required:</strong> [If applicable]</p>'
    },
    {
        id: 'tutorial',
        name: 'Tutorial',
        icon: 'graduation-cap',
        content: '<h1>Tutorial: [Topic]</h1><h2>Prerequisites</h2><ul><li>Item 1</li><li>Item 2</li></ul><h2>Step 1</h2><p>Description...</p><h2>Step 2</h2><p>Description...</p><h2>Conclusion</h2><p>Summary...</p>'
    },
    {
        id: 'job-listing',
        name: 'Job Listing',
        icon: 'briefcase',
        content: '<h1>[Job Title]</h1><h2>Organization</h2><p>[Organization Name]</p><h2>Job Details</h2><p><strong>Vacancies:</strong> [Number]</p><p><strong>Qualification:</strong> [Details]</p><h2>How to Apply</h2><p>Application process...</p><h2>Important Dates</h2><p><strong>Last Date:</strong> [Date]</p>'
    },
    {
        id: 'exam-notice',
        name: 'Exam Notice',
        icon: 'clipboard-list',
        content: '<h1>Exam Notification</h1><h2>Exam Details</h2><p><strong>Exam Name:</strong> [Name]</p><p><strong>Conducting Body:</strong> [Organization]</p><h2>Important Dates</h2><ul><li><strong>Exam Date:</strong> [Date]</li><li><strong>Last Date to Apply:</strong> [Date]</li></ul><h2>Eligibility</h2><p>Requirements...</p>'
    }
];

const EnhancedPostForm: React.FC<EnhancedPostFormProps> = ({ post, onSave, onCancel, defaultType }) => {
    const { generalSettings } = useData();
    const [formData, setFormData] = useState<Omit<ContentPost, 'id' | 'createdAt'> & {
        scheduledDate?: string;
        scheduledTime?: string;
    }>(post ? { ...post } : {
        title: '',
        category: 'General',
        content: '',
        status: 'published',
        type: defaultType,
        publishedDate: new Date().toISOString().split('T')[0],
        examDate: '',
        detailsUrl: '',
        imageUrl: '',
        seoTitle: '',
        seoDescription: '',
        scheduledDate: '',
        scheduledTime: ''
    });
    
    const [isSeoOpen, setIsSeoOpen] = useState(false);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<'wysiwyg' | 'html'>('wysiwyg');
    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);

    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        titleInputRef.current?.focus();
    }, []);

    useEffect(() => {
        // Calculate word count and reading time
        const text = formData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = text.split(' ').filter(w => w.length > 0).length;
        setWordCount(words);
        setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words/min
    }, [formData.content]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };
    
    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTemplateSelect = (templateContent: string) => {
        setFormData(prev => ({ ...prev, content: templateContent }));
        setIsTemplateOpen(false);
    };

    const handleScheduleChange = (date: string, time: string) => {
        setFormData(prev => ({
            ...prev,
            scheduledDate: date,
            scheduledTime: time
        }));
    };

    const handleStatusChange = (status: 'published' | 'draft' | 'scheduled') => {
        setFormData(prev => ({ ...prev, status }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { id, createdAt, scheduledDate, scheduledTime, ...dataToSave } = formData as any;
        
        // Store schedule info if status is scheduled
        const finalData = {
            ...dataToSave,
            ...(formData.status === 'scheduled' && scheduledDate && scheduledTime 
                ? { scheduledFor: `${scheduledDate}T${scheduledTime}` } 
                : {})
        };
        
        onSave(finalData, post?.id);
    };
    
    const getProgressBarColor = (length: number, ideal: number, max: number) => {
        if (length === 0) return 'bg-gray-200';
        if (length > max) return 'bg-red-500';
        if (length >= ideal) return 'bg-green-500';
        return 'bg-yellow-500';
    };

    const generateAutoSEO = () => {
        if (!formData.title) return;
        
        // Generate SEO title (max 60 chars)
        const seoTitle = formData.title.length > 60 
            ? formData.title.substring(0, 57) + '...'
            : formData.title;
        
        // Generate meta description from content (max 155 chars)
        const contentText = formData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const seoDescription = contentText.length > 155
            ? contentText.substring(0, 152) + '...'
            : contentText || 'Read more about ' + formData.title;
        
        setFormData(prev => ({
            ...prev,
            seoTitle,
            seoDescription
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input 
                    ref={titleInputRef} 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                    required 
                />
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input 
                        type="text" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white" 
                        required
                    >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Published Date *</label>
                    <input 
                        type="date" 
                        name="publishedDate" 
                        value={formData.publishedDate} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                        required 
                    />
                </div>
            </div>

            {/* Content Scheduling */}
            {formData.status === 'scheduled' && (
                <ContentScheduler
                    scheduledDate={formData.scheduledDate}
                    scheduledTime={formData.scheduledTime}
                    onScheduleChange={handleScheduleChange}
                    status={formData.status}
                    onStatusChange={handleStatusChange}
                />
            )}

            {/* Content Templates */}
            <div className="border rounded-md">
                <button
                    type="button"
                    onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                    className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                >
                    <span className="flex items-center gap-2">
                        <Icon name="copy" />
                        Content Templates
                    </span>
                    <Icon name={isTemplateOpen ? 'chevron-up' : 'chevron-down'} />
                </button>
                
                {isTemplateOpen && (
                    <div className="p-4 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {CONTENT_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => handleTemplateSelect(template.content)}
                                    className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2 text-center"
                                >
                                    <Icon name={template.icon} className="text-2xl text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Editor */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Content *</label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {wordCount} words · {readingTime} min read
                        </span>
                        <div className="flex border rounded-md overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setEditorMode('wysiwyg')}
                                className={`px-3 py-1 text-xs ${editorMode === 'wysiwyg' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                            >
                                <Icon name="eye" className="mr-1" />
                                Visual
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditorMode('html')}
                                className={`px-3 py-1 text-xs ${editorMode === 'html' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                            >
                                <Icon name="code" className="mr-1" />
                                HTML
                            </button>
                        </div>
                    </div>
                </div>
                
                {editorMode === 'wysiwyg' ? (
                    <WYSIWYGEditor
                        value={formData.content}
                        onChange={handleContentChange}
                        placeholder="Start writing your content..."
                    />
                ) : (
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={15}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                        placeholder="<h1>Your HTML content...</h1>"
                    />
                )}
            </div>
            
            {/* Featured Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Featured Image</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.imageUrl ? (
                        <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="h-24 w-40 object-cover rounded-md border p-1 bg-gray-100" 
                            loading="lazy" 
                        />
                    ) : (
                        <div className="h-24 w-40 bg-gray-100 rounded-md flex items-center justify-center border">
                            <Icon name="image" className="text-4xl text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <input 
                            id="image-upload-input" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="hidden" 
                        />
                        <label 
                            htmlFor="image-upload-input" 
                            className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                            <Icon name="upload" />
                            Upload Image
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Or paste URL below</p>
                    </div>
                </div>
                <input 
                    type="url" 
                    name="imageUrl" 
                    value={formData.imageUrl || ''} 
                    onChange={handleChange} 
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {/* Additional Fields for Exam Notices */}
            {(defaultType === 'exam-notices') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Exam Date (Optional)</label>
                        <input 
                            type="date" 
                            name="examDate" 
                            value={formData.examDate} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Details URL (e.g., PDF link)</label>
                        <input 
                            type="url" 
                            name="detailsUrl" 
                            value={formData.detailsUrl} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                        />
                    </div>
                </div>
            )}

            {(defaultType === 'results') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Details URL (e.g., PDF link)</label>
                    <input 
                        type="url" 
                        name="detailsUrl" 
                        value={formData.detailsUrl} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                    />
                </div>
            )}

            {/* SEO Section */}
            {defaultType === 'posts' && (
                <div className="border rounded-md">
                    <button
                        type="button"
                        className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                        onClick={() => setIsSeoOpen(!isSeoOpen)}
                    >
                        <span className="flex items-center gap-2">
                            <Icon name="search" />
                            SEO Settings (Optional)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    generateAutoSEO();
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                                Auto-Generate
                            </button>
                            <Icon name={isSeoOpen ? 'chevron-up' : 'chevron-down'} className="transition-transform" />
                        </div>
                    </button>
                    {isSeoOpen && (
                        <div className="p-4 space-y-4 border-t">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                                    <input
                                        type="text"
                                        name="seoTitle"
                                        value={formData.seoTitle}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        maxLength={70}
                                        placeholder={formData.title}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                                        <span>Recommended: 50-60 characters.</span>
                                        <div className="flex items-center gap-2">
                                            <span>{formData.seoTitle?.length || 0} / 70</span>
                                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getProgressBarColor(formData.seoTitle?.length || 0, 50, 60)}`} 
                                                    style={{ width: `${((formData.seoTitle?.length || 0) / 70) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                                    <textarea
                                        name="seoDescription"
                                        value={formData.seoDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        maxLength={160}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                                        <span>Recommended: 150-160 characters.</span>
                                        <div className="flex items-center gap-2">
                                            <span>{formData.seoDescription?.length || 0} / 160</span>
                                            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${getProgressBarColor(formData.seoDescription?.length || 0, 150, 155)}`} 
                                                    style={{ width: `${((formData.seoDescription?.length || 0) / 160) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-600 mb-2">Search Engine Result Preview</h4>
                                <SERPPreview
                                    title={formData.seoTitle || formData.title}
                                    description={formData.seoDescription || ''}
                                    url={`${generalSettings.siteTitle.toLowerCase().replace(/ /g, '')}.com > blog > ${slugify(formData.title || 'post-title')}`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90 flex items-center gap-2"
                >
                    <Icon name="save" />
                    {formData.status === 'scheduled' ? 'Schedule' : formData.status === 'draft' ? 'Save Draft' : 'Publish'}
                </button>
            </div>
        </form>
    );
};

export default EnhancedPostForm;
