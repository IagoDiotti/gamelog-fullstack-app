// src/components/RegisterForm.jsx
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function RegisterForm({ onRegisterSuccess }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3001/usuarios', { nome, email, password });
      toast.success('Cadastro realizado com sucesso! Por favor, faça o login.');
      onRegisterSuccess(); // Chama a função para voltar para a tela de login
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar.');
      console.error('Falha no cadastro:', err);
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
      <button type="submit">Cadastrar</button>
    </form>
  );
}