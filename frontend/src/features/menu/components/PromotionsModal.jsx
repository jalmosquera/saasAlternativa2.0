import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useLanguage } from '@shared/contexts/LanguageContext';

const PromotionsModal = ({ promotions, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  // Preload images for better UX
  useEffect(() => {
    promotions.forEach((promotion) => {
      if (promotion.image_url) {
        const img = new Image();
        img.src = promotion.image_url;
      }
    });
  }, [promotions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (!promotions || promotions.length === 0) {
    return null;
  }

  const currentPromotion = promotions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
      {/* Modal Container - 80% of viewport */}
      <div
        className="relative w-full h-full max-w-[80vw] max-h-[80vh] bg-white dark:bg-dark-card rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 text-white transition-colors bg-black rounded-full bg-opacity-60 hover:bg-opacity-80"
          aria-label={t('promotions.close')}
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        {/* Image Container */}
        <div className="relative w-full h-full">
          {/* Promotion Image */}
          {currentPromotion.image_url ? (
            <img
              src={currentPromotion.image_url}
              alt={currentPromotion.description || 'Promoción'}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-400">{t('promotions.noImage')}</span>
            </div>
          )}

          {/* Description Overlay */}
          {currentPromotion.description && (
            <div className="absolute inset-x-0 bottom-0 px-6 py-6 pb-16 text-center text-white bg-gradient-to-t from-black via-black/80 to-transparent">
              <p className="text-lg font-semibold md:text-xl lg:text-2xl drop-shadow-lg">
                {currentPromotion.description}
              </p>
            </div>
          )}

          {/* Navigation Arrows - Only show if more than 1 promotion */}
          {promotions.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all"
                aria-label={t('promotions.previous')}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all"
                aria-label={t('promotions.next')}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          )}

          {/* Dots Indicator - Only show if more than 1 promotion */}
          {promotions.length > 1 && (
            <div className="absolute flex gap-2 -translate-x-1/2 bottom-3 left-1/2 z-20">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all shadow-lg ${
                    index === currentIndex
                      ? 'bg-white w-7 md:w-9'
                      : 'bg-white bg-opacity-60 hover:bg-opacity-90'
                  }`}
                  aria-label={`${t('promotions.goToPromotion')} ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Background overlay - click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label={t('promotions.close')}
      />
    </div>
  );
};

PromotionsModal.propTypes = {
  promotions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string,
      image_url: PropTypes.string,
      order: PropTypes.number.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PromotionsModal;
