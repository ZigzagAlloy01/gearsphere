DO $$
BEGIN

    IF EXISTS (
        SELECT 1
        FROM storage.buckets
        WHERE id = 'listing-images'
           OR name = 'listing-images'
    ) THEN

        RAISE EXCEPTION
            'Storage bucket "listing-images" already exists. No bucket was created.';

    END IF;

    INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
    VALUES (
        'listing-images',
        'listing-images',
        true,
        5242880,
        ARRAY[
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ]
    );

END
$$;