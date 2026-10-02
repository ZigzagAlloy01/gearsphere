CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
--  -- 1. ENUM TYPES -- 
DO $$ BEGIN
IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'listing_status'
) THEN
    CREATE TYPE listing_status AS ENUM (
        'available',
        'paused',
        'rented',
        'archived'
    );
END IF;


IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'request_status'
) THEN
    CREATE TYPE request_status AS ENUM (
        'pending',
        'approved',
        'rejected',
        'cancelled'
    );
END IF;


IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'rental_status'
) THEN
    CREATE TYPE rental_status AS ENUM (
        'upcoming',
        'active',
        'completed',
        'cancelled'
    );
END IF;


IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'review_target_type'
) THEN
    CREATE TYPE review_target_type AS ENUM (
        'listing',
        'user'
    );
END IF;
 
END $$;
--  -- 2. UPDATED_AT FUNCTION -- 
CREATE OR REPLACE FUNCTION public.set_updated_at() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$ 
BEGIN NEW.updated_at = NOW(); RETURN NEW; 
END; $$;
--  -- 3. PROFILES -- 
CREATE TABLE IF NOT EXISTS public.profiles (
id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

name TEXT NOT NULL,

email TEXT NOT NULL UNIQUE,

image TEXT,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT profiles_name_length
    CHECK (char_length(name) BETWEEN 1 AND 100)
 
);
--  -- 4. AUTOMATIC PROFILE CREATION -- 
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
INSERT INTO public.profiles (
    id,
    name,
    email
)
VALUES (
    NEW.id,

    COALESCE(
        NEW.raw_user_meta_data ->> 'name',
        split_part(NEW.email, '@', 1)
    ),

    NEW.email
);

RETURN NEW;
 
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--  -- 5. PROFILE UPDATED_AT TRIGGER -- 
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--  -- 6. CATEGORIES -- 
CREATE TABLE IF NOT EXISTS public.categories (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

name TEXT NOT NULL UNIQUE,

description TEXT,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 
);
--  -- 7. LISTINGS -- 
CREATE TABLE IF NOT EXISTS public.listings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

owner_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

category_id UUID
    REFERENCES public.categories(id)
    ON DELETE SET NULL,

title TEXT NOT NULL,

description TEXT NOT NULL,

price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,

status listing_status NOT NULL DEFAULT 'available',

latitude DOUBLE PRECISION,

longitude DOUBLE PRECISION,

city TEXT,

state TEXT,

country TEXT DEFAULT 'USA',

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT listings_title_length
    CHECK (char_length(title) BETWEEN 1 AND 150),

CONSTRAINT listings_description_length
    CHECK (char_length(description) BETWEEN 1 AND 5000),

CONSTRAINT listings_price_nonnegative
    CHECK (price_per_day >= 0),

CONSTRAINT listings_latitude_valid
    CHECK (
        latitude IS NULL
        OR latitude BETWEEN -90 AND 90
    ),

CONSTRAINT listings_longitude_valid
    CHECK (
        longitude IS NULL
        OR longitude BETWEEN -180 AND 180
    )
 
);
--  -- 8. LISTING IMAGES -- 
CREATE TABLE IF NOT EXISTS public.listing_images (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

listing_id UUID NOT NULL
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

image_url TEXT NOT NULL,

storage_path TEXT,

display_order INTEGER NOT NULL DEFAULT 0,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT listing_images_display_order_nonnegative
    CHECK (display_order >= 0)
 
);
--  -- 9. RENTAL REQUESTS -- 
CREATE TABLE IF NOT EXISTS public.rental_requests (
 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 
    listing_id UUID NOT NULL
        REFERENCES public.listings(id)
        ON DELETE CASCADE,
 
    borrower_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,
 
    start_date DATE NOT NULL,
 
    end_date DATE NOT NULL,
 
    message TEXT,
 
    status request_status NOT NULL DEFAULT 'pending',
 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 
    CONSTRAINT rental_requests_valid_dates
        CHECK (end_date >= start_date)
 
);

CREATE OR REPLACE FUNCTION public.prevent_self_rental_request()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    listing_owner UUID;
BEGIN
 
    SELECT owner_id
    INTO listing_owner
    FROM public.listings
    WHERE id = NEW.listing_id;
 
    IF listing_owner = NEW.borrower_id THEN
        RAISE EXCEPTION 'Users cannot request their own listings';
    END IF;
 
    RETURN NEW;
