# 🏆 Sistema de Gestão de Campeonatos Desportivos

Sistema completo para gerir campeonatos desportivos — inscrições, equipas, jogos, classificações e estatísticas em tempo real.

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de Dados | PostgreSQL 15 |
| ORM | Prisma 5 |
| Autenticação | JWT |
| Infraestrutura | Docker |

## 📋 Funcionalidades

- ✅ Gestão de campeonatos (Liga, Taça, Misto)
- ✅ Inscrição de equipas e jogadores
- ✅ Geração automática de calendários
- ✅ Registo de jogos e eventos em tempo real
- ✅ Classificações automáticas
- ✅ Sistema de sanções e disciplina
- ✅ Estatísticas por jogador e equipa
- ✅ 6 perfis de utilizador com permissões diferentes

## 🚀 Como Instalar

### Pré-requisitos
- Node.js 18+
- Docker Desktop

### Passos
```bash
# 1. Clonar o repositório
git clone https://github.com/pwotwo/campeonatos.git
cd campeonatos

# 2. Arrancar a base de dados
docker-compose up -d

# 3. Configurar o backend
cd backend
npm install
cp .env.example .env
npm run dev

# 4. Configurar o frontend
cd ../frontend
npm install
npm run dev
```

### URLs de desenvolvimento
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: http://localhost:5555

## 📁 Estrutura do Projeto
```
campeonatos/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 👤 Autor

**pwotwo** — [github.com/pwotwo](https://github.com/pwotwo)