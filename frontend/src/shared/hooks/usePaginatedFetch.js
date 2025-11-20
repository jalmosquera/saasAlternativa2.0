import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@shared/services/api';

/**
 * Hook personalizado para hacer fetch de datos paginados desde la API
 * @param {string} baseUrl - URL base del endpoint (sin parámetros de paginación)
 * @param {number} initialPageSize - Tamaño de página inicial (default: 10)
 * @param {object} filters - Objeto con filtros adicionales (ej: { search: 'texto' })
 * @returns {object} - { data, loading, error, currentPage, pageSize, totalCount, setPage, setPageSize, refetch }
 */
const usePaginatedFetch = (baseUrl, initialPageSize = 10, externalFilters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);

  // Serializar filtros para comparación estable
  const filtersString = JSON.stringify(externalFilters);
  const prevFiltersStringRef = useRef(filtersString);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    if (prevFiltersStringRef.current !== filtersString) {
      prevFiltersStringRef.current = filtersString;
      setCurrentPage(1);
    }
  }, [filtersString]);

  const fetchData = useCallback(async () => {
    if (!baseUrl) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construir URL con parámetros de paginación y filtros
      const separator = baseUrl.includes('?') ? '&' : '?';
      let url = `${baseUrl}${separator}page=${currentPage}&page_size=${pageSize}`;

      // Parsear filtros desde string
      const filters = JSON.parse(filtersString);

      // Agregar filtros a la URL
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          url += `&${key}=${encodeURIComponent(filters[key])}`;
        }
      });

      const response = await api.get(url);

      setData(response.data);
      setTotalCount(response.data.count || 0);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Error al cargar datos';
      setError(errorMessage);
      setData(null);
      console.error('Error en usePaginatedFetch:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, currentPage, pageSize, filtersString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    setPage,
    setPageSize,
    refetch,
  };
};

export default usePaginatedFetch;
