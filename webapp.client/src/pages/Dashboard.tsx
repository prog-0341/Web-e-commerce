import MainLayout from '../layouts/MainLayout';

export default function Dashboard() {
  return (
    <MainLayout>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>📊 Panel del Productor</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Productos publicados', value: '12', icon: '📦' },
          { label: 'Pedidos activos', value: '5', icon: '🛒' },
          { label: 'Ventas del mes', value: '$3,240', icon: '💰' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stat.value}</div>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}