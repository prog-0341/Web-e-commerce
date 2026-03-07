import MainLayout from '../layouts/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <section style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>
          🌾 Bienvenido a EcoConecta
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto', color: '#555' }}>
          El marketplace que conecta productores rurales con consumidores urbanos.
          Productos frescos, directamente del campo a tu mesa.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button>Ver Productos</button>
          <button style={{ background: 'var(--color-accent)' }}>Soy Productor</button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
        {[
          { icon: '🥦', title: 'Verduras Frescas', desc: 'Directo del campo sin intermediarios' },
          { icon: '🍯', title: 'Productos Artesanales', desc: 'Miel, mermeladas y más' },
          { icon: '🚚', title: 'Entrega Rápida', desc: 'Pedidos a domicilio en tu ciudad' },
        ].map((card, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow)'
          }}>
            <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
            <h3 style={{ color: 'var(--color-primary)', margin: '0.5rem 0' }}>{card.title}</h3>
            <p style={{ color: '#666' }}>{card.desc}</p>
          </div>
        ))}
      </section>
    </MainLayout>
  );
}