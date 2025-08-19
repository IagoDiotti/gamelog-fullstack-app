// src/components/RegisterForm.jsx
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function RegisterForm({ onRegisterSuccess }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      await axios.post(`${API_URL}/usuarios`, { nome, email, password });
      
      toast.success('Cadastro realizado com sucesso! Por favor, faça o login.');
      onRegisterSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar.');
      console.error('Falha no cadastro:', err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="auth-form">
      <h2>Criar Conta</h2>
      <div className="form-group">
        <label htmlFor="register-name">Nome</label>
        <input id="register-name" type="text" value={nome} onChange={e => setNome(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="register-email">E-mail</label>
        <input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="register-password">Senha</label>
        <input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar'}</button>
    </form>
  );
}