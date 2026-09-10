# App5S — Checklist de Conformidade

Next.js (App Router) + Supabase (Postgres, Auth).

## Fase 1 (implementada)

- Scaffold Next.js + conexao Supabase
- Schema: `setores`, `users` com `codigo` sequencial (`SET-0001`, `USR-0001`)
- Login email/senha com redirecionamento por papel (`admin`, `coordenador`, `lider`)

## Fase 2 (implementada)

- `/admin/setores`: CRUD de setores
- `/admin/usuarios`: CRUD de usuarios (cria no Supabase Auth + perfil, papel e setor vinculado)

Requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (usada apenas em server actions).

## Fase 3 (implementada)

- Tabelas `checklist_templates` e `checklist_items` (`TPL-0001`, `ITM-0001`)
- `/admin/templates`: CRUD de templates por setor
- `/admin/templates/[id]`: CRUD de itens do template com campo `ordem`

## Fase 4 (implementada)

- Tabelas `checklists` (`CHK-0001`) e `checklist_respostas`
- `/lider`: templates do setor, criacao de checklist e lista dos proprios checklists
- `/lider/checklists/[id]`: toggle conforme/nao conforme, modal obrigatorio
  (descricao + foto) e finalizacao
- Fotos no bucket `checklist-fotos` do Supabase Storage

## Fase 5 (implementada)

- Tabela `acoes` (`ACA-0001`)
- Trigger `checklists_gerar_acoes`: ao finalizar checklist, cria uma acao com status
  `aberta` para cada resposta `conforme = false`

## Fase 6 (implementada)

- `/coordenador`: lista de acoes do setor com codigo, problema, status, prazo e resets
- Acao `aberta` recebe prazo (data manual) e passa para `com_prazo`

## Setup

1. `npm install`
2. Criar projeto no Supabase, copiar `.env.example` para `.env.local` e preencher
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Rodar os arquivos de `supabase/migrations/` em ordem no SQL Editor.
4. Criar o usuario admin em Authentication > Users e rodar `supabase/seed.sql`
   substituindo `<AUTH_USER_ID>` e `<EMAIL>`.
5. `npm run dev`

## Rotas

| Rota | Acesso |
|---|---|
| `/login` | publica |
| `/` | redireciona pelo papel |
| `/admin` | admin |
| `/coordenador` | coordenador |
| `/lider` | lider |