END;
$$;
 
 
DROP TRIGGER IF EXISTS prevent_self_rental_request_trigger
ON public.rental_requests;
 
 
CREATE TRIGGER prevent_self_rental_request_trigger
BEFORE INSERT OR UPDATE
ON public.rental_requests
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_rental_request();
--  -- 10. RENTALS -- 
CREATE TABLE IF NOT EXISTS public.rentals (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

listing_id UUID NOT NULL
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

owner_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

borrower_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

rental_request_id UUID UNIQUE
    REFERENCES public.rental_requests(id)
    ON DELETE SET NULL,

start_date DATE NOT NULL,

end_date DATE NOT NULL,

total_price NUMERIC(10,2) NOT NULL DEFAULT 0,

status rental_status NOT NULL DEFAULT 'upcoming',

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT rentals_valid_dates
    CHECK (end_date >= start_date),

CONSTRAINT rentals_total_price_nonnegative
    CHECK (total_price >= 0),

CONSTRAINT rentals_owner_borrower_different
    CHECK (owner_id <> borrower_id)
 
);
--  -- 11. PREVENT DOUBLE BOOKINGS -- 
ALTER TABLE public.rentals
DROP CONSTRAINT IF EXISTS rentals_no_overlapping_dates;
ALTER TABLE public.rentals
ADD CONSTRAINT rentals_no_overlapping_dates
EXCLUDE USING GIST (
listing_id WITH =,

daterange(
    start_date,
    end_date,
    '[]'
) WITH &&
 
)
WHERE ( status IN ('upcoming', 'active') );
--  -- 12. CONVERSATIONS -- 
CREATE TABLE IF NOT EXISTS public.conversations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

