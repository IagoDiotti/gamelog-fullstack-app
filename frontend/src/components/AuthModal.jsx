import Modal from 'react-modal';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'var(--cor-fundo-secundario)',
    border: '1px solid var(--cor-borda)',
    borderRadius: '8px',
    padding: '0',
    width: '90%',
    maxWidth: '450px',
    overflow: 'hidden'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
};

Modal.setAppElement('#root');

export function AuthModal({ isOpen, onRequestClose }) {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Autenticação"
    >
      <div className="auth-modal-container">
        <div className="modal-tabs">
          <button
            className={`modal-tab ${isLoginView ? 'active' : ''}`}
            onClick={() => setIsLoginView(true)}
          >
            Entrar
          </button>
          <button
            className={`modal-tab ${!isLoginView ? 'active' : ''}`}
            onClick={() => setIsLoginView(false)}
          >
            Cadastrar
          </button>
        </div>
        <div className="modal-content">
          {isLoginView ? (
            <LoginForm onLoginSuccess={onRequestClose} />
          ) : (
            <RegisterForm onRegisterSuccess={() => setIsLoginView(true)} />
          )}
        </div>
      </div>
    </Modal>
  );
}