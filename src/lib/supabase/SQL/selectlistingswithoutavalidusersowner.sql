SELECT
    l.id AS listing_id,
    l.owner_id
FROM public.listings AS l
LEFT JOIN public.users AS u
    ON u.id = l.owner_id
WHERE u.id IS NULL;