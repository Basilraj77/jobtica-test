import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { ContentPost } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import WYSIWYGEditor from './WYSIWYGEditor.tsx';
import MediaManager from './MediaManager.tsx';
import SeoOptimizer from './SeoOptimizer.tsx';
import TemplateManager from './TemplateManager.tsx';
import VersionControl from './VersionControl.tsx';
import ContentScheduler from './ContentScheduler.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
import { slugify } from '../../utils/slugify';

const ITEMS_PER_PAGE = 10;

type TabType = 'editor' | 'media' | 'seo' | 'templates' | 'versions';

interface EnhancedContentManagementProps {
    contentType?: 'posts' | 'exam-notices' | 'results';
}

const EnhancedContentManagement: React.FC<EnhancedContentManagementProps> = ({ contentType = 'posts' }) => {
    const { posts, addPost, updatePost, deletePost, securitySettings, demoUserSettings } = useData();
    const isDemoUser = securitySettings.demoModeEnabled;
    const canManage = !isDemoUser || demoUserSettings.canManageContent;

    // List view state
    const [showList, setShowList] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortKey, setSortKey] = useState<keyof ContentPost>('createdAt');
    const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('descending');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Editor state
    const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('editor');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        status: 'draft' as 'draft' | 'published' | 'scheduled',
        seoTitle: '',
        seoDescription: '',
        slug: '',
        featuredImage: '',
        scheduledDate: '',
        type: contentType,
        publishedDate: new Date().toISOString().split('T')[0]
    });

    // UI state
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Filter posts by type
    const filteredPosts = posts.filter(p => p.type === contentType);

    // Categories
    const categories = ['all', ...Array.from(new Set(filteredPosts.map(p => p.category)))];

    // Apply filters and sorting
    const sortedAndFilteredPosts = React.useMemo(() => {
        let filtered = filteredPosts;

        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        return [...filtered].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (!aValue || !bValue) return 0;

            if (sortDirection === 'ascending') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [filteredPosts, searchQuery, categoryFilter, statusFilter, sortKey, sortDirection]);

    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedAndFilteredPosts, { itemsPerPage: ITEMS_PER_PAGE });

    // Notification
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    // Create new post
    const handleCreateNew = () => {
        setEditingPost(null);
        setFormData({
            title: '',
            content: '',
            category: 'General',
            status: 'draft',
            seoTitle: '',
            seoDescription: '',
            slug: '',
            featuredImage: '',
            scheduledDate: '',
            type: contentType,
            publishedDate: new Date().toISOString().split('T')[0]
        });
        setActiveTab('editor');
        setShowList(false);
    };

    // Edit existing post
    const handleEdit = (post: ContentPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            content: post.content,
            category: post.category,
            status: post.status as any || 'draft',
            seoTitle: post.seoTitle || '',
            seoDescription: post.seoDescription || '',
            slug: post.slug || '',
            featuredImage: post.imageUrl || '',
            scheduledDate: '',
            type: contentType,
            publishedDate: post.publishedDate
        });
        setActiveTab('editor');
        setShowList(false);
    };

    // Save post
    const handleSave = async () => {
        if (!formData.title.trim()) {
            showNotification('Title is required', 'error');
            return;
        }

        if (!formData.content.trim()) {
            showNotification('Content is required', 'error');
            return;
        }

        setSaving(true);

        try {
            const postData: Omit<ContentPost, 'id' | 'createdAt'> = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                status: formData.status,
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
                slug: formData.slug || slugify(formData.title),
                imageUrl: formData.featuredImage,
                type: contentType,
                publishedDate: formData.publishedDate,
                examDate: '',
                detailsUrl: ''
            };

            if (editingPost) {
                await updatePost(editingPost.id, postData);
                showNotification('Post updated successfully');
            } else {
                await addPost(postData);
                showNotification('Post created successfully');
            }

            setShowList(true);
        } catch (error) {
            showNotification('Failed to save post', 'error');
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    // Delete post
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await deletePost(id);
            showNotification('Post deleted successfully');
        } catch (error) {
            showNotification('Failed to delete post', 'error');
            console.error('Delete error:', error);
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected posts?`)) return;

        try {
            for (const id of selectedIds) {
                await deletePost(id);
            }
            setSelectedIds([]);
            showNotification(`${selectedIds.length} posts deleted successfully`);
        } catch (error) {
            showNotification('Failed to delete posts', 'error');
        }
    };

    const tabs: { id: TabType; name: string; icon: string }[] = [
        { id: 'editor', name: 'Editor', icon: 'edit' },
        { id: 'media', name: 'Media', icon: 'images' },
        { id: 'seo', name: 'SEO', icon: 'search' },
        { id: 'templates', name: 'Templates', icon: 'layer-group' },
        { id: 'versions', name: 'Versions', icon: 'history' }
    ];

    if (showList) {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Content Management</h2>
                        {canManage && (
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <Icon name="plus" />
                                Create New
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="px-6 py-3 bg-blue-50 border-b flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedIds.length} items selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Posts List */}
                <div className="overflow-x-auto">
                    {paginatedData.length === 0 ? (
                        <div className="text-center py-16">
                            <Icon name="file-alt" className="text-5xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600">No posts found</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first post</p>
                            {canManage && (
                                <button
                                    onClick={handleCreateNew}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create New Post
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="w-12 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={paginatedData.length > 0 && selectedIds.length === paginatedData.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIds(paginatedData.map(p => p.id));
                                                } else {
                                                    setSelectedIds([]);
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedData.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(post.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([...selectedIds, post.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== post.id));
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{post.title}</div>
                                            {post.seoTitle && (
                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                    SEO: {post.seoTitle}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{post.category}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                post.status === 'published' ? 'bg-green-100 text-green-800' :
                                                post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {post.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(post.publishedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Icon name="edit" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Icon name="trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />
                    </div>
                )}

                {/* Notification */}
                {notification && (
                    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white z-50`}>
                        {notification.message}
                    </div>
                )}
            </div>
        );
    }

    // Editor View
    return (
        <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
            {/* Editor Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowList(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Back to list"
                    >
                        <Icon name="arrow-left" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold">
                            {editingPost ? 'Edit Post' : 'Create New Post'}
                        </h2>
                        {editingPost && (
                            <p className="text-sm text-gray-500">ID: {editingPost.id}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setFormData({ ...formData, status: 'draft' });
                            handleSave();
                        }}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        <Icon name="save" className="mr-2" />
                        Save Draft
                    </button>
                    <button
                        onClick={() => {
                            setFormData({ ...formData, status: 'published' });
                            handleSave();
                        }}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Icon name="check" className="mr-2" />
                        {saving ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Icon name={tab.icon} />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'editor' && (
                    <div className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter post title..."
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Category and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>General</option>
                                    <option>Jobs</option>
                                    <option>Exams</option>
                                    <option>Results</option>
                                    <option>Admit Cards</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <ContentScheduler
                                    status={formData.status}
                                    scheduledDate={formData.scheduledDate}
                                    onStatusChange={(status) => setFormData({ ...formData, status })}
                                    onScheduledDateChange={(date) => setFormData({ ...formData, scheduledDate: date })}
                                />
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Content *
                                </label>
                                <button
                                    onClick={() => setShowTemplateModal(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <Icon name="layer-group" />
                                    Use Template
                                </button>
                            </div>
                            <WYSIWYGEditor
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Start writing your content..."
                            />
                        </div>

                        {/* Featured Image */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Featured Image
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                                    placeholder="Image URL..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => setShowMediaModal(true)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    <Icon name="images" className="mr-2" />
                                    Browse
                                </button>
                            </div>
                            {formData.featuredImage && (
                                <img
                                    src={formData.featuredImage}
                                    alt="Featured"
                                    className="mt-2 w-48 h-32 object-cover rounded-md"
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <MediaManager
                        onSelectMedia={(media) => {
                            setFormData({ ...formData, featuredImage: media.public_url });
                            setActiveTab('editor');
                        }}
                        mode="select"
                    />
                )}

                {activeTab === 'seo' && (
                    <SeoOptimizer
                        title={formData.title}
                        content={formData.content}
                        seoTitle={formData.seoTitle}
                        seoDescription={formData.seoDescription}
                        slug={formData.slug}
                        onUpdate={(data) => setFormData({ ...formData, ...data })}
                    />
                )}

                {activeTab === 'templates' && (
                    <TemplateManager
                        onSelectTemplate={(content) => {
                            setFormData({ ...formData, content });
                            setActiveTab('editor');
                        }}
                    />
                )}

                {activeTab === 'versions' && editingPost && (
                    <VersionControl
                        contentId={editingPost.id}
                        onRestore={(versionData) => {
                            if (confirm('Restore this version? Current changes will be lost.')) {
                                setFormData({
                                    ...formData,
                                    title: versionData.title || formData.title,
                                    content: versionData.content || formData.content,
                                    seoTitle: versionData.seo_title || formData.seoTitle,
                                    seoDescription: versionData.seo_description || formData.seoDescription,
                                });
                                setActiveTab('editor');
                            }
                        }}
                    />
                )}
            </div>

            {/* Modals */}
            {showMediaModal && (
                <Modal isOpen={showMediaModal} onClose={() => setShowMediaModal(false)} title="Media Library">
                    <MediaManager
                        onSelectMedia={(media) => {
                            setFormData({ ...formData, featuredImage: media.public_url });
                            setShowMediaModal(false);
                        }}
                        onClose={() => setShowMediaModal(false)}
                        mode="select"
                    />
                </Modal>
            )}

            {showTemplateModal && (
                <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Content Templates">
                    <TemplateManager
                        onSelectTemplate={(content) => {
                            setFormData({ ...formData, content });
                            setShowTemplateModal(false);
                        }}
                        onClose={() => setShowTemplateModal(false)}
                    />
                </Modal>
            )}

            {/* Notification */}
            {notification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
                    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white z-50`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default EnhancedContentManagement;
