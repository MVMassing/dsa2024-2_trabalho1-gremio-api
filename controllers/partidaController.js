const partidas = [];
let currentId = 1;

exports.criarPartida = (req, res) => {
  const { adversario, data, local } = req.body;
  const novaPartida = {
    id: currentId++,
    adversario,
    data,
    local,
    golsGremio: 0,
    golsAdversario: 0,
    resultado: null
  };
  partidas.push(novaPartida);
  res.status(201).json(novaPartida);
};

exports.listarPartidas = (req, res) => {
  res.status(200).json(partidas);
};

exports.registrarGols = (req, res) => {
  const { id } = req.params;
  const { golsGremio, golsAdversario } = req.body;
  const partida = partidas.find(p => p.id === parseInt(id));
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada' });
  }
  partida.golsGremio = golsGremio;
  partida.golsAdversario = golsAdversario;
  partida.resultado = `Grêmio ${golsGremio} - ${golsAdversario} ${partida.adversario}`;
  res.status(200).json(partida);
};

exports.buscarPartidaPorId = (req, res) => {
  const { id } = req.params;
  const partida = partidas.find(p => p.id === parseInt(id));
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada' });
  }
  res.status(200).json(partida);
};

exports.atualizarPartida = (req, res) => {
  const { id } = req.params;
  const partida = partidas.find(p => p.id === parseInt(id));
  if (!partida) {
    return res.status(404).json({ message: 'Partida não encontrada' });
  }
  const { adversario, data, local } = req.body;
  partida.adversario = adversario;
  partida.data = data;
  partida.local = local;
  res.status(200).json(partida);
};

exports.deletarPartida = (req, res) => {
  const { id } = req.params;
  const partidaIndex = partidas.findIndex(p => p.id === parseInt(id));
  if (partidaIndex === -1) {
    return res.status(404).json({ message: 'Partida não encontrada' });
  }
  partidas.splice(partidaIndex, 1);
  res.status(204).send();
};