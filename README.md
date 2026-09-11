# Checklist de Conformidade

App web de checklists de conformidade por setor. Líder executa o checklist, itens não
conformes viram ações corretivas, coordenador define prazo, ação vencida volta para o
líder concluir ou resetar.

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
| `lider@demo.local` | Líder | SET-0001 Produção |
| `coord@demo.local` | Coordenador | SET-0001 Produção |
| `lider2@demo.local` | Líder | SET-0002 Manutenção |
| `coord2@demo.local` | Coordenador | SET-0002 Manutenção |

Para começar do zero: `npm run reset` (apaga `data/`, incluindo fotos) e rode `npm run dev`
de novo. Para subir sem os dados de exemplo: `SEM_DEMO=1 npm run dev` — aí a primeira conta
criada na tela de login vira administradora.

Produção local: `npm run build && npm start`.

## Fluxo

1. **Admin** cadastra setores, usuários (papel + setor) e templates com itens ordenados.
2. **Líder** cria um checklist a partir de um template do seu setor e responde cada item.
   Item não conforme exige descrição + foto (sem foto não salva).
3. Ao **finalizar**, cada resposta não conforme gera uma ação com status `aberta`.
4. **Coordenador** define o prazo da ação → status `com_prazo`.
5. Prazo vencido (`prazo < hoje`) → status `vencida`, calculado em consulta ao abrir as telas.
6. **Líder** avalia a ação vencida: **concluir** (grava `concluido_em`/`concluido_por`) ou
   **resetar** (volta para `aberta`, limpa o prazo, `reset_count + 1`).
7. **Dashboard** (coordenador e admin): ações por status/setor, vencidas, reincidência e
   tempo médio entre abertura e conclusão.

## Papéis e telas

| Rota | Acesso |
|---|---|
| `/login` | pública (entrar / criar conta) |
| `/pendente` | conta criada sem papel, aguardando liberação do admin |
| `/admin/setores`, `/admin/usuarios`, `/admin/templates`, `/admin/templates/[id]` | admin |
| `/lider`, `/lider/checklists/[id]`, `/lider/avaliacao` | líder |
| `/coordenador` | coordenador |
| `/dashboard` | coordenador (próprio setor) e admin (todos) |

Todas as entidades têm código sequencial legível — `SET-0001`, `USR-0001`, `TPL-0001`,
`ITM-0001`, `CHK-0001`, `ACA-0001` — e o UUID nunca aparece na interface.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- SQLite pelo módulo nativo do Node (`node:sqlite`) — arquivo local, sem dependência nativa para compilar
- Autenticação própria: senha com `scrypt`, sessão em cookie httpOnly
- Fotos gravadas em `data/uploads` e servidas por `/api/fotos/...`, exibidas como
  miniatura com ampliação em modal
- Telas do líder pensadas para o celular (cartões empilhados, botões de largura total,
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

## Limitações

- SQLite em arquivo e fotos em disco funcionam localmente e em servidor com disco
  persistente. **Não funcionam em Vercel/serverless**, onde o disco é efêmero — lá é
  preciso trocar por um banco gerenciado (Postgres/Supabase) e storage de objetos.
- Sessões não expiram sozinhas; o logout remove a sessão.
- No Node 22 o `node:sqlite` emite um aviso de recurso experimental no console; no Node 24
  o módulo é estável e o aviso não aparece.
