-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 15/09/2026 às 12:14
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `laboratory_observer`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(10) UNSIGNED NOT NULL,
  `produto_id` int(10) UNSIGNED NOT NULL,
  `quantidade` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `cliente_nome` varchar(160) NOT NULL,
  `cliente_email` varchar(180) NOT NULL,
  `cliente_telefone` varchar(30) DEFAULT NULL,
  `status` enum('CRIADO','PROCESSANDO','ENVIADO','ENTREGUE','CANCELADO') NOT NULL DEFAULT 'CRIADO',
  `criado_por` int(10) UNSIGNED NOT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `pedidos`
--

INSERT INTO `pedidos` (`id`, `produto_id`, `quantidade`, `cliente_nome`, `cliente_email`, `cliente_telefone`, `status`, `criado_por`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 1, 'Thiago', 'lucasslimalica@gmail.com', NULL, 'CANCELADO', 1, '2026-09-12 22:25:30', '2026-09-12 22:26:38'),
(2, 1, 1, 'Maria', 'lucasslimalica@gmail.com', NULL, 'CANCELADO', 1, '2026-09-12 23:02:07', '2026-09-12 23:02:30'),
(3, 1, 1, 'Douglas', 'lucasslimalica@gmail.com', NULL, 'ENVIADO', 1, '2026-09-15 02:18:04', '2026-09-15 02:40:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedido_status_historico`
--

CREATE TABLE `pedido_status_historico` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pedido_id` int(10) UNSIGNED NOT NULL,
  `status_anterior` varchar(30) DEFAULT NULL,
  `status_novo` varchar(30) NOT NULL,
  `alterado_por` int(10) UNSIGNED NOT NULL,
  `alterado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `pedido_status_historico`
--

INSERT INTO `pedido_status_historico` (`id`, `pedido_id`, `status_anterior`, `status_novo`, `alterado_por`, `alterado_em`) VALUES
(1, 1, 'CRIADO', 'PROCESSANDO', 1, '2026-09-12 22:26:00'),
(2, 1, 'PROCESSANDO', 'ENVIADO', 1, '2026-09-12 22:26:14'),
(3, 1, 'ENVIADO', 'ENTREGUE', 1, '2026-09-12 22:26:33'),
(4, 1, 'ENTREGUE', 'CANCELADO', 1, '2026-09-12 22:26:38'),
(5, 2, 'CRIADO', 'PROCESSANDO', 1, '2026-09-12 23:02:11'),
(6, 2, 'PROCESSANDO', 'ENVIADO', 1, '2026-09-12 23:02:20'),
(7, 2, 'ENVIADO', 'ENTREGUE', 1, '2026-09-12 23:02:24'),
(8, 2, 'ENTREGUE', 'CANCELADO', 1, '2026-09-12 23:02:30'),
(9, 3, 'CRIADO', 'PROCESSANDO', 1, '2026-09-15 02:18:12'),
(10, 3, 'PROCESSANDO', 'ENVIADO', 1, '2026-09-15 02:27:06'),
(11, 3, 'ENVIADO', 'ENTREGUE', 1, '2026-09-15 02:35:10'),
(12, 3, 'ENTREGUE', 'ENVIADO', 1, '2026-09-15 02:40:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(160) NOT NULL,
  `descricao` varchar(500) DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `estoque`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Lápis', 'Faber Castel', 3.00, 47, 1, '2026-09-12 22:25:05', '2026-09-15 02:18:04');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(120) NOT NULL,
  `email` varchar(180) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `papel` enum('FUNCIONARIO','DONO') NOT NULL DEFAULT 'FUNCIONARIO',
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha_hash`, `papel`, `criado_em`) VALUES
(1, 'Lucas Lima', 'lucasslimalica@gmail.com', '$2a$12$ItEcsQ8PpAJte18YXMYdwOlmJpUOOKnXOe7i5BioCQUkmgAzQPJ66', 'DONO', '2026-09-12 22:24:15');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pedido_produto` (`produto_id`),
  ADD KEY `fk_pedido_usuario` (`criado_por`),
  ADD KEY `idx_pedidos_status` (`status`);

--
-- Índices de tabela `pedido_status_historico`
--
ALTER TABLE `pedido_status_historico`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_historico_usuario` (`alterado_por`),
  ADD KEY `idx_historico_pedido_data` (`pedido_id`,`alterado_em`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `pedido_status_historico`
--
ALTER TABLE `pedido_status_historico`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedido_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  ADD CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `pedido_status_historico`
--
ALTER TABLE `pedido_status_historico`
  ADD CONSTRAINT `fk_historico_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `fk_historico_usuario` FOREIGN KEY (`alterado_por`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
