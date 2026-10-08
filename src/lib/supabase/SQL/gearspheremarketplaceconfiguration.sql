-- ============================================================
-- 1. FAVORITES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    listing_id UUID NOT NULL
        REFERENCES public.listings(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (
        user_id,
        listing_id
    )
);


CREATE INDEX IF NOT EXISTS idx_favorites_listing_id
ON public.favorites(listing_id);


CREATE INDEX IF NOT EXISTS idx_favorites_user_id
ON public.favorites(user_id);


ALTER TABLE public.favorites
ENABLE ROW LEVEL SECURITY;


REVOKE ALL
ON public.favorites
FROM anon;


GRANT SELECT, INSERT, DELETE
ON public.favorites
TO authenticated;


DROP POLICY IF EXISTS
"Users can view their favorites"
ON public.favorites;

CREATE POLICY
"Users can view their favorites"
ON public.favorites
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);


DROP POLICY IF EXISTS
"Users can create their own favorites"
ON public.favorites;

CREATE POLICY
"Users can create their own favorites"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);


DROP POLICY IF EXISTS
"Users can delete their own favorites"
ON public.favorites;

CREATE POLICY
"Users can delete their own favorites"
ON public.favorites
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
);



-- ============================================================
-- 2. PUBLIC LISTING REVIEWS VIEW
-- ============================================================

DROP VIEW IF EXISTS public.public_listing_reviews;


CREATE VIEW public.public_listing_reviews
WITH (security_invoker = false)
AS
SELECT
    r.id,
    r.listing_id,
    r.reviewer_id,

    u.name AS reviewer_name,
    u.image AS reviewer_image,

    r.rating,
    r.comment,
    r.created_at

FROM public.reviews r

INNER JOIN public.users u
    ON u.id = r.reviewer_id

WHERE
    r.target_type = 'listing';


GRANT SELECT
ON public.public_listing_reviews
TO anon, authenticated;



-- ============================================================
-- 3. REVIEW CREATION FUNCTION
-- ============================================================

DROP FUNCTION IF EXISTS
public.submit_listing_review(
    UUID,
    UUID,
    INTEGER,
    TEXT
);


CREATE FUNCTION public.submit_listing_review(
    p_rental_id UUID,
    p_listing_id UUID,
    p_rating INTEGER,
    p_comment TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_rental public.rentals%ROWTYPE;
    v_review_id UUID;
BEGIN

    v_user_id := (SELECT auth.uid());


    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'unauthenticated',
            'message', 'You must be signed in.'
        );
    END IF;


    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'invalid_rating',
            'message', 'Rating must be between 1 and 5.'
        );
    END IF;


    IF p_comment IS NOT NULL
       AND char_length(trim(p_comment)) > 2000
    THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'comment_too_long',
            'message', 'Review must be 2000 characters or less.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Verify completed rental
    -- --------------------------------------------------------

    SELECT *
    INTO v_rental
    FROM public.rentals
    WHERE id = p_rental_id
      AND listing_id = p_listing_id
      AND status = 'completed'
      AND (
          owner_id = v_user_id
          OR borrower_id = v_user_id
      );


    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'rental_not_eligible',
            'message',
            'You can only review equipment from a completed rental.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Prevent duplicate listing review for same rental
    -- --------------------------------------------------------

    IF EXISTS (
        SELECT 1
        FROM public.reviews
        WHERE rental_id = p_rental_id
          AND reviewer_id = v_user_id
          AND target_type = 'listing'
    ) THEN

        RETURN jsonb_build_object(
            'success', false,
            'code', 'already_reviewed',
            'message',
            'You already reviewed this rental.'
        );

    END IF;


    INSERT INTO public.reviews (
        rental_id,
        reviewer_id,
        target_type,
        target_user_id,
        listing_id,
        rating,
        comment
    )
    VALUES (
        p_rental_id,
        v_user_id,
        'listing',
        NULL,
        p_listing_id,
        p_rating,
        NULLIF(trim(p_comment), '')
    )
    RETURNING id INTO v_review_id;


    RETURN jsonb_build_object(
        'success', true,
        'review_id', v_review_id
    );

END;
$$;


