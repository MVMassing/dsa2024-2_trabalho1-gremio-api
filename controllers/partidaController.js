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
    campos.push("adversario = $");
    valores.push(adversario);
  }
  if (data) {
    campos.push("data = $");
    valores.push(data);
  }
  if (local) {
    campos.push("local = $");
    valores.push(local);
  }

  if (campos.length === 0) {
    return res.status(400).json({ message: "Nenhum campo para atualização fornecido." });
  }

  valores.push(id);

  const camposQuery = campos.map((campo, index) => `${campo}${index + 1}`).join(", ")

  const query = `
    UPDATE partidas
    SET ${camposQuery}
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
  const { idJogador, gols, golsSofridos } = req.body; // golsSofridos pode ser informado isoladamente
  const { id } = req.params; // A partida ID vem pela URL, não pelo corpo

  const client = await pool.connect();

  try {
    // Inicia a transação
    await client.query('BEGIN');

    // Verificar se foi informado apenas idJogador ou apenas gols
    if ((idJogador && gols === undefined) || (gols !== undefined && !idJogador)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Se for declarar gols, deve informar o idJogador, e vice-versa.' });
    }

    // Se o idJogador for fornecido, atualizar os gols do jogador
    if (idJogador && gols !== undefined) {
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
    }

    // Verificar se a partida existe
    const partidaQuery = 'SELECT gols_marcados, gols_sofridos FROM partidas WHERE id = $1';
    const partidaResult = await client.query(partidaQuery, [id]);

    if (partidaResult.rows.length === 0) {
      await client.query('ROLLBACK');  // Se não encontrar a partida, faz o rollback da transação
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    // Atualizar os gols sofridos, se informado
    let golsSofridosFinal = golsSofridos;

    if (golsSofridos === undefined) {
      golsSofridosFinal = partidaResult.rows[0].gols_sofridos;
    }

    // Atualizar a partida com os gols sofridos
    const updatePartidaQuery = `
      UPDATE partidas
      SET gols_sofridos = $1
      WHERE id = $2
      RETURNING *;
    `;
    const partidaValues = [golsSofridosFinal, id];
    const updatePartidaResult = await client.query(updatePartidaQuery, partidaValues);

    if (updatePartidaResult.rows.length === 0) {
      await client.query('ROLLBACK');  // Se a atualização da partida falhar, faz o rollback
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    // Se foram fornecidos gols e idJogador, também atualizar os gols marcados na partida
    if (gols !== undefined && idJogador) {
      const updateGolsMarcadosQuery = `
        UPDATE partidas
        SET gols_marcados = COALESCE(gols_marcados, 0) + $1
        WHERE id = $2
        RETURNING *;
      `;
      const golsMarcadosValues = [gols, id];
      await client.query(updateGolsMarcadosQuery, golsMarcadosValues);
    }

    // Se todas as operações foram bem-sucedidas, faz o commit da transação
    await client.query('COMMIT');

    res.status(200).json({
      partidaAtualizada: updatePartidaResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');  // Em caso de erro, faz o rollback de todas as alterações
    res.status(500).json({ error: error.message });
  } finally {
    client.release(); 
  }
};