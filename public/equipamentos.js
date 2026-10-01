const formulario = document.getElementById("form-equipamento");
const mensagem = document.getElementById("mensagem");
const corpoTabela = document.getElementById("corpo-tabela");
const contador = document.getElementById("contador");
const tituloFormulario = document.getElementById("titulo-formulario");
const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelar = document.getElementById("botao-cancelar");
const botaoRecarregar = document.getElementById("botao-recarregar");

const campos = {
  id: document.getElementById("equipamento-id"),
  nome: document.getElementById("nome"),
  descricao: document.getElementById("descricao"),
  categoria: document.getElementById("categoria"),
  nivel: document.getElementById("nivel"),
  preco: document.getElementById("preco"),
  minimo: document.getElementById("minimo"),
  retirada: document.getElementById("retirada"),
  unidades: document.getElementById("unidades")
};

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem " + tipo;
}

function limparMensagem() {
  mensagem.textContent = "";
  mensagem.className = "mensagem";
}

function dataParaInput(valor) {
  if (!valor) {
    return "";
  }

  if (valor.includes("/")) {
    const partes = valor.split("/");
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }

  return valor.slice(0, 10);
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function validarDados(dados) {
  if (!dados.nome.trim()) {
    return "Informe o nome do equipamento.";
  }

  if (!dados.descricao.trim()) {
    return "Informe a descrição do equipamento.";
  }

  if (!dados.categoria.trim()) {
    return "Informe a categoria.";
  }

  if (!dados.nivel) {
    return "Selecione o nível físico.";
  }

  if (Number.isNaN(dados.preco) || dados.preco <= 0) {
    return "Informe um preço por diária maior que zero.";
  }

  if (Number.isNaN(dados.minimo) || dados.minimo < 1) {
    return "Informe um período mínimo de pelo menos 1 dia.";
  }

  if (!dados.retirada) {
    return "Informe a data disponível para retirada.";
  }

  if (Number.isNaN(dados.unidades) || dados.unidades < 0) {
    return "Informe uma quantidade de unidades válida.";
  }

  return "";
}

function lerDadosFormulario() {
  return {
    nome: campos.nome.value.trim(),
    descricao: campos.descricao.value.trim(),
    categoria: campos.categoria.value.trim(),
    nivel: campos.nivel.value,
    preco: Number(campos.preco.value),
    minimo: Number(campos.minimo.value),
    retirada: campos.retirada.value,
    unidades: Number(campos.unidades.value)
  };
}

function preencherFormulario(equipamento) {
  campos.id.value = equipamento.id;
  campos.nome.value = equipamento.nome;
  campos.descricao.value = equipamento.descricao;
  campos.categoria.value = equipamento.categoria;
  campos.nivel.value = equipamento.nivel;
  campos.preco.value = equipamento.preco;
  campos.minimo.value = equipamento.minimo;
  campos.retirada.value = dataParaInput(equipamento.retirada);
  campos.unidades.value = equipamento.unidades;

  tituloFormulario.textContent = "Editar equipamento #" + equipamento.id;
  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.style.display = "inline-block";
  limparMensagem();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function limparFormulario() {
  formulario.reset();
  campos.id.value = "";
  tituloFormulario.textContent = "Novo equipamento";
  botaoSalvar.textContent = "Cadastrar equipamento";
  botaoCancelar.style.display = "none";
}

function renderizarTabela(equipamentos) {
  contador.textContent = `${equipamentos.length} registro${equipamentos.length === 1 ? "" : "s"}`;

  if (equipamentos.length === 0) {
    corpoTabela.innerHTML = `
      <tr>
        <td colspan="8">Nenhum equipamento cadastrado.</td>
      </tr>
    `;
    return;
  }

  corpoTabela.innerHTML = equipamentos.map(equipamento => `
    <tr>
      <td>${equipamento.id}</td>
      <td>
        <strong>${equipamento.nome}</strong>
        <span>${equipamento.descricao}</span>
      </td>
      <td>${equipamento.categoria}</td>
      <td>${equipamento.nivel}</td>
      <td>${formatarMoeda(equipamento.preco)}</td>
      <td>${equipamento.retirada}</td>
      <td>${equipamento.unidades}</td>
      <td class="acoes-tabela">
        <button class="botao pequeno" type="button" data-acao="editar" data-id="${equipamento.id}">Editar</button>
        <button class="botao pequeno perigo" type="button" data-acao="excluir" data-id="${equipamento.id}">Excluir</button>
      </td>
    </tr>
  `).join("");
}

async function carregarEquipamentos() {
  try {
    const resposta = await fetch("/equipamentos");
    const equipamentos = await resposta.json();

    if (!resposta.ok) {
      throw new Error(equipamentos.mensagem || "Erro ao consultar equipamentos.");
    }

    renderizarTabela(equipamentos);
  } catch (erro) {
    corpoTabela.innerHTML = `
      <tr>
        <td colspan="8">Não foi possível carregar os equipamentos.</td>
      </tr>
    `;
    mostrarMensagem(erro.message, "erro");
  }
}

async function salvarEquipamento(evento) {
  evento.preventDefault();

  const dados = lerDadosFormulario();
  const erroValidacao = validarDados(dados);

  if (erroValidacao) {
    mostrarMensagem(erroValidacao, "erro");
    return;
  }

  const id = campos.id.value;
  const editando = Boolean(id);
  const url = editando ? `/equipamentos/${id}` : "/equipamentos";
  const metodo = editando ? "PUT" : "POST";

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.mensagem || "Não foi possível salvar o equipamento.");
    }

    mostrarMensagem(editando ? "Equipamento atualizado com sucesso." : "Equipamento cadastrado com sucesso.", "sucesso");
    limparFormulario();
    await carregarEquipamentos();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

async function editarEquipamento(id) {
  try {
    const resposta = await fetch(`/equipamentos/${id}`);
    const equipamento = await resposta.json();

    if (!resposta.ok) {
      throw new Error(equipamento.mensagem || "Equipamento não encontrado.");
    }

    preencherFormulario(equipamento);
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

async function excluirEquipamento(id) {
  const confirmou = window.confirm("Deseja excluir este equipamento?");

  if (!confirmou) {
    return;
  }

  try {
    const resposta = await fetch(`/equipamentos/${id}`, {
      method: "DELETE"
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.mensagem || "Não foi possível excluir o equipamento.");
    }

    mostrarMensagem("Equipamento excluído com sucesso.", "sucesso");
    limparFormulario();
    await carregarEquipamentos();
  } catch (erro) {
    mostrarMensagem(erro.message, "erro");
  }
}

corpoTabela.addEventListener("click", evento => {
  const botao = evento.target.closest("button");

  if (!botao) {
    return;
  }

  const id = botao.dataset.id;

  if (botao.dataset.acao === "editar") {
    editarEquipamento(id);
  }

  if (botao.dataset.acao === "excluir") {
    excluirEquipamento(id);
  }
});

formulario.addEventListener("submit", salvarEquipamento);

botaoCancelar.addEventListener("click", () => {
  limparFormulario();
  limparMensagem();
});

botaoRecarregar.addEventListener("click", carregarEquipamentos);

limparFormulario();
carregarEquipamentos();
