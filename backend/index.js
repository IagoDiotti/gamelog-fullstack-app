const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // Usa a porta definida no ambiente ou 3001
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware');
const axios = require('axios'); // Adicione esta linha no topo com os outros imports

// Middlewares
app.use(cors()); // Permite requisições de outras origens
app.use(express.json()); // Permite que o express entenda requisições com corpo em JSON

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Meu GameLog está no ar!');
});


const db = require('./db');
const bcrypt = require('bcryptjs');

// ROTA DE CADASTRO DE USUÁRIO
app.post('/usuarios', async (req, res) => {
  // 1. Obter os dados do corpo da requisição
  const { nome, email, password } = req.body;

  // 2. Validar os dados (simples)
  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // 3. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(password, salt);

    // 4. Inserir o usuário no banco de dados
    const text = 'INSERT INTO usuarios(nome, email, senha_hash) VALUES($1, $2, $3) RETURNING id, email, nome';
    const values = [nome, email, senhaHash];
    
    const result = await db.query(text, values);
    const novoUsuario = result.rows[0];

    // 5. Retornar uma resposta de sucesso
    return res.status(201).json(novoUsuario);

  } catch (error) {
    console.error(error);
    // Verifica se o erro é de violação de chave única (email duplicado)
    if (error.code === '23505') {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA DE LOGIN DE USUÁRIO
app.post('/login', async (req, res) => {
  // 1. Obter os dados do corpo da requisição
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 2. Procurar o usuário no banco de dados pelo e-mail
    const text = 'SELECT * FROM usuarios WHERE email = $1';
    const values = [email];
    const result = await db.query(text, values);
    
    // Se a busca não retornar nenhum usuário, o email está errado
    if (result.rows.length === 0) {
      // Usamos uma mensagem genérica por segurança
      return res.status(401).json({ error: 'Credenciais inválidas' }); 
    }

    const user = result.rows[0];

    // 3. Comparar a senha enviada com a senha criptografada (hash) no banco
    // A função bcrypt.compare faz isso de forma segura
    const senhaCorreta = await bcrypt.compare(password, user.senha_hash);

    if (!senhaCorreta) {
      // Se as senhas não baterem, a senha está errada
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 4. Se as credenciais estiverem corretas, gerar um token JWT
    // O "payload" do token contém informações que queremos associar a ele
    const payload = { 
      userId: user.id,
      // Você pode adicionar outras informações se quiser, como user.nome
    };

    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET, // Nossa chave secreta do .env
      { expiresIn: '1h' } // Define um tempo de expiração para o token (ex: 1 hora)
    );

    // 5. Enviar o token de volta para o cliente
    res.status(200).json({ token: token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ROTA DE TESTE PROTEGIDA
app.get('/profile', authenticateToken, (req, res) => {
  // Graças ao middleware, o req.user contém os dados do token (o payload)
  // No nosso caso, contém o userId que colocamos ao criar o token.
  res.send(`Olá! Este é o seu perfil, usuário de ID: ${req.user.userId}`);
});

// ROTA PARA BUSCAR JOGOS NA API EXTERNA (RAWG)
app.get('/api/games/search', async (req, res) => {
  // 1. Pegar o termo de busca da query string (ex: /search?q=TheWitcher)
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ error: 'O termo de busca (q) é obrigatório.' });
  }

  const apiKey = process.env.RAWG_API_KEY;
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchTerm)}`;

  try {
    // 2. Fazer a requisição para a API da RAWG usando axios
    const response = await axios.get(url);
    
    // 3. Simplificar os dados que recebemos da RAWG antes de enviar de volta
    // Queremos apenas as informações que vamos usar no nosso app
    const games = response.data.results.map(game => ({
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
    }));

    // 4. Enviar a lista de jogos simplificada como resposta
    res.status(200).json(games);

  } catch (error) {
    console.error('Erro ao buscar jogos na API da RAWG:', error.message);
    res.status(500).json({ error: 'Não foi possível buscar os jogos.' });
  }
});

// ROTA PARA CRIAR/ATUALIZAR UMA AVALIAÇÃO (PROTEGIDA)
app.post('/reviews', authenticateToken, async (req, res) => {
  // 1. Obter o ID do usuário a partir do token (adicionado pelo middleware)
  const userId = req.user.userId;

  // 2. Obter os dados da avaliação do corpo da requisição
  const { gameApiId, gameTitle, gameCoverUrl, rating, reviewText } = req.body;

  // Validação básica
  if (!gameApiId || !rating) {
    return res.status(400).json({ error: 'ID do jogo e nota são obrigatórios.' });
  }

  try {
    // 3. Lógica "Upsert" para o jogo:
    // Tente inserir o jogo. Se ele já existir (conflito no api_id),
    // não faça nada e apenas retorne o ID do jogo que já está no banco.
    // Esta é uma query poderosa e eficiente!
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

    // 4. Lógica "Upsert" para a avaliação:
    // Agora que temos o ID do jogo local, vamos inserir ou atualizar a avaliação.
    // Se o usuário já avaliou este jogo (conflito em usuario_id, jogo_id),
    // atualize a nota e o texto em vez de criar um novo registro.
    const reviewQuery = `
      INSERT INTO avaliacoes(usuario_id, jogo_id, nota, texto_review)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT(usuario_id, jogo_id) DO UPDATE SET
        nota = EXCLUDED.nota,
        texto_review = EXCLUDED.texto_review
      RETURNING *;
    `;
    const reviewResult = await db.query(reviewQuery, [userId, localGameId, rating, reviewText]);
    
    // 5. Enviar a avaliação criada/atualizada como resposta
    res.status(201).json(reviewResult.rows[0]);

  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    res.status(500).json({ error: 'Não foi possível salvar a avaliação.' });
  }
});


// ROTA PÚBLICA PARA BUSCAR TODAS AS AVALIAÇÕES DE UM JOGO
app.get('/reviews/game/:gameApiId', async (req, res) => {
  const { gameApiId } = req.params; // Pega o ID do jogo da URL

  try {
    // Esta query é mais complexa. Vamos quebrar o que ela faz:
    // 1. SELECT ...: Seleciona as colunas que queremos retornar.
    // 2. FROM avaliacoes: Começa pela tabela de avaliações.
    // 3. JOIN usuarios ON ...: Junta com a tabela de usuários para podermos pegar o nome do usuário.
    // 4. JOIN jogos ON ...: Junta com a tabela de jogos para podermos encontrar o jogo pelo api_id.
    // 5. WHERE jogos.api_id = $1: Filtra para trazer apenas as avaliações do jogo que queremos.
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


// ROTA PROTEGIDA PARA UM USUÁRIO BUSCAR SUAS PRÓPRIAS AVALIAÇÕES
app.get('/users/me/reviews', authenticateToken, async (req, res) => {
  // O middleware já verificou o token e nos deu o ID do usuário em req.user.userId
  const userId = req.user.userId;

  try {
    // Query que busca todas as avaliações de um usuário específico,
    // juntando com a tabela de jogos para trazer os detalhes do jogo.
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




// ROTA PÚBLICA PARA VER AS AVALIAÇÕES DE UM USUÁRIO ESPECÍFICO
app.get('/users/:userId/reviews', async (req, res) => {
  const { userId } = req.params; // Pega o ID do usuário da URL

  try {
    // A query é exatamente a mesma da rota '/users/me/reviews',
    // a única diferença é de onde pegamos o ID do usuário (dos parâmetros da URL).
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


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});