import { useState, useEffect } from 'react';
import axios from 'axios';

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
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [gameApiId]);

  if (isLoading) {
    return <p>Carregando avaliações...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

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

export default ReviewList;