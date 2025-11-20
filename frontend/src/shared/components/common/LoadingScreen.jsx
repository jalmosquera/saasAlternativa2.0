import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingScreen - Componente de carga con animación de sartén
 *
 * @param {boolean} isLoading - Controla si el loading está visible
 * @param {string} text - Texto a mostrar debajo del logo (opcional)
 * @param {string} brandName - Nombre de la marca (por defecto: "Equss Pub")
 * @param {string} subtitle - Subtítulo (por defecto: "Admin")
 * @param {number} minDuration - Duración mínima en ms antes de ocultar (por defecto: 1200)
 */
const LoadingScreen = ({
  isLoading = true,
  text = 'Cargando...',
  brandName = 'Equss Pub',
  subtitle = 'Comida exquisita',
  minDuration = 1200
}) => {
  const [shouldShow, setShouldShow] = useState(isLoading);
  const [isVisible, setIsVisible] = useState(isLoading);
  const [isDark, setIsDark] = useState(false);

  // Detectar tema oscuro
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Verificar inicialmente
    checkTheme();

    // Observar cambios en el tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Esperar la duración mínima antes de empezar a ocultar
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Después de la transición de opacidad, remover del DOM
        setTimeout(() => {
          setShouldShow(false);
        }, 400);
      }, minDuration);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(true);
      setIsVisible(true);
    }
  }, [isLoading, minDuration]);

  // No renderizar nada si no debe mostrarse
  if (!shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-400 ${
        isDark ? 'bg-dark-bg' : 'bg-white'
      } ${isVisible ? 'opacity-100' : 'opacity-0 invisible'}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <div className="text-center">
        {/* Animación de la sartén */}
        <div className="relative mx-auto mb-6 h-40 w-[200px]">
          {/* Ingredientes que caen */}
          {/* Ingrediente 1 - Huevo */}
          <div className="loading-ingredient loading-i1 absolute bottom-[35px] left-1/2 h-[18px] w-[18px] drop-shadow-md">
            <svg className="h-[22px] w-7" viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="18" cy="14" rx="11" ry="9" fill="#fffbee" />
              <circle cx="18" cy="14" r="5" fill="#ffcb2e" />
            </svg>
          </div>

          {/* Ingrediente 2 - Tomate */}
          <div className="loading-ingredient loading-i2 absolute bottom-[35px] left-1/2 h-[18px] w-[18px] drop-shadow-md">
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" fill="#ff5a5a" />
            </svg>
          </div>

          {/* Ingrediente 3 - Vegetal verde */}
          <div className="loading-ingredient loading-i3 absolute bottom-[35px] left-1/2 h-[18px] w-[18px] drop-shadow-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12c2-5 6-7 10-8 0 0 2 4 1 8s-3 6-8 6S5 18 6 12z" fill="#7be26b" />
            </svg>
          </div>

          {/* Ingrediente 4 - Hierba */}
          <div className="loading-ingredient loading-i4 absolute bottom-[35px] left-1/2 h-[18px] w-[18px] drop-shadow-md">
            <svg className="w-3 h-3" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 0c1 1 2 1 3 2s1 2 1 3-1 2-2 3-2-1-3-2S3 7 2 6 3 2 6 0z" fill="#79d28b" />
            </svg>
          </div>

          {/* Sartén */}
          <div className="absolute bottom-0 left-1/2 h-[100px] w-[180px] -translate-x-1/2">
            <svg
              className="w-full h-full loading-pan-svg"
              viewBox="0 0 480 260"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Sombra de la sartén */}
              <ellipse cx="240" cy="160" rx="180" ry="60" fill="#c54e0d" />

              {/* Borde exterior */}
              <ellipse cx="240" cy="145" rx="170" ry="50" fill="#d95910" />

              {/* Interior de la sartén con gradiente */}
              <ellipse cx="240" cy="155" rx="140" ry="40" fill="url(#panGradient)" />

              {/* Definiciones */}
              <defs>
                <linearGradient id="panGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#f76511" />
                  <stop offset="1" stopColor="#e05a0f" />
                </linearGradient>
              </defs>

              {/* Borde superior brillante */}
              <path
                d="M60 140 C120 100 360 100 420 140"
                fill="none"
                stroke="#ff7d2b"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Mango de la sartén */}
              <rect
                x="420"
                y="118"
                width="120"
                height="18"
                rx="8"
                fill="#b84d0c"
                transform="rotate(-35 445 165)"
              />

              {/* Detalle del mango */}
              <circle cx="488" cy="132" r="6" fill="#8a3b08" />
            </svg>
          </div>
        </div>

        {/* Texto de marca */}
        <div className={`mb-2 text-2xl font-bold tracking-wide ${
          isDark ? 'text-text-primary' : 'text-gray-800'
        }`}>
          {brandName}{' '}
          <span className={`ml-1.5 text-lg font-normal ${
            isDark ? 'text-text-secondary' : 'text-gray-400'
          }`}>
            {subtitle}
          </span>
        </div>

        {/* Texto de estado */}
        <div className={`text-sm font-medium ${
          isDark ? 'text-text-secondary' : 'text-gray-500'
        }`}>
          {text}
        </div>
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  isLoading: PropTypes.bool,
  text: PropTypes.string,
  brandName: PropTypes.string,
  subtitle: PropTypes.string,
  minDuration: PropTypes.number,
};

export default LoadingScreen;
