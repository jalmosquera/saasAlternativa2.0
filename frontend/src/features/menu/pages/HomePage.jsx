import { useState, useMemo, useEffect } from 'react';
import usePaginatedFetch from '@/shared/hooks/usePaginatedFetch';
import { ProductGrid, CategoryFilter } from '../components';
import PromotionsModal from '../components/PromotionsModal';
import PromotionsCarousel from '../components/PromotionsCarousel';
import { useLanguage } from '@shared/contexts/LanguageContext';
import Pagination from '@shared/components/Pagination';
import { trackVisit } from '@shared/services/visitTracker';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPromotionsModal, setShowPromotionsModal] = useState(false);
  const [activePromotions, setActivePromotions] = useState([]);
  const [carouselCards, setCarouselCards] = useState([]);
  const { t } = useLanguage();

  // Track page visit
  useEffect(() => {
    trackVisit();
  }, []);

  // Fetch active promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        // Check if modal was already shown this session
        const promotionsShown = sessionStorage.getItem('promotionsModalShown');

        if (promotionsShown === 'true') {
          return; // Don't show modal again this session
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/promotions/active/`
        );

        if (response.ok) {
          const data = await response.json();

          if (data && data.length > 0) {
            setActivePromotions(data);
            setShowPromotionsModal(true);
            // Mark as shown for this session
            sessionStorage.setItem('promotionsModalShown', 'true');
          }
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        // Fail silently - promotions are not critical
      }
    };

    fetchPromotions();
  }, []);

  // Fetch carousel cards on mount
  useEffect(() => {
    const fetchCarouselCards = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/carousel-cards/active/`
        );

        if (response.ok) {
          const data = await response.json();
          setCarouselCards(data || []);
        }
      } catch (error) {
        console.error('Error fetching carousel cards:', error);
        // Fail silently - carousel cards are not critical
      }
    };

    fetchCarouselCards();
  }, []);

  // Preload hero images for better performance
  useEffect(() => {
    const heroImages = ['/homePage.jpg', '/burger.jpg', '/logoEquss.png'];
    heroImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filters = { available: 'true' };
    if (selectedCategory) filters.categories = selectedCategory;
    return filters;
  }, [selectedCategory]);

  // Fetch de productos con paginación (solo disponibles para el menú público)
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    currentPage,
    pageSize,
    totalCount,
    setPage,
  } = usePaginatedFetch('/products/', 12, apiFilters);

  const {
    data: categoriesData,
    loading: categoriesLoading,
  } = usePaginatedFetch('/categories/', 100); // Muchas categorías para mostrar todas

  // Extraer los arrays de results de la respuesta paginada
  const categories = categoriesData?.results || [];
  const filteredProducts = productsData?.results || [];

  // Handler para cambio de categoría
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1); // Resetear a página 1 cuando cambia la categoría
  };

  // Handler to close promotions modal
  const handleClosePromotions = () => {
    setShowPromotionsModal(false);
  };

  // Scroll al inicio de la sección de categorías cuando cambia la página
  useEffect(() => {
    if (currentPage > 1) {
      const menuSection = document.getElementById('menu-section');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen">
      {/* Desktop Hero Section - Only visible on desktop */}
      <section className="relative hidden h-screen md:block">
        {/* Background Image */}
        <div className="absolute inset-0 bg-center bg-cover bg-[url('/homePage.jpg')]">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 mx-auto lg:px-16 max-w-7xl">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img
              src="/logoEquss.png"
              alt="Logo"
              width="192"
              height="192"
              loading="eager"
              className="w-40 h-40 lg:w-48 lg:h-48 drop-shadow-2xl"
            />
          </div>
   

          {/* Text Content */}
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="mb-6 text-5xl font-bold text-white lg:text-6xl drop-shadow-lg font-gabarito">
              {t('home.mobileHeroTitle')}
            </h1>
            <p className="mb-10 text-xl text-white lg:text-2xl drop-shadow-md">
              {t('home.mobileHeroSubtitle')}
            </p>
            <a
              href="#menu-section"
              className="inline-block px-10 py-4 text-xl font-semibold text-white transition-all duration-300 shadow-xl bg-pepper-orange rounded-xl hover:bg-pepper-orange/90 hover:scale-105 active:scale-95"
            >
              {t('home.mobileHeroCta')}
            </a>
          </div>
          {/* Scroll Indicator */}
          <div className="absolute -translate-x-1/2 bottom-8 left-1/2 animate-bounce">
            <svg
              className="w-8 h-8 text-white drop-shadow-lg"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Mobile Hero Section - Only visible on mobile */}
      <section className="relative block h-screen md:hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-center bg-cover bg-[url('/burger.jpg')]">
          {/* Gradient Overlay on dark area */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full px-6 pt-16">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img
              src="/logoEquss.png"
              alt="Logo"
              width="256"
              height="256"
              loading="eager"
              className="w-64 h-64 drop-shadow-2xl"
            />
          </div>

          {/* Text Content */}
          <div className="max-w-md text-center animate-fade-in-up">
            <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg font-gabarito">
              {t('home.mobileHeroTitle')}
            </h1>
            <p className="mb-8 text-lg text-white drop-shadow-md">
              {t('home.mobileHeroSubtitle')}
            </p>
            <a
              href="#menu-section"
              className="inline-block px-8 py-3 text-lg font-semibold text-white transition-all duration-300 shadow-xl bg-pepper-orange rounded-xl hover:bg-pepper-orange/90 hover:scale-105 active:scale-95"
            >
              {t('home.mobileHeroCta')}
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute -translate-x-1/2 bottom-8 left-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-white drop-shadow-lg"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Promotions Carousel */}
      {carouselCards.length > 0 && (
        <PromotionsCarousel cards={carouselCards} />
      )}

      {/* Menu Section */}
      <section
        id="menu-section"
        className="py-16 transition-colors duration-200 bg-white lg:py-24 dark:bg-gray-900"
      >
        <div className="container-pepper">
          <h2 className="mb-4 text-3xl font-black text-center font-gabarito md:text-4xl lg:text-5xl text-pepper-charcoal dark:text-white">
            {t('home.ourMenu')}
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-center text-gray-600 font-inter md:text-xl dark:text-gray-300">
            {t('home.menuDescription')}
          </p>

          {/* Filtro de categorías */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            loading={categoriesLoading}
          />

          {/* Grid de productos */}
          <ProductGrid
            products={filteredProducts}
            loading={productsLoading}
            error={productsError}
          />

          {/* Pagination */}
          {!productsLoading && !productsError && (
            <Pagination
              count={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>

      {/* Promotions Modal */}
      {showPromotionsModal && activePromotions.length > 0 && (
        <PromotionsModal
          promotions={activePromotions}
          onClose={handleClosePromotions}
        />
      )}
    </div>
  );
};

export default HomePage;
 