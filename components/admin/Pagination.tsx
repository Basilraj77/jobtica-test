
import React from 'react';
import Icon from '../Icon.tsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    
    // Always add the first page
    items.push(1);

    // Add leading ellipsis if needed
    if (currentPage > 3) {
      items.push('...');
    }

    // Add page before current page
    if (currentPage > 2) {
      items.push(currentPage - 1);
    }

    // Add current page if it's not the first or last
    if (currentPage !== 1 && currentPage !== totalPages) {
      items.push(currentPage);
    }
    
    // Add page after current page
    if (currentPage < totalPages - 1) {
      items.push(currentPage + 1);
    }

    // Add trailing ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push('...');
    }
    
    // Always add the last page if it's more than 1
    if (totalPages > 1) {
        items.push(totalPages);
    }
    
    // Return a unique set of items
    return Array.from(new Set(items));
  };

  const paginationItems = getPaginationItems();

  return (
    <div className="flex items-center justify-center mt-8 py-2">
      <nav className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="arrow-left" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <div className="hidden sm:flex items-center gap-2">
          {paginationItems.map((item, index) => {
            if (typeof item === 'string') {
              return <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm text-gray-500">...</span>;
            }
            return (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                aria-current={currentPage === item ? 'page' : undefined}
                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                  currentPage === item
                    ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] z-10'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        
        <div className="sm:hidden text-sm text-gray-700 px-2">
             Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Next</span>
          <Icon name="arrow-right" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;