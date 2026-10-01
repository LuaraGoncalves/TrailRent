const Equipamento = require("../models/Equipamento");
const equipamentoRepository = require("../repositories/equipamentoRepository");

function enviarJson(res, status, dados) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(dados));
}

function dadosInvalidos(dados) {
  return !dados.nome ||
    !dados.descricao ||
    !dados.categoria ||
    !dados.nivel ||
    dados.preco === undefined ||
    Number(dados.preco) <= 0 ||
    dados.minimo === undefined ||
    Number(dados.minimo) < 1 ||
    !dados.retirada ||
    dados.unidades === undefined ||
    Number(dados.unidades) < 0;
}

function montarEquipamento(dados) {
  return new Equipamento(
    dados.nome,
    dados.descricao,
    dados.categoria,
    dados.nivel,
    Number(dados.preco),
    Number(dados.minimo),
    dados.retirada,
    Number(dados.unidades)
  );
}

async function listar(req, res) {
  try {
    const equipamentos = await equipamentoRepository.listar();
    enviarJson(res, 200, equipamentos);
  } catch (erro) {
    enviarJson(res, 500, { mensagem: "Erro ao listar equipamentos" });
  }
}

async function buscar(req, res, id) {
  try {
    const equipamento = await equipamentoRepository.buscarPorId(id);

    if (!equipamento) {
      enviarJson(res, 404, { mensagem: "Equipamento nao encontrado" });
      return;
    }

    enviarJson(res, 200, equipamento);
  } catch (erro) {
    enviarJson(res, 500, { mensagem: "Erro ao buscar equipamento" });
  }
}

async function criar(req, res, dados) {
  try {
    if (dadosInvalidos(dados)) {
      enviarJson(res, 400, { mensagem: "Preencha todos os campos" });
      return;
    }

    const equipamento = montarEquipamento(dados);
    const id = await equipamentoRepository.criar(equipamento);
    const equipamentoCriado = await equipamentoRepository.buscarPorId(id);

    enviarJson(res, 201, equipamentoCriado);
  } catch (erro) {
    enviarJson(res, 500, { mensagem: "Erro ao cadastrar equipamento" });
  }
}

async function alterar(req, res, id, dados) {
  try {
    if (dadosInvalidos(dados)) {
      enviarJson(res, 400, { mensagem: "Preencha todos os campos" });
      return;
    }

    const equipamento = montarEquipamento(dados);
    const linhasAlteradas = await equipamentoRepository.alterar(id, equipamento);

    if (linhasAlteradas === 0) {
      enviarJson(res, 404, { mensagem: "Equipamento nao encontrado" });
      return;
    }

    const equipamentoAlterado = await equipamentoRepository.buscarPorId(id);
    enviarJson(res, 200, equipamentoAlterado);
  } catch (erro) {
    enviarJson(res, 500, { mensagem: "Erro ao alterar equipamento" });
  }
}

async function excluir(req, res, id) {
  try {
    const linhasExcluidas = await equipamentoRepository.excluir(id);

    if (linhasExcluidas === 0) {
      enviarJson(res, 404, { mensagem: "Equipamento nao encontrado" });
      return;
    }

    enviarJson(res, 200, { mensagem: "Equipamento excluido com sucesso" });
  } catch (erro) {
    enviarJson(res, 500, { mensagem: "Erro ao excluir equipamento" });
  }
}

module.exports = {
  listar,
  buscar,
  criar,
  alterar,
  excluir
};