listing_id UUID
    REFERENCES public.listings(id)
    ON DELETE SET NULL,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 
);
--  -- 13. CONVERSATION PARTICIPANTS -- 
CREATE TABLE IF NOT EXISTS public.conversation_participants (
conversation_id UUID NOT NULL
    REFERENCES public.conversations(id)
    ON DELETE CASCADE,

user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

PRIMARY KEY (
    conversation_id,
    user_id
)
 
);
--  -- 14. MESSAGES -- 
CREATE TABLE IF NOT EXISTS public.messages (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

conversation_id UUID NOT NULL
    REFERENCES public.conversations(id)
    ON DELETE CASCADE,

sender_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

content TEXT NOT NULL,

read_at TIMESTAMPTZ,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT messages_content_length
    CHECK (char_length(content) BETWEEN 1 AND 5000)
 
);
--  -- 15. REVIEWS -- 
CREATE TABLE IF NOT EXISTS public.reviews (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

rental_id UUID NOT NULL
    REFERENCES public.rentals(id)
    ON DELETE CASCADE,

reviewer_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

target_type review_target_type NOT NULL,

target_user_id UUID
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

listing_id UUID
    REFERENCES public.listings(id)
    ON DELETE CASCADE,

rating INTEGER NOT NULL,

comment TEXT,

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

CONSTRAINT reviews_rating_valid
    CHECK (rating BETWEEN 1 AND 5),

CONSTRAINT reviews_valid_target
    CHECK (
        (
            target_type = 'user'
            AND target_user_id IS NOT NULL
            AND listing_id IS NULL
        )
        OR
        (
            target_type = 'listing'
            AND target_user_id IS NULL
            AND listing_id IS NOT NULL
        )
    ),

CONSTRAINT reviews_not_self
    CHECK (
        target_user_id IS NULL
        OR reviewer_id <> target_user_id
    )
 
);
--  -- 16. REVIEW UNIQUENESS -- 
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_review_per_target ON public.reviews ( rental_id, reviewer_id, target_type );
--  -- 17. INDEXES -- 
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rental_requests_borrower_id ON public.rental_requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON public.rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_rental_requests_dates ON public.rental_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rentals_owner_id ON public.rentals(owner_id);
CREATE INDEX IF NOT EXISTS idx_rentals_borrower_id ON public.rentals(borrower_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_dates ON public.rentals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_user ON public.reviews(target_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.reviews(listing_id);
--  -- 18. UPDATED_AT TRIGGERS -- 
DROP TRIGGER IF EXISTS listings_set_updated_at ON public.listings;
CREATE TRIGGER listings_set_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS rental_requests_set_updated_at ON public.rental_requests;
CREATE TRIGGER rental_requests_set_updated_at BEFORE UPDATE ON public.rental_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS rentals_set_updated_at ON public.rentals;
CREATE TRIGGER rentals_set_updated_at BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS conversations_set_updated_at ON public.conversations;
CREATE TRIGGER conversations_set_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS reviews_set_updated_at ON public.reviews;
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
--  -- 19. FULL TEXT SEARCH -- 
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS search_vector TSVECTOR GENERATED ALWAYS AS ( to_tsvector( 'spanish', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, '') ) ) STORED;
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING GIN(search_vector);
--  -- 20. ROW LEVEL SECURITY -- 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
--  -- 21. PROFILE POLICIES -- 
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
--  -- 22. CATEGORY POLICIES -- 
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
--  -- 23. LISTING POLICIES -- 
DROP POLICY IF EXISTS "Authenticated users can view available listings" ON public.listings;
CREATE POLICY "Authenticated users can view available listings" ON public.listings FOR SELECT TO authenticated USING ( status <> 'archived' OR owner_id = auth.uid() );
DROP POLICY IF EXISTS "Users can create own listings" ON public.listings;
CREATE POLICY "Users can create own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK ( owner_id = auth.uid() );
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE TO authenticated USING ( owner_id = auth.uid() ) WITH CHECK ( owner_id = auth.uid() );
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE TO authenticated USING ( owner_id = auth.uid() );
--  -- 24. LISTING IMAGE POLICIES -- 
DROP POLICY IF EXISTS "Users can view listing images" ON public.listing_images;
CREATE POLICY "Users can view listing images" ON public.listing_images FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owners can add listing images" ON public.listing_images;
CREATE POLICY "Owners can add listing images" ON public.listing_images FOR INSERT TO authenticated WITH CHECK ( EXISTS ( SELECT 1 FROM public.listings WHERE listings.id = listing_images.listing_id AND listings.owner_id = auth.uid() ) );
DROP POLICY IF EXISTS "Owners can update listing images" ON public.listing_images;
CREATE POLICY "Owners can update listing images" ON public.listing_images FOR UPDATE TO authenticated USING ( EXISTS ( SELECT 1 FROM public.listings WHERE listings.id = listing_images.listing_id AND listings.owner_id = auth.uid() ) );
DROP POLICY IF EXISTS "Owners can delete listing images" ON public.listing_images;
CREATE POLICY "Owners can delete listing images" ON public.listing_images FOR DELETE TO authenticated USING ( EXISTS ( SELECT 1 FROM public.listings WHERE listings.id = listing_images.listing_id AND listings.owner_id = auth.uid() ) );
--  -- 25. RENTAL REQUEST POLICIES -- 
DROP POLICY IF EXISTS "Users can view their rental requests" ON public.rental_requests;
CREATE POLICY "Users can view their rental requests" ON public.rental_requests FOR SELECT TO authenticated USING ( borrower_id = auth.uid() OR EXISTS ( SELECT 1 FROM public.listings WHERE listings.id = rental_requests.listing_id AND listings.owner_id = auth.uid() ) );
DROP POLICY IF EXISTS "Users can create rental requests" ON public.rental_requests;
CREATE POLICY "Users can create rental requests" ON public.rental_requests FOR INSERT TO authenticated WITH CHECK ( borrower_id = auth.uid() );
DROP POLICY IF EXISTS "Borrowers can cancel their requests" ON public.rental_requests;
CREATE POLICY "Borrowers can cancel their requests" ON public.rental_requests
FOR UPDATE
TO authenticated
USING (
    borrower_id = auth.uid()
    AND status = 'pending'
)
WITH CHECK (
    borrower_id = auth.uid()
    AND status = 'cancelled'
);
DROP POLICY IF EXISTS "Owners can manage listing requests" ON public.rental_requests;
CREATE POLICY "Owners can manage listing requests" ON public.rental_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.listings
        WHERE listings.id = rental_requests.listing_id
        AND listings.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.listings
        WHERE listings.id = rental_requests.listing_id
        AND listings.owner_id = auth.uid()
    )
);
--  -- 26. RENTAL POLICIES -- 
DROP POLICY IF EXISTS "Users can view their rentals" ON public.rentals;
CREATE POLICY "Users can view their rentals" ON public.rentals
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid()
    OR borrower_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can create rentals" ON public.rentals;
