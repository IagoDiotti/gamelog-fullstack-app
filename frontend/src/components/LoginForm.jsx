import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      login(response.data.token);
      toast.success('Login bem-sucedido!');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/');
    } catch (err) {
      toast.error('E-mail ou senha inválidos.');
      console.error('Falha no login:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <h2>Entrar na sua Conta</h2>
      <div className="form-group">
        <label htmlFor="login-email">E-mail</label>
        <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="login-password">Senha</label>
        <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}