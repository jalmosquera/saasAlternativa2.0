import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { LanguageProvider } from '@shared/contexts/LanguageContext';
import { CartProvider } from '@shared/contexts/CartContext';

const mockProduct = {
  id: 1,
  translations: {
    es: {
      name: 'Pizza Margherita',
      description: 'Deliciosa pizza',
    },
    en: {
      name: 'Margherita Pizza',
      description: 'Delicious pizza',
    },
  },
  price: '12.99',
  image: 'https://example.com/pizza.jpg',
  is_available: true,
  categories: [],
  ingredients: [],
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  it('should render product name', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
  });

  it('should render product price', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText(/12.99/)).toBeInTheDocument();
  });
});
