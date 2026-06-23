import React, { useState } from 'react';
import { Menu, X, LogIn, Settings, LogOut } from 'lucide-react';
import './HamburgerMenu.css'; // Importation de ton CSS personnalisé

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log("Log In cliqué (Interface de connexion en attente...)");
    setIsOpen(false);
  };

  return (
    <div className="hamburger-container">
      {/* Bouton de déclenchement */}
      <button onClick={toggleMenu} className="hamburger-trigger" aria-label="Toggle Menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Arrière-plan flouté cliquable pour fermer le menu */}
      {isOpen && <div className="menu-overlay" onClick={toggleMenu} />}

      {/* Le menu déroulant */}
      <div className={`menu-dropdown ${isOpen ? 'is-open' : ''}`}>
        {/* Effet halo interne */}
        <div className="menu-halo-effect" />

        <nav className="menu-nav">
          {/* Option: Log In */}
          <button onClick={handleLoginClick} className="menu-item">
            <LogIn size={18} />
            <span>Log In</span>
            <span className="badge-dev">Dev</span>
          </button>

          {/* Option: Paramètres */}
          <button onClick={() => { console.log("Settings"); setIsOpen(false); }} className="menu-item">
            <Settings size={18} />
            <span>Paramètres</span>
          </button>

          {/* Séparateur visuel */}
          <hr className="menu-separator" />

          {/* Option: Log Out */}
          <button onClick={() => { console.log("Logout"); setIsOpen(false); }} className="menu-item menu-item-logout">
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
}