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

## Setup

1. `npm install`
2. Criar projeto no Supabase, copiar `.env.example` para `.env.local` e preencher
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Rodar `supabase/migrations/0001_fase1_setores_users.sql` no SQL Editor.
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
