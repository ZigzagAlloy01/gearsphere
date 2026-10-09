CREATE POLICY "Owners can update their rentals"
ON public.rentals
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = rentals.listing_id
      AND listings.owner_id = auth.uid()
  )
);