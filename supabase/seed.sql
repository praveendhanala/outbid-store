-- Optional: run after schema.sql to seed the leaderboard with example
-- stores so the UI has something to show right away. Requires the
-- category rows inserted by schema.sql to already exist (FK constraint).

with new_stores as (
  insert into stores (name, domain, description, bid, status, clicks, created_at) values
    ('Sneaker Hub', 'sneakerhub.com', 'Curated rare and limited-edition sneakers, shipped worldwide in 48 hours.', 3200, 'active', 8412, now() - interval '2 hours'),
    ('Street Bruv', 'streetbruv.com', 'Streetwear and sneaker drops from independent labels.', 2850, 'active', 5108, now() - interval '5 hours'),
    ('Glowlab', 'glowlab.store', 'Clean skincare, small batches, no filler ingredients.', 1940, 'active', 3021, now() - interval '1 day'),
    ('KicksXpress', 'kicksxpress.co', 'Fast restocks on the sneakers everyone else sells out of.', 1450, 'active', 2467, now() - interval '1 day'),
    ('Hearthcraft', 'hearthcraft.shop', 'Handmade home goods from a small studio in Portugal.', 920, 'active', 1189, now() - interval '2 days'),
    ('Solelab', 'solelab.store', 'Sneaker restoration kits and cleaning gear.', 610, 'active', 944, now() - interval '2 days'),
    ('Byte & Bolt', 'byteandbolt.com', 'Refurbished small electronics, tested and warrantied.', 340, 'active', 601, now() - interval '3 days'),
    ('Millbrew Coffee', 'millbrew.co', 'Single-origin beans roasted to order, shipped weekly.', 210, 'active', 388, now() - interval '3 days')
  returning id, domain
)
insert into store_categories (store_id, category_id)
select id, category_id
from new_stores
join (values
  ('sneakerhub.com', 'sneakers'),
  ('streetbruv.com', 'sneakers'),
  ('streetbruv.com', 'fashion'),
  ('glowlab.store', 'beauty'),
  ('kicksxpress.co', 'sneakers'),
  ('hearthcraft.shop', 'home'),
  ('solelab.store', 'sneakers'),
  ('byteandbolt.com', 'electronics'),
  ('millbrew.co', 'food')
) as mapping(domain, category_id) using (domain);
