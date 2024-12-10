const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const jogadorController = require('../controllers/jogadorController');
const router = express.Router();

router.post('/', jogadorController.criarJogador);
router.get('/', jogadorController.listarJogadores);
router.get('/:id', jogadorController.buscarJogadorPorId);
router.put('/:id', jogadorController.atualizarJogador);
router.delete('/:id', jogadorController.deletarJogador);

// Rota temporária para popular o banco
router.post('/populate', async (req, res) => {
    try {
      const jogadoresPath = path.join(__dirname, '../data/jogadores.json');
      const data = fs.readFileSync(jogadoresPath, 'utf-8');
      const jogadores = JSON.parse(data);
  
      for (const jogador of jogadores) {
        const query = `
          INSERT INTO jogadores (nome, posicao, numero, idade, nacionalidade, numGols)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING; -- Evita duplicatas
        `;
        const values = [
          jogador.nome,
          jogador.posicao,
          jogador.numero,
          jogador.idade,
          jogador.nacionalidade,
          jogador.numGols || 0,
        ];
  
        await pool.query(query, values);
      }
  
      res.status(201).json({ message: 'Jogadores inseridos com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
