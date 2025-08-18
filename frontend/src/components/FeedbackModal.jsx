// src/components/FeedbackModal.jsx

import Modal from 'react-modal';
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Cole aqui os seus customStyles do AuthModal
const customStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', background: 'var(--cor-fundo-secundario)',
    border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '0',
    width: '90%', maxWidth: '450px', overflow: 'hidden'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 }
};

Modal.setAppElement('#root');

export function FeedbackModal({ isOpen, onRequestClose }) {
  const [tipo, setTipo] = useState('Elogio');
  const [mensagem, setMensagem] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // COLOQUE O SEU URL DO GETFORM AQUI
  const GETFORM_ENDPOINT_URL = 'https://getform.io/f/bvrmwexb';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const formData = { tipo, mensagem, email };

    try {
      // Usamos axios para enviar os dados para o endpoint do Getform
      await axios.post(GETFORM_ENDPOINT_URL, formData);
      
      toast.success('Mensagem enviada com sucesso! Obrigado.');
      setMensagem('');
      setEmail('');
      onRequestClose();
    } catch (error) {
      toast.error('Não foi possível enviar sua mensagem.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      {/* O JSX do formulário continua exatamente o mesmo */}
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Fale Conosco</h2>
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Mensagem</label>
          <select id="tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="Elogio">Elogio</option>
            <option value="Reclamação">Reclamação</option>
            <option value="Sugestão">Sugestão</option>
            <option value="Informação">Informação</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="email">Seu E-mail (Opcional)</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seunome@email.com" />
        </div>
        <div className="form-group">
          <label htmlFor="mensagem">Mensagem</label>
          <textarea id="mensagem" value={mensagem} onChange={e => setMensagem(e.target.value)} required placeholder="Escreva sua mensagem aqui..."></textarea>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </Modal>
  );
}