const pool = require("../db")

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
  const { adversario, data, local } = req.body;

  const campos = [];
  const valores = [];

  if (adversario) {
    campos.push("adversario = $1");
    valores.push(adversario);
  }
  if (data) {
    campos.push("data = $2");
    valores.push(data);
  }
  if (local) {
    campos.push("local = $3");
    valores.push(local);
  }

  if (campos.length === 0) {
    return res.status(400).json({ message: "Nenhum campo para atualização fornecido." });
  }

  valores.push(id);

  const query = `
    UPDATE partidas
    SET ${campos.join(", ")}
    WHERE id = $${valores.length}
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(query, valores);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Partida não encontrada" });
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
  const { idJogador, gols, golsSofridos } = req.body;
  const { id } = req.params; // A partida ID vem pela URL, não pelo corpo

  const client = await pool.connect();

  try {
    // Inicia a transação
    await client.query('BEGIN');

    // Atualizar gols do jogador
    const jogadorQuery = `
      UPDATE jogadores
      SET numGols = numGols + $1
      WHERE id = $2
      RETURNING *;
    `;
    const jogadorValues = [gols, idJogador];
    const jogadorResult = await client.query(jogadorQuery, jogadorValues);

    if (jogadorResult.rows.length === 0) {
      await client.query('ROLLBACK');  // Se não encontrar o jogador, faz o rollback da transação
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    // Define gols_sofridos com valor 0 se não for informado e se não houver valor maior que 0 já registrado
    const partidaQuery = 'SELECT gols_sofridos FROM partidas WHERE id = $1';
    const partidaResult = await client.query(partidaQuery, [id]);

    if (partidaResult.rows.length === 0) {
      await client.query('ROLLBACK');  // Se não encontrar a partida, faz o rollback da transação
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    let golsSofridosFinal = golsSofridos;

    // Se gols_sofridos não foi fornecido, mas já existem gols sofridos maiores que 0 na partida, mantem esse valor
    if (golsSofridos === undefined && partidaResult.rows[0].gols_sofridos > 0) {
      golsSofridosFinal = partidaResult.rows[0].gols_sofridos;
    } else if (golsSofridos === undefined) {
      golsSofridosFinal = 0;  // Se não foi informado e não havia gols sofridos antes, define como 0
    }

    // Atualizar gols na partida
    const updatePartidaQuery = `
      UPDATE partidas
      SET gols_marcados = COALESCE(gols_marcados, 0) + $1, gols_sofridos = $2
      WHERE id = $3
      RETURNING *;
    `;
    const partidaValues = [gols, golsSofridosFinal, id];
    const updatePartidaResult = await client.query(updatePartidaQuery, partidaValues);

    if (updatePartidaResult.rows.length === 0) {
      await client.query('ROLLBACK');  // Se a atualização da partida falhar, faz o rollback
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    // Se todas as operações foram bem-sucedidas, faz o commit da transação
    await client.query('COMMIT');

    res.status(200).json({
      jogadorAtualizado: jogadorResult.rows[0],
      partidaAtualizada: updatePartidaResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');  // Em caso de erro, faz o rollback de todas as alterações
    res.status(500).json({ error: error.message });
  } finally {
    client.release(); 
  }
};

