

import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { ActivityLog } from '../../types.ts';
import Icon from '../Icon.tsx';
import Pagination from './Pagination.tsx';
import usePagination from '../../hooks/usePagination.ts';
import ConfirmationModal from './ConfirmationModal.tsx';

const ITEMS_PER_PAGE = 15;

const EmptyState: React.FC<{ message: string; }> = ({ message }) => (
    <div className="text-center py-16 border-t">
        <Icon name="shield-alt" className="text-5xl text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
    </div>
);

const SecurityLogs: React.FC = () => {
    const { activityLogs, clearActivityLogs } = useData();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    
    const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const { currentPage, totalPages, paginatedData, goToPage } = usePagination(sortedLogs, { itemsPerPage: ITEMS_PER_PAGE });
    
    const handlePageChange = (page: number) => {
        goToPage(page);
        containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleClearLogs = () => {
        clearActivityLogs();
        setIsConfirmModalOpen(false);
    };

    const LogIcon: React.FC<{ action: string }> = ({ action }) => {
        if (action.includes('Login') || action.includes('Logout')) return <Icon name="user-clock" className="text-gray-500" />;
        if (action.includes('Created')) return <Icon name="plus-circle" className="text-green-500" />;
        if (action.includes('Updated')) return <Icon name="pencil-alt" className="text-yellow-500" />;
        if (action.includes('Deleted')) return <Icon name="trash-alt" className="text-red-500" />;
        if (action.includes('Settings')) return <Icon name="cogs" className="text-blue-500" />;
        return <Icon name="info-circle" className="text-gray-500" />;
    };

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-700">Security & Activity Logs ({activityLogs.length})</h2>
                {activityLogs.length > 0 && (
                    <button 
                        onClick={() => setIsConfirmModalOpen(true)} 
                        className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-700"
                    >
                        <Icon name="trash" /> Clear All Logs
                    </button>
                )}
            </div>
            {paginatedData.length > 0 ? (
            <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 w-12"></th>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(log => (
                            <tr key={log.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="" className="px-6 py-4 text-center">
                                    <LogIcon action={log.action} />
                                </td>
                                <td data-label="Timestamp" className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td data-label="Action" className="px-6 py-4 font-semibold text-gray-800">{log.action}</td>
                                <td data-label="Details" className="px-6 py-4">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
            ) : (
                <EmptyState message="No activity has been logged yet." />
            )}
             <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleClearLogs}
                title="Confirm Clearing Logs"
                message="Are you sure you want to permanently delete all security logs? This action cannot be undone."
                confirmText="Clear All"
            />
        </div>
    );
};

export default SecurityLogs;