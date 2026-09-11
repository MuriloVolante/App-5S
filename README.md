# Checklist de Conformidade

App web de auditoria de conformidade por setor. O embaixador do setor define o
checklist e seus itens, o auditor (externo, sem setor fixo) abre a auditoria e avalia
cada item, itens não conformes viram pendências para o embaixador do setor, que define
o prazo — e a ação vencida volta para o auditor concluir ou resetar.

## Rodar (dois comandos, sem configurar nada)

Requisito: Node.js 22.5 ou superior (Node 24 recomendado). Nada além disso — sem banco
para instalar, sem compilador, sem variável de ambiente.

```bash
npm install
npm run dev
```

Abre em http://localhost:3000. O banco (SQLite) é criado sozinho em `data/app.db` na
primeira execução, já com dados de demonstração.

### Contas de demonstração (senha `123456` em todas)

| E-mail | Papel | Setor |
|---|---|---|
| `admin@demo.local` | Admin | — |
| `lider@demo.local` | Auditor | — (vê todos) |
| `coord@demo.local` | Embaixador | SET-0001 Produção |
| `lider2@demo.local` | Auditor | — (vê todos) |
| `coord2@demo.local` | Embaixador | SET-0002 Manutenção |

Os e-mails mantêm os nomes antigos só por comodidade de teste; os papéis são Auditor e
Embaixador.

Para começar do zero: `npm run reset` (apaga `data/`, incluindo fotos) e rode `npm run dev`
de novo. Para subir sem os dados de exemplo: `SEM_DEMO=1 npm run dev` — aí a primeira conta
criada na tela de login vira administradora.

Produção local: `npm run build && npm start`.

## Fluxo

1. **Admin** cadastra setores e usuários (papel + setor, quando houver).
2. **Embaixador** — responsável pelo setor — cria os checklists do seu setor e cadastra
   os itens que devem ser auditados, com ordem.
3. **Auditor** — externo, sem setor fixo, enxerga todos — abre a auditoria a partir de
   qualquer checklist e responde item a item. Item não conforme exige descrição + foto
   (sem foto não salva). Ao final, **finaliza**.
4. Ao finalizar, cada resposta não conforme vira uma pendência (ação `aberta`) para o
   embaixador do setor auditado.
5. **Embaixador** define o prazo da pendência → status `com_prazo`.
6. Prazo vencido (`prazo < hoje`) → status `vencida`, calculado em consulta ao abrir as telas.
7. **Auditor** avalia a ação vencida: **concluir** (grava `concluido_em`/`concluido_por`) ou
   **resetar** (volta para `aberta`, limpa o prazo, `reset_count + 1`).
8. **Dashboard** (embaixador e admin): ações por status/setor, vencidas, reincidência e
   tempo médio entre abertura e conclusão.

## Papéis e telas

| Rota | Acesso |
|---|---|
| `/login` | pública (entrar / criar conta) |
| `/pendente` | conta criada sem papel, aguardando liberação do admin |
| `/admin/setores`, `/admin/usuarios` | admin |
| `/embaixador/templates`, `/embaixador/templates/[id]` (itens), `/embaixador/acoes` | embaixador |
| `/auditor`, `/auditor/checklists/[id]`, `/auditor/avaliacao` | auditor |
| `/dashboard` | embaixador (próprio setor) e admin (todos) |

Todas as entidades têm código sequencial legível — `SET-0001`, `USR-0001`, `TPL-0001`,
`ITM-0001`, `CHK-0001`, `ACA-0001` — e o UUID nunca aparece na interface.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- SQLite pelo módulo nativo do Node (`node:sqlite`) — arquivo local, sem dependência nativa para compilar
- Autenticação própria: senha com `scrypt`, sessão em cookie httpOnly
- Fotos gravadas em `data/uploads` e servidas por `/api/fotos/...`, exibidas como
  miniatura com ampliação em modal
- Telas do auditor pensadas para o celular (cartões empilhados, botões de largura total,
  câmera direto no campo de foto)

Estrutura:

```
src/lib/db.ts      schema, códigos sequenciais e dados de demonstração
src/lib/repo.ts    consultas e regras de negócio
src/lib/sessao.ts  sessão em cookie
src/app/...        telas por papel
```

### Variáveis opcionais

| Variável | Efeito |
|---|---|
| `DATABASE_FILE` | caminho do arquivo SQLite (padrão `data/app.db`) |
| `UPLOADS_DIR` | pasta das fotos (padrão `data/uploads`) |
| `SEM_DEMO=1` | não cria setores, usuários e templates de exemplo |

## Volume de dados

Toda lista é paginada no banco (`limit`/`offset` + `count`), então a tela nunca carrega a
tabela inteira:

| Tela | Página |
|---|---|
| Admin: setores, usuários, templates, itens do template | 20 por página |
| Embaixador: checklists do setor, itens, pendências | 20 por página |
| Auditor: checklists disponíveis e auditorias em andamento | 20 · finalizadas 10 |
| Auditor: ações vencidas | 20 por página |
| Dashboard: vencidas e reincidentes | 20 · tabelas por setor 10 |

Os indicadores do dashboard (totais por status, vencidas, reincidência e tempo médio) são
calculados por agregação em SQL — nenhuma linha de `acoes` é carregada para a memória do
servidor. O banco tem índices para os filtros usados (setor, status, prazo, template).

A exceção proposital é a execução do checklist, que carrega todos os itens do template:
o auditor precisa responder todos antes de finalizar.

## Limitações

- SQLite em arquivo e fotos em disco funcionam localmente e em servidor com disco
  persistente. **Não funcionam em Vercel/serverless**, onde o disco é efêmero — lá é
  preciso trocar por um banco gerenciado (Postgres/Supabase) e storage de objetos.
- Sessões não expiram sozinhas; o logout remove a sessão.
- Bases anteriores são migradas na abertura: papéis renomeados, coluna
  `checklists.lider_id` virou `criado_por` e auditores perdem o vínculo de setor.
- No Node 22 o `node:sqlite` emite um aviso de recurso experimental no console; no Node 24
  o módulo é estável e o aviso não aparece.
