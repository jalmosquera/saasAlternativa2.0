# Loading Screen - Documentación

## 📖 Descripción

Este directorio contiene el componente `LoadingScreen` y el hook `useLoading` para manejar estados de carga en la aplicación.

---

## 🎨 LoadingScreen Component

Componente visual que muestra una animación de sartén con ingredientes cayendo, ideal para pantallas de carga.

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `true` | Controla si el loading está visible |
| `text` | `string` | `"Cargando el panel..."` | Texto a mostrar debajo del logo |
| `brandName` | `string` | `"Equss Pub"` | Nombre de la marca |
| `subtitle` | `string` | `"Admin"` | Subtítulo |
| `minDuration` | `number` | `1200` | Duración mínima en ms antes de ocultar |

### Ejemplo de uso básico

```jsx
import LoadingScreen from '@shared/components/common/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      {/* Tu contenido aquí */}
    </>
  );
}
```

### Ejemplo con texto personalizado

```jsx
<LoadingScreen
  isLoading={isLoading}
  text="Cargando menú delicioso..."
  brandName="Digital Letter"
  subtitle="Menu"
/>
```

---

## 🔧 useLoading Hook

Hook personalizado que maneja estados de carga con threshold (tiempo mínimo antes de mostrar el loading).

### Parámetros

- `threshold` (number, default: `3000`): Tiempo en ms antes de mostrar el loading

### Retorna

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isLoading` | `boolean` | Estado actual de loading |
| `shouldShowLoading` | `boolean` | Si debe mostrarse el loading visual (después del threshold) |
| `startLoading` | `function` | Función para iniciar el loading |
| `stopLoading` | `function` | Función para detener el loading |
| `withLoading` | `function` | Wrapper para ejecutar funciones async con loading automático |

### Ejemplo 1: Uso manual

```jsx
import useLoading from '@shared/hooks/useLoading';
import LoadingScreen from '@shared/components/common/LoadingScreen';

function ProductsPage() {
  const { shouldShowLoading, startLoading, stopLoading } = useLoading(3000);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    startLoading();
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <LoadingScreen isLoading={shouldShowLoading} />
      {/* Tu contenido aquí */}
    </>
  );
}
```

### Ejemplo 2: Uso con wrapper automático

```jsx
import useLoading from '@shared/hooks/useLoading';
import LoadingScreen from '@shared/components/common/LoadingScreen';

function OrdersPage() {
  const { shouldShowLoading, withLoading } = useLoading(3000);
  const [orders, setOrders] = useState([]);

  // El hook maneja automáticamente startLoading y stopLoading
  const fetchOrders = withLoading(async () => {
    const response = await fetch('/api/orders');
    const data = await response.json();
    setOrders(data);
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <LoadingScreen isLoading={shouldShowLoading} />
      {/* Tu contenido aquí */}
    </>
  );
}
```

### Ejemplo 3: Submit de formulario

```jsx
import useLoading from '@shared/hooks/useLoading';
import LoadingScreen from '@shared/components/common/LoadingScreen';

function CreateProductForm() {
  const { shouldShowLoading, withLoading } = useLoading(3000);

  const handleSubmit = withLoading(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });
    // Mostrar mensaje de éxito
  });

  return (
    <>
      <LoadingScreen
        isLoading={shouldShowLoading}
        text="Creando producto..."
      />
      <form onSubmit={handleSubmit}>
        {/* Campos del formulario */}
        <button type="submit">Crear Producto</button>
      </form>
    </>
  );
}
```

---

## ⚙️ Configuración del threshold

El threshold es el tiempo mínimo que debe pasar antes de mostrar el loading. Esto evita "flashes" de loading en operaciones rápidas.

### Recomendaciones:

- **Operaciones de red:** `3000ms` (3 segundos)
- **Búsquedas/Filtros:** `500ms` (0.5 segundos)
- **Carga inicial de página:** `0ms` (mostrar inmediatamente)

```jsx
// Para búsquedas rápidas
const { shouldShowLoading, startLoading, stopLoading } = useLoading(500);

// Para operaciones de red
const { shouldShowLoading, startLoading, stopLoading } = useLoading(3000);

// Para carga inicial (sin threshold)
const { shouldShowLoading, startLoading, stopLoading } = useLoading(0);
```

---

## 🎭 Animaciones

Las animaciones están definidas en `src/index.css`:

- `panTilt`: Movimiento de la sartén (1.6s)
- `tossA`, `tossB`, `tossC`: Movimientos de ingredientes (1.5-1.8s)
- Cada ingrediente tiene un delay diferente para crear efecto escalonado

---

## 🚀 Mejores prácticas

1. **Usar `shouldShowLoading`** en lugar de `isLoading` para mostrar el LoadingScreen (evita flashes)

2. **Siempre limpiar el loading** en el bloque `finally` o con `withLoading`

3. **Personalizar el texto** del loading según la operación:
   ```jsx
   <LoadingScreen
     isLoading={shouldShowLoading}
     text="Guardando cambios..."
   />
   ```

4. **Ajustar el threshold** según la operación:
   - Rápidas (búsquedas): 500ms
   - Normales (fetch): 3000ms
   - Lentas (upload): 1000ms

5. **Failsafe automático**: El LoadingScreen tiene un failsafe de 5 segundos (configurable con `minDuration`)

---

## 📝 Notas

- El componente usa `z-index: 99999` para asegurar que esté por encima de todo
- Las animaciones son compatibles con todos los navegadores modernos
- El loading se oculta suavemente con una transición de opacidad de 400ms
- El hook limpia automáticamente los timeouts cuando el componente se desmonta
