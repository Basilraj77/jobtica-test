import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { ContentPost } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
import PostForm from './PostForm.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData

const ITEMS_PER_PAGE = 10;

const EmptyState: React.FC<{ message: string; buttonText?: string; onButtonClick?: () => void; }> = ({ message, buttonText, onButtonClick }) => (
    <div className="text-center py-16 border-t">
      <Icon name="bell" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
      {buttonText && onButtonClick && (
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
          <Icon name="plus" /> {buttonText}
        </button>
      )}
    </div>
);

const ExamNoticeManagement: React.FC = () => {
    const { posts, addPost, updatePost, deletePost, demoUserSettings, securitySettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<ContentPost | undefined>(undefined);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<ContentPost | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const canManage = !isDemoUser || demoUserSettings.canManageContent;

    const filteredPosts = posts.filter(p => p.type === 'exam-notices');
    const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedPosts, { itemsPerPage: ITEMS_PER_PAGE });

    const handlePageChange = (page: number) => {
        goToPage(page);
        const mainContent = document.getElementById('admin-main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSave = (postData: Omit<ContentPost, 'id' | 'createdAt'>, id?: string) => {
        if (!canManage) return;
        if (id) {
             const originalPost = posts.find(p => p.id === id);
             if (originalPost) {
                updatePost({ ...originalPost, ...postData });
             }
        } else {
            addPost(postData);
        }
        setIsModalOpen(false);
        setEditingPost(undefined);
    };

    const handleEdit = (post: ContentPost) => {
        if (!canManage) return;
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (post: ContentPost) => {
        if (!canManage) return;
        setPostToDelete(post);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            deletePost(postToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setPostToDelete(null);
    };

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-700">Exam Notices & Admit Cards</h2>
                {canManage && (
                    <button onClick={() => { setEditingPost(undefined); setIsModalOpen(true); }} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90">
                        <Icon name="plus" /> Add New Notice
                    </button>
                )}
            </div>
            {paginatedData.length > 0 ? (
            <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Published Date</th>
                            <th className="px-6 py-3">Exam Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(post => (
                            <tr key={post.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Title" className="px-6 py-4 font-medium text-gray-900">{post.title}</td>
                                <td data-label="Category" className="px-6 py-4">{post.category}</td>
                                <td data-label="Published" className="px-6 py-4">{post.publishedDate}</td>
                                <td data-label="Exam Date" className="px-6 py-4">{post.examDate || 'N/A'}</td>
                                <td data-label="Status" className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{post.status}</span>
                                </td>
                                <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                    {canManage && (
                                        <>
                                            <button onClick={() => handleEdit(post)} className="text-yellow-500 hover:text-yellow-700" aria-label={`Edit notice: ${post.title}`}><Icon name="edit" /></button>
                                            <button onClick={() => handleDeleteRequest(post)} className="text-red-500 hover:text-red-700" aria-label={`Delete notice: ${post.title}`}><Icon name="trash" /></button>
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
                    message="No exam notices found."
                    buttonText={canManage ? "Add New Notice" : undefined}
                    onButtonClick={canManage ? () => { setEditingPost(undefined); setIsModalOpen(true); } : undefined}
                />
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPost ? 'Edit Notice' : 'Add New Notice'}>
                <PostForm 
                    post={editingPost} 
                    onSave={handleSave} 
                    onCancel={() => setIsModalOpen(false)}
                    defaultType="exam-notices"
                />
            </Modal>
             <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={<>Are you sure you want to delete this notice: <strong>"{postToDelete?.title}"</strong>?</>}
                confirmText="Delete"
            />
        </div>
    );
};

export default ExamNoticeManagement;