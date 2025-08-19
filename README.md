# 🎮 GameLog - Seu Catálogo Pessoal de Jogos

![Capa do Projeto]([https://github.com/user-attachments/assets/533d5e44-0467-4c08-8831-3fbb8622a377](https://gamelog-fullstack-app.vercel.app/))

<p align="center">
  Uma aplicação web completa para entusiastas de jogos buscarem, avaliarem e catalogarem seus títulos favoritos.
</p>


<p align="center">
  <a href="#-sobre-o-projeto"><strong>Sobre</strong></a> •
  <a href="#-funcionalidades"><strong>Funcionalidades</strong></a> •
  <a href="#-tecnologias"><strong>Tecnologias</strong></a> •
  <a href="#-como-rodar"><strong>Como Rodar</strong></a>
</p>

---
## 🚀 Demo Ao Vivo

**[Clique aqui para testar o GameLog ao vivo!](https://gamelog-fullstack-app.vercel.app/)**

---

## 📖 Sobre o Projeto


O **GameLog** é uma plataforma full-stack desenvolvida para demonstrar habilidades práticas na construção de aplicações web modernas. O projeto permite que usuários se cadastrem, busquem em um vasto catálogo de jogos fornecido pela API da RAWG, salvem avaliações pessoais com notas e comentários, e visualizem as opiniões da comunidade. A aplicação foi estruturada com uma API REST no backend (Node.js/Express) e uma Single-Page Application (SPA) no frontend (React).

Link para o site:https://gamelog-fullstack-iz182tkuw-iago-augusto-diotti-vianas-projects.vercel.app/ 
---

## ✨ Funcionalidades

- **✅ Autenticação de Usuários:** Sistema completo de cadastro e login com tokens JWT, gerenciado por um elegante modal com abas.
- **🔍 Busca de Jogos:** Integração com a API da [RAWG](https://rawg.io/apidocs) para pesquisar jogos. A página inicial já carrega os títulos mais populares do momento.
- **📄 Páginas de Detalhes:** Cada jogo possui uma página dedicada com descrição, data de lançamento e mais.
- **⭐ Sistema de Avaliação:** Usuários logados podem dar uma nota (1-5) e escrever um review para qualquer jogo.
- **👀 Visualização de Avaliações:** Exibição das avaliações da comunidade em cada página de jogo.
- **👤 Perfil de Usuário:** Página "Minhas Avaliações" para o usuário ver todo o seu histórico.
- **💬 Formulário de Contato/Feedback:** Integrado com [Getform.io](https://getform.io) para receber mensagens dos usuários.
- **💅 UI Polida e Responsiva:** Interface moderna com foco na experiência do usuário, incluindo notificações, feedback visual e layout consistente.

---

## 🛠️ Tecnologias

As seguintes ferramentas e tecnologias foram utilizadas na construção do projeto:

#### **Backend** (`Node.js` + `Express` + `PostgreSQL`)
- **Node.js** e **Express** para a construção da API REST.
- **PostgreSQL** como banco de dados, gerenciado pelo **Supabase**.
- **JWT (JSON Web Token)** para autenticação de rotas.
- **Bcrypt.js** para hashing de senhas.
- **Axios** para comunicação com a API da RAWG.
- **CORS** para gerenciamento de permissões de acesso.

#### **Frontend** (`React` + `Vite`)
- **React** para a construção da interface de usuário.
- **Vite** como ambiente de desenvolvimento e build tool.
- **React Router DOM** para gerenciamento de rotas e criação de uma SPA.
- **React Context API** para gerenciamento de estado global de autenticação.
- **Axios** para consumo da API backend.
- **React Hot Toast** para notificações elegantes.
- **React Modal** para pop-ups de autenticação e feedback.
- **React Icons** para ícones.
- **CSS puro** para estilização, com foco em práticas modernas como Flexbox, Grid e Variáveis CSS.

---

## 🚀 Como Rodar o Projeto Localmente

Este projeto é um monorepo, dividido em `backend` e `frontend`.

#### **Pré-requisitos**
- **Node.js** (v18 ou superior)
- **npm**
- Conta no **Supabase** (para o banco de dados PostgreSQL)
- Conta na **RAWG API** (para a API de jogos)

#### **1. Clonando o Repositório**
bash
git clone [https://github.com/IagoDiotti/gamelog-fullstack-app.git](https://github.com/IagoDiotti/gamelog-fullstack-app.git)
cd gamelog-fullstack-app

#### **2. Configurando o Backend**
Navegue para a pasta do backend
cd backend

Instale as dependências
npm install

Crie um arquivo .env na raiz da pasta 'backend'
e adicione as chaves necessárias (veja .env.example)

Inicie o servidor
node index.js

#### **3. Configurando o Frontend**

Em um NOVO terminal, navegue para a pasta do frontend
cd frontend

Instale as dependências
npm install

Crie um arquivo .env na raiz da pasta 'frontend'
e adicione as chaves necessárias (veja .env.example)

Inicie a aplicação React
npm run dev
