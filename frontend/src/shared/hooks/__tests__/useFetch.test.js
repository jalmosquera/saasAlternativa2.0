import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useFetch from '../useFetch';
import api from '@shared/services/api';

// Mock api
vi.mock('@shared/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = {
      results: [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }],
    };

    api.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useFetch('/products/'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(api.get).toHaveBeenCalledWith('/products/', {});
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Network error';
    api.get.mockRejectedValue({
      response: { data: { detail: errorMessage } },
    });

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFetch('/products/'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(errorMessage);

    consoleError.mockRestore();
  });

  it('should not fetch when url is null', async () => {
    const { result } = renderHook(() => useFetch(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('should not fetch when url is empty string', async () => {
    const { result } = renderHook(() => useFetch(''));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('should refetch data when refetch is called', async () => {
    const mockData1 = { results: [{ id: 1, name: 'Product 1' }] };
    const mockData2 = { results: [{ id: 2, name: 'Product 2' }] };

    api.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result } = renderHook(() => useFetch('/products/'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1);

    // Call refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('should handle refetch error', async () => {
    const mockData = { results: [{ id: 1, name: 'Product 1' }] };
    const errorMessage = 'Refetch failed';

    api.get
      .mockResolvedValueOnce({ data: mockData })
      .mockRejectedValueOnce({
        response: { data: { detail: errorMessage } },
      });

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFetch('/products/'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);

    // Call refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    // After refetch error, previous data is preserved
    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);

    consoleError.mockRestore();
  });

  it('should refetch when URL changes', async () => {
    const mockData1 = { results: [{ id: 1, name: 'Product 1' }] };
    const mockData2 = { results: [{ id: 2, name: 'Category 1' }] };

    api.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/products/' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1);

    // Change URL
    rerender({ url: '/categories/' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(api.get).toHaveBeenCalledWith('/products/', {});
    expect(api.get).toHaveBeenCalledWith('/categories/', {});
  });

  it('should pass options to api call', async () => {
    const mockData = { results: [] };
    const options = { params: { page: 1, page_size: 10 } };

    api.get.mockResolvedValue({ data: mockData });

    renderHook(() => useFetch('/products/', options));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products/', options);
    });
  });

  it('should handle error message from different response formats', async () => {
    const errorMessage = 'Custom error message';
    api.get.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFetch('/products/'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);

    consoleError.mockRestore();
  });

  it('should use default error message when no error details available', async () => {
    api.get.mockRejectedValue(new Error('Unknown error'));

    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFetch('/products/'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unknown error');

    consoleError.mockRestore();
  });
});
