const partidas = []
let currentId = 1
const jogadores = require("../data/jogadores.json")

exports.criarPartida = (req, res) => {
  const { adversario, data, local } = req.body
  const novaPartida = {
    id: currentId++,
    adversario,
    data,
    local,
    golsGremio: 0,
    golsAdversario: 0,
    resultado: null,
    golsDe: [],
  }
  partidas.push(novaPartida)
  res.status(201).json(novaPartida)
}

exports.listarPartidas = (req, res) => {
  res.status(200).json(partidas)
}

exports.buscarPartidaPorId = (req, res) => {
  const { id } = req.params
  const partida = partidas.find((p) => p.id === parseInt(id))
  if (!partida) {
    return res.status(404).json({ message: "Partida não encontrada" })
  }
  res.status(200).json(partida)
}

exports.atualizarPartida = (req, res) => {
  const { id } = req.params
  const partida = partidas.find((p) => p.id === parseInt(id))
  if (!partida) {
    return res.status(404).json({ message: "Partida não encontrada" })
  }
  const { adversario, data, local } = req.body
  partida.adversario = adversario
  partida.data = data
  partida.local = local
  res.status(200).json(partida)
}

exports.deletarPartida = (req, res) => {
  const { id } = req.params;
  const partidaIndex = partidas.findIndex((p) => p.id === parseInt(id));

  if (partidaIndex === -1) {
    return res.status(404).json({ message: "Partida não encontrada" });
  }
  
  partidas.splice(partidaIndex, 1);

  return res.status(204).send(); 
}


exports.registrarGols = (req, res) => {
  const { id } = req.params

  const partida = partidas.find((p) => p.id === parseInt(id))
  if (!partida) {
    return res.status(404).json({ message: "Partida não encontrada" })
  }

  const { isGremio, idJogador = null, gols } = req.body

  if (isGremio && idJogador == null)
    return res.json({ message: "Por favor, informe o id do jogador" })

  const jogador = jogadores.find((j) => j.id === parseInt(idJogador))
  if (isGremio == true && !jogador) {
    return res.status(404).json({ message: "Jogador não encontrado" })
  }

  if (isGremio) {
    partida.golsGremio += gols
    for (let i = 0; i < gols; i++) partida.golsDe.push(jogador.nome)
    jogador.numGols += gols
  } else {
    partida.golsAdversario += gols
    for (let i = 0; i < gols; i++) partida.golsDe.push("Adversário")
  }

  partida.resultado = `Grêmio ${partida.golsGremio} - ${partida.golsAdversario} ${partida.adversario}`
  res.status(200).json(partida)
}
