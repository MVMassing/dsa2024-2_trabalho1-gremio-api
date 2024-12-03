const express = require('express');
const cors = require('cors');
const jogadorRoutes = require('./routes/jogadorRoutes');
const partidaRoutes = require('./routes/partidaRoutes');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/jogadores', jogadorRoutes);
app.use('/api/partidas', partidaRoutes);

app.get('/', (req, res) => {
  // eslint-disable-next-line no-unused-vars
  res.send('Bem-vindo à API de Jogadores do Grêmio!');
});

// Criação automática das tabelas
const criarTabelas = async () => {
  const queryJogadores = `
    CREATE TABLE IF NOT EXISTS jogadores (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      posicao VARCHAR(50) NOT NULL,
      numero INTEGER NOT NULL,
      idade INTEGER NOT NULL,
      nacionalidade VARCHAR(50) NOT NULL,
      numGols INTEGER DEFAULT 0
    );
  `;
  const queryPartidas = `
    CREATE TABLE IF NOT EXISTS partidas (
      id SERIAL PRIMARY KEY,
      adversario VARCHAR(100) NOT NULL,
      data DATE NOT NULL,
      local VARCHAR(100) NOT NULL,
      gols_marcados INTEGER DEFAULT 0,
      gols_sofridos INTEGER DEFAULT 0
    );
  `;

  try {
    await pool.query(queryJogadores);
    await pool.query(queryPartidas);
    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
};

criarTabelas();

app.use((req, res) => {
  // eslint-disable-next-line no-unused-vars
 res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(port, () => {
console.log(`Servidor rodando em http://localhost:${port}`);
});
