const pool = require('../server');

exports.criarJogador = async (req, res) => {
  const { nome, posicao, numero, idade, nacionalidade, numGols = 0 } = req.body;

  try {
    const query = `
      INSERT INTO jogadores (nome, posicao, numero, idade, nacionalidade, numgols)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [nome, posicao, numero, idade, nacionalidade, numGols];
    const { rows } = await pool.query(query, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    //TESTE ERRO
    if (error.code === '23505') { 
      return res.status(400).json({ error: 'Jogador já existe.' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.listarJogadores = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM jogadores;");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.buscarJogadorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query("SELECT * FROM jogadores WHERE id = $1;", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Jogador não encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.atualizarJogador = async (req, res) => {
  const { id } = req.params;
  const { nome, posicao, numero, idade, nacionalidade } = req.body;

  try {
    const query = `
      UPDATE jogadores
      SET nome = $1, posicao = $2, numero = $3, idade = $4, nacionalidade = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [nome, posicao, numero, idade, nacionalidade, id];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jogador não encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletarJogador = async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM jogadores WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Jogador não encontrado" });
    }

    res.status(200).json({ message: "Jogador deletado com sucesso", jogador: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
