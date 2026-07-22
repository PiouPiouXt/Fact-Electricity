import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation basique côté client
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulation de l'appel API vers ton futur backend Node.js
      // À remplacer plus tard par : axios.post('/api/auth/login', { email, password })
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulation d'une vérification basique pour le test
          if (email === 'fact@electricity.mg' && password === 'password123') {
            resolve();
          } else {
            reject(new Error("Identifiants incorrects. Testez avec fact@electricity.mg / password123"));
          }
        }, 1500); // Faux temps de latence réseau
      });

      console.log('Connexion réussie !');
      if (onLoginSuccess) onLoginSuccess();
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Effet d'arrière-plan : Halo lumineux principal */}
      <div className="login-bg-glow" />

      <div className="login-card">
        {/* En-tête de la carte */}
        <div className="login-header">
          <div className="login-logo">⚡</div>
          <h2>Ravi de vous revoir</h2>
          <p>Connectez-vous pour suivre et sauvegarder votre consommation</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="login-error-badge">
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password">Mot de passe</label>
              <a href="#forgot" className="forgot-link">Mot de passe oublié ?</a>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading-content">
                <Loader2 className="spinner" size={18} />
                Connexion en cours...
              </span>
            ) : (
              <span className="btn-content">
                Se connecter
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Pied de la carte */}
        <div className="login-footer">
          <p>Vous n'avez pas de compte ? <a href="#register">Créer un compte</a></p>
        </div>
      </div>
    </div>
  );
}