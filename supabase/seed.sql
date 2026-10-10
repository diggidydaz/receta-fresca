-- Places from data/places.json. Accounts are created by scripts/seed.mjs (through the auth admin API).
insert into public.places (id, kind, name) values
  ('c1', 'colmado', 'Colmado La Esperanza'),
  ('c2', 'colmado', 'Colmado Don Rafa'),
  ('f1', 'finca', 'Finca Raíces'),
  ('f2', 'finca', 'Agro Las Tres Marías'),
  ('k1', 'cocina', 'Fonda Doña Carmen'),
  ('k2', 'cocina', 'La Cocina de Titi Awilda')
on conflict (id) do update set kind = excluded.kind, name = excluded.name;
