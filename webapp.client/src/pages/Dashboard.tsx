import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { productsApi, categoriesApi, ordersApi } from '../services/api';
import type { Product, Category, Order, ProductFormData } from '../types';

const STATUS_COLORS: Record<string, string> = {
  Pendiente: '#f39c12', Confirmado: '#2980b9',
  Enviado: '#8e44ad', Entregado: '#27ae60', Cancelado: '#e74c3c',
};

const emptyForm = (): ProductFormData => ({
  name: '', description: '', price: 0, stock: 0, unit: 'kg',
  producer: '', imageUrl: '', isActive: true, categoryId: 1,
});

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'stats' | 'products' | 'orders'>('stats');

  // Formulario producto
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats, ords] = await Promise.all([
        productsApi.getAll({ onlyActive: false }),
        categoriesApi.getAll(),
        ordersApi.getAll(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalRevenue = orders
    .filter(o => o.status === 'Entregado')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;

  // Handlers del formulario
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description ?? '', price: p.price, stock: p.stock, unit: p.unit, producer: p.producer, imageUrl: p.imageUrl ?? '', isActive: p.isActive, categoryId: p.categoryId });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editingId !== null) {
        await productsApi.update(editingId, form);
      } else {
        await productsApi.create(form);
      }
      setShowForm(false);
      await loadData();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      await loadData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      await loadData();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const inputStyle = { width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' as const };

  return (
    <MainLayout>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>📊 Panel del Productor</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['stats', 'products', 'orders'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === t ? 'var(--color-primary)' : '#eee', color: tab === t ? 'white' : '#333' }}
          >
            {{ stats: '📈 Estadísticas', products: '📦 Productos', orders: '🛒 Pedidos' }[t]}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#888' }}>Cargando datos...</p>}
      {error && <p style={{ color: '#c0392b' }}>⚠️ {error}</p>}

      {!loading && !error && (
        <>
          {/* ===== TAB: ESTADÍSTICAS ===== */}
          {tab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Productos registrados', value: products.length, icon: '📦' },
                { label: 'Pedidos pendientes', value: pendingOrders, icon: '⏳' },
                { label: 'Total de pedidos', value: orders.length, icon: '🛒' },
                { label: 'Ingresos entregados', value: `$${totalRevenue.toFixed(2)}`, icon: '💰' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stat.value}</div>
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ===== TAB: PRODUCTOS ===== */}
          {tab === 'products' && (
            <>
              <button onClick={openNew} style={{ marginBottom: '1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer' }}>
                + Nuevo producto
              </button>

              {/* Modal formulario */}
              {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--color-primary)' }}>
                      {editingId !== null ? 'Editar producto' : 'Nuevo producto'}
                    </h3>
                    {[
                      { label: 'Nombre', key: 'name', type: 'text' },
                      { label: 'Descripción', key: 'description', type: 'text' },
                      { label: 'Precio (MXN)', key: 'price', type: 'number' },
                      { label: 'Stock', key: 'stock', type: 'number' },
                      { label: 'Unidad (kg, frasco, pza...)', key: 'unit', type: 'text' },
                      { label: 'Productor', key: 'producer', type: 'text' },
                    ].map(({ label, key, type }) => (
                      <div key={key} style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#555' }}>{label}</label>
                        <input
                          type={type}
                          value={String(form[key as keyof ProductFormData] ?? '')}
                          onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#555' }}>Categoría</label>
                      <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: Number(e.target.value) }))} style={inputStyle}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: '#555', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                        Producto activo
                      </label>
                    </div>
                    {formError && <p style={{ color: '#c0392b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>⚠️ {formError}</p>}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}>Cancelar</button>
                      <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'wait' : 'pointer' }}>
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <thead>
                  <tr style={{ background: 'var(--color-primary)', color: 'white' }}>
                    {['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: '#888' }}>{p.id}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}>{p.category?.name ?? '—'}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}>${p.price}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem', color: p.stock < 5 ? '#e67e22' : '#27ae60' }}>{p.stock}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: p.isActive ? '#d4efdf' : '#fadbd8', color: p.isActive ? '#1e8449' : '#c0392b' }}>
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => openEdit(p)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #3498db', color: '#3498db', background: 'white', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #e74c3c', color: '#e74c3c', background: 'white', cursor: 'pointer' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ===== TAB: PEDIDOS ===== */}
          {tab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.length === 0 && <p style={{ color: '#888' }}>No hay pedidos registrados.</p>}
              {orders.map(order => (
                <div key={order.id} style={{ background: 'white', borderRadius: '10px', padding: '1rem', boxShadow: 'var(--shadow)', borderLeft: `4px solid ${STATUS_COLORS[order.status] ?? '#aaa'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong>Pedido #{order.id}</strong> — {order.customerName} ({order.customerEmail})
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(order.orderDate).toLocaleString('es-MX')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: STATUS_COLORS[order.status] ?? '#aaa', color: 'white', fontSize: '0.8rem' }}>
                        {order.status}
                      </span>
                      <strong>${order.total.toFixed(2)} MXN</strong>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
                    {order.items.map(item => (
                      <span key={item.id} style={{ marginRight: '0.75rem' }}>
                        {item.product?.name ?? `Producto #${item.productId}`} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                  {order.status !== 'Entregado' && order.status !== 'Cancelado' && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['Confirmado', 'Enviado', 'Entregado', 'Cancelado']
                        .filter(s => s !== order.status)
                        .map(s => (
                          <button key={s} onClick={() => handleUpdateStatus(order.id, s)}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', border: `1px solid ${STATUS_COLORS[s]}`, color: STATUS_COLORS[s], background: 'white', cursor: 'pointer' }}>
                            → {s}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
