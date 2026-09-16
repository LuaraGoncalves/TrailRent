class Equipamento {
  constructor(nome, descricao, categoria, nivel, preco, minimo, retirada, unidades) {
    this.nome = nome;
    this.descricao = descricao;
    this.categoria = categoria;
    this.nivel = nivel;
    this.preco = preco;
    this.minimo = minimo;
    this.retirada = retirada;
    this.unidades = unidades;
  }
}

module.exports = Equipamento;
