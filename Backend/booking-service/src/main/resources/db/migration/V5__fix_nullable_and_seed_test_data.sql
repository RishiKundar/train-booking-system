-----------------------------------------------------------
-----------------------------------------------------------

-- Service - Booking Service
-- Project Name - Train Booking Reservation System
-- Created By - Rishi Kundar
-- Created Date - 04-04-2026
-- Purpose - (1) Fix booking table nullable constraints to support async PENDING state
--           (2) Clear stale test data
--           (3) Seed seat_inventory for the 4 test trains across upcoming travel dates

-----------------------------------------------------------
-----------------------------------------------------------


-- ========================
-- 1. Fix booking table constraints to allow PENDING rows
--    (entity was updated to nullable; DB must match)
-- ========================
ALTER TABLE booking_service.booking
    ALTER COLUMN train_id              DROP NOT NULL,
    ALTER COLUMN source_station_id     DROP NOT NULL,
    ALTER COLUMN destination_station_id DROP NOT NULL,
    ALTER COLUMN travel_date           DROP NOT NULL,
    ALTER COLUMN seats_booked          DROP NOT NULL;


-- ========================
-- 2. Clear stale booking data
-- ========================
DELETE FROM booking_service.booking_seats;
DELETE FROM booking_service.booking;
DELETE FROM booking_service.seat_inventory;

ALTER SEQUENCE booking_service.seat_inventory_id_seq RESTART WITH 1;


-- ========================
-- 3. Seed seat_inventory
--    Train 1 (MAE001): 500 total seats, Mumbai → Ahmedabad
--    Train 2 (MJS002): 450 total seats, Mumbai → Jaipur
--    Train 3 (MDR003): 600 total seats, Mumbai → Delhi
--    Train 4 (PNI004): 300 total seats, Pune → Nagpur
-- ========================

-- Travel dates: next 7 days from today (hardcoded for test data)
INSERT INTO booking_service.seat_inventory (train_id, travel_date, total_seats, available_seats, version) VALUES
-- Train 1
(1, '2026-04-05', 500, 500, 0),
(1, '2026-04-06', 500, 500, 0),
(1, '2026-04-07', 500, 480, 0),
(1, '2026-04-08', 500, 450, 0),
(1, '2026-04-09', 500, 500, 0),
(1, '2026-04-10', 500, 500, 0),
(1, '2026-04-11', 500, 500, 0),

-- Train 2
(2, '2026-04-05', 450, 450, 0),
(2, '2026-04-06', 450, 420, 0),
(2, '2026-04-07', 450, 450, 0),
(2, '2026-04-08', 450, 450, 0),
(2, '2026-04-09', 450, 430, 0),
(2, '2026-04-10', 450, 450, 0),
(2, '2026-04-11', 450, 450, 0),

-- Train 3
(3, '2026-04-05', 600, 600, 0),
(3, '2026-04-06', 600, 600, 0),
(3, '2026-04-07', 600, 560, 0),
(3, '2026-04-08', 600, 600, 0),
(3, '2026-04-09', 600, 600, 0),
(3, '2026-04-10', 600, 580, 0),
(3, '2026-04-11', 600, 600, 0),

-- Train 4
(4, '2026-04-05', 300, 300, 0),
(4, '2026-04-06', 300, 280, 0),
(4, '2026-04-07', 300, 300, 0),
(4, '2026-04-08', 300, 300, 0),
(4, '2026-04-09', 300, 250, 0),
(4, '2026-04-10', 300, 300, 0),
(4, '2026-04-11', 300, 300, 0);
