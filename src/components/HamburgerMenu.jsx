import React, { useState } from 'react';
import { Menu, X, LogIn, Settings, LogOut } from 'lucide-react';
import Login from './Login'; // 1. On importe le composant Login
import './HamburgerMenu.css';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // État pour la modal

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsOpen(false); // Ferme le menu hamburger
    setShowLoginModal(true); // Ouvre la modal de connexion
  };

  const handleLoginSuccess = () => {
    // Ce bloc s'exécute quand l'utilisateur a entré les bons identifiants
    setShowLoginModal(false); // Ferme la modal
    alert("Bienvenue sur Livreo !"); 
    // Tu pourras ici mettre à jour l'état global de l'utilisateur (ex: avec un Context ou Zustand)
  };

  return (
    <>
      <div className="hamburger-container">
        {/* Bouton de déclenchement */}
        <button onClick={toggleMenu} className="hamburger-trigger" aria-label="Toggle Menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Arrière-plan flouté cliquable pour fermer le menu */}
        {isOpen && <div className="menu-overlay" onClick={toggleMenu} />}

        {/* Le menu déroulant */}
        <div className={`menu-dropdown ${isOpen ? 'is-open' : ''}`}>
          <div className="menu-halo-effect" />

          <nav className="menu-nav">
            {/* Option: Log In lié à notre fonction */}
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

            <hr className="menu-separator" />

            {/* Option: Log Out */}
            <button onClick={() => { console.log("Logout"); setIsOpen(false); }} className="menu-item menu-item-logout">
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </div>

      {/* 2. Affichage de la Modal Login si showLoginModal est vrai */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Bouton de fermeture de la modal */}
            <button 
              className="modal-close-btn" 
              onClick={() => setShowLoginModal(false)}
            >
              <X size={20} />
            </button>
            
            {/* Injection du composant Login */}
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
}