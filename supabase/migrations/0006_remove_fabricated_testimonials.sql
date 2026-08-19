-- The testimonials inserted in 0005_seed_content.sql attributed invented
-- quotes to named people, which is fake social proof even when labeled as
-- demo content. Remove them; the testimonials section now simply doesn't
-- render until real student testimonials exist (added via the admin CMS
-- in a later phase).
delete from public.testimonials;
