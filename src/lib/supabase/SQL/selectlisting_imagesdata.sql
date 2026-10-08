SELECT json_agg(to_jsonb(l)) AS listings_json
FROM public.listing_images l;