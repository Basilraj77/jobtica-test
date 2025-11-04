import { useState, useMemo, useEffect } from 'react';

interface PaginationOptions {
  initialPage?: number;
  itemsPerPage: number;
}

export const usePagination = <T>(data: T[], options: PaginationOptions) => {
  const { initialPage = 1, itemsPerPage } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Reset to the first page whenever the data array changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = useMemo(() => {
    const total = Math.ceil(data.length / itemsPerPage);
    return total > 0 ? total : 1; // Ensure totalPages is at least 1
  }, [data, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
  };
};

export default usePagination;
