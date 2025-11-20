import { useState } from 'react';
import PropTypes from 'prop-types';

const PromotionsCarousel = ({ cards }) => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate cards for infinite scroll effect
  const duplicatedCards = [...cards, ...cards];

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full py-16 overflow-hidden md:py-20 lg:py-24 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute top-0 bottom-0 left-0 z-10 w-8 pointer-events-none bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 z-10 w-8 pointer-events-none bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent" />

      {/* Carousel container */}
      <div
        className="flex gap-6"
        style={{
          animation: isPaused ? 'none' : 'scroll 5s linear infinite',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedCards.map((card, index) => (
          <div
            key={`${card.id}-${index}`}
            className="flex-shrink-0 w-72 transition-transform rounded-3xl md:w-80 lg:w-96 hover:scale-105 overflow-hidden"
            style={{
              backgroundColor: card.background_color || '#FF6B35',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center transition-shadow shadow-lg md:p-10 lg:p-12 hover:shadow-xl">
              {/* Emoji */}
              <div className="mb-6 text-7xl md:text-8xl">{card.emoji}</div>

              {/* Text */}
              <p className="text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                {card.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

PromotionsCarousel.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired,
      background_color: PropTypes.string,
      order: PropTypes.number,
    })
  ).isRequired,
};

export default PromotionsCarousel;
