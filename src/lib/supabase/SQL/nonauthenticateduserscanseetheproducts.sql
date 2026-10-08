DROP POLICY IF EXISTS "Public can view available listings"
ON public.listings;

CREATE POLICY "Public can view available listings"
ON public.listings
FOR SELECT
TO anon
USING (
    status = 'available'
);

DROP POLICY IF EXISTS "Public can view listing images"
ON public.listing_images;

CREATE POLICY "Public can view listing images"
ON public.listing_images
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1
        FROM public.listings
        WHERE listings.id = listing_images.listing_id
        AND listings.status = 'available'
    )
);

DROP POLICY IF EXISTS "Public can view categories"
ON public.categories;

CREATE POLICY "Public can view categories"
ON public.categories
FOR SELECT
TO anon
USING (true)