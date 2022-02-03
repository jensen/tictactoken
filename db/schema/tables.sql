drop table if exists users cascade;
drop table if exists games cascade;

create table users (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  username text not null,
  email text not null,
  provider_id text unique not null,
  avatar text not null
);

create index users_provider_id_idx on users (provider_id);

create table games (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  host_id uuid not null,
  constraint host_id foreign key(host_id) references users(id) on delete cascade,

  guest_id uuid,
  constraint guest_id foreign key(guest_id) references users(id) on delete cascade,

  state json not null,
  x uuid null,
  winner uuid null
);
