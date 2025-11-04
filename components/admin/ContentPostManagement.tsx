import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { ContentPost } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
import EnhancedPostForm from './EnhancedPostForm.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData
import MarkdownRenderer from '../MarkdownRenderer.tsx';

const ITEMS_PER_PAGE = 10;

type SortKey = keyof ContentPost;
type SortDirection = 'ascending' | 'descending';

const EmptyState: React.FC<{ message: string; buttonText?: string; onButtonClick?: () => void; }> = ({ message, buttonText, onButtonClick }) => (
    <div className="text-center py-16 border-t">
      <Icon name="file-alt" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
      {buttonText && onButtonClick && (
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
          <Icon name="plus" /> {buttonText}
        </button>
      )}
    </div>
);

const ContentPostManagement: React.FC = () => {
    const { posts, addPost, updatePost, deletePost, deleteMultiplePosts, demoUserSettings, securitySettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<ContentPost | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('descending');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewPost, setPreviewPost] = useState<ContentPost | null>(null);
    const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalContent, setConfirmModalContent] = useState<{ title: string; message: React.ReactNode; onConfirm: () => void; }>({ title: '', message: '', onConfirm: () => {} });
    const containerRef = useRef<HTMLDivElement>(null);

    const canManage = !isDemoUser || demoUserSettings.canManageContent;

    const filteredPostsSource = posts.filter(p => p.type === 'posts');

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const openConfirmationModal = (title: string, message: React.ReactNode, onConfirm: () => void) => {
        setConfirmModalContent({ title, message, onConfirm });
        setIsConfirmModalOpen(true);
    };

    const categories = useMemo(() => {
        const uniqueCategories = new Set(filteredPostsSource.map(p => p.category));
        return ['all', ...Array.from(uniqueCategories).sort()];
    }, [filteredPostsSource]);
    
    const sortedAndFilteredPosts = useMemo(() => {
        let filtered = filteredPostsSource;

        if (searchQuery) {
            filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
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
    }, [filteredPostsSource, searchQuery, categoryFilter, sortKey, sortDirection]);


    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedAndFilteredPosts, { itemsPerPage: ITEMS_PER_PAGE });

    const handlePageChange = (page: number) => {
        goToPage(page);
        const mainContent = document.getElementById('admin-main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        setSelectedPostIds([]);
    }, [currentPage, categoryFilter, sortKey, sortDirection, searchQuery]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'ascending' ? 'descending' : 'ascending');
        } else {
            setSortKey(key);
            setSortDirection('ascending');
        }
    };

    const handleSave = (postData: Omit<ContentPost, 'id' | 'createdAt'>, id?: string) => {
        if (!canManage) return;
        if (id) {
             const originalPost = posts.find(p => p.id === id);
             if (originalPost) {
                updatePost({ ...originalPost, ...postData });
                showNotification(`Post '${postData.title}' updated.`);
             }
        } else {
            addPost({ ...postData, type: 'posts' });
            showNotification(`Post '${postData.title}' created.`);
        }
        setIsModalOpen(false);
        setEditingPost(undefined);
    };

    const handleEdit = (post: ContentPost) => {
        if (!canManage) return;
        setEditingPost(post);
        setIsModalOpen(true);
    };
    
    const handlePreview = (post: ContentPost) => {
        setPreviewPost(post);
        setIsPreviewModalOpen(true);
    };

    const handleDelete = (post: ContentPost) => {
        if (!canManage) return;
        openConfirmationModal(
            'Confirm Deletion',
            <>Are you sure you want to delete the post: <strong>"{post.title}"</strong>?</>,
            () => {
                deletePost(post.id);
                showNotification(`Post '${post.title}' deleted.`);
                setIsConfirmModalOpen(false);
            }
        );
    };
    
    const handleStatusToggle = (post: ContentPost) => {
        if (!canManage) return;
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        updatePost({ ...post, status: newStatus });
        showNotification(`'${post.title}' status changed to ${newStatus}.`);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPostIds(e.target.checked ? paginatedData.map(p => p.id) : []);
    };
    
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedPostIds(prev => [...prev, id]);
        } else {
            setSelectedPostIds(prev => prev.filter(postId => postId !== id));
        }
    };
    
    const handleBulkDelete = () => {
        if (!canManage) {
            showNotification('You do not have permission to delete posts.', 'error');
            return;
        }
        if (selectedPostIds.length === 0) return;
        openConfirmationModal(
            'Confirm Bulk Deletion',
            <>Are you sure you want to delete <strong>{selectedPostIds.length} selected post(s)</strong>?</>,
            () => {
                deleteMultiplePosts(selectedPostIds);
                showNotification(`${selectedPostIds.length} posts deleted.`);
                setSelectedPostIds([]);
                setIsConfirmModalOpen(false);
            }
        );
    };

    const SortableHeader: React.FC<{ columnKey: SortKey; title: string; }> = ({ columnKey, title }) => (
        <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort(columnKey)}>
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
                    <h2 className="text-xl font-bold text-gray-700">General Posts</h2>
                    {selectedPostIds.length > 0 && canManage && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700 transition-colors"
                        >
                           <Icon name="trash" /> Delete ({selectedPostIds.length})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <input 
                        type="text" 
                        placeholder="Search by title..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-auto"
                    />
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full sm:w-auto"
                    >
                        {categories.map((cat: string) => (
                            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                        ))}
                    </select>
                    {canManage && (
                        <button onClick={() => { setEditingPost(undefined); setIsModalOpen(true); }} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 w-full sm:w-auto justify-center">
                            <Icon name="plus" /> Add New Post
                        </button>
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
                                        checked={paginatedData.length > 0 && selectedPostIds.length === paginatedData.length}
                                        className="w-4 h-4 text-[var(--primary-color)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                    />
                                </th>
                                <th className="px-6 py-3">Image</th>
                                <SortableHeader columnKey="title" title="Title" />
                                <SortableHeader columnKey="category" title="Category" />
                                <SortableHeader columnKey="publishedDate" title="Published Date" />
                                <SortableHeader columnKey="status" title="Status" />
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map(post => (
                                <tr key={post.id} className={`bg-white hover:bg-gray-50 ${selectedPostIds.includes(post.id) ? 'bg-[var(--primary-color)]/10' : 'border-b'}`}>
                                     <td data-label="Select" className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedPostIds.includes(post.id)}
                                            onChange={(e) => handleSelectOne(e, post.id)}
                                            className="w-4 h-4 text-[var(--primary-color)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--primary-color)]"
                                        />
                                    </td>
                                    <td data-label="Image" className="px-6 py-4">
                                        {post.imageUrl ? (
                                            <img src={post.imageUrl} alt={post.title} className="w-16 h-10 object-cover rounded-md bg-gray-200" loading="lazy" />
                                        ) : (
                                            <div className="w-16 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                                                <Icon name="image" className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td data-label="Title" className="px-6 py-4 font-medium text-gray-900">{post.title}</td>
                                    <td data-label="Category" className="px-6 py-4">{post.category}</td>
                                    <td data-label="Published" className="px-6 py-4">{post.publishedDate}</td>
                                    <td data-label="Status" className="px-6 py-4">
                                        <button onClick={() => handleStatusToggle(post)} title={`Click to change status`}>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${post.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>{post.status}</span>
                                        </button>
                                    </td>
                                    <td data-label="Actions" className="px-6 py-4 flex gap-4 items-center actions-cell">
                                        <button onClick={() => handlePreview(post)} className="text-blue-500 hover:text-blue-700" aria-label={`Preview post: ${post.title}`}><Icon name="eye" /></button>
                                        {canManage && (
                                            <>
                                                <button onClick={() => handleEdit(post)} className="text-yellow-500 hover:text-yellow-700" aria-label={`Edit post: ${post.title}`}><Icon name="edit" /></button>
                                                <button onClick={() => handleDelete(post)} className="text-red-500 hover:text-red-700" aria-label={`Delete post: ${post.title}`}><Icon name="trash" /></button>
                                            </>
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
                <EmptyState 
                    message={searchQuery || categoryFilter !== 'all' ? "No posts match your filters." : "No general posts found."}
                    buttonText={canManage ? "Add New Post" : undefined}
                    onButtonClick={canManage ? () => { setEditingPost(undefined); setIsModalOpen(true); } : undefined}
                />
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPost ? 'Edit Post' : 'Add New Post'}>
                <EnhancedPostForm 
                    post={editingPost} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)}
                    defaultType="posts"
                />
            </Modal>
            <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Post Preview">
                {previewPost && (
                    <div className="bg-gray-50 -m-6 p-6">
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                             {previewPost.imageUrl && (
                                <img src={previewPost.imageUrl} alt={previewPost.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-6" />
                            )}
                            <h1 className="text-3xl font-bold text-[#1e3c72] mb-4">{previewPost.title}</h1>
                            <div className="text-sm text-gray-600 mb-6 border-b pb-4">
                                <span><Icon name="calendar-alt" className="mr-2 text-gray-400" />Published on {previewPost.publishedDate}</span>
                                <span className="ml-4"><Icon name="tag" className="mr-2 text-gray-400" />{previewPost.category}</span>
                            </div>

                            <div className="static-content">
                                <MarkdownRenderer content={previewPost.content} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalContent.onConfirm}
                title={confirmModalContent.title}
                message={confirmModalContent.message}
                isLoading={isLoading}
                confirmText="Delete"
            />
        </div>
    );
};

export default ContentPostManagement;