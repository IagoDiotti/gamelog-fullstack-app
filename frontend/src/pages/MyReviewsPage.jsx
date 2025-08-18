// src/pages/MyReviewsPage.jsx

import { useAuth } from '../context/AuthContext';
import MyReviews from '../components/MyReviews';
function MyReviewsPage() {
  const { token } = useAuth();

  return (
    <div>
      {/* Você pode adicionar um título ou outra informação aqui */}
      {token ? <MyReviews token={token} /> : <p>Você precisa estar logado para ver suas avaliações.</p>}
    </div>
  );
}

export default MyReviewsPage;