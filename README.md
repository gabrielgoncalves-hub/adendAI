# 🤖 AgendAI - Gestão Inteligente e Automação via WhatsApp

![Banner Simulando Interface do Sistema](https://i.ibb.co/3s1f93S/bg-chat.png)

> **O futuro do gerenciamento para barbearias, salões e profissionais de serviço.**
> Uma plataforma completa Full-Stack com foco em experiência Premium, Dashboard interativo e Simulador de Inteligência Artificial para Automação.

---

## 💻 Sobre o Projeto

O **AgendAI** é um software de modelo *SaaS (Software as a Service)* com interfaces limpas no formato *Single Page Application* (SPA), inspirado em designs modernos. Ele substitui a prancheta de papel por um Gestor Digital focado em conversão e produtividade, permitindo gerenciar Profissionais, Agendamentos, Relatórios Financeiros e Planos de Assinatura de forma dinâmica e em tempo real.

O grande diferencial do sistema é o **Módulo de Bot para WhatsApp com IA**, capaz de simular conversas de confirmações de horários e lembretes com clientes, mostrando de forma visual como a automação funcionaria na prática.

---

## 🚀 Principais Funcionalidades

* **Dashboard Reativo:** Gráficos e números gerados automaticamente através de cálculos em tempo real com base no faturamento do mês.
* **Módulo Financeiro & Métricas:** Um histórico interativo avaliando os Top Serviços que geraram mais lucro e o faturamento isolado por profissional.
* **Módulo do Cliente:** Tela de agendamento *Client-facing* para os clientes finais da Barbearia solicitarem seu espaço na agenda diretamente no banco de dados.
* **AgendAI Bot Assistant (WhatsApp):** Uma interface interativa que lista Logs de conversas e *triggers* automáticos que provam como a IA responde confirmando e lembrando seus clientes de cada consulta marcada.
* **Gestão de Conta Premium:** Telas dinâmicas de configurações e atualização de assinaturas (`Plano Gratuito` vs `Plano Pro`) que refletem diretamente no banco de dados e na interface global.

---

## ⚙️ Tecnologias Utilizadas

Este projeto foi construído pensando em velocidade e arquitetura modular, sem o peso de frameworks complexos de Frontend:

* **Frontend:** HTML5 Semântico, Vanilla JavaScript, CSS Puro Modular (Variáveis Globais e Design Automático).
* **Backend:** Node.js com Framework **Express.js**.
* **Banco de Dados:** Banco Local Relacional via **SQLite** (`better-sqlite3`), fornecendo persistência segura sem a necessidade de instalar servidores SQL pesados.
* **Segurança:** Middleware de Autenticação via Tokens Simples (`Bearer Auth`).

---

## 🛠️ Como rodar o projeto localmente

Esse projeto é *Plug and Play*. Basta ter o Node.js instalado na sua máquina!

**1. Clone o repositório ou baixe os arquivos (baixe o .zip do GitHub)**
```bash
git clone https://github.com/gabrielgoncalves-hub/adendAI.git
cd adendAI
```

**2. Instale as dependências essenciais do pacote do Sistema**
O comando abaixo baixará o Node HTTP Express e o Banco de Dados.
```bash
npm install express better-sqlite3 cors
```

**3. Inicie o Servidor Node.js**
O banco de dados SQLite e todas as configurações iniciais se criam de forma automática no primeiro momento em que você liga o servidor.
```bash
node server.js
```

**4. Acesse e Teste o Sistema!**
Abra o navegador e digite o endereço local:
```text
http://localhost:3000
```

---
*Desenvolvido como projeto de portfólio de excelência por Gabriel Gonçalves.*
