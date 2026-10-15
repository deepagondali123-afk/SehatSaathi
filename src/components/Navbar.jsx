
import { useState } from 'react';
import { Heart, Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    ['Home', '#home'],
    ['Features', '#features'],
    ['How It Works', '#how-it-works'],
    ['Our Mission', '#our-mission'],
  ];

  return (
    <header className="ss-navbar">
      <a href="#home" className="ss-brand">
        <span className="ss-brand-icon"><Heart size={22} fill="currentColor" /></span>
        <span>Sehat <b>Saathi</b></span>
      </a>

      <nav className={`ss-nav-links ${menuOpen ? 'ss-nav-open' : ''}`}>
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <a className="ss-mobile-login" href="/login">Login</a>
      </nav>

      <div className="ss-nav-actions">
        <a className="ss-login-link" href="/login">Login</a>
        <a className="ss-nav-cta" href="/login">
          Get Started <ArrowRight size={16} />
        </a>
      </div>

      <button
        className="ss-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
};

export default Navbar;
