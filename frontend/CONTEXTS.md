# Context API Documentation

Complete documentation of all React Context providers in the Digital Letter project.

## Table of Contents

- [Overview](#overview)
- [Available Contexts](#available-contexts)
  - [CartContext](#cartcontext)
  - [LanguageContext](#languagecontext)
  - [ThemeContext](#themecontext)
  - [AuthContext](#authcontext)
- [Usage Patterns](#usage-patterns)
- [Testing Contexts](#testing-contexts)

---

## Overview

The Digital Letter project uses React Context API for global state management. Each context is responsible for a specific domain:

- **CartContext** - Shopping cart state and operations
- **LanguageContext** - Multi-language support (ES/EN)
- **ThemeContext** - Dark/Light theme management
- **AuthContext** - User authentication and authorization

All contexts use localStorage for persistence where applicable.

---

## Available Contexts

### CartContext

Manages shopping cart state with localStorage persistence and ingredient customization support.

**Location:** `src/shared/contexts/CartContext.jsx`

#### Provider Setup

```jsx
import { CartProvider } from '@shared/contexts/CartContext';

function App() {
  return (
    <CartProvider>
      {/* Your app components */}
    </CartProvider>
  );
}
```

#### Hook Usage

```jsx
import { useCart } from '@shared/contexts/CartContext';

function MyComponent() {
  const {
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
    itemCount,
    totalPrice
  } = useCart();
}
```

#### API Reference

##### State

- `items: Array<CartItem>` - Array of cart items

**CartItem Structure:**
```typescript
{
  id: number,                    // Unique cart item ID
  product: Product,              // Product object with full details
  quantity: number,              // Item quantity
  customization: {               // Optional customization
    selectedIngredients: number[],  // Array of ingredient IDs
    additionalNotes: string         // Additional ingredient requests
  } | null
}
```

##### Methods

**addToCart(product, quantity, customization)**

Add item to cart with optional customization.

```jsx
// Without customization (merges with existing)
addToCart(product, 2);

// With customization (always creates new item)
addToCart(product, 1, {
  selectedIngredients: [1, 2, 3],
  additionalNotes: 'Extra cheese'
});
```

Parameters:
- `product: Product` - Product object (required)
- `quantity: number` - Quantity to add (default: 1)
- `customization: Object | null` - Optional customization

Behavior:
- If no customization: merges with existing non-customized item
- If customization exists: always creates new separate item
- Each customized item is unique in cart

**removeFromCart(itemId)**

Remove item completely from cart.

```jsx
removeFromCart(cartItem.id);
```

Parameters:
- `itemId: number` - Unique cart item ID (not product ID!)

**updateQuantity(itemId, quantity)**

Update quantity of specific cart item.

```jsx
updateQuantity(cartItem.id, 5);
```

Parameters:
- `itemId: number` - Cart item ID
- `quantity: number` - New quantity (min: 1, 0 removes item)

**incrementQuantity(itemId)**

Increment quantity by 1.

```jsx
incrementQuantity(cartItem.id);
```

**decrementQuantity(itemId)**

Decrement quantity by 1 (removes if quantity becomes 0).

```jsx
decrementQuantity(cartItem.id);
```

**clearCart()**

Remove all items from cart.

```jsx
clearCart();
```

**getItemCount()**

Get total number of items in cart (sum of quantities).

```jsx
const count = getItemCount(); // e.g., 5 items
```

**getTotalPrice()**

Calculate total price of all items in cart.

```jsx
const total = getTotalPrice(); // e.g., 45.50
```

**isInCart(productId)**

Check if product exists in cart (any variant).

```jsx
const inCart = isInCart(product.id); // true/false
```

**getItemQuantity(productId)**

Get total quantity of product in cart (all variants).

```jsx
const qty = getItemQuantity(product.id); // e.g., 3
```

##### Computed Properties

- `itemCount: number` - Current total item count (auto-updates)
- `totalPrice: number` - Current total price (auto-updates)

#### Complete Examples

**Example 1: Add Product without Customization**

```jsx
import { useCart } from '@shared/contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    // If product already in cart without customization,
    // quantity will be incremented
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>
        {isInCart(product.id) ? 'Add More' : 'Add to Cart'}
      </button>
    </div>
  );
}
```

**Example 2: Add Product with Customization**

```jsx
import { useState } from 'react';
import { useCart } from '@shared/contexts/CartContext';

function ProductDetail({ product }) {
  const [selectedIngredients, setSelectedIngredients] = useState(
    product.ingredients.map(i => i.id)
  );
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const customization = {
      selectedIngredients,
      additionalNotes: additionalNotes.trim()
    };

    addToCart(product, quantity, customization);
    // This will ALWAYS create a new cart item
    // because customization is provided
  };

  return (
    <div>
      {/* Ingredient checkboxes */}
      {product.ingredients.map(ingredient => (
        <label key={ingredient.id}>
          <input
            type="checkbox"
            checked={selectedIngredients.includes(ingredient.id)}
            onChange={() => {
              setSelectedIngredients(prev =>
                prev.includes(ingredient.id)
                  ? prev.filter(id => id !== ingredient.id)
                  : [...prev, ingredient.id]
              );
            }}
          />
          {ingredient.name}
        </label>
      ))}

      {/* Additional notes */}
      <input
        value={additionalNotes}
        onChange={e => setAdditionalNotes(e.target.value)}
        placeholder="Extra ingredients..."
      />

      {/* Quantity */}
      <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
      <span>{quantity}</span>
      <button onClick={() => setQuantity(q => q + 1)}>+</button>

      {/* Add to cart */}
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}
```

**Example 3: Display Cart with Customizations**

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
      <h1>Shopping Cart</h1>

      {items.map(({ id, product, quantity, customization }) => {
        const name = getTranslation(product.translations, 'name');
        const price = parseFloat(product.price) || 0;
        const subtotal = price * quantity;

        return (
          <div key={id} className="cart-item">
            <h3>{name}</h3>
            <p>Price: €{price.toFixed(2)}</p>
            <p>Quantity: {quantity}</p>
            <p>Subtotal: €{subtotal.toFixed(2)}</p>

            {/* Display customization if exists */}
            {customization && (
              <div className="customization">
                <h4>Customization:</h4>

                {/* Selected ingredients */}
                {customization.selectedIngredients && (
                  <div>
                    <strong>Ingredients:</strong>
                    {product.ingredients
                      .filter(ing => customization.selectedIngredients.includes(ing.id))
                      .map(ing => getTranslation(ing.translations, 'name'))
                      .join(', ')}
                  </div>
                )}

                {/* Additional notes */}
                {customization.additionalNotes && (
                  <div>
                    <strong>Additional:</strong> {customization.additionalNotes}
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <button onClick={() => decrementQuantity(id)}>-</button>
            <button onClick={() => incrementQuantity(id)}>+</button>
            <button onClick={() => removeFromCart(id)}>Remove</button>
          </div>
        );
      })}

      {/* Total */}
      <div className="cart-total">
        <h2>Total: €{getTotalPrice().toFixed(2)}</h2>
        <button onClick={() => navigate('/checkout')}>
          Checkout
        </button>
      </div>
    </div>
  );
}
```

#### Storage

- Cart automatically persists to `localStorage` under key `'cart'`
- Loads on app initialization
- Updates on every cart modification
- Survives page refreshes

---

### LanguageContext

Manages application language with support for Spanish (es) and English (en).

**Location:** `src/shared/contexts/LanguageContext.jsx`

#### Provider Setup

```jsx
import { LanguageProvider } from '@shared/contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      {/* Your app components */}
    </LanguageProvider>
  );
}
```

#### Hook Usage

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

function MyComponent() {
  const { language, switchLanguage, t, getTranslation } = useLanguage();
}
```

#### API Reference

##### State

- `language: string` - Current language code ('es' | 'en')

##### Methods

**switchLanguage(lang)**

Change application language.

```jsx
switchLanguage('es'); // Switch to Spanish
switchLanguage('en'); // Switch to English
```

**t(key)**

Translate static UI text using translation keys.

```jsx
const title = t('menu.title');
// Returns: "Menú" (es) or "Menu" (en)

const addToCart = t('product.addToCart');
// Returns: "Agregar al carrito" (es) or "Add to Cart" (en)
```

**getTranslation(translations, field)**

Extract translated field from API response translations array.

```jsx
const productName = getTranslation(product.translations, 'name');
// Extracts name for current language from translations array

const description = getTranslation(product.translations, 'description');
```

#### Translation Keys

The context includes a comprehensive translation dictionary. Common keys:

```javascript
// Menu
menu.title
menu.categories
menu.allProducts

// Product
product.addToCart
product.viewDetails
product.price
product.new
product.popular
product.soldOut

// Cart
cart.title
cart.empty
cart.total
cart.checkout

// Checkout
checkout.title
checkout.deliveryInfo
checkout.deliveryStreet
checkout.deliveryHouseNumber
checkout.deliveryLocation
checkout.ardales
checkout.carratraca
checkout.notes
checkout.sendOrder

// Product Detail
productDetail.ingredients
productDetail.selectIngredients
productDetail.additionalIngredients
productDetail.back

// Auth
auth.login
auth.register
auth.logout
auth.email
auth.password
auth.phoneNumber
```

#### Complete Examples

**Example 1: Language Switcher**

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="language-switcher">
      <button
        onClick={() => switchLanguage('es')}
        className={language === 'es' ? 'active' : ''}
      >
        ES
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={language === 'en' ? 'active' : ''}
      >
        EN
      </button>
    </div>
  );
}
```

**Example 2: Translating UI Text**

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

function ProductCard({ product }) {
  const { t } = useLanguage();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button>{t('product.addToCart')}</button>
      <button>{t('product.viewDetails')}</button>
    </div>
  );
}
```

**Example 3: Translating API Data**

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

function ProductList({ products }) {
  const { getTranslation } = useLanguage();

  return (
    <div>
      {products.map(product => {
        // API returns translations array like:
        // translations: [
        //   { language: 'es', name: 'Pizza', description: 'Deliciosa' },
        //   { language: 'en', name: 'Pizza', description: 'Delicious' }
        // ]

        const name = getTranslation(product.translations, 'name');
        const description = getTranslation(product.translations, 'description');

        return (
          <div key={product.id}>
            <h3>{name}</h3>
            <p>{description}</p>
          </div>
        );
      })}
    </div>
  );
}
```

**Example 4: Complete Multi-language Component**

```jsx
import { useLanguage } from '@shared/contexts/LanguageContext';

function CheckoutPage() {
  const { t, language, getTranslation } = useLanguage();
  const [deliveryLocation, setDeliveryLocation] = useState('');

  return (
    <div>
      <h1>{t('checkout.title')}</h1>

      <form>
        <label>{t('checkout.deliveryStreet')}</label>
        <input type="text" placeholder={t('checkout.streetPlaceholder')} />

        <label>{t('checkout.deliveryLocation')}</label>
        <select
          value={deliveryLocation}
          onChange={e => setDeliveryLocation(e.target.value)}
        >
          <option value="">{t('checkout.selectLocation')}</option>
          <option value="ardales">{t('checkout.ardales')}</option>
          <option value="carratraca">{t('checkout.carratraca')}</option>
        </select>

        <button type="submit">
          {t('checkout.sendOrder')}
        </button>
      </form>
    </div>
  );
}
```

#### Storage

- Language preference persists to `localStorage` under key `'language'`
- Defaults to `'es'` (Spanish)
- Loads on app initialization

---

### ThemeContext

Manages dark/light theme with system preference detection.

**Location:** `src/shared/contexts/ThemeContext.jsx`

#### Provider Setup

```jsx
import { ThemeProvider } from '@shared/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

#### Hook Usage

```jsx
import { useTheme } from '@shared/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
}
```

#### API Reference

##### State

- `theme: string` - Current theme ('light' | 'dark')
- `isDark: boolean` - True if dark theme active

##### Methods

**toggleTheme()**

Toggle between light and dark themes.

```jsx
toggleTheme();
```

#### Complete Examples

**Example 1: Theme Toggle Button**

```jsx
import { useTheme } from '@shared/contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
```

**Example 2: Conditional Styling**

```jsx
import { useTheme } from '@shared/contexts/ThemeContext';

function MyComponent() {
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'dark-specific-class' : 'light-specific-class'}>
      {/* Component content */}
    </div>
  );
}
```

**Note:** Most components should use Tailwind's `dark:` prefix instead:

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* Automatically responds to theme */}
</div>
```

#### Implementation Details

- Applies `dark` class to `<html>` element
- Tailwind's `darkMode: 'class'` responds to this
- Detects system preference on first load
- Persists to `localStorage` under key `'theme'`

#### Storage

- Theme preference persists to `localStorage`
- Detects system preference: `window.matchMedia('(prefers-color-scheme: dark)')`
- Updates `<html>` class automatically

---

### AuthContext

Manages user authentication and authorization with JWT tokens.

**Location:** `src/shared/contexts/AuthContext.jsx`

#### Provider Setup

```jsx
import { AuthProvider } from '@shared/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

#### Hook Usage

```jsx
import { useAuth } from '@shared/contexts/AuthContext';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  } = useAuth();
}
```

#### API Reference

##### State

- `user: Object | null` - Current user object
- `isAuthenticated: boolean` - True if user logged in
- `isLoading: boolean` - True during auth operations

**User Object Structure:**
```typescript
{
  id: number,
  email: string,
  name: string,
  phone: string,
  role: string, // 'customer' | 'admin'
}
```

##### Methods

**login(email, password)**

Authenticate user and store tokens.

```jsx
const login = async (email, password) => {
  try {
    await login(email, password);
    navigate('/');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

Returns: `Promise<User>`

**register(userData)**

Create new user account.

```jsx
const handleRegister = async (formData) => {
  try {
    await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone
    });
    navigate('/');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

Returns: `Promise<User>`

**logout()**

Log out user and clear tokens.

```jsx
const handleLogout = () => {
  logout();
  navigate('/login');
};
```

#### Complete Examples

**Example 1: Login Form**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**Example 2: Protected Route**

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Usage in routes:
<Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  }
/>
```

**Example 3: User Menu**

```jsx
import { useAuth } from '@shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <button onClick={() => navigate('/login')}>
        Login
      </button>
    );
  }

  return (
    <div className="user-menu">
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Storage

- Access token stored in `localStorage` under `'access_token'`
- Refresh token stored in `localStorage` under `'refresh_token'`
- Tokens cleared on logout

---

## Usage Patterns

### Combining Multiple Contexts

```jsx
import { useCart } from '@shared/contexts/CartContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { useAuth } from '@shared/contexts/AuthContext';

function CheckoutPage() {
  const { items, getTotalPrice } = useCart();
  const { t, getTranslation, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>{t('checkout.title')}</h1>
      <p>User: {user.name}</p>
      <p>Items: {items.length}</p>
      <p>Total: €{getTotalPrice().toFixed(2)}</p>
    </div>
  );
}
```

### Provider Nesting Order

```jsx
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <CartProvider>
            <BrowserRouter>
              {/* App routes */}
            </BrowserRouter>
          </CartProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
```

**Recommended order:**
1. AuthProvider (outermost - needed by all)
2. LanguageProvider (needed for translations)
3. ThemeProvider (UI preference)
4. CartProvider (business logic)

---

## Testing Contexts

### Testing CartContext

```jsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '@shared/contexts/CartContext';

describe('CartContext', () => {
  const wrapper = ({ children }) => (
    <CartProvider>{children}</CartProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const product = {
      id: 1,
      name: 'Pizza',
      price: '10.00',
      translations: []
    };

    act(() => {
      result.current.addToCart(product, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.getItemCount()).toBe(2);
  });

  it('handles customization', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const product = { id: 1, name: 'Pizza', price: '10.00' };
    const customization = {
      selectedIngredients: [1, 2],
      additionalNotes: 'Extra cheese'
    };

    act(() => {
      result.current.addToCart(product, 1, customization);
    });

    expect(result.current.items[0].customization).toEqual(customization);
  });
});
```

### Testing LanguageContext

```jsx
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@shared/contexts/LanguageContext';

describe('LanguageContext', () => {
  const wrapper = ({ children }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  it('switches language', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('es');

    act(() => {
      result.current.switchLanguage('en');
    });

    expect(result.current.language).toBe('en');
  });

  it('translates UI text', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    const title = result.current.t('menu.title');
    expect(title).toBe('Menú');
  });
});
```

---

For component documentation, see [COMPONENTS.md](./COMPONENTS.md).
