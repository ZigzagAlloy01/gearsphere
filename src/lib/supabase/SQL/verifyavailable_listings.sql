SELECT 
    '1. available_listings' AS elemento_evaluado,
    c.reloptions AS opciones_vista, -- Debe mostrar security_invoker=false (o vacío si por defecto es false)
    has_table_privilege('anon', 'public.available_listings', 'SELECT') AS anon_tiene_select,
    has_table_privilege('authenticated', 'public.available_listings', 'SELECT') AS auth_tiene_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'available_listings';

SELECT 
    '2. public_listing_images' AS elemento_evaluado,
    EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' AND table_name = 'public_listing_images'
    ) AS la_vista_existe,
    has_table_privilege('anon', 'public.public_listing_images', 'SELECT') AS anon_tiene_select,
    has_table_privilege('authenticated', 'public.public_listing_images', 'SELECT') AS auth_tiene_select;

SELECT 
    '3. policy categories' AS elemento_evaluado,
    policyname,
    cmd AS operacion,
    roles,
    qual AS condicion
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'categories' 
  AND policyname = 'Anyone can view categories';