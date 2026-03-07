import MainLayout from '../layouts/MainLayout';

const mockProducts = [
  { id: 1, name: 'Tomates Orgánicos', price: 45, producer: 'Rancho El Sol', emoji: '🍅' },
  { id: 2, name: 'Miel de Abeja', price: 120, producer: 'Apicultura Flores', emoji: '🍯' },
  { id: 3, name: 'Aguacates', price: 80, producer: 'Huerto Verde', emoji: '🥑' },
  { id: 4, name: 'Chile Serrano', price: 35, producer: 'Milpa Alta', emoji: '🌶️' },
];

export default function Products() {
  return (
    <MainLayout>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>🛒 Productos Disponibles</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {mockProducts.map(p => (
          <div key={p.id} style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '1.2rem', boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>{p.emoji}</div>
            <h3 style={{ margin: '0.5rem 0', color: 'var(--color-primary)' }}>{p.name}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Por: {p.producer}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0.5rem 0' }}>${p.price} MXN/kg</p>
            <button style={{ width: '100%' }}>Agregar al carrito</button>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}