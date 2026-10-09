-- ============================================================
-- PUBLIC LISTING DATA
-- ============================================================

ALTER VIEW public.available_listings
SET (security_invoker = false);

GRANT SELECT
ON public.available_listings
TO anon, authenticated;


-- ============================================================
-- PUBLIC LISTING IMAGES
-- ============================================================

CREATE OR REPLACE VIEW public.public_listing_images AS
SELECT
    li.id,
    li.listing_id,
    li.image_url,
    li.display_order
FROM public.listing_images li
INNER JOIN public.listings l
    ON l.id = li.listing_id
WHERE l.status = 'available';


GRANT SELECT
ON public.public_listing_images
TO anon, authenticated;


-- ============================================================
-- PUBLIC CATEGORIES
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view categories"
ON public.categories;

CREATE POLICY
"Anyone can view categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);