

import { useState, useEffect } from 'react';
import axios from 'axios';

// Este componente recebe o token como "prop" para fazer a chamada autenticada
function MyReviews({ token }) {
  const [myReviews, setMyReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return; // Não faz nada se não houver token

    const fetchMyReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Faz a chamada para a rota protegida, passando o token no cabeçalho
        const response = await axios.get('http://localhost:3001/users/me/reviews', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setMyReviews(response.data);
      } catch (err) {
        setError('Não foi possível carregar suas avaliações.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyReviews();
  }, [token]); // Roda sempre que o token mudar (ex: ao fazer login)

  if (isLoading) {
    return <p>Carregando suas avaliações...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="my-reviews-section">
      <h2>Minhas Avaliações</h2>
      {myReviews.length === 0 ? (
        <p>Você ainda não avaliou nenhum jogo.</p>
      ) : (
        <div className="my-reviews-list">
          {myReviews.map(review => (
            <div key={review.id} className="game-card">
              <img src={review.gameCoverUrl} alt={review.gameTitle} />
              <h3>{review.gameTitle}</h3>
              <p>Sua nota: {review.nota}/5</p>
              {review.reviewText && <p className="review-text">"{review.reviewText}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReviews;