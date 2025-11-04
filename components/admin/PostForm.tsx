import React, { useState, useEffect, useRef } from 'react';
import { ContentPost } from '../../types.ts';
import Icon from '../Icon.tsx';
import { useData } from '../../contexts/DataContext.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { slugify } from '../../utils/slugify';
import MarkdownToolbar from './MarkdownToolbar.tsx';

interface PostFormProps {
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


const PostForm: React.FC<PostFormProps> = ({ post, onSave, onCancel, defaultType }) => {
    const { generalSettings } = useData();
    const [formData, setFormData] = useState<Omit<ContentPost, 'id' | 'createdAt'>>(post ? { ...post } : {
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
    });
    const [isSeoOpen, setIsSeoOpen] = useState(false);

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
        setFormData(prev => ({ ...prev, content: value }));
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { id, createdAt, ...dataToSave } = formData as ContentPost;
        onSave(dataToSave, post?.id);
    };
    
    const getProgressBarColor = (length: number, ideal: number, max: number) => {
        if (length === 0) return 'bg-gray-200';
        if (length > max) return 'bg-red-500';
        if (length >= ideal) return 'bg-green-500';
        return 'bg-yellow-500';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input ref={titleInputRef} type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <MarkdownToolbar textareaRef={contentRef} onValueChange={handleContentChange} />
                <textarea ref={contentRef} name="content" value={formData.content} onChange={handleChange} rows={6} className="block w-full px-3 py-2 border border-gray-300 rounded-md rounded-t-none" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="h-16 w-32 object-cover rounded-md border p-1 bg-gray-100" loading="lazy" />
                    ) : (
                        <div className="h-16 w-32 bg-gray-100 rounded-md flex items-center justify-center border">
                            <Icon name="image" className="text-3xl text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <input id="image-upload-input" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <label htmlFor="image-upload-input" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Published Date *</label>
                    <input type="date" name="publishedDate" value={formData.publishedDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                {(defaultType === 'exam-notices') && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Exam Date (Optional)</label>
                        <input type="date" name="examDate" value={formData.examDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                )}
            </div>
             {(defaultType === 'exam-notices' || defaultType === 'results') && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Details URL (e.g., PDF link)</label>
                    <input type="url" name="detailsUrl" value={formData.detailsUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
             )}

            {/* SEO Section for General Posts */}
            {defaultType === 'posts' && (
                <div className="border rounded-md">
                    <button
                        type="button"
                        className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                        onClick={() => setIsSeoOpen(!isSeoOpen)}
                    >
                        <span><Icon name="search" className="mr-2" /> SEO Settings (Optional)</span>
                        <Icon name={isSeoOpen ? 'chevron-up' : 'chevron-down'} className="transition-transform" />
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
                                                <div className={`h-full ${getProgressBarColor(formData.seoTitle?.length || 0, 50, 60)}`} style={{ width: `${((formData.seoTitle?.length || 0) / 70) * 100}%` }}></div>
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
                                                <div className={`h-full ${getProgressBarColor(formData.seoDescription?.length || 0, 150, 155)}`} style={{ width: `${((formData.seoDescription?.length || 0) / 160) * 100}%` }}></div>
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
            
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save</button>
            </div>
        </form>
    );
};

export default PostForm;