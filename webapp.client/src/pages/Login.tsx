import MainLayout from '../layouts/MainLayout';

export default function Login() {
  return (
    <MainLayout>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
          🌿 Iniciar Sesión
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="email" placeholder="Correo electrónico"
            style={{ padding: '0.8rem', borderRadius: 'var(--radius)', border: '1px solid #ccc', fontSize: '1rem' }} />
          <input type="password" placeholder="Contraseña"
            style={{ padding: '0.8rem', borderRadius: 'var(--radius)', border: '1px solid #ccc', fontSize: '1rem' }} />
          <button style={{ width: '100%', padding: '0.9rem' }}>Entrar</button>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
            ¿No tienes cuenta? <a href="#" style={{ color: 'var(--color-primary)' }}>Regístrate</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}