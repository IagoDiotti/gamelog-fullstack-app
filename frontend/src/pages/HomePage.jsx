// src/pages/HomePage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

// --- Componentes Internos Reutilizáveis ---
// Mantendo aqui por simplicidade, mas poderiam ser movidos para a pasta /components

function ReviewForm({ game, token, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const reviewData = {
      gameApiId: game.id,
      gameTitle: game.name,
      gameCoverUrl: game.background_image,
      rating: parseInt(rating, 10),
      reviewText: reviewText,
    };
    try {
      await axios.post('http://localhost:3001/reviews', reviewData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Avaliação enviada com sucesso!');
      onReviewSubmitted();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Falha ao enviar avaliação. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h4>Avaliar {game.name}</h4>
      <div>
        <label>Nota (1-5): </label>
        <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} required />
      </div>
      <div>
        <label>Comentário (opcional):</label>
        <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="O que você achou do jogo?" />
      </div>
      <button type="submit">Enviar Avaliação</button>
    </form>
  );
}

function ReviewList({ gameApiId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:3001/reviews/game/${gameApiId}`);
        setReviews(response.data);
      } catch (err) {
        setError('Não foi possível carregar as avaliações.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [gameApiId]);

  if (isLoading) return <p>Carregando avaliações...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="review-list">
      <h4>Avaliações da Comunidade</h4>
      {reviews.length === 0 ? (
        <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
      ) : (
        <ul>
          {reviews.map(review => (
            <li key={review.id} className="review-item">
              <strong>{review.usuarioNome}</strong> <span>(Nota: {review.nota}/5)</span>
              <p>{review.texto_review}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// --- Componente Principal da Página ---

function HomePage() {
  const { token } = useAuth();

  // --- ESTADOS DO COMPONENTE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia como true para o carregamento inicial
  const [error, setError] = useState(null);
  const [reviewingGameId, setReviewingGameId] = useState(null);
  const [viewingReviewsGameId, setViewingReviewsGameId] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [pageTitle, setPageTitle] = useState('Jogos mais Populares do Ano');

  // --- EFEITO PARA BUSCAR JOGOS POPULARES AO CARREGAR ---
useEffect(() => {
  const fetchPopularGames = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);
    setPageTitle('Jogos mais Populares'); // Título inicial
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      // URL CORRIGIDA: Ordena pelos mais adicionados, sem filtro de data, e pega 20 resultados.
      const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-added&page_size=20`;
      
      const response = await axios.get(url);
      setGames(response.data.results);
    } catch (err) {
      setError('Não foi possível carregar os jogos populares.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchPopularGames();
}, []); // Array vazio [] garante que isso rode apenas uma vez
  // --- FUNÇÃO DE BUSCA MANUAL ---
  const handleSearch = async (event) => {
  event.preventDefault();
  if (!searchTerm) return;

  setLoading(true);
  setError(null);
  setGames([]);
  setNoResults(false);
  setPageTitle(`Resultados para "${searchTerm}"`);

  try {
    const apiKey = import.meta.env.VITE_RAWG_API_KEY;
    // URL CORRIGIDA: Usa o parâmetro `search=` com o termo que você digitou.
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchTerm)}`;

    const response = await axios.get(url);
    setGames(response.data.results);
    
    if (response.data.results.length === 0) {
      setNoResults(true);
    }
  } catch (err) {
    setError('Não foi possível buscar os jogos.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2>Seu Universo Gamer, Organizado.</h2>
          <p>Busque, avalie e acompanhe os jogos que você ama.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Ou procure por um jogo específico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading && searchTerm ? <FaSpinner className="spinner" /> : 'Buscar'}
        </button>
      </form>

      <main>
        <h2 className="section-title">{pageTitle}</h2>
        {error && <p className="error-message">{error}</p>}
        {noResults && <p className="no-results-message">Nenhum jogo encontrado para sua busca.</p>}
        
        {loading && !games.length && <p>Carregando jogos...</p>}

        <div className="games-list">
          {games.map(game => (
             <div key={game.id} className="game-card">
      <Link to={`/game/${game.id}`} className="card-link">
        <img src={game.background_image} alt={game.name} />
        <div className="card-content">
          <h3>{game.name}</h3>
          <p>Lançamento: {game.released}</p>
        </div>
      </Link>
    </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HomePage;