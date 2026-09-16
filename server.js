const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const equipamentoRepository = require("./repositories/equipamentoRepository");

const porta = 3000;
const usuarioCorreto = "aluno";
const senhaCorreta = "1234";

function lerArquivo(caminho) {
  return fs.readFileSync(path.join(__dirname, caminho), "utf8");
}

function enviar(res, status, conteudo, tipo) {
  res.writeHead(status, { "Content-Type": tipo });
  res.end(conteudo);
}

function redirecionar(res, caminho) {
  res.writeHead(302, { Location: caminho });
  res.end();
}

function estaLogado(req) {
  return req.headers.cookie && req.headers.cookie.includes("logado=sim");
}

function pegarCorpo(req, callback) {
  let dados = "";

  req.on("data", parte => {
    dados += parte;
  });

  req.on("end", () => {
    callback(querystring.parse(dados));
  });
}

function formatarPreco(valor) {
  return Number(valor).toFixed(2).replace(".", ",");
}

function enviarErroBanco(res) {
  enviar(
    res,
    500,
    "<h1>Erro ao acessar o banco de dados</h1><p>Confira se o MySQL esta ligado e se a base trailrent foi criada.</p>",
    "text/html; charset=utf-8"
  );
}

async function paginaInicial(res) {
  try {
    const equipamentos = await equipamentoRepository.listar();
    let html = lerArquivo("views/index.html");
    let cards = "";

    equipamentos.forEach(equipamento => {
      cards += `
        <article class="card">
          <h2>${equipamento.nome}</h2>
          <p><strong>Retirada:</strong> ${equipamento.retirada}</p>
          <p><strong>Mínimo:</strong> ${equipamento.minimo} dia(s)</p>
          <p><strong>Diária:</strong> R$ ${formatarPreco(equipamento.preco)}</p>
          <a class="botao" href="/equipamento/${equipamento.id}">Ver detalhes</a>
        </article>
      `;
    });

    html = html.replace("{{equipamentos}}", cards);
    enviar(res, 200, html, "text/html; charset=utf-8");
  } catch (erro) {
    console.error("Erro ao listar equipamentos:", erro.message);
    enviarErroBanco(res);
  }
}

function paginaLogin(res, mensagem, next) {
  let html = lerArquivo("views/login.html");
  html = html.replace("{{mensagem}}", mensagem || "");
  html = html.replace("{{next}}", next || "/");
  enviar(res, 200, html, "text/html; charset=utf-8");
}

async function paginaDetalhes(req, res, id) {
  if (!estaLogado(req)) {
    redirecionar(res, "/login?next=/equipamento/" + id);
    return;
  }

  try {
    const equipamento = await equipamentoRepository.buscarPorId(id);

    if (!equipamento) {
      enviar(res, 404, "<h1>Equipamento não encontrado</h1>", "text/html; charset=utf-8");
      return;
    }

    let html = lerArquivo("views/detalhes.html");
    html = html.replaceAll("{{nome}}", equipamento.nome);
    html = html.replace("{{descricao}}", equipamento.descricao);
    html = html.replace("{{categoria}}", equipamento.categoria);
    html = html.replace("{{nivel}}", equipamento.nivel);
    html = html.replace("{{preco}}", formatarPreco(equipamento.preco));
    html = html.replace("{{precoValor}}", equipamento.preco);
    html = html.replace("{{unidades}}", equipamento.unidades);
    html = html.replace("{{minimo}}", equipamento.minimo);

    enviar(res, 200, html, "text/html; charset=utf-8");
  } catch (erro) {
    console.error("Erro ao buscar equipamento:", erro.message);
    enviarErroBanco(res);
  }
}

function arquivoPublico(res, caminho) {
  const arquivo = path.join(__dirname, "public", caminho);

  if (!fs.existsSync(arquivo)) {
    enviar(res, 404, "Arquivo não encontrado", "text/plain; charset=utf-8");
    return;
  }

  const extensao = path.extname(arquivo);
  const tipos = {
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8"
  };

  enviar(res, 200, fs.readFileSync(arquivo), tipos[extensao] || "text/plain; charset=utf-8");
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:" + porta);

  if (req.method === "GET" && url.pathname === "/") {
    paginaInicial(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/login") {
    paginaLogin(res, "", url.searchParams.get("next"));
    return;
  }

  if (req.method === "POST" && url.pathname === "/login") {
    pegarCorpo(req, dados => {
      if (dados.usuario === usuarioCorreto && dados.senha === senhaCorreta) {
        res.writeHead(302, {
          Location: dados.next || "/",
          "Set-Cookie": "logado=sim; HttpOnly; Path=/"
        });
        res.end();
      } else {
        paginaLogin(res, "Usuário ou senha inválidos.", dados.next);
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/sair") {
    res.writeHead(302, {
      Location: "/",
      "Set-Cookie": "logado=; Max-Age=0; Path=/"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/equipamento/")) {
    paginaDetalhes(req, res, url.pathname.split("/")[2]);
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/public/")) {
    arquivoPublico(res, url.pathname.replace("/public/", ""));
    return;
  }

  enviar(res, 404, "<h1>Página não encontrada</h1>", "text/html; charset=utf-8");
});

servidor.listen(porta, () => {
  console.log("Servidor rodando em http://localhost:" + porta);
});
