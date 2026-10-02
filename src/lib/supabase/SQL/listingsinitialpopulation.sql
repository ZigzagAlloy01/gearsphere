DO $$
DECLARE
    v_owner_id uuid := gen_random_uuid();
    v_cat_id uuid;
    v_listing_id uuid;
BEGIN

    SELECT id INTO v_owner_id FROM public.users LIMIT 1;
    
    IF v_owner_id IS NULL THEN
        v_owner_id := gen_random_uuid();

        SET LOCAL session_replication_role = 'replica';

        INSERT INTO public.users (id, email, name)
        VALUES (v_owner_id, 'ivanblued@gmail.com', 'ZigzagAlloy01');

        SET LOCAL session_replication_role = 'origin';
    END IF;

    -- CATEGORY: Photography

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Photography';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Sony Alpha a7 IV Mirrorless Camera', 'Full-frame mirrorless camera with 33MP sensor, 4K 60p video capabilities, and dual card slots. Ideal for professional photography and events.', 45.00, 'available', 'Boise', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1606986628470-26a67fa4730c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'DJI Mavic 3 Pro Drone', 'Tri-camera system drone with Hasselblad optics and up to 43 minutes of flight time. Captures stunning 5.1K aerial footage.', 60.00, 'available', 'Rexburg', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1631052941794-2a6e26d4ac17?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Profoto B10X Location Flash Kit', 'Battery-powered portable studio flash offering 500W of power, fast recycling times, and continuous LED modeling light.', 55.00, 'available', 'Idaho Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1687389821836-5f8ee8b9e5b4?q=80&w=1582&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);
    END IF;

    -- CATEGORY: Construction

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Construction';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'DeWalt 20V MAX Heavy-Duty Jackhammer', 'Cordless electric demolition hammer delivering exceptional impact energy for breaking concrete floors, foundations, and sidewalks.', 75.00, 'available', 'Meridian', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1613790410526-0c15af6a250c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Bosch SDS-Max Rotary Hammer Drill', 'High-performance rotary hammer designed for heavy concrete drilling and chipping applications with vibration control.', 35.00, 'available', 'Pocatello', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/30413428/pexels-photo-30413428.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Wacker Neuson Plate Compactor', 'Commercial grade vibratory plate compactor for soil, asphalt, and gravel compaction on landscaping and construction projects.', 90.00, 'available', 'Twin Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/17315723/pexels-photo-17315723.jpeg', 0);
    END IF;

    -- CATEGORY: Sports & Recreation

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Sports & Recreation';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Specialized Rockhopper Mountain Bike', 'Trail-ready hardtail mountain bike with hydraulic disc brakes, responsive suspension fork, and 29-inch wheels.', 30.00, 'available', 'Coeur d Alene', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/31636727/pexels-photo-31636727.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Inflatable Two-Person Kayak', 'Durable drop-stitch construction kayak complete with paddles, high-pressure hand pump, and comfortable seats for recreational water adventures.', 25.00, 'available', 'Nampa', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://plus.unsplash.com/premium_photo-1681169158032-dbcc1f1e1a33?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Callaway Complete Golf Club Set', 'Men right-handed comprehensive golf set including driver, fairway woods, irons, putter, and a lightweight stand bag.', 40.00, 'available', 'Caldwell', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/7758346/pexels-photo-7758346.jpeg', 0);
    END IF;

    -- CATEGORY: Party & Events

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Party & Events';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Commercial Grade Outdoor Canopy Tent', 'Heavy-duty 10x20 ft waterproof party tent with removable sidewalls, perfect for weddings, birthdays, and outdoor corporate events.', 50.00, 'available', 'Lewiston', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://plus.unsplash.com/premium_photo-1762115489142-9c546f7b22bd?q=80&w=1606&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'JBL PartyBox 310 Portable Speaker', 'High-power Bluetooth party speaker featuring dazzling dynamic light shows, microphone inputs, and deep bass for indoor/outdoor gatherings.', 45.00, 'available', 'Post Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1687772424499-21363b114191?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Round Folding Banquet Tables & Chairs Set', 'Includes one 60-inch round folding table and 8 padded chairs. Ideal for family dinners, catering, and social events.', 25.00, 'available', 'Moscow', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1677129661406-114c058df06c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);
    END IF;

    -- CATEGORY: Other

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Other';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Heavy Duty Moving Dolly & Hand Truck', 'Convertible aluminum hand truck and dolly with solid rubber wheels, rated up to 800 lbs for seamless furniture and box transport.', 15.00, 'available', 'Boise', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/12522022/pexels-photo-12522022.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, '10-Foot Aluminum Extension Ladder', 'ANSI Type I heavy-duty extension ladder featuring slip-resistant rungs and quick-latch mechanisms for safe elevation work.', 20.00, 'available', 'Rexburg', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://plus.unsplash.com/premium_photo-1663088640356-ca855fd9d609?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Professional Carpet Steam Cleaner', 'Deep-cleaning residential carpet extractor with dual motor suction and heated cleaning technology to eliminate stubborn stains.', 35.00, 'available', 'Idaho Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://plus.unsplash.com/premium_photo-1661663379320-213541539ec8?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);
    END IF;

    -- CATEGORY: Outdoor & Camping

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Outdoor & Camping';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Coleman 4-Person Instant Tent', 'Spacious cabin tent that sets up in under 2 minutes with pre-attached poles, weather-resistant fabric, and room for 3 queen air beds.', 25.00, 'available', 'Meridian', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://plus.unsplash.com/premium_photo-1680742509291-52bc7a7f1bbf?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Yeti Tundra 65 Hard Cooler', 'Roto-molded premium cooler featuring PermaFrost insulation to keep ice for days during camping trips and tailgates.', 15.00, 'available', 'Pocatello', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1626011691736-491522324aa0?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Garmin Montana 700i GPS Handheld', 'Rugged GPS navigator with global inReach satellite communication capabilities, routable TOPO mapping, and a 5-inch touch display.', 20.00, 'available', 'Twin Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/30403062/pexels-photo-30403062.jpeg', 0);
    END IF;

    -- CATEGORY: Gardening 

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Gardening';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Honda HRX218VKA Self-Propelled Lawn Mower', 'Gas-powered 21-inch lawn mower with variable speed Select Drive and Versamow system for mulching, bagging, and discharging.', 30.00, 'available', 'Coeur d Alene', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/5163433/pexels-photo-5163433.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Stihl Gas Powered Chainsaw', 'Powerful 18-inch guide bar chainsaw designed for fast tree felling, limb pruning, and firewood cutting on residential properties.', 35.00, 'available', 'Nampa', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/32796705/pexels-photo-32796705.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Earthwise Cordless Electric Tiller', '40-volt electric garden cultivator with adjustable steel tines, ideal for loosening soil in vegetable gardens and flower beds.', 25.00, 'available', 'Caldwell', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/36183685/pexels-photo-36183685.jpeg', 0);
    END IF;

    -- CATEGORY: Power Tools

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Power Tools';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'DeWalt 20V MAX Cordless Combo Kit', '4-tool combo kit featuring hammer drill, impact driver, reciprocating saw, LED work light, batteries, and fast charger.', 30.00, 'available', 'Lewiston', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/30486958/pexels-photo-30486958.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Milwaukee M18 FUEL Jobsite Table Saw', '8-1/4 inch cordless table saw with rack and pinion fence system, delivering full corded performance on job sites.', 40.00, 'available', 'Post Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/28518832/pexels-photo-28518832.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Makita Sliding Compound Miter Saw', '10-inch dual-bevel sliding miter saw with laser marker and smooth rail system for precise crosscuts and miters in lumber.', 35.00, 'available', 'Moscow', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/30237897/pexels-photo-30237897.jpeg', 0);
    END IF;

    -- CATEGORY: Hand Tools 

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Hand Tools';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Craftsman 230-Piece Mechanic Tool Set', 'Comprehensive socket, wrench, and ratchet set forged from alloy steel, housed in a durable 3-drawer blow-molded case.', 20.00, 'available', 'Boise', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Estwing Framing Hammer & Chisel Set', '16 oz solid steel-headed framing hammer with shock-reduction grip, paired with heavy-duty wood chisels for carpentry.', 12.00, 'available', 'Meridian', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/16922985/pexels-photo-16922985.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Stanley Heavy-Duty Pipe Wrench Set', 'Professional plumber wrench set including 10-inch, 14-inch, and 18-inch forged steel pipe wrenches with non-stick jaws.', 15.00, 'available', 'Twin Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/5210901/pexels-photo-5210901.jpeg', 0);
    END IF;

    -- CATEGORY: Electronics

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Electronics';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'MacBook Pro 16-inch M3 Max', 'High-end creator laptop with 36GB unified memory, 1TB SSD, Liquid Retina XDR display, and supreme processing performance.', 65.00, 'available', 'Rexburg', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/8524596/pexels-photo-8524596.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling over-ear headphones with exceptional sound clarity, 30-hour battery life, and crystal-clear calls.', 20.00, 'available', 'Idaho Falls', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.pexels.com/photos/5382359/pexels-photo-5382359.jpeg', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Epson 4K Pro-Uso Home Theater Projector', 'High-definition home cinema projector with advanced HDR processing and high lumens output for stunning movie nights.', 55.00, 'available', 'Pocatello', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1768502171609-a51a20ea027a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);
    END IF;

    -- CATEGORY: Automotive

    SELECT id INTO v_cat_id FROM public.categories WHERE name = 'Automotive';
    IF v_cat_id IS NOT NULL THEN

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Bluetooth Code Reader', 'Wireless vehicle diagnostic scanner tool that reads check engine lights, live sensor data, and system diagnostics via smartphone app.', 15.00, 'available', 'Nampa', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://images.unsplash.com/photo-1637597384329-f2dd4cdf61e6?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, '3-Ton Low Profile Floor Jack & Stand Kit', 'Heavy-duty steel hydraulic floor jack paired with a pair of 3-ton jack stands for secure vehicle lifting and maintenance.', 25.00, 'available', 'Caldwell', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://plus.unsplash.com/premium_photo-1683141561399-76ad4a53e1fb?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 0);

        INSERT INTO public.listings (owner_id, category_id, title, description, price_per_day, status, city, state, country)
        VALUES (v_owner_id, v_cat_id, 'Folding Engine Crane & Load Leveler', '2-ton capacity hydraulic shop crane with adjustable boom and heavy-duty casters for safe engine removal and garage work.', 40.00, 'available', 'Coeur d Alene', 'Idaho', 'United States')
        RETURNING id INTO v_listing_id;
        
        INSERT INTO public.listing_images (listing_id, image_url, display_order)
        VALUES (v_listing_id, 'https://live.staticflickr.com/65535/55536588868_ca40a6a22b_c.jpg', 0);
    END IF;

    RAISE NOTICE 'Successfully populated 33 listings across 12 different cities in Idaho!';
END $$;