/**
 * API service for Product Options management
 */

import { getAuthHeaders } from '@shared/utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get all product options with pagination
 */
export const getProductOptions = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      ...filters,
    });

    const response = await fetch(
      `${API_URL}/api/product-options/?${params}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching product options');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getProductOptions:', error);
    throw error;
  }
};

/**
 * Get a single product option by ID
 */
export const getProductOption = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-options/${id}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching product option');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getProductOption:', error);
    throw error;
  }
};

/**
 * Create a new product option
 */
export const createProductOption = async (data) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-options/`,
      {
        method: 'POST',
        headers: getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createProductOption:', error);
    throw error;
  }
};

/**
 * Update a product option
 */
export const updateProductOption = async (id, data) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-options/${id}/`,
      {
        method: 'PUT',
        headers: getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateProductOption:', error);
    throw error;
  }
};

/**
 * Delete a product option
 */
export const deleteProductOption = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-options/${id}/`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error deleting product option');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProductOption:', error);
    throw error;
  }
};

/**
 * Get all option choices for a specific option
 */
export const getOptionChoices = async (optionId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-option-choices/?option=${optionId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching option choices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getOptionChoices:', error);
    throw error;
  }
};

/**
 * Create a new option choice
 */
export const createOptionChoice = async (data) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-option-choices/`,
      {
        method: 'POST',
        headers: getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createOptionChoice:', error);
    throw error;
  }
};

/**
 * Update an option choice
 */
export const updateOptionChoice = async (id, data) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-option-choices/${id}/`,
      {
        method: 'PUT',
        headers: getAuthHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateOptionChoice:', error);
    throw error;
  }
};

/**
 * Delete an option choice
 */
export const deleteOptionChoice = async (id) => {
  try {
    const response = await fetch(
      `${API_URL}/api/product-option-choices/${id}/`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Error deleting option choice');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteOptionChoice:', error);
    throw error;
  }
};

export default {
  getProductOptions,
  getProductOption,
  createProductOption,
  updateProductOption,
  deleteProductOption,
  getOptionChoices,
  createOptionChoice,
  updateOptionChoice,
  deleteOptionChoice,
};
