// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Importações dos seus componentes e contexto
import { AuthProvider } from './context/AuthContext'; // <--- Importe o provedor
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import MyReviewsPage from './pages/MyReviewsPage.jsx'; 
import './index.css'

// Sua configuração do router (está correta)
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "game/:gameApiId", element: <GamePage /> },
      { path: "my-reviews", element: <MyReviewsPage /> },
    ]
  },
]);

// O PONTO CRÍTICO ESTÁ AQUI
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* O AuthProvider DEVE envolver o RouterProvider */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)