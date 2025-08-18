// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (o componente que vai "segurar" a lógica)
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verifica se já existe um token no localStorage quando o app carrega
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    // Recarregar a página garante que todos os estados sejam limpos
    window.location.reload();
  };

  // O valor que será compartilhado com todos os componentes "filhos"
  const value = { token, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Cria um "Hook" customizado para facilitar o uso do contexto
export function useAuth() {
  return useContext(AuthContext);
}