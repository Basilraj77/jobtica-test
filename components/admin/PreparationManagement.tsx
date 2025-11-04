import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { PreparationCourse, PreparationBook, UpcomingExam } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';

// A styled empty state component for this page
const EmptyState: React.FC<{ message: string; buttonText: string; onButtonClick: () => void; icon: string; }> = ({ message, buttonText, onButtonClick, icon }) => (
    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50">
        <Icon name={icon} className="text-5xl text-gray-300 mb-4 mx-auto" />
        <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
            <Icon name="plus" /> {buttonText}
        </button>
    </div>
);


// Form for Courses
const CourseForm: React.FC<{ course?: PreparationCourse; onSave: (course: Omit<PreparationCourse, 'id'>, id?: string) => void; onCancel: () => void; }> = ({ course, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<PreparationCourse, 'id'>>(course ? { ...course } : {
        title: '', platform: 'Other', url: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, course?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Course Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Platform *</label>
                <select name="platform" value={formData.platform} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                    <option>Udemy</option> <option>Unacademy</option> <option>Coursera</option>
                    <option>Testbook</option> <option>Adda247</option> <option>Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Affiliate URL *</label>
                <input type="url" name="url" value={formData.url} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save Course</button>
            </div>
        </form>
    );
};

// Form for Books
const BookForm: React.FC<{ book?: PreparationBook; onSave: (book: Omit<PreparationBook, 'id'>, id?: string) => void; onCancel: () => void; }> = ({ book, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<PreparationBook, 'id'>>(book ? { ...book } : {
        title: '', author: '', url: '', imageUrl: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, book?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Book Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Author *</label>
                <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Affiliate URL *</label>
                <input type="url" name="url" value={formData.url} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save Book</button>
            </div>
        </form>
    );
};

// Form for Upcoming Exams
const ExamForm: React.FC<{ exam?: UpcomingExam; onSave: (exam: Omit<UpcomingExam, 'id'>, id?: string) => void; onCancel: () => void; }> = ({ exam, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<UpcomingExam, 'id'>>(exam ? { ...exam } : {
        name: '', deadline: '', notificationLink: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, exam?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Exam Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Deadline Date *</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Official Notification Link *</label>
                <input type="url" name="notificationLink" value={formData.notificationLink} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save Deadline</button>
            </div>
        </form>
    );
};


const PreparationManagement: React.FC = () => {
    const { 
        preparationCourses, addPreparationCourse, updatePreparationCourse, deletePreparationCourse,
        preparationBooks, addPreparationBook, updatePreparationBook, deletePreparationBook,
        upcomingExams, addUpcomingExam, updateUpcomingExam, deleteUpcomingExam,
        demoUserSettings 
    } = useData();
    const { isDemoUser } = useAuth();

    const [modalState, setModalState] = useState<{ type: 'course' | 'book' | 'exam'; item?: PreparationCourse | PreparationBook | UpcomingExam } | null>(null);
    const [confirmState, setConfirmState] = useState<{ type: 'course' | 'book' | 'exam'; item: PreparationCourse | PreparationBook | UpcomingExam } | null>(null);

    const canManage = !isDemoUser || demoUserSettings.canManageContent;

    const handleSaveCourse = (courseData: Omit<PreparationCourse, 'id'>, id?: string) => {
        if (!canManage) return;
        id ? updatePreparationCourse({ ...courseData, id }) : addPreparationCourse(courseData);
        setModalState(null);
    };
    
    const handleSaveBook = (bookData: Omit<PreparationBook, 'id'>, id?: string) => {
        if (!canManage) return;
        id ? updatePreparationBook({ ...bookData, id }) : addPreparationBook(bookData);
        setModalState(null);
    };
    
    const handleSaveExam = (examData: Omit<UpcomingExam, 'id'>, id?: string) => {
        if (!canManage) return;
        id ? updateUpcomingExam({ ...examData, id }) : addUpcomingExam(examData);
        setModalState(null);
    };

    const confirmDelete = () => {
        if (!canManage || !confirmState) return;
        if (confirmState.type === 'course') deletePreparationCourse(confirmState.item.id);
        if (confirmState.type === 'book') deletePreparationBook(confirmState.item.id);
        if (confirmState.type === 'exam') deleteUpcomingExam(confirmState.item.id);
        setConfirmState(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
             <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b">Exam Preparation Content</h2>

            <div className="space-y-12">
                 {/* Upcoming Exam Deadlines Management */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-700">Upcoming Exam Deadlines</h3>
                        {canManage && (
                            <button onClick={() => setModalState({ type: 'exam' })} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm">
                                <Icon name="plus" /> Add Deadline
                            </button>
                        )}
                    </div>
                    {upcomingExams.length > 0 ? (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 responsive-table">
                               <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Exam Name</th>
                                        <th className="px-6 py-3">Deadline</th>
                                        <th className="px-6 py-3">Notification Link</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingExams.map(exam => (
                                        <tr key={exam.id} className="bg-white hover:bg-gray-50/50 border-b last:border-b-0">
                                            <td data-label="Name" className="px-6 py-4 font-medium">{exam.name}</td>
                                            <td data-label="Deadline" className="px-6 py-4">{exam.deadline}</td>
                                            <td data-label="URL" className="px-6 py-4 truncate max-w-xs"><a href={exam.notificationLink} target="_blank" rel="nofollow noopener noreferrer" className="text-[var(--primary-color)] hover:underline">{exam.notificationLink}</a></td>
                                            <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                                {canManage && <>
                                                    <button onClick={() => setModalState({ type: 'exam', item: exam })} className="text-yellow-500 hover:text-yellow-700"><Icon name="edit" /></button>
                                                    <button onClick={() => setConfirmState({ type: 'exam', item: exam })} className="text-red-500 hover:text-red-700"><Icon name="trash" /></button>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        canManage && <EmptyState icon="calendar-check" message="No deadlines found. Add upcoming exam deadlines." buttonText="Add New Deadline" onButtonClick={() => setModalState({ type: 'exam' })} />
                    )}
                </div>

                {/* Course Management */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-700">Manage Courses</h3>
                        {canManage && (
                            <button onClick={() => setModalState({ type: 'course' })} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 text-sm">
                                <Icon name="plus" /> Add New Course
                            </button>
                        )}
                    </div>
                    {preparationCourses.length > 0 ? (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 responsive-table">
                               <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Platform</th>
                                        <th className="px-6 py-3">URL</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preparationCourses.map(course => (
                                        <tr key={course.id} className="bg-white hover:bg-gray-50/50 border-b last:border-b-0">
                                            <td data-label="Title" className="px-6 py-4 font-medium">{course.title}</td>
                                            <td data-label="Platform" className="px-6 py-4">{course.platform}</td>
                                            <td data-label="URL" className="px-6 py-4 truncate max-w-xs"><a href={course.url} target="_blank" rel="nofollow noopener noreferrer" className="text-[var(--primary-color)] hover:underline">{course.url}</a></td>
                                            <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                                {canManage && <>
                                                    <button onClick={() => setModalState({ type: 'course', item: course })} className="text-yellow-500 hover:text-yellow-700"><Icon name="edit" /></button>
                                                    <button onClick={() => setConfirmState({ type: 'course', item: course })} className="text-red-500 hover:text-red-700"><Icon name="trash" /></button>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        canManage && <EmptyState icon="chalkboard-teacher" message="No courses found. Add recommended courses." buttonText="Add New Course" onButtonClick={() => setModalState({ type: 'course' })} />
                    )}
                </div>

                {/* Book Management */}
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-700">Manage Books</h3>
                        {canManage && (
                            <button onClick={() => setModalState({ type: 'book' })} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 text-sm">
                                <Icon name="plus" /> Add New Book
                            </button>
                        )}
                    </div>
                     {preparationBooks.length > 0 ? (
                        <div className="overflow-x-auto border rounded-lg">
                             <table className="w-full text-sm text-left text-gray-500 responsive-table">
                               <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Image</th>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Author</th>
                                        <th className="px-6 py-3">URL</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preparationBooks.map(book => (
                                        <tr key={book.id} className="bg-white hover:bg-gray-50/50 border-b last:border-b-0">
                                            <td data-label="Image" className="px-6 py-4">
                                                {book.imageUrl ? <img src={book.imageUrl} alt={book.title} className="h-10 w-auto object-contain bg-gray-100" /> : <span className="text-gray-400 text-xs">No Image</span>}
                                            </td>
                                            <td data-label="Title" className="px-6 py-4 font-medium">{book.title}</td>
                                            <td data-label="Author" className="px-6 py-4">{book.author}</td>
                                            <td data-label="URL" className="px-6 py-4 truncate max-w-xs"><a href={book.url} target="_blank" rel="nofollow noopener noreferrer" className="text-[var(--primary-color)] hover:underline">{book.url}</a></td>
                                            <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                                {canManage && <>
                                                    <button onClick={() => setModalState({ type: 'book', item: book })} className="text-yellow-500 hover:text-yellow-700"><Icon name="edit" /></button>
                                                    <button onClick={() => setConfirmState({ type: 'book', item: book })} className="text-red-500 hover:text-red-700"><Icon name="trash" /></button>
                                                </>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         canManage && <EmptyState icon="book-open" message="No books found. Add recommended books." buttonText="Add New Book" onButtonClick={() => setModalState({ type: 'book' })} />
                    )}
                </div>
            </div>

            {/* Modal for Forms */}
            <Modal
                isOpen={!!modalState}
                onClose={() => setModalState(null)}
                title={modalState?.item ? `Edit ${modalState.type}` : `Add New ${modalState.type}`}
            >
                {modalState?.type === 'course' && (
                    <CourseForm course={modalState.item as PreparationCourse} onSave={handleSaveCourse} onCancel={() => setModalState(null)} />
                )}
                {modalState?.type === 'book' && (
                    <BookForm book={modalState.item as PreparationBook} onSave={handleSaveBook} onCancel={() => setModalState(null)} />
                )}
                {modalState?.type === 'exam' && (
                    <ExamForm exam={modalState.item as UpcomingExam} onSave={handleSaveExam} onCancel={() => setModalState(null)} />
                )}
            </Modal>
            
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmState}
                onClose={() => setConfirmState(null)}
                onConfirm={confirmDelete}
                title={`Confirm Deletion`}
                message={<>Are you sure you want to delete this {confirmState?.type}: <strong>"{(confirmState?.item as any)?.title || (confirmState?.item as UpcomingExam)?.name}"</strong>?</>}
                confirmText="Delete"
            />
        </div>
    );
};

export default PreparationManagement;