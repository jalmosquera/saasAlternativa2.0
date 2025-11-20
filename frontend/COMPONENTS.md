# Component Documentation

Complete documentation of all reusable components in the Digital Letter project.

## Table of Contents

- [Menu Components](#menu-components)
  - [ProductCard](#productcard)
  - [ProductGrid](#productgrid)
  - [CategoryFilter](#categoryfilter)
- [Layout Components](#layout-components)
  - [MenuLayout](#menulayout)
  - [Navbar](#navbar)
  - [Footer](#footer)
- [Pages](#pages)
  - [HomePage](#homepage)
  - [ProductDetailPage](#productdetailpage)
  - [CartPage](#cartpage)
  - [CheckoutPage](#checkoutpage)
- [Usage Patterns](#usage-patterns)

---

## Menu Components

### ProductCard

Display product information in a card format with image, name, price, and action buttons.

**Location:** `src/features/menu/components/ProductCard.jsx`

#### Props

```typescript
interface ProductCardProps {
  product: {
    id: number;
    translations: Array<{language: string, name: string, description: string}>;
    price: string;
    image: string;
    is_popular?: boolean;
    is_new?: boolean;
    available?: boolean;
    categories?: Array<{id: number, name: string}>;
  };
  onViewDetails?: (id: number) => void;
}
```

#### Features

- Responsive image with aspect ratio preservation
- Badge indicators for popular/new products
- Availability status (sold out)
- Localized product names and descriptions
- Add to cart functionality
- View details navigation
- Dark mode support

#### Examples

**Basic Usage:**
```jsx
import ProductCard from '@features/menu/components/ProductCard';

function MenuPage() {
  return (
    <ProductCard
      product={product}
      onViewDetails={(id) => navigate(`/product/${id}`)}
    />
  );
}
```

**With Cart Integration:**
```jsx
import ProductCard from '@features/menu/components/ProductCard';
import { useCart } from '@shared/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

function MenuPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <ProductCard
      product={product}
      onViewDetails={(id) => navigate(`/product/${id}`)}
    />
  );
}
```

#### Styling

- Uses Tailwind classes with `pepper` theme
- Card shadow: `shadow-pepper` with hover effect `shadow-pepper-hover`
- Responsive grid compatibility
- Dark mode: `dark:bg-gray-800`, `dark:text-white`

---

### ProductGrid

Grid layout component for displaying multiple products with loading and empty states.

**Location:** `src/features/menu/components/ProductGrid.jsx`

#### Props

```typescript
interface ProductGridProps {
  products: Array<Product>;
  loading?: boolean;
  error?: string;
  onViewDetails?: (id: number) => void;
}
```

#### Features

- Responsive grid layout (1-3 columns)
- Loading skeleton states
- Empty state handling
- Error state display
- Automatic ProductCard rendering

#### Examples

**Basic Usage:**
```jsx
import ProductGrid from '@features/menu/components/ProductGrid';

function MenuPage() {
  const { data: products, loading, error } = useFetch('/api/products');

  return (
    <ProductGrid
      products={products}
      loading={loading}
      error={error}
      onViewDetails={(id) => navigate(`/product/${id}`)}
    />
  );
}
```

**With Filtering:**
```jsx
function MenuPage() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { data: products, loading } = useFetch('/api/products');

  return (
    <div>
      <CategoryFilter onFilter={setFilteredProducts} />
      <ProductGrid
        products={filteredProducts}
        loading={loading}
      />
    </div>
  );
}
```

#### Grid Breakpoints

- Mobile (default): 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns

---

### CategoryFilter

Filter products by category with chip-based UI.

**Location:** `src/features/menu/components/CategoryFilter.jsx`

#### Props

```typescript
interface CategoryFilterProps {
  categories: Array<{
    id: number;
    translations: Array<{language: string, name: string}>;
  }>;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}
```

#### Features

- Horizontal scrollable category list
- "All" option to clear filter
- Active category highlighting
- Localized category names
- Mobile-friendly touch scrolling

#### Examples

**Basic Usage:**
```jsx
import CategoryFilter from '@features/menu/components/CategoryFilter';

function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { data: categories } = useFetch('/api/categories');

  return (
    <CategoryFilter
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
    />
  );
}
```

**With Product Filtering:**
```jsx
function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { data: products } = useFetch('/api/products');

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categories.some(c => c.id === selectedCategory))
    : products;

  return (
    <div>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
```

---

## Layout Components

### MenuLayout

Main layout wrapper with navigation and footer.

**Location:** `src/shared/components/layout/MenuLayout.jsx`

#### Props

```typescript
interface MenuLayoutProps {
  children: React.ReactNode;
}
```

#### Features

- Consistent header with Navbar
- Footer with links
- Outlet for nested routes
- Responsive container
- Dark mode support

#### Examples

**Basic Usage:**
```jsx
import MenuLayout from '@shared/components/layout/MenuLayout';

function App() {
  return (
    <Routes>
      <Route element={<MenuLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
    </Routes>
  );
}
```

---

### Navbar

Navigation bar with logo, cart, language switcher, and theme toggle.

**Location:** `src/shared/components/menu/Navbar.jsx`

#### Features

- Logo/brand name
- Cart icon with item count badge
- Language switcher (ES/EN)
- Dark mode toggle
- Responsive mobile menu
- Sticky positioning

#### Examples

**Usage:**
```jsx
// Navbar is used within MenuLayout
// No direct usage needed in most cases

// To customize cart badge:
import { useCart } from '@shared/contexts/CartContext';

function Navbar() {
  const { getItemCount } = useCart();

  return (
    <div className="relative">
      <ShoppingCartIcon />
      {getItemCount() > 0 && (
        <span className="badge">{getItemCount()}</span>
      )}
    </div>
  );
}
```

---

### Footer

Footer with navigation links and social media.

**Location:** `src/shared/components/menu/Footer.jsx`

#### Features

- Navigation links
- Social media icons
- Copyright information
- Responsive layout
- Dark mode support

---

## Pages

### HomePage

Main landing page displaying products with filters.

**Location:** `src/features/menu/pages/HomePage.jsx`

#### Features

- Product grid with all products
- Category filtering
- Search functionality
- Loading states
- Error handling
- Responsive layout

#### Key Sections

1. **Hero/Header** - Welcome message
2. **Category Filter** - Filter by category
3. **Product Grid** - Display all products
4. **Empty State** - When no products found

#### Examples

**Basic Structure:**
```jsx
function HomePage() {
  const { data: products, loading } = useFetch('/api/products');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredProducts = selectedCategory
    ? products.filter(/* filter logic */)
    : products;

  return (
    <div className="container-pepper">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ProductGrid products={filteredProducts} loading={loading} />
    </div>
  );
}
```

---

### ProductDetailPage

Detailed product view with ingredient customization and add to cart.

**Location:** `src/features/menu/pages/ProductDetailPage.jsx`

#### Features

- Product image gallery
- Product information (name, description, price)
- Ingredient selection with checkboxes (base ingredients)
- Extra ingredients selection (143 ingredients available, alphabetically sorted, no pagination)
- Toggle button to show/hide extra ingredients section
- Additional ingredients text field for special requests
- Quantity selector
- Add to cart with full customization support
- Navigation back to menu
- Loading and error states

#### Key Sections

1. **Image** - Product image with badges
2. **Info** - Name, description, categories
3. **Ingredients** - Checkbox selection
4. **Additional Ingredients** - Text input
5. **Quantity** - Increment/decrement selector
6. **Actions** - Add to cart button

#### Examples

**Ingredient Customization:**
```jsx
import { useState, useEffect } from 'react';
import { useCart } from '@shared/contexts/CartContext';

function ProductDetailPage() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Initialize with all ingredients selected
  useEffect(() => {
    if (product?.ingredients) {
      setSelectedIngredients(product.ingredients.map(i => i.id));
    }
  }, [product]);

  const toggleIngredient = (id) => {
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    const customization = {
      selectedIngredients,
      additionalNotes: additionalNotes.trim()
    };
    addToCart(product, quantity, customization);
  };

  return (
    <div>
      {/* Ingredient checkboxes */}
      {product.ingredients.map(ingredient => (
        <label key={ingredient.id}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient.id)}
            onChange={() => toggleIngredient(ingredient.id)}
          />
          {ingredient.name}
        </label>
      ))}

      {/* Additional ingredients */}
      <input
        value={additionalNotes}
        onChange={(e) => setAdditionalNotes(e.target.value)}
        placeholder="Extra ingredients..."
      />

      {/* Add to cart */}
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}
```

---

### CartPage

Shopping cart with item management.

**Location:** `src/features/cart/pages/CartPage.jsx`

#### Features

- List all cart items
- Quantity controls (increment/decrement)
- Remove items
- Display customizations
- Total price calculation
- Empty cart state
- Checkout navigation

#### Key Sections

1. **Cart Items** - List of items with controls
2. **Customizations** - Display selected/additional ingredients
3. **Summary** - Subtotal, total
4. **Actions** - Clear cart, proceed to checkout

#### Examples

**Cart Item Display:**
```jsx
import { useCart } from '@shared/contexts/CartContext';
import { useLanguage } from '@shared/contexts/LanguageContext';

function CartPage() {
  const {
    items,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    getTotalPrice
  } = useCart();
  const { getTranslation } = useLanguage();

  return (
    <div>
      {items.map(({ id, product, quantity, customization }) => (
        <div key={id}>
          <h3>{getTranslation(product.translations, 'name')}</h3>
          <p>Quantity: {quantity}</p>
          <p>Price: €{(product.price * quantity).toFixed(2)}</p>

          {customization && (
            <div>
              <p>Customization:</p>
              {customization.selectedIngredients && (
                <p>Ingredients: {/* display selected ingredients */}</p>
              )}
              {customization.additionalNotes && (
                <p>Notes: {customization.additionalNotes}</p>
              )}
            </div>
          )}

          <button onClick={() => incrementQuantity(id)}>+</button>
          <button onClick={() => decrementQuantity(id)}>-</button>
          <button onClick={() => removeFromCart(id)}>Remove</button>
        </div>
      ))}

      <div>
        <p>Total: €{getTotalPrice().toFixed(2)}</p>
        <button onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
```

---

### CheckoutPage

Checkout form with delivery information and WhatsApp order submission.

**Location:** `src/features/cart/pages/CheckoutPage.jsx`

#### Features

- Delivery address form (street, house number)
- Location selector (Ardales, Carratraca)
- Phone number field
- Notes field
- Form validation
- Order summary
- WhatsApp integration
- Authentication check
- Cart validation

#### Key Sections

1. **Form** - Delivery information inputs
2. **Summary** - Order items and total
3. **Submit** - Send via WhatsApp

#### Examples

**Checkout Flow:**
```jsx
import { useState } from 'react';
import { useCart } from '@shared/contexts/CartContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useAuth } from '@shared/contexts/AuthContext';
import { sendOrderViaWhatsApp } from '@shared/services/whatsappService';

function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { language, getTranslation } = useLanguage();
  const { user } = useAuth();

  const [deliveryInfo, setDeliveryInfo] = useState({
    delivery_street: '',
    delivery_house_number: '',
    delivery_location: '',
    phone: user?.phone || '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const orderData = {
      items,
      deliveryInfo,
      user,
      totalPrice: getTotalPrice()
    };

    sendOrderViaWhatsApp(orderData, language, getTranslation);

    // Clear cart after sending
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="delivery_street"
        value={deliveryInfo.delivery_street}
        onChange={(e) => setDeliveryInfo({
          ...deliveryInfo,
          delivery_street: e.target.value
        })}
        placeholder="Street"
        required
      />

      <input
        name="delivery_house_number"
        value={deliveryInfo.delivery_house_number}
        onChange={(e) => setDeliveryInfo({
          ...deliveryInfo,
          delivery_house_number: e.target.value
        })}
        placeholder="House Number"
        required
      />

      <select
        name="delivery_location"
        value={deliveryInfo.delivery_location}
        onChange={(e) => setDeliveryInfo({
          ...deliveryInfo,
          delivery_location: e.target.value
        })}
        required
      >
        <option value="">Select Location</option>
        <option value="ardales">Ardales</option>
        <option value="carratraca">Carratraca</option>
      </select>

      <input
        name="phone"
        type="tel"
        value={deliveryInfo.phone}
        onChange={(e) => setDeliveryInfo({
          ...deliveryInfo,
          phone: e.target.value
        })}
        placeholder="Phone"
        required
      />

      <textarea
        name="notes"
        value={deliveryInfo.notes}
        onChange={(e) => setDeliveryInfo({
          ...deliveryInfo,
          notes: e.target.value
        })}
        placeholder="Additional notes..."
      />

      <button type="submit">
        Send Order via WhatsApp
      </button>
    </form>
  );
}
```

---

## Usage Patterns

### Common Patterns

#### 1. Using Language Context for Translations

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

function MyComponent() {
  const { t, getTranslation } = useLanguage();

  // For static UI text
  const title = t('menu.title');

  // For API data translations
  const productName = getTranslation(product.translations, 'name');
}
```

#### 2. Cart Operations

```jsx
import { useCart } from '@shared/contexts/CartContext';

function MyComponent() {
  const { addToCart, removeFromCart, incrementQuantity } = useCart();

  // Add without customization
  addToCart(product, 1);

  // Add with customization
  addToCart(product, 1, {
    selectedIngredients: [1, 2, 3],
    additionalNotes: 'Extra cheese'
  });

  // Remove by cart item ID
  removeFromCart(cartItemId);

  // Increment quantity
  incrementQuantity(cartItemId);
}
```

#### 3. Data Fetching with useFetch

```jsx
import useFetch from '@shared/hooks/useFetch';

function MyComponent() {
  const { data, loading, error } = useFetch('/api/products');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ProductGrid products={data} />;
}
```

#### 4. Navigation

```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  // Navigate to route
  navigate('/cart');

  // Navigate with state
  navigate('/product/123', { state: { from: 'menu' } });

  // Go back
  navigate(-1);
}
```

#### 5. Theme Switching

```jsx
import { useTheme } from '@shared/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

---

## PropTypes Best Practices

Always define PropTypes for your components:

```jsx
import PropTypes from 'prop-types';

const ProductCard = ({ product, onViewDetails }) => {
  // Component logic
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    translations: PropTypes.arrayOf(PropTypes.shape({
      language: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
    })).isRequired,
    price: PropTypes.string.isRequired,
    image: PropTypes.string,
    is_popular: PropTypes.bool,
    is_new: PropTypes.bool,
    available: PropTypes.bool,
  }).isRequired,
  onViewDetails: PropTypes.func,
};

export default ProductCard;
```

---

## Testing Components

Example test for ProductCard:

```jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    translations: [
      { language: 'es', name: 'Pizza', description: 'Delicious' }
    ],
    price: '10.00 €',
    image: '/pizza.jpg',
    is_popular: true,
    available: true
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('displays popular badge', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });
});
```

---

For more information on contexts, see [CONTEXTS.md](./CONTEXTS.md).
