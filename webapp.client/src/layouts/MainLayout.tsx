import type { ReactNode } from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import '../styles/global.css';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}