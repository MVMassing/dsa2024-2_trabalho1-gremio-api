class Partida {
    constructor(id, adversario, data, local, resultado = null, golsGremio = 0, golsAdversario = 0) {
      this.id = id;
      this.adversario = adversario;
      this.data = data;
      this.local = local;
      this.resultado = resultado;
      this.golsGremio = golsGremio;
      this.golsAdversario = golsAdversario;
    }
  
    registrarGols(golsGremio, golsAdversario) {
      this.golsGremio = golsGremio;
      this.golsAdversario = golsAdversario;
      this.resultado = `Grêmio ${golsGremio} - ${golsAdversario} ${this.adversario}`;
    }
  }
  
  module.exports = Partida;