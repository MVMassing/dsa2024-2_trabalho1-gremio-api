const pool = require('../db');

exports.criarPartida = async (req, res) => {
  const { adversario, data, local, golsMarcados, golsSofridos } = req.body;

  try {
    const query = `
      INSERT INTO partidas (adversario, data, local, gols_marcados, gols_sofridos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [adversario, data, local, golsMarcados, golsSofridos];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listarPartidas = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM partidas');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarPartidaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM partidas WHERE id = $1';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.atualizarPartida = async (req, res) => {
  const { id } = req.params;
  const { adversario, data, local, golsMarcados, golsSofridos } = req.body;

  try {
    const query = `
      UPDATE partidas
      SET adversario = $1, data = $2, local = $3, gols_marcados = $4, gols_sofridos = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [adversario, data, local, golsMarcados, golsSofridos, id];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletarPartida = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM partidas WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    res.status(200).json({ message: 'Partida deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registrarGols = async (req, res) => {
  const { idJogador, idPartida, gols } = req.body;

  try {
    // Atualizar gols do jogador
    const jogadorQuery = `
      UPDATE jogadores
      SET numgols = numgols + $1
      WHERE id = $2
      RETURNING *;
    `;
    const jogadorValues = [gols, idJogador];
    const jogadorResult = await pool.query(jogadorQuery, jogadorValues);

    if (jogadorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    // Registrar gols na partida
    const partidaQuery = `
      UPDATE partidas
      SET gols_marcados = gols_marcados + $1
      WHERE id = $2
      RETURNING *;
    `;
    const partidaValues = [gols, idPartida];
    const partidaResult = await pool.query(partidaQuery, partidaValues);

    if (partidaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    res.status(200).json({
      jogadorAtualizado: jogadorResult.rows[0],
      partidaAtualizada: partidaResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};