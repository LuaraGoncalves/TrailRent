const Equipamento = require("../models/Equipamento");
const equipamentoRepository = require("../repositories/equipamentoRepository");
const conexao = require("../database/conexao");

async function testarCrud() {
  try {
    console.log("Iniciando teste de CRUD de equipamentos...");

    const equipamento = new Equipamento(
      "Lanterna de cabeca",
      "Lanterna leve para trilhas noturnas.",
      "Camping",
      "Leve",
      18.5,
      1,
      "2026-09-01",
      20
    );

    const idCriado = await equipamentoRepository.criar(equipamento);
    console.log("Inclusao funcionando. ID criado:", idCriado);

    const todos = await equipamentoRepository.listar();
    console.log("Consulta geral funcionando. Total encontrado:", todos.length);

    equipamento.preco = 20;
    equipamento.unidades = 18;
    await equipamentoRepository.alterar(idCriado, equipamento);
    console.log("Alteracao funcionando.");

    const equipamentoAlterado = await equipamentoRepository.buscarPorId(idCriado);
    console.log("Consulta por ID funcionando:", equipamentoAlterado);

    await equipamentoRepository.excluir(idCriado);
    console.log("Exclusao funcionando.");

    const equipamentoExcluido = await equipamentoRepository.buscarPorId(idCriado);
    console.log("Depois da exclusao, busca retornou:", equipamentoExcluido);
  } catch (erro) {
    console.error("Erro durante o teste:", erro.message);
  } finally {
    await conexao.end();
  }
}

testarCrud();
