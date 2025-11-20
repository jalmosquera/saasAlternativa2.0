import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Pagination = ({ count, currentPage, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(count / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, count);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 mt-6">
      {/* Info Text */}
      <div className="text-sm text-center text-gray-600 dark:text-text-secondary">
        Mostrando <span className="font-semibold text-gray-900 dark:text-text-primary">{startItem}</span> a{' '}
        <span className="font-semibold text-gray-900 dark:text-text-primary">{endItem}</span> de{' '}
        <span className="font-semibold text-gray-900 dark:text-text-primary">{count}</span> resultados
      </div>

      {/* Pagination Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border transition-colors ${
            currentPage === 1
              ? 'border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'border-gray-300 dark:border-dark-border text-gray-700 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg'
          }`}
          aria-label="Página anterior"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base text-gray-500 dark:text-text-secondary"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border transition-colors min-w-[32px] sm:min-w-[40px] text-sm sm:text-base ${
                  currentPage === page
                    ? 'bg-pepper-orange text-white border-pepper-orange font-semibold'
                    : 'border-gray-300 dark:border-dark-border text-gray-700 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border transition-colors ${
            currentPage === totalPages
              ? 'border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'border-gray-300 dark:border-dark-border text-gray-700 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg'
          }`}
          aria-label="Página siguiente"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  count: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
