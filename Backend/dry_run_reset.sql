-- ============================================================
-- 🚆 TRAIN BOOKING SYSTEM — COMPLETE FRESH DATABASE RESET & SEED
-- Compatible with Neon Serverless PostgreSQL & Local PostgreSQL
-- ============================================================
-- Execution Order:
--   1. Truncate transactional data (Payments, Bookings)
--   2. Truncate master data (Seat Configs, Routes, Trains, Stations)
--   3. Re-seed Stations (8 Key Junctions)
--   4. Re-seed Trains (4 Express & Superfast Trains)
--   5. Re-seed Route Stops with Timings & Distance Matrices
--   6. Re-seed Seat Configurations (Classes & Fare per KM)
--   7. Dynamically Seed Seat Inventory for NEXT 30 DAYS (Always Valid)
--   8. Re-seed Default System Roles
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- STEP 1: TRUNCATE ALL TABLES (Cascade FKs & Reset Sequences)
-- ─────────────────────────────────────────────────────────────

-- 1.1 Payment Service
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'payment_service' AND table_name = 'payment') THEN
        TRUNCATE TABLE payment_service.payment RESTART IDENTITY CASCADE;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment') THEN
        TRUNCATE TABLE payment RESTART IDENTITY CASCADE;
    END IF;
END $$;

-- 1.2 Booking Service
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'booking_service' AND table_name = 'booking') THEN
        TRUNCATE TABLE booking_service.booking_seats    RESTART IDENTITY CASCADE;
        TRUNCATE TABLE booking_service.seat_inventory   RESTART IDENTITY CASCADE;
        TRUNCATE TABLE booking_service.booking          RESTART IDENTITY CASCADE;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'booking') THEN
        TRUNCATE TABLE booking_seats    RESTART IDENTITY CASCADE;
        TRUNCATE TABLE seat_inventory   RESTART IDENTITY CASCADE;
        TRUNCATE TABLE booking          RESTART IDENTITY CASCADE;
    END IF;
END $$;

-- 1.3 Train Service
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'train_service' AND table_name = 'trains') THEN
        TRUNCATE TABLE train_service.train_seat_configs RESTART IDENTITY CASCADE;
        TRUNCATE TABLE train_service.train_routes       RESTART IDENTITY CASCADE;
        TRUNCATE TABLE train_service.trains             RESTART IDENTITY CASCADE;
        TRUNCATE TABLE train_service.stations           RESTART IDENTITY CASCADE;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trains') THEN
        TRUNCATE TABLE train_seat_configs RESTART IDENTITY CASCADE;
        TRUNCATE TABLE train_routes       RESTART IDENTITY CASCADE;
        TRUNCATE TABLE trains             RESTART IDENTITY CASCADE;
        TRUNCATE TABLE stations           RESTART IDENTITY CASCADE;
    END IF;
END $$;

-- 1.4 User Service (Users & Refresh Tokens)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'user_service' AND table_name = 'users') THEN
        TRUNCATE TABLE user_service.refresh_tokens RESTART IDENTITY CASCADE;
        TRUNCATE TABLE user_service.user_roles     RESTART IDENTITY CASCADE;
        TRUNCATE TABLE user_service.users          RESTART IDENTITY CASCADE;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        TRUNCATE TABLE refresh_tokens RESTART IDENTITY CASCADE;
        TRUNCATE TABLE user_roles     RESTART IDENTITY CASCADE;
        TRUNCATE TABLE users          RESTART IDENTITY CASCADE;
    END IF;
END $$;



-- ============================================================
-- STEP 2: RE-SEED STATIONS (8 Stations)
-- ============================================================
INSERT INTO train_service.stations (id, name, code, city, state, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES
(1, 'Mumbai Central',      'BCT',  'Mumbai',    'Maharashtra', now(), now()),
(2, 'Surat',               'ST',   'Surat',     'Gujarat',     now(), now()),
(3, 'Vadodara Junction',   'BRC',  'Vadodara',  'Gujarat',     now(), now()),
(4, 'Ahmedabad Junction',  'ADI',  'Ahmedabad', 'Gujarat',     now(), now()),
(5, 'Jaipur Junction',     'JP',   'Jaipur',    'Rajasthan',   now(), now()),
(6, 'Delhi Junction',      'DLI',  'Delhi',     'Delhi',       now(), now()),
(7, 'Pune Junction',       'PUNE', 'Pune',      'Maharashtra', now(), now()),
(8, 'Nagpur Junction',     'NGP',  'Nagpur',    'Maharashtra', now(), now());

-- Reset station sequence
SELECT setval(pg_get_serial_sequence('train_service.stations', 'id'), coalesce(max(id), 1), true) FROM train_service.stations;


-- ============================================================
-- STEP 3: RE-SEED TRAINS (4 Trains)
-- ============================================================
INSERT INTO train_service.trains (id, name, code, train_type, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES
(1, 'Mumbai Ahmedabad Express', 'MAE001', 'EXPRESS',   now(), now()),
(2, 'Mumbai Jaipur Superfast',  'MJS002', 'SUPERFAST', now(), now()),
(3, 'Mumbai Delhi Rajdhani',    'MDR003', 'RAJDHANI',  now(), now()),
(4, 'Pune Nagpur Intercity',    'PNI004', 'EXPRESS',   now(), now());

-- Reset train sequence
SELECT setval(pg_get_serial_sequence('train_service.trains', 'id'), coalesce(max(id), 1), true) FROM train_service.trains;


-- ============================================================
-- STEP 4: RE-SEED ROUTE STOPS & TIMINGS
-- ============================================================

-- Train 1: Mumbai (1) → Surat (2) → Vadodara (3) → Ahmedabad (4)
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source, created_at, updated_at) VALUES
(1, 1, 1, '06:00:00', '06:00:00', 0,   now(), now()),
(1, 2, 2, '09:30:00', '09:35:00', 263, now(), now()),
(1, 3, 3, '11:15:00', '11:20:00', 392, now(), now()),
(1, 4, 4, '13:00:00', '13:00:00', 493, now(), now());

-- Train 2: Mumbai (1) → Surat (2) → Jaipur (5)
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source, created_at, updated_at) VALUES
(2, 1, 1, '07:00:00', '07:00:00', 0,    now(), now()),
(2, 2, 2, '10:20:00', '10:25:00', 263,  now(), now()),
(2, 5, 3, '18:00:00', '18:00:00', 1160, now(), now());

