-- =========================================================
-- GS Infinity Travel / Quadros
-- Cole este arquivo inteiro em Supabase > SQL Editor > Run.
-- Pode rodar de novo: ele só cria o que ainda não existe.
--
-- Contas:
--   * ADMINISTRADOR (login mestre): só o e-mail definido em master_email()
--     abaixo, e só entrando com o Google. Os demais e-mails nunca são admin.
--   * MEMBRO: todo o resto. Cria a conta, fica "pendente" e só vê os dados
--     depois que o administrador aprova.
-- =========================================================

-- ---------- tabelas ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  color      text not null default 'mint',
  bio        text not null default '',
  role       text not null default 'member'  check (role in ('admin','member')),
  status     text not null default 'pending' check (status in ('pending','active','blocked')),
  created_at timestamptz not null default now()
);

create table if not exists public.boards (
  id         text primary key,
  data       jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id         text primary key,
  data       jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- ---------- login mestre ----------
-- Para trocar o administrador, mude só este e-mail e rode o arquivo de novo.
create or replace function public.master_email() returns text
language sql immutable as $$ select 'grupovilane@gmail.com'::text $$;

-- ---------- funções de apoio ----------
create or replace function public.is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active' and role = 'admin')
$$;

-- ---------- o e-mail do administrador só entra com o Google ----------
-- Impede que alguém cadastre esse e-mail com senha antes do dono.
create or replace function public.guard_master_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(new.email, '')) = public.master_email()
     and coalesce(new.raw_app_meta_data->>'provider', '') <> 'google' then
    raise exception 'O e-mail do administrador só entra com o Google.';
  end if;
  return new;
end $$;

drop trigger if exists guard_master_signup on auth.users;
create trigger guard_master_signup
  before insert on auth.users
  for each row execute function public.guard_master_signup();

-- ---------- perfil criado automaticamente no cadastro ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_master boolean;
  n int;
begin
  select count(*) into n from public.profiles;
  is_master := lower(coalesce(new.email, '')) = public.master_email();
  insert into public.profiles (id, email, name, color, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), nullif(new.raw_user_meta_data->>'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    (array['mint','apricot','teal','gold','royal','serenity'])[1 + (n % 6)],
    case when is_master then 'admin' else 'member' end,
    case when is_master then 'active' else 'pending' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- regra de ouro: quem pode editar qual conta ----------
-- A função (admin/membro) nunca muda pelo app: ela vem do e-mail.
-- Membro: só a própria conta, e só nome, cor e bio.
-- Administrador: aprova e bloqueia as outras contas (menos a própria).
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;  -- alterações feitas direto no painel do Supabase
  end if;

  if new.id <> old.id then
    raise exception 'Não é permitido trocar o id da conta.';
  end if;
  if new.role <> old.role then
    raise exception 'A função de uma conta não pode ser alterada.';
  end if;

  if public.is_admin() then
    if old.id = auth.uid() and new.status <> old.status then
      raise exception 'O administrador não pode mudar o próprio status.';
    end if;
    return new;
  end if;

  if old.id <> auth.uid() then
    raise exception 'Você só pode editar a sua própria conta.';
  end if;
  if new.status <> old.status or new.email <> old.email then
    raise exception 'Você não pode alterar status ou e-mail.';
  end if;
  return new;
end $$;

drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile();

-- ---------- segurança por linha (RLS) ----------
alter table public.profiles  enable row level security;
alter table public.boards    enable row level security;
alter table public.templates enable row level security;

drop policy if exists "perfis: ver"       on public.profiles;
drop policy if exists "perfis: editar"    on public.profiles;
drop policy if exists "quadros: tudo"     on public.boards;
drop policy if exists "modelos: tudo"     on public.templates;

-- Cada pessoa vê o próprio perfil (mesmo pendente); quem está ativo vê a equipe toda.
create policy "perfis: ver" on public.profiles
  for select using (id = auth.uid() or public.is_active());

-- O gatilho acima restringe o que cada um pode mudar.
create policy "perfis: editar" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Quadros e modelos: toda a equipe ativa lê e edita. Pendentes e bloqueados não veem nada.
create policy "quadros: tudo" on public.boards
  for all using (public.is_active()) with check (public.is_active());
create policy "modelos: tudo" on public.templates
  for all using (public.is_active()) with check (public.is_active());

-- ---------- acerta contas que já existiam ----------
update public.profiles set role = 'admin',  status = 'active' where lower(email) = public.master_email();
update public.profiles set role = 'member'                    where lower(email) <> public.master_email() and role = 'admin';

-- ---------- tempo real ----------
do $$
begin
  begin alter publication supabase_realtime add table public.profiles;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.boards;    exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.templates; exception when duplicate_object then null; end;
end $$;
