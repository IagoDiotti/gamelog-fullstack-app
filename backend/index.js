const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware');
const axios = require('axios');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Meu GameLog está no ar!');
});

const db = require('./db');
const bcrypt = require('bcryptjs');

app.post('/usuarios', async (req, res) => {
  const { nome, email, password } = req.body;
  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(password, salt);
    const text = 'INSERT INTO usuarios(nome, email, senha_hash) VALUES($1, $2, $3) RETURNING id, email, nome';
    const values = [nome, email, senhaHash];
    const result = await db.query(text, values);
    const novoUsuario = result.rows[0];
    return res.status(201).json(novoUsuario);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const text = 'SELECT * FROM usuarios WHERE email = $1';
    const values = [email];
    const result = await db.query(text, values);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' }); 
    }
    const user = result.rows[0];
    const senhaCorreta = await bcrypt.compare(password, user.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const payload = { 
      userId: user.id,
    };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.get('/profile', authenticateToken, (req, res) => {
  res.send(`Olá! Este é o seu perfil, usuário de ID: ${req.user.userId}`);
});

app.get('/api/games/search', async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.status(400).json({ error: 'O termo de busca (q) é obrigatório.' });
  }
  const apiKey = process.env.RAWG_API_KEY;
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchTerm)}`;
  try {
    const response = await axios.get(url);
    const games = response.data.results.map(game => ({
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
    }));
    res.status(200).json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos na API da RAWG:', error.message);
    res.status(500).json({ error: 'Não foi possível buscar os jogos.' });
  }
});

app.post('/reviews', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { gameApiId, gameTitle, gameCoverUrl, rating, reviewText } = req.body;
  if (!gameApiId || !rating) {
    return res.status(400).json({ error: 'ID do jogo e nota são obrigatórios.' });
  }
  try {
    const gameQuery = `
      WITH ins AS (
        INSERT INTO jogos(api_id, titulo, capa_url)
        VALUES($1, $2, $3)
        ON CONFLICT(api_id) DO NOTHING
        RETURNING id
      )
      SELECT id FROM ins
      UNION ALL
      SELECT id FROM jogos WHERE api_id = $1;
    `;
    const gameResult = await db.query(gameQuery, [gameApiId, gameTitle, gameCoverUrl]);
    const localGameId = gameResult.rows[0].id;
    const reviewQuery = `
      INSERT INTO avaliacoes(usuario_id, jogo_id, nota, texto_review)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(usuario_id, jogo_id) DO UPDATE SET
        nota = EXCLUDED.nota,
        texto_review = EXCLUDED.texto_review
      RETURNING *;
    `;
    const reviewResult = await db.query(reviewQuery, [userId, localGameId, rating, reviewText]);
    res.status(201).json(reviewResult.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    res.status(500).json({ error: 'Não foi possível salvar a avaliação.' });
  }
});

app.get('/reviews/game/:gameApiId', async (req, res) => {
  const { gameApiId } = req.params;
  try {
    const query = `
      SELECT 
        avaliacoes.id, 
        avaliacoes.nota, 
        avaliacoes.texto_review, 
        avaliacoes.created_at,
        usuarios.id as "usuarioId",
        usuarios.nome as "usuarioNome"
      FROM avaliacoes
      JOIN usuarios ON avaliacoes.usuario_id = usuarios.id
      JOIN jogos ON avaliacoes.jogo_id = jogos.id
      WHERE jogos.api_id = $1
      ORDER BY avaliacoes.created_at DESC;
    `;
    const result = await db.query(query, [gameApiId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar avaliações do jogo:', error);
    res.status(500).json({ error: 'Não foi possível buscar as avaliações.' });
  }
});

app.get('/users/me/reviews', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const query = `
      SELECT 
        avaliacoes.id,
        avaliacoes.nota,
        avaliacoes.texto_review,
        avaliacoes.created_at,
        jogos.api_id as "gameApiId",
        jogos.titulo as "gameTitle",
        jogos.capa_url as "gameCoverUrl"
      FROM avaliacoes
      JOIN jogos ON avaliacoes.jogo_id = jogos.id
      WHERE avaliacoes.usuario_id = $1
      ORDER BY avaliacoes.created_at DESC;
    `;
    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar avaliações do usuário:', error);
    res.status(500).json({ error: 'Não foi possível buscar as avaliações.' });
  }
});

app.get('/users/:userId/reviews', async (req, res) => {
  const { userId } = req.params; 
  try {
    const query = `
      SELECT 
        avaliacoes.id,
        avaliacoes.nota,
        avaliacoes.texto_review,
        avaliacoes.created_at,
        jogos.api_id as "gameApiId",
        jogos.titulo as "gameTitle",
        jogos.capa_url as "gameCoverUrl"
      FROM avaliacoes
      JOIN jogos ON avaliacoes.jogo_id = jogos.id
      WHERE avaliacoes.usuario_id = $1
      ORDER BY avaliacoes.created_at DESC;
    `;
    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar avaliações do usuário:', error);
    res.status(500).json({ error: 'Não foi possível buscar as avaliações.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});