# Products API - Frontend Usage Guide

## Overview

The Products API supports two input formats:
- **JSON format**: For requests without files (no image)
- **form-data format**: For requests with files (with image)

## Endpoint

```
POST /api/products/
PUT /api/products/{id}/
PATCH /api/products/{id}/
```

---

## Option 1: JSON Format (Without Image)

Use this format when you DON'T need to upload an image.

### Content-Type
```
Content-Type: application/json
```

### Request Body Structure

```json
{
  "translations": {
    "en": {
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza with tomato and mozzarella"
    },
    "es": {
      "name": "Pizza Margarita",
      "description": "Pizza italiana clásica con tomate y mozzarella"
    }
  },
  "price": "12.99",
  "stock": 50,
  "available": true,
  "be_extra": false,
  "categories": [1, 2],
  "ingredients": [3, 4, 5]
}
```

### JavaScript/TypeScript Example (Fetch)

```javascript
const createProduct = async (productData) => {
  const response = await fetch('http://localhost:8000/api/products/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`, // If authentication required
    },
    body: JSON.stringify({
      translations: {
        en: {
          name: 'Margherita Pizza',
          description: 'Classic Italian pizza'
        },
        es: {
          name: 'Pizza Margarita',
          description: 'Pizza italiana clásica'
        }
      },
      price: '12.99',
      stock: 50,
      available: true,
      be_extra: false,
      categories: [1, 2],
      ingredients: [3, 4, 5]
    })
  });

  return await response.json();
};
```

### Axios Example

```javascript
import axios from 'axios';

const createProduct = async (productData) => {
  const response = await axios.post('http://localhost:8000/api/products/', {
    translations: {
      en: {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza'
      },
      es: {
        name: 'Pizza Margarita',
        description: 'Pizza italiana clásica'
      }
    },
    price: '12.99',
    stock: 50,
    available: true,
    be_extra: false,
    categories: [1, 2],
    ingredients: [3, 4, 5]
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`, // If authentication required
    }
  });

  return response.data;
};
```

---

## Option 2: form-data Format (With Image)

Use this format when you NEED to upload an image file.

### Content-Type
```
Content-Type: multipart/form-data
```

### Request Body Structure

Instead of nested objects, use flat fields:

```
name_en: "Margherita Pizza"
name_es: "Pizza Margarita"
description_en: "Classic Italian pizza with tomato and mozzarella"
description_es: "Pizza italiana clásica con tomate y mozzarella"
price: "12.99"
stock: "50"
available: "true"
be_extra: "false"
categories: "1,2"           // Comma-separated IDs OR "[1,2]" JSON string
ingredients: "3,4,5"        // Comma-separated IDs OR "[3,4,5]" JSON string
image: [File object]
```

### JavaScript/TypeScript Example (Fetch with FormData)

```javascript
const createProductWithImage = async (productData, imageFile) => {
  const formData = new FormData();

  // Add translation fields (flat format)
  formData.append('name_en', 'Margherita Pizza');
  formData.append('name_es', 'Pizza Margarita');
  formData.append('description_en', 'Classic Italian pizza');
  formData.append('description_es', 'Pizza italiana clásica');

  // Add regular fields
  formData.append('price', '12.99');
  formData.append('stock', '50');
  formData.append('available', 'true');
  formData.append('be_extra', 'false');

  // Add relationships - Option 1: Comma-separated
  formData.append('categories', '1,2');
  formData.append('ingredients', '3,4,5');

  // OR Option 2: JSON string (both work!)
  // formData.append('categories', JSON.stringify([1, 2]));
  // formData.append('ingredients', JSON.stringify([3, 4, 5]));

  // Add image file
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:8000/api/products/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`, // If authentication required
      // DON'T set Content-Type header - browser will set it automatically with boundary
    },
    body: formData
  });

  return await response.json();
};

// Usage example
const fileInput = document.getElementById('imageInput');
const imageFile = fileInput.files[0];
await createProductWithImage(productData, imageFile);
```

### Axios Example with FormData

```javascript
import axios from 'axios';

