const equipamentoController = require("../controllers/equipamentoController");

function receberJson(req) {
  return new Promise((resolve, reject) => {
    let corpo = "";

    req.on("data", parte => {
      corpo += parte;
    });

    req.on("end", () => {
      if (!corpo) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(corpo));
      } catch (erro) {
        reject(erro);
      }
    });
  });
}

function enviarJson(res, status, dados) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(dados));
}

async function equipamentoRoutes(req, res, url) {
  const partes = url.pathname.split("/").filter(Boolean);

  if (partes[0] !== "equipamentos") {
    return false;
  }

  try {
    if (partes.length === 1 && req.method === "GET") {
      await equipamentoController.listar(req, res);
      return true;
    }

    if (partes.length === 2 && req.method === "GET") {
      await equipamentoController.buscar(req, res, partes[1]);
      return true;
    }

    if (partes.length === 1 && req.method === "POST") {
      const dados = await receberJson(req);
      await equipamentoController.criar(req, res, dados);
      return true;
    }

    if (partes.length === 2 && req.method === "PUT") {
      const dados = await receberJson(req);
      await equipamentoController.alterar(req, res, partes[1], dados);
      return true;
    }

    if (partes.length === 2 && req.method === "DELETE") {
      await equipamentoController.excluir(req, res, partes[1]);
      return true;
    }

    enviarJson(res, 405, { mensagem: "Metodo nao permitido" });
    return true;
  } catch (erro) {
    enviarJson(res, 400, { mensagem: "JSON invalido" });
    return true;
  }
}

module.exports = equipamentoRoutes;