CREATE POLICY "Users can create rentals" ON public.rentals
FOR INSERT
TO authenticated
WITH CHECK (
    owner_id = auth.uid()
    OR borrower_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can update their rentals" ON public.rentals;
CREATE POLICY "Users can update their rentals" ON public.rentals
FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid()
    OR borrower_id = auth.uid()
)
WITH CHECK (
    owner_id = auth.uid()
    OR borrower_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can delete their rentals" ON public.rentals;
CREATE POLICY "Users can delete their rentals" ON public.rentals
FOR DELETE
TO authenticated
USING (
    owner_id = auth.uid()
    OR borrower_id = auth.uid()
);

--  -- 27. CONVERSATION POLICIES -- 
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT TO authenticated USING ( EXISTS ( SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid() ) );
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
--  -- 28. CONVERSATION PARTICIPANT POLICIES -- 
DROP POLICY IF EXISTS "Participants can view participants" ON public.conversation_participants;
CREATE POLICY "Participants can view participants" ON public.conversation_participants FOR SELECT TO authenticated USING ( EXISTS ( SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid() ) );
DROP POLICY IF EXISTS "Users can add themselves to conversations" ON public.conversation_participants;
CREATE POLICY "Users can add themselves to conversations" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK ( user_id = auth.uid() );
--  -- 29. MESSAGE POLICIES -- 
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated USING ( EXISTS ( SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid() ) );
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK ( sender_id = auth.uid() AND EXISTS ( SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid() ) );
--  -- 30. REVIEW POLICIES -- 
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.rentals r
        WHERE r.id = reviews.rental_id
        AND (
            r.owner_id = auth.uid()
            OR r.borrower_id = auth.uid()
        )
        AND r.status = 'completed'
    )
);
--  -- 31. SEED CATEGORIES -- 
INSERT INTO public.categories ( name, description ) VALUES
( 'Power Tools', 'Electric and battery-powered tools.' ),
( 'Hand Tools', 'Manual tools for construction, repair and maintenance.' ),
( 'Outdoor & Camping', 'Camping, hiking and outdoor recreation equipment.' ),
( 'Gardening', 'Tools and equipment for gardening and landscaping.' ),
( 'Automotive', 'Tools and equipment for vehicle maintenance and repair.' ),
( 'Construction', 'Construction and renovation equipment.' ),
( 'Photography', 'Cameras, lenses, lighting and photography equipment.' ),
( 'Sports & Recreation', 'Sports and recreational equipment.' ),
( 'Party & Events', 'Equipment and supplies for parties and events.' ),
( 'Electronics', 'Electronic equipment and accessories.' ),
( 'Other', 'Items that do not fit another category.' )
ON CONFLICT (name) DO NOTHING;
--  -- 32. DASHBOARD VIEW -- 
CREATE OR REPLACE VIEW public.user_dashboard_stats WITH (security_invoker = true) AS
SELECT
p.id AS user_id,

(
    SELECT COUNT(*)
    FROM public.listings l
    WHERE l.owner_id = p.id
    AND l.status <> 'archived'
) AS listings_count,

(
    SELECT COUNT(*)
    FROM public.rental_requests rr
    JOIN public.listings l
        ON l.id = rr.listing_id
    WHERE l.owner_id = p.id
    AND rr.status = 'pending'
) AS requests_count,

(
    SELECT COUNT(*)
    FROM public.rentals r
    WHERE (
        r.owner_id = p.id
        OR r.borrower_id = p.id
    )
    AND r.status IN ('upcoming', 'active')
) AS rentals_count,

(
    SELECT COUNT(*)
    FROM public.messages m
    JOIN public.conversation_participants cp
        ON cp.conversation_id = m.conversation_id
    WHERE cp.user_id = p.id
    AND m.sender_id <> p.id
    AND m.read_at IS NULL
) AS messages_count
 
FROM public.profiles p;
--  -- 33. LISTING SEARCH VIEW -- 
CREATE OR REPLACE VIEW public.available_listings WITH (security_invoker = true) AS
SELECT
l.id,

l.owner_id,

p.name AS owner_name,

p.image AS owner_image,

l.category_id,

c.name AS category_name,

l.title,

l.description,

l.price_per_day,

l.status,

l.latitude,

l.longitude,

l.city,

l.state,

l.country,

l.created_at,

(
    SELECT li.image_url
    FROM public.listing_images li
    WHERE li.listing_id = l.id
    ORDER BY li.display_order ASC
    LIMIT 1
) AS primary_image
 
FROM public.listings l
LEFT JOIN public.profiles p ON p.id = l.owner_id
LEFT JOIN public.categories c ON c.id = l.category_id
WHERE l.status = 'available';