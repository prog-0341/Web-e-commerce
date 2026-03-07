import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-icon">🌿</span>
        <Link to="/" className="brand-name">EcoConecta</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/products">Productos</Link></li>
        <li><Link to="/dashboard">Mi Panel</Link></li>
        <li><Link to="/login" className="btn-login">Iniciar Sesión</Link></li>
      </ul>
    </nav>
  );
}