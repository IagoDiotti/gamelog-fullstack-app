// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// CORREÇÃO: Adicionamos onFeedbackClick aqui
export function Navbar({ onLoginClick, onFeedbackClick }) { 
  const { token, logout } = useAuth();

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">Meu GameLog</NavLink>
      
      <div className="nav-links">
        {/* Movi o botão de contato para dentro desta div para melhor alinhamento */}
        <button onClick={onFeedbackClick} className="nav-link">Contato</button>
        
        {token ? (
          <>
            <NavLink to="/my-reviews" className="nav-link">Minhas Avaliações</NavLink>
            <button onClick={logout} className="nav-button">Sair</button>
          </>
        ) : (
          <button onClick={onLoginClick} className="nav-button">Entrar / Cadastrar</button>
        )}
      </div>
    </nav>
  );
}