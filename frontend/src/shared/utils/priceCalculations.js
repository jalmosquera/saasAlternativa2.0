/**
 * Price calculation utilities for product customization.
 *
 * This module provides functions to calculate prices for products with
 * ingredient customization, including support for ingredient swapping.
 */

/**
 * Calculate the total price of extra ingredients considering ingredient swaps.
 *
 * When a product allows ingredient swapping (allow_ingredient_swap = true),
 * customers can deselect original ingredients and add extras without additional
 * charge on a 1-for-1 basis. The most expensive extras are prioritized as free.
 *
 * @param {Array} selectedExtras - Array of extra ingredient objects with prices
 * @param {number} deselectedCount - Number of original ingredients deselected
 * @param {boolean} allowSwap - Whether this product allows ingredient swapping
 *
 * @returns {Object} Calculation result with:
 *   - totalPrice: Total price to charge for extras (number)
 *   - freeExtrasCount: Number of extras that are free due to swaps (number)
 *   - paidExtrasCount: Number of extras that are charged (number)
 *   - freeExtras: Array of extra objects that are free (Array)
 *   - paidExtras: Array of extra objects that are charged (Array)
 *
 * @example
 * // Product with 4 original ingredients
 * // User deselects 2 ingredients, adds 3 extras
 * const extras = [
 *   { id: 1, price: '1.50', name: 'Bacon' },
 *   { id: 2, price: '1.00', name: 'Jamón' },
 *   { id: 3, price: '0.50', name: 'Champiñones' }
 * ];
 *
 * const result = calculateExtrasPrice(extras, 2, true);
 * // Returns:
 * // {
 * //   totalPrice: 0.50,           // Only champiñones charged
 * //   freeExtrasCount: 2,         // Bacon and Jamón are free
 * //   paidExtrasCount: 1,         // Champiñones is paid
 * //   freeExtras: [bacon, jamón], // Sorted by price desc
 * //   paidExtras: [champiñones]
 * // }
 *
 * @example
 * // Without swap capability
 * const result = calculateExtrasPrice(extras, 2, false);
 * // Returns:
 * // {
 * //   totalPrice: 3.00,    // All extras charged
 * //   freeExtrasCount: 0,
 * //   paidExtrasCount: 3,
 * //   freeExtras: [],
 * //   paidExtras: [all three extras]
 * // }
 */
export const calculateExtrasPrice = (selectedExtras, deselectedCount, allowSwap) => {
  // Validate inputs
  if (!Array.isArray(selectedExtras)) {
    return {
      totalPrice: 0,
      freeExtrasCount: 0,
      paidExtrasCount: 0,
      freeExtras: [],
      paidExtras: []
    };
  }

  // If no extras selected, return zero
  if (selectedExtras.length === 0) {
    return {
      totalPrice: 0,
      freeExtrasCount: 0,
      paidExtrasCount: 0,
      freeExtras: [],
      paidExtras: []
    };
  }

  // If swapping is not allowed, charge all extras
  if (!allowSwap || deselectedCount <= 0) {
    const totalPrice = selectedExtras.reduce((sum, extra) => {
      return sum + (parseFloat(extra.price) || 0);
    }, 0);

    return {
      totalPrice,
      freeExtrasCount: 0,
      paidExtrasCount: selectedExtras.length,
      freeExtras: [],
      paidExtras: [...selectedExtras]
    };
  }

  // Swapping is allowed - sort extras by price (most expensive first)
  const sortedExtras = [...selectedExtras].sort((a, b) => {
    const priceA = parseFloat(a.price) || 0;
    const priceB = parseFloat(b.price) || 0;
    return priceB - priceA; // Descending order
  });

  // Calculate how many extras are free (min of deselected count and total extras)
  const freeCount = Math.min(deselectedCount, sortedExtras.length);

  // Split into free and paid extras
  const freeExtras = sortedExtras.slice(0, freeCount);
  const paidExtras = sortedExtras.slice(freeCount);

  // Calculate total price (only for paid extras)
  const totalPrice = paidExtras.reduce((sum, extra) => {
    return sum + (parseFloat(extra.price) || 0);
  }, 0);

  return {
    totalPrice,
    freeExtrasCount: freeCount,
    paidExtrasCount: paidExtras.length,
    freeExtras,
    paidExtras
  };
};

/**
 * Format a price number to a localized string with Euro symbol.
 *
 * @param {number} price - The price to format
 * @returns {string} Formatted price string (e.g., "€12.99")
 *
 * @example
 * formatPrice(12.5) // Returns "€12.50"
 * formatPrice(0) // Returns "€0.00"
 */
export const formatPrice = (price) => {
  const numPrice = parseFloat(price) || 0;
  return `€${numPrice.toFixed(2)}`;
};

/**
 * Parse a price string that may contain currency symbols to a number.
 *
 * @param {string|number} priceString - Price string (e.g., "12.99 €" or "€12.99")
 * @returns {number} Parsed price as number
 *
 * @example
 * parsePrice("12.99 €") // Returns 12.99
 * parsePrice("€12.99") // Returns 12.99
 * parsePrice(12.99) // Returns 12.99
 */
export const parsePrice = (priceString) => {
  if (typeof priceString === 'number') {
    return priceString;
  }

  if (typeof priceString === 'string') {
    // Remove all non-numeric characters except decimal point
    const cleaned = priceString.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  return 0;
};