const createProductWithImage = async (productData, imageFile) => {
  const formData = new FormData();

  // Add translation fields
  formData.append('name_en', productData.name_en);
  formData.append('name_es', productData.name_es);
  formData.append('description_en', productData.description_en);
  formData.append('description_es', productData.description_es);

  // Add regular fields
  formData.append('price', productData.price);
  formData.append('stock', productData.stock);
  formData.append('available', productData.available);
  formData.append('be_extra', productData.be_extra || false);

  // Add relationships (comma-separated or JSON)
  formData.append('categories', productData.categories.join(','));
  formData.append('ingredients', productData.ingredients.join(','));

  // Add image
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await axios.post('http://localhost:8000/api/products/', formData, {
    headers: {
      'Authorization': `Bearer ${accessToken}`, // If authentication required
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};
```

### React Hook Form Example

```typescript
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface ProductFormData {
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: string;
  stock: number;
  available: boolean;
  be_extra: boolean;
  categories: number[];
  ingredients: number[];
  image?: FileList;
}

const ProductForm = () => {
  const { register, handleSubmit } = useForm<ProductFormData>();

  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();

    // Translations
    formData.append('name_en', data.name_en);
    formData.append('name_es', data.name_es);
    formData.append('description_en', data.description_en);
    formData.append('description_es', data.description_es);

    // Regular fields
    formData.append('price', data.price);
    formData.append('stock', String(data.stock));
    formData.append('available', String(data.available));
    formData.append('be_extra', String(data.be_extra));

    // Relationships
    formData.append('categories', data.categories.join(','));
    formData.append('ingredients', data.ingredients.join(','));

    // Image
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    try {
      const response = await axios.post('/api/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('Product created:', response.data);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name_en')} placeholder="Name (English)" />
      <input {...register('name_es')} placeholder="Nombre (Español)" />
      <textarea {...register('description_en')} placeholder="Description (English)" />
      <textarea {...register('description_es')} placeholder="Descripción (Español)" />
      <input {...register('price')} type="number" step="0.01" />
      <input {...register('stock')} type="number" />
      <input {...register('image')} type="file" accept="image/*" />
      <button type="submit">Create Product</button>
    </form>
  );
};
```

---

## Field Reference

### Required Fields
- `name_en` or `name_es` (at least one language)
- `price` (must be > 0.01)
- `categories` (at least one category ID)

### Optional Fields
- `description_en`, `description_es`
- `stock` (default: 0)
- `available` (default: true)
- `be_extra` (default: false)
- `ingredients` (empty array if not provided)
- `image` (no image if not provided)

### Categories and Ingredients Format Options

Both formats are supported for `categories` and `ingredients`:

1. **Comma-separated string**: `"1,2,3"`
2. **JSON string**: `"[1,2,3]"`

---

## Update Product (PUT/PATCH)

### Full Update (PUT) - Replace entire product

```javascript
// JSON format (without changing image)
await axios.put(`/api/products/${productId}/`, {
  translations: {
    en: { name: 'Updated Name', description: 'Updated Description' },
    es: { name: 'Nombre Actualizado', description: 'Descripción Actualizada' }
  },
  price: '15.99',
  stock: 100,
  available: true,
  be_extra: false,
  categories: [1, 3],
  ingredients: [2, 4, 6]
});
```

### Partial Update (PATCH) - Update specific fields

```javascript
// form-data format (updating image)
const formData = new FormData();
formData.append('price', '16.99');
formData.append('stock', '75');
formData.append('image', newImageFile);

await axios.patch(`/api/products/${productId}/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## Error Handling

```javascript
try {
  const response = await createProductWithImage(productData, imageFile);
  console.log('Success:', response);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Validation errors:', error.response.data);
    // Example: { "price": ["Ensure this value is greater than 0.01."] }
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

---

## Notes

1. **Authentication**: Most endpoints require authentication. Include the Authorization header with your access token.

2. **Image formats**: Accepted formats include JPEG, PNG, GIF, WebP. The backend will store them in the `media/Products/` directory.

3. **Decimal precision**: Price supports up to 10 digits with 2 decimal places.

4. **Stock validation**: Stock cannot be negative (minimum: 0).

5. **Translations**: You can provide translations for one or both languages. Missing translations will fall back to the default language (Spanish).

6. **Content-Type**:
   - When using JSON format: Set `Content-Type: application/json`
   - When using FormData: Let the browser set `Content-Type` automatically (it will include the boundary)

7. **Boolean values in form-data**: Use strings "true" or "false", they will be converted automatically.
