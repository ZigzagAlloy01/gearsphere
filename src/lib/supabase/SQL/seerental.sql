SELECT
    id,
    listing_id,
    owner_id,
    borrower_id,
    status,
    start_date,
    end_date
FROM rentals
WHERE listing_id = '55a510d8-41dc-4e56-8673-2a8a01af678e'
ORDER BY end_date DESC;