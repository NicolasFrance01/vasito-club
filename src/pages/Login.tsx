import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, LogIn } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="logo-placeholder">🍦</div>
          <h1>Vasito Club</h1>
          <p>Bienvenido. Por favor ingresa a tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Usuario</label>
            <div className="input-with-icon">
              <UserIcon size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Nombre de usuario" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="login-error animate-fade-in">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : (
              <>
                <LogIn size={20} />
                Ingresar
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Vasito Club. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
