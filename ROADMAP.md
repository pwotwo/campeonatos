# Roadmap / Roteiro

Este roteiro organiza o projeto por modulos viaveis. A regra e simples: cada modulo deve ficar funcional, validado e publicado no GitHub antes de avancarmos para o proximo.

This roadmap organizes the project into viable modules. The rule is simple: each module should be functional, validated, and pushed to GitHub before moving to the next one.

## Principios / Principles

- Entregar fluxo utilizavel no fim de cada modulo.
- Manter backend, frontend e base de dados alinhados.
- Validar com build e testes manuais/API antes de cada push.
- Escrever commits em portugues e ingles.
- Evitar funcionalidades grandes pela metade.

- Deliver a usable flow at the end of each module.
- Keep backend, frontend, and database aligned.
- Validate with builds and manual/API checks before each push.
- Write commits in Portuguese and English.
- Avoid large half-finished features.

## Calendario Estimado / Estimated Schedule

Estimativa para uma pessoa em dias uteis. Pode variar conforme design, testes, deploy e mudancas de escopo.

Estimated for one person in working days. It may change depending on design, testing, deployment, and scope changes.

| # | Modulo / Module | Duracao / Duration | Estado / Status | Entrega / Deliverable |
|---|---|---:|---|---|
| 1 | Base tecnica e estabilidade / Technical base and stability | 2 dias / 2 days | Em progresso / In progress | Ambiente local, builds, seed, GitHub limpo / Local setup, builds, seed, clean GitHub |
| 2 | Campeonatos / Championships | 3 dias / 3 days | Parcial / Partial | Criar, listar, publicar, estados e formatos / Create, list, publish, statuses and formats |
| 3 | Equipas e jogadores / Teams and players | 3 dias / 3 days | Parcial / Partial | Criar equipas, gerir jogadores e detalhes / Create teams, manage players and details |
| 4 | Inscricoes / Enrollments | 3 dias / 3 days | Em progresso / In progress | Inscrever, aprovar e rejeitar equipas / Enroll, approve, and reject teams |
| 5 | Calendario automatico / Automatic schedule | 3 dias / 3 days | Em progresso / In progress | Gerar jogos, jornadas e evitar duplicados / Generate matches, rounds, and avoid duplicates |
| 6 | Gestao de jogos / Match management | 4 dias / 4 days | Em progresso / In progress | Iniciar, registar eventos e finalizar jogos / Start, record events, and finish matches |
| 7 | Classificacoes automaticas / Automatic standings | 3 dias / 3 days | Em progresso / In progress | Tabela segura, recalculo e desempates / Safe table, recalculation, and tie-breakers |
| 8 | Rankings e estatisticas / Rankings and statistics | 4 dias / 4 days | Em progresso / In progress | Artilheiros, cartoes, estatisticas por equipa/jogador / Scorers, cards, team/player stats |
| 9 | Permissoes por perfil / Role permissions | 4 dias / 4 days | Em progresso / In progress | Acessos por admin, organizador, gestor, arbitro e jogador / Access by admin, organizer, manager, referee, and player |
| 10 | Pagina publica do campeonato / Public championship page | 4 dias / 4 days | Em progresso / In progress | Link publico com tabela, jogos, equipas e rankings / Public link with table, matches, teams, and rankings |
| 11 | UI/UX e responsividade / UI/UX and responsiveness | 4 dias / 4 days | Pendente / Pending | Estados, erros, mobile e polimento visual / States, errors, mobile, and visual polish |
| 12 | Testes e revisao MVP / MVP tests and review | 4 dias / 4 days | Pendente / Pending | Testes criticos, bugs e preparacao para deploy / Critical tests, bugs, and deployment readiness |

## Estimativa Total / Total Estimate

- MVP funcional: cerca de 41 dias uteis.
- Ritmo de algumas horas por dia: cerca de 10 a 12 semanas.

- Functional MVP: around 41 working days.
- A few hours per day pace: around 10 to 12 weeks.

## Definicao de Pronto / Definition of Done

Um modulo so fica pronto quando:

- O fluxo principal funciona no frontend.
- A API responde corretamente.
- A base de dados suporta o fluxo sem dados inconsistentes.
- `npm run build` passa no backend e no frontend.
- As mudancas estao commitadas e enviadas para o GitHub.

A module is only done when:

- The main flow works in the frontend.
- The API responds correctly.
- The database supports the flow without inconsistent data.
- `npm run build` passes in backend and frontend.
- Changes are committed and pushed to GitHub.

## Proximos Passos / Next Steps

1. Fechar o modulo de gestao de jogos.
2. Consolidar classificacoes automaticas com recalculo seguro.
3. Avancar para inscricoes com aprovacao/rejeicao.

1. Finish the match management module.
2. Consolidate automatic standings with safe recalculation.
3. Move into enrollments with approval/rejection.
