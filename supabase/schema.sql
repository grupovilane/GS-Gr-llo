-- =========================================================
-- GS Infinity Travel / Quadros
-- Cole este arquivo inteiro em Supabase > SQL Editor > Run.
-- Pode rodar de novo: ele só cria o que ainda não existe.
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

-- ---------- funções de apoio ----------
create or replace function public.is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active')
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active' and role = 'admin')
$$;

-- ---------- perfil criado automaticamente no cadastro ----------
-- A PRIMEIRA conta criada vira administradora e já entra liberada.
-- Todas as outras entram como "pendente" até o administrador aprovar.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
  n int;
begin
  select count(*) into n from public.profiles;
  is_first := (n = 0);
  insert into public.profiles (id, email, name, color, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), nullif(new.raw_user_meta_data->>'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    (array['mint','apricot','teal','gold','royal','serenity'])[1 + (n % 6)],
    case when is_first then 'admin' else 'member' end,
    case when is_first then 'active' else 'pending' end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- regra de ouro: quem pode editar qual conta ----------
-- Membro: só a própria conta, e só nome, cor e bio.
-- Administrador: qualquer conta, inclusive função e status (menos a própria função/status).
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return new;  -- alterações feitas direto no painel do Supabase
  end if;

  if new.id <> old.id then
    raise exception 'Não é permitido trocar o id da conta.';
  end if;

  if public.is_admin() then
    if old.id = auth.uid() and (new.role <> old.role or new.status <> old.status) then
      raise exception 'O administrador não pode mudar a própria função ou status.';
    end if;
    return new;
  end if;

  if old.id <> auth.uid() then
    raise exception 'Você só pode editar a sua própria conta.';
  end if;
  if new.role <> old.role or new.status <> old.status or new.email <> old.email then
    raise exception 'Você não pode alterar função, status ou e-mail.';
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

-- ---------- tempo real ----------
do $$
begin
  begin alter publication supabase_realtime add table public.profiles;  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.boards;    exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.templates; exception when duplicate_object then null; end;
end $$;
