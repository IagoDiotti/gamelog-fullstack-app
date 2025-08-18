// src/pages/GamePage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Para simplificar, vamos manter os componentes de review aqui por enquanto
// Eles poderiam ser movidos para a pasta /components

function ReviewForm({ game, token, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const reviewData = {
      gameApiId: game.id, gameTitle: game.name, gameCoverUrl: game.background_image,
      rating: parseInt(rating, 10), reviewText: reviewText,
    };
    try {
      await axios.post('http://localhost:3001/reviews', reviewData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Avaliação enviada com sucesso!');
      onReviewSubmitted();
    } catch (error) {
      toast.error('Falha ao enviar avaliação.');
      console.error('Erro ao enviar avaliação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h4>Deixe sua avaliação</h4>
      <div><label>Nota (1-5):</label><input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} required /></div>
      <div><label>Comentário:</label><textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="O que você achou do jogo?" /></div>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}</button>
    </form>
  );
}

function ReviewList({ gameApiId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3001/reviews/game/${gameApiId}`);
        setReviews(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [gameApiId]);

  if (isLoading) return <p>Carregando avaliações...</p>;

  return (
    <div className="review-list">
      <h4>Avaliações da Comunidade</h4>
      {reviews.length === 0 ? <p>Nenhuma avaliação ainda. Seja o primeiro!</p> : (
        <ul>
          {reviews.map(review => (
            <li key={review.id} className="review-item">
              <strong>{review.usuarioNome}</strong> <span>(Nota: {review.nota}/5)</span>
              {review.texto_review && <p>"{review.texto_review}"</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


function GamePage() {
  const { gameApiId } = useParams();
  const { token } = useAuth();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para forçar a atualização da lista de reviews
  const [reviewUpdateCounter, setReviewUpdateCounter] = useState(0);

  useEffect(() => {
    const fetchGameDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        const response = await axios.get(`https://api.rawg.io/api/games/${gameApiId}?key=${apiKey}`);
        setGame(response.data);
      } catch (err) {
        setError('Não foi possível carregar os detalhes do jogo.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameDetails();
  }, [gameApiId]);

  if (isLoading) return <p>Carregando detalhes do jogo...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!game) return <p>Jogo não encontrado.</p>;

  return (
    <div className="game-page">
      <h2>{game.name}</h2>
      <img src={game.background_image} alt={game.name} className="game-detail-image" />
      <div className="game-description" dangerouslySetInnerHTML={{ __html: game.description }} />
      <div className="game-reviews-section">
        {token && (
          <ReviewForm
            game={game}
            token={token}
            onReviewSubmitted={() => setReviewUpdateCounter(c => c + 1)} // Força a re-renderização
          />
        )}
        {/* Passamos o contador como `key` para forçar o ReviewList a recarregar quando uma nova review é enviada */}
        <ReviewList key={reviewUpdateCounter} gameApiId={game.id} />
      </div>
    </div>
  );
}

export default GamePage;