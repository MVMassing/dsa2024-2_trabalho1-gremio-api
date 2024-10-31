const jogadores = require("../data/jogadores.json")
let currentId = 12

exports.criarJogador = (req, res) => {
  const { nome, posicao, numero, idade, nacionalidade, numGols = 0 } = req.body
  const novoJogador = {
    id: currentId++,
    nome,
    posicao,
    numero,
    idade,
    nacionalidade,
    numGols,
  }
  jogadores.push(novoJogador)
  res.status(201).json(novoJogador)
}

exports.listarJogadores = (req, res) => {
  res.status(200).json(jogadores)
}

exports.buscarJogadorPorId = (req, res) => {
  const { id } = req.params
  const jogador = jogadores.find((j) => j.id === parseInt(id))
  if (!jogador) {
    return res.status(404).json({ message: "Jogador não encontrado" })
  }
  res.status(200).json(jogador)
}

exports.atualizarJogador = (req, res) => {
  const { id } = req.params
  const { nome, posicao, numero, idade, nacionalidade } = req.body
  const jogador = jogadores.find((j) => j.id === parseInt(id))
  if (!jogador) {
    return res.status(404).json({ message: "Jogador não encontrado" })
  }
  jogador.nome = nome
  jogador.posicao = posicao
  jogador.numero = numero
  jogador.idade = idade
  jogador.nacionalidade = nacionalidade
  res.status(200).json(jogador)
}

exports.deletarJogador = (req, res) => {
  const { id } = req.params
  const index = jogadores.findIndex((j) => j.id === parseInt(id))
  if (index === -1) {
    return res.status(404).json({ message: "Jogador não encontrado" })
  }
  jogadores.splice(index, 1)
  res.status(204).send()
}
