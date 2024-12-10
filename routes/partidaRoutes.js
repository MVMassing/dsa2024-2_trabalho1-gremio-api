const express = require("express")
const partidaController = require("../controllers/partidaController")
const router = express.Router()
const fs = require('fs');
const path = require('path');
const pool = require('../db'); // Ajuste o caminho para o arquivo de conexão com o banco de dados

router.post("/", partidaController.criarPartida)
router.get("/", partidaController.listarPartidas)
router.get("/:id", partidaController.buscarPartidaPorId)
router.put("/:id", partidaController.atualizarPartida)
router.delete("/:id", partidaController.deletarPartida)

router.put("/:id/gols", partidaController.registrarGols)

module.exports = router

// Rota temporária para popular o banco de partidas
router.post('/populate', async (req, res) => {
  try {
    const partidasPath = path.join(__dirname, '../data/partidas.json');
    const data = fs.readFileSync(partidasPath, 'utf-8');
    const partidas = JSON.parse(data);

    for (const partida of partidas) {
      const query = `
        INSERT INTO partidas (adversario, data, local, gols_marcados, gols_sofridos)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING; -- Evita duplicatas
      `;
      const values = [
        partida.adversario,
        partida.data,
        partida.local,
        partida.golsMarcados || 0,
        partida.golsSofridos || 0
      ];

      await pool.query(query, values);
    }

    res.status(201).json({ message: 'Partidas inseridas com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
