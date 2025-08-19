import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


import { AuthProvider } from './context/AuthContext'; 
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx';
import GamePage from './pages/GamePage.jsx';
import MyReviewsPage from './pages/MyReviewsPage.jsx'; 
import './index.css'


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


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)