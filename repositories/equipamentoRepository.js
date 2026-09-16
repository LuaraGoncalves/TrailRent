const conexao = require("../database/conexao");

function formatarDataRetirada(valor) {
  if (!valor) {
    return "";
  }

  const data = valor instanceof Date ? valor : new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function normalizarEquipamento(equipamento) {
  return {
    ...equipamento,
    preco: Number(equipamento.preco),
    retirada: formatarDataRetirada(equipamento.retirada)
  };
}

async function listar() {
  const [linhas] = await conexao.query(
    "SELECT * FROM equipamentos ORDER BY id"
  );

  return linhas.map(normalizarEquipamento);
}

async function buscarPorId(id) {
  const [linhas] = await conexao.query(
    "SELECT * FROM equipamentos WHERE id = ?",
    [id]
  );

  if (linhas.length === 0) {
    return null;
  }

  return normalizarEquipamento(linhas[0]);
}

async function criar(equipamento) {
  const [resultado] = await conexao.query(
    `INSERT INTO equipamentos
    (nome, descricao, categoria, nivel, preco, minimo, retirada, unidades)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      equipamento.nome,
      equipamento.descricao,
      equipamento.categoria,
      equipamento.nivel,
      equipamento.preco,
      equipamento.minimo,
      equipamento.retirada,
      equipamento.unidades
    ]
  );

  return resultado.insertId;
}

async function alterar(id, equipamento) {
  const [resultado] = await conexao.query(
    `UPDATE equipamentos
    SET nome = ?, descricao = ?, categoria = ?, nivel = ?,
        preco = ?, minimo = ?, retirada = ?, unidades = ?
    WHERE id = ?`,
    [
      equipamento.nome,
      equipamento.descricao,
      equipamento.categoria,
      equipamento.nivel,
      equipamento.preco,
      equipamento.minimo,
      equipamento.retirada,
      equipamento.unidades,
      id
    ]
  );

  return resultado.affectedRows;
}

async function excluir(id) {
  const [resultado] = await conexao.query(
    "DELETE FROM equipamentos WHERE id = ?",
    [id]
  );

  return resultado.affectedRows;
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  alterar,
  excluir
};
