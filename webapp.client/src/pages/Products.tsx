import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { productsApi, categoriesApi } from '../services/api';
import type { Product, Category, CreateOrderRequest } from '../types';
import { ordersApi } from '../services/api';

const UNIT_EMOJI: Record<string, string> = {
  kg: '⚖️', frasco: '🫙', pza: '🔢', manojo: '🌿',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [orderMsg, setOrderMsg] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    Promise.all([
      productsApi.getAll(),
      categoriesApi.getAll(),
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      const prods = await productsApi.getAll({ search, categoryId: selectedCategory });
      setProducts(prods);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const name = prompt('Tu nombre:');
    const email = prompt('Tu correo electrónico:');
    if (!name || !email) return;

    const payload: CreateOrderRequest = {
      customerName: name,
      customerEmail: email,
      items: cart.map(c => ({ productId: c.product.id, quantity: c.qty })),
    };

    try {
      const order = await ordersApi.create(payload);
      setOrderMsg(`✅ ¡Pedido #${order.id} creado! Total: $${order.total} MXN`);
      setCart([]);
      setShowCart(false);
      // Recargar productos para actualizar stock
      const prods = await productsApi.getAll({ search, categoryId: selectedCategory });
      setProducts(prods);
    } catch (err: unknown) {
      setOrderMsg(`❌ Error: ${(err as Error).message}`);
    }
  };

  return (
    <MainLayout>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>🛒 Productos Disponibles</h2>

      {/* Barra de búsqueda y filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar producto o productor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFilter()}
          style={{ flex: 1, minWidth: '180px', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <select
          value={selectedCategory ?? ''}
          onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
          style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={handleFilter} style={{ padding: '0.5rem 1rem' }}>Buscar</button>
        <button
          onClick={() => setShowCart(!showCart)}
          style={{ padding: '0.5rem 1rem', background: cart.length > 0 ? 'var(--color-primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          🛒 Carrito ({cart.length}) — ${cartTotal} MXN
        </button>
      </div>

      {/* Carrito */}
      {showCart && cart.length > 0 && (
        <div style={{ background: '#f0faf5', border: '1px solid var(--color-primary)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Tu carrito</h3>
          {cart.map(c => (
            <div key={c.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{c.product.name} × {c.qty}</span>
              <span style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <strong>${(c.product.price * c.qty).toFixed(2)}</strong>
                <button onClick={() => removeFromCart(c.product.id)} style={{ background: '#e55', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.1rem 0.4rem' }}>✕</button>
              </span>
            </div>
          ))}
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <strong>Total: ${cartTotal.toFixed(2)} MXN</strong>
            <button onClick={placeOrder} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer' }}>
              Hacer pedido
            </button>
          </div>
        </div>
      )}

      {orderMsg && (
        <div style={{ padding: '0.75rem 1rem', background: '#f0faf5', border: '1px solid #74c69d', borderRadius: '8px', marginBottom: '1rem' }}>
          {orderMsg}
        </div>
      )}

      {/* Estado de carga / error */}
      {loading && <p style={{ color: '#888' }}>Cargando productos...</p>}
      {error && <p style={{ color: '#c0392b' }}>⚠️ {error}</p>}

      {/* Grid de productos */}
      {!loading && !error && (
        <>
          {products.length === 0
            ? <p style={{ color: '#888' }}>No se encontraron productos.</p>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    background: 'white', borderRadius: 'var(--radius)',
                    padding: '1.2rem', boxShadow: 'var(--shadow)',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem'
                  }}>
                    <div style={{ fontSize: '2.5rem', textAlign: 'center' }}>
                      {UNIT_EMOJI[p.unit] ?? '📦'}
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#e8f5e9', color: '#2d6a4f', borderRadius: '4px', padding: '0.1rem 0.5rem', alignSelf: 'flex-start' }}>
                      {p.category?.name ?? 'Sin categoría'}
                    </span>
                    <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{p.name}</h3>
                    <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Por: {p.producer}</p>
                    {p.description && <p style={{ color: '#555', fontSize: '0.85rem', margin: 0 }}>{p.description}</p>}
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0.25rem 0' }}>${p.price} MXN/{p.unit}</p>
                    <p style={{ fontSize: '0.8rem', color: p.stock > 10 ? '#27ae60' : '#e67e22', margin: 0 }}>
                      Stock: {p.stock} {p.unit}
                    </p>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      style={{ marginTop: 'auto', opacity: p.stock === 0 ? 0.5 : 1, cursor: p.stock === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {p.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </>
      )}
    </MainLayout>
  );
}
