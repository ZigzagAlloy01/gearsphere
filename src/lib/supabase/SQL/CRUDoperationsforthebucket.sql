DROP POLICY IF EXISTS "Public can view listing images"
ON storage.objects;

CREATE POLICY "Public can view listing images"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'listing-images'
);

DROP POLICY IF EXISTS "Users can upload own listing images"
ON storage.objects;

CREATE POLICY "Users can upload own listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'listing-images'

    AND owner_id = auth.uid()::text

    AND name ~ '^listings/[0-9a-fA-F-]{36}/[^/]+$'

    AND EXISTS (
        SELECT 1
        FROM public.listings AS l
        WHERE l.id = split_part(name, '/', 2)::uuid
          AND l.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update own listing images"
ON storage.objects;

CREATE POLICY "Users can update own listing images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'listing-images'

    AND owner_id = auth.uid()::text

    AND name ~ '^listings/[0-9a-fA-F-]{36}/[^/]+$'

    AND EXISTS (
        SELECT 1
        FROM public.listings AS l
        WHERE l.id = split_part(name, '/', 2)::uuid
          AND l.owner_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'listing-images'

    AND owner_id = auth.uid()::text

    AND name ~ '^listings/[0-9a-fA-F-]{36}/[^/]+$'

    AND EXISTS (
        SELECT 1
        FROM public.listings AS l
        WHERE l.id = split_part(name, '/', 2)::uuid
          AND l.owner_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can delete own listing images"
ON storage.objects;

CREATE POLICY "Users can delete own listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'listing-images'

    AND owner_id = auth.uid()::text

    AND name ~ '^listings/[0-9a-fA-F-]{36}/[^/]+$'

    AND EXISTS (
        SELECT 1
        FROM public.listings AS l
        WHERE l.id = split_part(name, '/', 2)::uuid
          AND l.owner_id = auth.uid()
    )
);