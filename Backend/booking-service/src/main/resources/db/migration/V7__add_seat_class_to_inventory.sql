-- Step 1: Add seat_class column
ALTER TABLE booking_service.seat_inventory
    ADD COLUMN seat_class VARCHAR(20);

-- Step 2: Update unique constraint to include seat_class
-- (trainId + travelDate alone is no longer unique — need class too)
ALTER TABLE booking_service.seat_inventory
DROP CONSTRAINT IF EXISTS uq_train_date;

ALTER TABLE booking_service.seat_inventory
    ADD CONSTRAINT uq_train_date_class
        UNIQUE (train_id, travel_date, seat_class);

-- Step 3: Handle existing rows (set a default so NOT NULL works)
UPDATE booking_service.seat_inventory SET seat_class = 'SLEEPER' WHERE seat_class IS NULL;

-- Step 4: Enforce NOT NULL
ALTER TABLE booking_service.seat_inventory
    ALTER COLUMN seat_class SET NOT NULL;
