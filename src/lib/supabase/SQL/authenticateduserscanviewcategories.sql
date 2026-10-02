DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;

CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
TO public 
USING (true);