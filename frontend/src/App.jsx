// src/App.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { FeedbackModal } from './components/FeedbackModal'; // Importe o novo modal

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // Novo estado


  return (
    <div className="container">
      <Toaster position="top-right" toastOptions={{ /* ... */ }} />

      <Navbar 
    onLoginClick={() => setIsAuthModalOpen(true)} 
    onFeedbackClick={() => setIsFeedbackModalOpen(true)} // <-- ADICIONE ESTA LINHA
/>

      <main>
        <Outlet />
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onRequestClose={() => setIsAuthModalOpen(false)} 
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onRequestClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default App;