import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Pizza Margherita',
  price: '12.50',
  translations: [
    { language: 'es', name: 'Pizza Margherita' }
  ],
  ingredients: [
    { id: 1, name: 'Tomate', translations: [{ language: 'es', name: 'Tomate' }] },
    { id: 2, name: 'Queso', translations: [{ language: 'es', name: 'Queso' }] },
    { id: 3, name: 'Albahaca', translations: [{ language: 'es', name: 'Albahaca' }] }
  ]
};

// Test component
const TestComponent = () => {
  const {
    items,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getTotalPrice,
    getItemCount
  } = useCart();

  return (
    <div>
      <div data-testid="item-count">{getItemCount()}</div>
      <div data-testid="total-price">{getTotalPrice().toFixed(2)}</div>
      <div data-testid="items-list">
        {items.map((item) => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            <span data-testid={`quantity-${item.id}`}>{item.quantity}</span>
            <button
              onClick={() => incrementQuantity(item.id)}
              data-testid={`increment-${item.id}`}
            >
              +
            </button>
            <button
              onClick={() => decrementQuantity(item.id)}
              data-testid={`decrement-${item.id}`}
            >
              -
            </button>
            <button
              onClick={() => removeFromCart(item.id)}
              data-testid={`remove-${item.id}`}
            >
              Remove
            </button>
            {item.customization && (
              <div data-testid={`customization-${item.id}`}>
                {item.customization.additionalNotes}
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => addToCart(mockProduct, 1)}>Add Product</button>
      <button onClick={() => addToCart(mockProduct, 2, {
        selectedIngredients: [1, 2],
        additionalNotes: 'Extra cheese'
      })}>
        Add Product with Customization
      </button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-price')).toHaveTextContent('0.00');
  });

  it('should add product to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-price')).toHaveTextContent('12.50');
  });

  it('should add product with customization', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product with Customization');
    fireEvent.click(addButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');

    // Find the customization div
    const customizationDivs = screen.queryAllByText('Extra cheese');
    expect(customizationDivs.length).toBeGreaterThan(0);
  });

  it('should add same product twice without customization and merge quantities', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('2');
    // Should have only one item in cart
    const items = screen.getByTestId('items-list').children;
    expect(items.length).toBe(1);
  });

  it('should add same product twice with customization as separate items', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product with Customization');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('4');
    // Should have two separate items in cart
    const items = screen.getByTestId('items-list').children;
    expect(items.length).toBe(2);
  });

  it('should increment quantity', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Get the item id from the DOM
    const itemsList = screen.getByTestId('items-list');
    const firstItem = itemsList.children[0];
    const itemId = firstItem.getAttribute('data-testid').split('-')[1];

    const incrementButton = screen.getByTestId(`increment-${itemId}`);
    fireEvent.click(incrementButton);

    expect(screen.getByTestId(`quantity-${itemId}`)).toHaveTextContent('2');
    expect(screen.getByTestId('total-price')).toHaveTextContent('25.00');
  });

  it('should decrement quantity', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    const itemsList = screen.getByTestId('items-list');
    const firstItem = itemsList.children[0];
    const itemId = firstItem.getAttribute('data-testid').split('-')[1];

    const incrementButton = screen.getByTestId(`increment-${itemId}`);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);

    const decrementButton = screen.getByTestId(`decrement-${itemId}`);
    fireEvent.click(decrementButton);

    expect(screen.getByTestId(`quantity-${itemId}`)).toHaveTextContent('2');
  });

  it('should remove item when quantity reaches 0', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    const itemsList = screen.getByTestId('items-list');
    const firstItem = itemsList.children[0];
    const itemId = firstItem.getAttribute('data-testid').split('-')[1];

    const decrementButton = screen.getByTestId(`decrement-${itemId}`);
    fireEvent.click(decrementButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should remove item from cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    const itemsList = screen.getByTestId('items-list');
    const firstItem = itemsList.children[0];
    const itemId = firstItem.getAttribute('data-testid').split('-')[1];

    const removeButton = screen.getByTestId(`remove-${itemId}`);
    fireEvent.click(removeButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
  });

  it('should clear cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const clearButton = screen.getByText('Clear Cart');
    fireEvent.click(clearButton);

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-price')).toHaveTextContent('0.00');
  });

  it('should persist cart in localStorage', () => {
    const { unmount } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);

    // Unmount and remount
    unmount();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-price')).toHaveTextContent('12.50');
  });

  it('should calculate total price correctly with multiple items', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByTestId('total-price')).toHaveTextContent('25.00');
  });
});