REVOKE EXECUTE
ON FUNCTION public.submit_listing_review(
    UUID,
    UUID,
    INTEGER,
    TEXT
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.submit_listing_review(
    UUID,
    UUID,
    INTEGER,
    TEXT
)
TO authenticated;



-- Prevent direct review insertion through the API.
REVOKE INSERT
ON public.reviews
FROM anon, authenticated;



-- ============================================================
-- 4. SERVER-SIDE MARKETPLACE SEARCH
-- ============================================================

DROP FUNCTION IF EXISTS
public.search_available_listings(
    TEXT,
    UUID,
    TEXT,
    NUMERIC,
    NUMERIC,
    DOUBLE PRECISION,
    DOUBLE PRECISION,
    DOUBLE PRECISION,
    DATE,
    DATE,
    TEXT,
    INTEGER,
    INTEGER
);


CREATE FUNCTION public.search_available_listings(
    p_query TEXT DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT NULL,

    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,

    p_lat DOUBLE PRECISION DEFAULT NULL,
    p_lng DOUBLE PRECISION DEFAULT NULL,
    p_radius_miles DOUBLE PRECISION DEFAULT NULL,

    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,

    p_sort TEXT DEFAULT 'newest',

    p_limit INTEGER DEFAULT 12,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    owner_id UUID,
    owner_name TEXT,
    owner_image TEXT,

    category_id UUID,
    category_name TEXT,

    title TEXT,
    description TEXT,

    price_per_day NUMERIC,

    status TEXT,

    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    city TEXT,
    state TEXT,
    country TEXT,

    created_at TIMESTAMPTZ,

    primary_image TEXT,

    distance_miles DOUBLE PRECISION,

    total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$

WITH candidates AS (

    SELECT
        l.*,

        CASE
            WHEN
                p_lat IS NOT NULL
                AND p_lng IS NOT NULL
                AND l.latitude IS NOT NULL
                AND l.longitude IS NOT NULL
            THEN
                3958.7613 * acos(
                    LEAST(
                        1,
                        GREATEST(
                            -1,

                            cos(radians(p_lat))
                            *
                            cos(radians(l.latitude))
                            *
                            cos(
                                radians(l.longitude)
                                - radians(p_lng)
                            )

                            +

                            sin(radians(p_lat))
                            *
                            sin(radians(l.latitude))
                        )
                    )
                )

            ELSE NULL
        END AS calculated_distance

    FROM public.available_listings l

    WHERE
        (
            NULLIF(trim(p_query), '') IS NULL

            OR l.title ILIKE
                '%' || trim(p_query) || '%'

            OR l.description ILIKE
                '%' || trim(p_query) || '%'

            OR l.category_name ILIKE
                '%' || trim(p_query) || '%'

            OR l.city ILIKE
                '%' || trim(p_query) || '%'

            OR l.state ILIKE
                '%' || trim(p_query) || '%'

            OR l.owner_name ILIKE
                '%' || trim(p_query) || '%'
        )


        AND (
            p_category_id IS NULL
            OR l.category_id = p_category_id
        )


        AND (
            NULLIF(trim(p_location), '') IS NULL

            OR l.city ILIKE
                '%' || trim(p_location) || '%'

            OR l.state ILIKE
                '%' || trim(p_location) || '%'

            OR l.country ILIKE
                '%' || trim(p_location) || '%'
        )


        AND (
            p_min_price IS NULL
            OR l.price_per_day >= p_min_price
        )


        AND (
            p_max_price IS NULL
            OR l.price_per_day <= p_max_price
        )


        -- ----------------------------------------------------
        -- Date availability
        -- ----------------------------------------------------

        AND (
            p_start_date IS NULL
            OR p_end_date IS NULL

            OR NOT EXISTS (
                SELECT 1
                FROM public.rentals r
                WHERE
                    r.listing_id = l.id

                    AND r.status IN (
                        'upcoming',
                        'active'
                    )

                    AND r.start_date <= p_end_date
                    AND r.end_date >= p_start_date
            )
        )
)

SELECT
    c.id,
    c.owner_id,
    c.owner_name,
    c.owner_image,

    c.category_id,
    c.category_name,

    c.title,
    c.description,

    c.price_per_day,

    c.status,

    c.latitude,
    c.longitude,

    c.city,
    c.state,
    c.country,

    c.created_at,

    c.primary_image,

    c.calculated_distance AS distance_miles,

    COUNT(*) OVER () AS total_count

FROM candidates c

WHERE
    (
        p_lat IS NULL
        OR p_lng IS NULL
        OR p_radius_miles IS NULL

        OR (
            c.calculated_distance IS NOT NULL
            AND c.calculated_distance <= p_radius_miles
        )
    )

ORDER BY

    CASE
        WHEN p_sort = 'oldest'
        THEN c.created_at
    END ASC NULLS LAST,

    CASE
        WHEN p_sort = 'price_low'
        THEN c.price_per_day
    END ASC NULLS LAST,

    CASE
        WHEN p_sort = 'price_high'
        THEN c.price_per_day
    END DESC NULLS LAST,

    CASE
        WHEN p_sort = 'name'
        THEN lower(c.title)
    END ASC NULLS LAST,

    c.created_at DESC

LIMIT LEAST(
    GREATEST(
        COALESCE(p_limit, 12),
        1
    ),
    48
)

OFFSET GREATEST(
    COALESCE(p_offset, 0),
    0
);

$$;


REVOKE EXECUTE
ON FUNCTION public.search_available_listings(
    TEXT,
    UUID,
    TEXT,
    NUMERIC,
    NUMERIC,
    DOUBLE PRECISION,
    DOUBLE PRECISION,
    DOUBLE PRECISION,
    DATE,
    DATE,
    TEXT,
    INTEGER,
    INTEGER
)
FROM PUBLIC;


GRANT EXECUTE
ON FUNCTION public.search_available_listings(
    TEXT,
    UUID,
    TEXT,
    NUMERIC,
    NUMERIC,
    DOUBLE PRECISION,
    DOUBLE PRECISION,
    DOUBLE PRECISION,
    DATE,
    DATE,
    TEXT,
    INTEGER,
    INTEGER
)
TO anon, authenticated;



-- ============================================================
-- 5. PUBLIC VIEW ACCESS
-- ============================================================

ALTER VIEW public.available_listings
SET (security_invoker = false);


GRANT SELECT
ON public.available_listings
TO anon, authenticated;