-- Train 3: Mumbai (1) → Vadodara (3) → Jaipur (5) → Delhi (6)
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source, created_at, updated_at) VALUES
(3, 1, 1, '08:00:00', '08:00:00', 0,    now(), now()),
(3, 3, 2, '12:00:00', '12:10:00', 392,  now(), now()),
(3, 5, 3, '19:30:00', '19:40:00', 1160, now(), now()),
(3, 6, 4, '06:00:00', '06:00:00', 1411, now(), now());

-- Train 4: Pune (7) → Nagpur (8)
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source, created_at, updated_at) VALUES
(4, 7, 1, '05:30:00', '05:30:00', 0,   now(), now()),
(4, 8, 2, '14:00:00', '14:00:00', 705, now(), now());


-- ============================================================
-- STEP 5: RE-SEED SEAT CONFIGURATIONS (Classes & Fare per KM)
-- ============================================================

-- Train 1: Mumbai Ahmedabad Express
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km, created_at, updated_at) VALUES
(1, 'SLEEPER',        200, 0.50, now(), now()),
(1, 'AC_3_TIER',      150, 1.20, now(), now()),
(1, 'AC_2_TIER',      100, 1.80, now(), now()),
(1, 'AC_FIRST_CLASS',  50, 3.00, now(), now());

-- Train 2: Mumbai Jaipur Superfast
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km, created_at, updated_at) VALUES
(2, 'SLEEPER',        180, 0.50, now(), now()),
(2, 'AC_3_TIER',      150, 1.20, now(), now()),
(2, 'AC_2_TIER',       80, 1.80, now(), now()),
(2, 'AC_FIRST_CLASS',  40, 3.00, now(), now());

-- Train 3: Mumbai Delhi Rajdhani (No Sleeper)
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km, created_at, updated_at) VALUES
(3, 'AC_3_TIER',      240, 1.40, now(), now()),
(3, 'AC_2_TIER',      200, 2.00, now(), now()),
(3, 'AC_FIRST_CLASS',  48, 3.50, now(), now());

-- Train 4: Pune Nagpur Intercity
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km, created_at, updated_at) VALUES
(4, 'SLEEPER',        150, 0.50, now(), now()),
(4, 'AC_3_TIER',       96, 1.20, now(), now()),
(4, 'AC_2_TIER',       54, 1.80, now(), now());


-- ============================================================
-- STEP 6: DYNAMIC SEAT INVENTORY SEEDING (TODAY + NEXT 30 DAYS)
-- Automatically generates real-time inventory for every train & class
-- ============================================================

INSERT INTO booking_service.seat_inventory (train_id, travel_date, seat_class, total_seats, available_seats, version)
SELECT 
    tsc.train_id,
    d.travel_date::date,
    tsc.seat_class,
    tsc.total_seats,
    tsc.total_seats AS available_seats,
    0 AS version
FROM train_service.train_seat_configs tsc
CROSS JOIN (
    SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day'::interval)::date AS travel_date
) d
ON CONFLICT (train_id, travel_date, seat_class) DO UPDATE 
SET available_seats = EXCLUDED.total_seats;


-- ============================================================
-- STEP 7: RE-SEED DEFAULT ROLES (USER_SERVICE)
-- ============================================================
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'user_service' AND table_name = 'roles') THEN
        INSERT INTO user_service.roles (id, role) OVERRIDING SYSTEM VALUE VALUES 
        (1, 'ROLE_USER'),
        (2, 'ROLE_ADMIN')
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
        
        PERFORM setval(pg_get_serial_sequence('user_service.roles', 'id'), coalesce(max(id), 1), true) FROM user_service.roles;
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles') THEN
        INSERT INTO roles (id, role) OVERRIDING SYSTEM VALUE VALUES 
        (1, 'ROLE_USER'),
        (2, 'ROLE_ADMIN')
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
        
        PERFORM setval(pg_get_serial_sequence('roles', 'id'), coalesce(max(id), 1), true) FROM roles;
    END IF;
END $$;



-- ============================================================
-- STEP 8: VERIFICATION SUMMARY
-- ============================================================
SELECT 'train_service.stations'       AS table_name, COUNT(*) AS total_rows FROM train_service.stations
UNION ALL
SELECT 'train_service.trains'         AS table_name, COUNT(*) AS total_rows FROM train_service.trains
UNION ALL
SELECT 'train_service.train_routes'   AS table_name, COUNT(*) AS total_rows FROM train_service.train_routes
UNION ALL
SELECT 'train_service.seat_configs'   AS table_name, COUNT(*) AS total_rows FROM train_service.train_seat_configs
UNION ALL
SELECT 'booking_service.inventory'    AS table_name, COUNT(*) AS total_rows FROM booking_service.seat_inventory
UNION ALL
SELECT 'booking_service.booking'      AS table_name, COUNT(*) AS total_rows FROM booking_service.booking
UNION ALL
SELECT 'payment_service.payment'      AS table_name, COUNT(*) AS total_rows FROM payment_service.payment;
