import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar estados de carga con threshold
 *
 * Este hook muestra un loading solo si la operación tarda más de X milisegundos.
 * Es útil para evitar flashes de loading en operaciones rápidas.
 *
 * @param {number} threshold - Tiempo en ms antes de mostrar el loading (por defecto: 3000ms)
 * @returns {Object} - { isLoading, startLoading, stopLoading, withLoading }
 *
 * @example
 * // Uso básico con threshold de 3 segundos
 * const { isLoading, startLoading, stopLoading } = useLoading(3000);
 *
 * const fetchData = async () => {
 *   startLoading();
 *   try {
 *     const data = await api.get('/data');
 *     // procesar data
 *   } finally {
 *     stopLoading();
 *   }
 * };
 *
 * @example
 * // Uso con wrapper automático
 * const { isLoading, withLoading } = useLoading(3000);
 *
 * const fetchData = withLoading(async () => {
 *   const data = await api.get('/data');
 *   return data;
 * });
 */
const useLoading = (threshold = 3000) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const timeoutRef = useRef(null);
  const loadingStartTimeRef = useRef(null);

  // Limpiar timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Inicia el estado de loading
   * Solo muestra el loading visual si la operación tarda más del threshold
   */
  const startLoading = useCallback(() => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true);

    // Configurar timeout para mostrar el loading después del threshold
    timeoutRef.current = setTimeout(() => {
      setShouldShowLoading(true);
    }, threshold);
  }, [threshold]);

  /**
   * Detiene el estado de loading
   * Limpia el timeout si aún no se ha mostrado
   */
  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setShouldShowLoading(false);

    // Limpiar timeout si aún no se ha ejecutado
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    loadingStartTimeRef.current = null;
  }, []);

  /**
   * Wrapper que ejecuta una función async y maneja el loading automáticamente
   *
   * @param {Function} asyncFn - Función async a ejecutar
   * @returns {Function} - Función wrapeada que maneja el loading
   */
  const withLoading = useCallback(
    (asyncFn) => {
      return async (...args) => {
        startLoading();
        try {
          const result = await asyncFn(...args);
          return result;
        } finally {
          stopLoading();
        }
      };
    },
    [startLoading, stopLoading]
  );

  return {
    /**
     * Estado actual de loading (true si está en proceso, false si no)
     */
    isLoading,

    /**
     * Si debe mostrarse el loading visual (solo después del threshold)
     */
    shouldShowLoading,

    /**
     * Función para iniciar el loading manualmente
     */
    startLoading,

    /**
     * Función para detener el loading manualmente
     */
    stopLoading,

    /**
     * Wrapper para ejecutar funciones async con loading automático
     */
    withLoading,
  };
};

export default useLoading;
