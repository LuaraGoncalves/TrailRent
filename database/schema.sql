CREATE DATABASE IF NOT EXISTS trailrent;

USE trailrent;

CREATE TABLE IF NOT EXISTS equipamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  nivel VARCHAR(50) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  minimo INT NOT NULL,
  retirada DATE NOT NULL,
  unidades INT NOT NULL
);

INSERT INTO equipamentos
(id, nome, retirada, minimo, preco, categoria, nivel, unidades, descricao)
VALUES
(1, 'Barraca para 4 pessoas', '2026-08-22', 2, 45.00, 'Camping', 'Leve', 8, 'Barraca resistente para camping em familia ou grupo pequeno. Possui boa ventilacao, protecao contra chuva e montagem simples.'),
(2, 'Mochila cargueira 60L', '2026-08-23', 1, 28.00, 'Trilha', 'Moderado', 12, 'Mochila grande para trilhas longas, com alcas acolchoadas, regulagem no quadril e espaco para roupas, comida e acessorios.'),
(3, 'Bicicleta mountain bike', '2026-08-25', 1, 75.00, 'Trilha', 'Intenso', 5, 'Bicicleta preparada para terrenos irregulares, com suspensao dianteira, marchas e pneus proprios para aventura.'),
(4, 'Kit de rapel', '2026-08-26', 2, 90.00, 'Escalada', 'Intenso', 4, 'Kit com capacete, cadeirinha, mosquetoes e corda para pratica de rapel com acompanhamento adequado.'),
(5, 'Canoa individual', '2026-08-28', 1, 110.00, 'Esporte aquatico', 'Moderado', 3, 'Canoa individual para passeios em rios calmos e lagos. Acompanha remo e colete salva-vidas.'),
(6, 'Fogareiro portatil', '2026-08-24', 1, 22.00, 'Camping', 'Leve', 10, 'Fogareiro compacto para preparar refeicoes durante acampamentos. Facil de transportar e usar em areas abertas.')
ON DUPLICATE KEY UPDATE
nome = VALUES(nome),
retirada = VALUES(retirada),
minimo = VALUES(minimo),
preco = VALUES(preco),
categoria = VALUES(categoria),
nivel = VALUES(nivel),
unidades = VALUES(unidades),
descricao = VALUES(descricao);
