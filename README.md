<div align="center">
  <img src="https://i.ibb.co/689NfR6/icon.png" width="120" alt="AgendAI Logo">
  # AgendAI - A Automação Inteligente
  
**O futuro do gerenciamento para barbearias, salões e profissionais de serviço.**
  <br>🚀 Uma plataforma completa Full-Stack com foco em experiência Premium, Dashboard interativo e Simulador de Inteligência Artificial para Automação via WhatsApp.
</div>
---
## 💻 Sobre o Projeto
O **AgendAI** é um software de modelo *SaaS (Software as a Service)* desenhado com interfaces limpas no formato *Single Page Application* (SPA) e inspirado em designs globais da Apple e TailwindCSS. Ele substitui a prancheta de papel por um Gestor Digital focado em conversão e produtividade, permitindo gerenciar Profissionais, Agendamentos, Relatórios Financeiros e Planos de Assinatura Dinâmicos em tempo real.
Como um grande diferencial tecnológico, o sistema integra um **Módulo de Bot para WhatsApp com IA**, capaz de simular conversas de confirmações de horários e lembretes com clientes!
## ⚙️ Tecnologias Utilizadas
Este projeto foi construído pensando em velocidade absoluta e arquitetura modular:
- **Frontend:** HTML5 Semântico, Vanilla JavaScript, CSS Puro Modular (Variáveis e Design Patterns).
- **Backend:** Node.js com Framework **Express.js**. API RESTful. Middleware de Autenticação Segura via Tokens (`Bearer Auth`).
- **Banco de Dados:** **SQLite**, fornecendo persistência relacional sem necessitar de contêineres e um motor super leve (via `better-sqlite3`).
## 🚀 Principais Funcionalidades
- **[x] Dashboard Reativo:** Gráficos e números gerados automaticamente através de matemática do backend com base no faturamento do mês;
- **[x] Módulo Financeiro & Métricas:** Um histórico interativo avaliando os Top Serviços que geraram mais lucro e o faturamento isolado por profissional.
- **[x] Módulo do Cliente (Tela de Agendamento):** Flow de cadastro em tempo real para os clientes finais da Barbearia solicitarem seu espaço na agenda.
- **[x] AgendAI Bot Assistant (WhatsApp Simulador):** Uma interface interativa que lista Logs de conversas e *triggers* automáticos que provam como a IA responde confirmando e lembrando seus clientes de cada consulta marcada.
- **[x] Gestão de Conta e Faturamento Premium:** Uma roleta interativa que lê do SQLite detalhes sobre Planos VIP e assinaturas corporativas mudando ativamente as ferramentas de tela (Feature toggles).
## 🛠️ Como rodar o projeto na sua máquina localmente
Certifique-se de que você possui o [Node.js](https://nodejs.org/) instalado em seu computador.
1. **Faça o clone do repositório ou baixe os arquivos** (ignorar isso caso não esteja usando Git terminal):
   ```bash
   git clone https://github.com/gabrielgoncalves-hub/adendAI.git
   cd adendAI
   ```
2. **Instale as dependências essenciais do pacote do Sistema (Backend)**
   Isso fará o download da biblioteca do Banco de Dados Dinâmico.
   ```bash
   npm install express better-sqlite3 cors
   ```
3. **Inicie o Servidor Inteligente**
   Para inicializar seu servidor e conectar o seu Banco de Dados (as tabelas e arquivos `.sqlite` se montam sozinhos e automaticamente!):
   ```bash
   node server.js
   ```
4. **Comece a Usar!**
   Abra seu navegador de preferência e digite:
   `http://localhost:3000`
---
*Desenvolvido com excelência por [Gabriel Gonçalves]*
