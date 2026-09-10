-- Executar apos criar o usuario no Supabase Auth (Dashboard > Authentication > Add user).
-- Substituir <AUTH_USER_ID> e <EMAIL> pelos valores do usuario criado.

insert into public.setores (nome) values ('Producao'), ('Manutencao');

insert into public.users (id, nome, email, papel, setor_id)
values ('<AUTH_USER_ID>', 'Admin', '<EMAIL>', 'admin', null);
