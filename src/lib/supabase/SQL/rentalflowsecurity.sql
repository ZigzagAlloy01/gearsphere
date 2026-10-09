-- ------------------------------------------------------------
-- 1. OWNER CANNOT DIRECTLY EDIT RENTAL REQUESTS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS
"Owners can manage listing requests"
ON public.rental_requests;


-- ------------------------------------------------------------
-- 2. USERS CANNOT DIRECTLY CREATE/UPDATE/DELETE RENTALS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS
"Users can create rentals"
ON public.rentals;

DROP POLICY IF EXISTS
"Users can update their rentals"
ON public.rentals;

DROP POLICY IF EXISTS
"Users can delete their rentals"
ON public.rentals;


-- ------------------------------------------------------------
-- 3. OWNER REVIEW FUNCTION
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.review_rental_request(
    p_request_id UUID,
    p_decision TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_request public.rental_requests%ROWTYPE;
    v_listing public.listings%ROWTYPE;
    v_rental_id UUID;
    v_total_price NUMERIC(10,2);
BEGIN

    v_user_id := (SELECT auth.uid());

    -- --------------------------------------------------------
    -- Authentication
    -- --------------------------------------------------------

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'unauthenticated',
            'message', 'You must be signed in.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Validate decision
    -- --------------------------------------------------------

    IF p_decision NOT IN ('approved', 'rejected') THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'invalid_decision',
            'message', 'Decision must be approved or rejected.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Lock request row
    -- --------------------------------------------------------

    SELECT *
    INTO v_request
    FROM public.rental_requests
    WHERE id = p_request_id
    FOR UPDATE;


    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'request_not_found',
            'message', 'Rental request not found.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Get and lock listing
    -- --------------------------------------------------------

    SELECT *
    INTO v_listing
    FROM public.listings
    WHERE id = v_request.listing_id
    FOR UPDATE;


    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'listing_not_found',
            'message', 'The listing no longer exists.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Verify owner
    -- --------------------------------------------------------

    IF v_listing.owner_id <> v_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'forbidden',
            'message',
            'Only the listing owner can review this request.'
        );
    END IF;


    -- --------------------------------------------------------
    -- Only pending requests can be reviewed
    -- --------------------------------------------------------

    IF v_request.status <> 'pending' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'already_reviewed',
            'message',
            'This rental request has already been processed.'
        );
    END IF;


    -- --------------------------------------------------------
    -- REJECT
    -- --------------------------------------------------------

    IF p_decision = 'rejected' THEN

        UPDATE public.rental_requests
        SET
            status = 'rejected',
            updated_at = NOW()
        WHERE id = v_request.id;

        RETURN jsonb_build_object(
            'success', true,
            'code', 'rejected',
            'message', 'Rental request rejected.',
            'request_id', v_request.id
        );

    END IF;


    -- --------------------------------------------------------
    -- APPROVE VALIDATION
    -- --------------------------------------------------------

    IF v_listing.status <> 'available' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'listing_unavailable',
            'message',
            'This listing is no longer available.'
        );
    END IF;


    IF v_request.borrower_id = v_listing.owner_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'self_rental',
            'message',
            'Users cannot rent their own equipment.'
        );
    END IF;


    -- --------------------------------------------------------
    -- PRE-CHECK OVERLAPPING RENTALS
    -- --------------------------------------------------------

    IF EXISTS (
        SELECT 1
        FROM public.rentals r
        WHERE r.listing_id = v_listing.id
        AND r.status IN ('upcoming', 'active')
        AND r.start_date <= v_request.end_date
        AND r.end_date >= v_request.start_date
    ) THEN

        RETURN jsonb_build_object(
            'success', false,
            'code', 'overlap',
            'message',
            'This equipment is already rented for part of those dates.'
        );

    END IF;


    -- --------------------------------------------------------
    -- Calculate total price
    -- --------------------------------------------------------

    v_total_price :=
        (
            (v_request.end_date - v_request.start_date) + 1
        )
        * v_listing.price_per_day;


    -- --------------------------------------------------------
    -- CREATE RENTAL
    -- --------------------------------------------------------

    BEGIN

        INSERT INTO public.rentals (
            listing_id,
            owner_id,
            borrower_id,
            rental_request_id,
            start_date,
            end_date,
            total_price,
            status
        )
        VALUES (
            v_listing.id,
            v_listing.owner_id,
            v_request.borrower_id,
            v_request.id,
            v_request.start_date,
            v_request.end_date,
            v_total_price,
            'upcoming'
        )
        RETURNING id INTO v_rental_id;


    EXCEPTION
        WHEN exclusion_violation THEN

            RETURN jsonb_build_object(
                'success', false,
                'code', 'overlap',
                'message',
                'The equipment was booked for overlapping dates.'
            );

    END;


    -- --------------------------------------------------------
    -- APPROVE REQUEST ONLY AFTER RENTAL WAS CREATED
    -- --------------------------------------------------------

    UPDATE public.rental_requests
    SET
        status = 'approved',
        updated_at = NOW()
    WHERE id = v_request.id;


    RETURN jsonb_build_object(
        'success', true,
        'code', 'approved',
        'message', 'Rental request approved.',
        'request_id', v_request.id,
        'rental_id', v_rental_id,
        'total_price', v_total_price
    );

END;
$$;


-- ------------------------------------------------------------
-- 4. LOCK DOWN FUNCTION EXECUTION
-- ------------------------------------------------------------

REVOKE EXECUTE
ON FUNCTION public.review_rental_request(UUID, TEXT)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.review_rental_request(UUID, TEXT)
TO authenticated;