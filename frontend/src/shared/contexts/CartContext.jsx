import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    // Load cart from localStorage on init
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  /**
   * Add item to cart with optional customization
   * @param {Object} product - Product object with id, name, price, image, translations
   * @param {number} quantity - Quantity to add (default 1)
   * @param {Object} customization - Optional customization {selectedIngredients, additionalNotes}
   */
  const addToCart = (product, quantity = 1, customization = null) => {
    setItems((prevItems) => {
      // Generate unique ID for the cart item
      const cartItemId = Date.now() + Math.random();

      // If customization exists, always add as new item (don't merge)
      if (customization) {
        return [...prevItems, { id: cartItemId, product, quantity, customization }];
      }

      // Otherwise, check if product exists and merge quantities
      const existingItem = prevItems.find(item =>
        item.product.id === product.id && !item.customization
      );

      if (existingItem) {
        // Update quantity if product already in cart without customization
        return prevItems.map(item =>
          item.product.id === product.id && !item.customization
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new product to cart
        return [...prevItems, { id: cartItemId, product, quantity, customization: null }];
      }
    });
  };

  /**
   * Remove item from cart completely
   * @param {number} itemId - Unique ID of cart item to remove
   */
  const removeFromCart = (itemId) => {
    setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
  };

  /**
   * Update quantity of item in cart
   * @param {number} itemId - Unique ID of cart item to update
   * @param {number} quantity - New quantity (must be >= 1)
   */
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  /**
   * Increment quantity of item in cart
   * @param {number} itemId - Unique ID of cart item to increment
   */
  const incrementQuantity = (itemId) => {
    setItems((prevItems) =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  /**
   * Decrement quantity of item in cart (removes if quantity becomes 0)
   * @param {number} itemId - Unique ID of cart item to decrement
   */
  const decrementQuantity = (itemId) => {
    setItems((prevItems) => {
      const item = prevItems.find(i => i.id === itemId);
      if (!item) return prevItems;

      if (item.quantity <= 1) {
        return prevItems.filter(i => i.id !== itemId);
      }

      return prevItems.map(i =>
        i.id === itemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Get total number of items in cart
   * @returns {number} Total item count
   */
  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Get total price of all items in cart
   * @returns {number} Total price
   */
  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const basePrice = parseFloat(item.product.price) || 0;

      // Calculate extras price if customization exists
      let extrasPrice = 0;
      if (item.customization?.selectedExtras) {
        extrasPrice = item.customization.selectedExtras.reduce((sum, extra) => {
          return sum + (parseFloat(extra.price) || 0);
        }, 0);
      }

      return total + ((basePrice + extrasPrice) * item.quantity);
    }, 0);
  };

  /**
   * Check if product is in cart
   * @param {number} productId - ID of product to check
   * @returns {boolean} True if product is in cart
   */
  const isInCart = (productId) => {
    return items.some(item => item.product.id === productId);
  };

  /**
   * Get quantity of specific product in cart
   * @param {number} productId - ID of product
   * @returns {number} Quantity in cart (0 if not in cart)
   */
  const getItemQuantity = (productId) => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
    isInCart,
    getItemQuantity,
    itemCount: getItemCount(),
    totalPrice: getTotalPrice(),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
