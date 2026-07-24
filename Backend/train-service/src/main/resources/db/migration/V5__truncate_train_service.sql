-- ─────────────────────────────────────────────────────────────
-- STEP 3: Clear train_service schema (FK order: routes first)
-- ─────────────────────────────────────────────────────────────
TRUNCATE TABLE train_service.train_seat_configs RESTART IDENTITY CASCADE;
TRUNCATE TABLE train_service.train_routes       RESTART IDENTITY CASCADE;
TRUNCATE TABLE train_service.trains             RESTART IDENTITY CASCADE;
TRUNCATE TABLE train_service.stations           RESTART IDENTITY CASCADE;



-- ============================================================
-- STEP 4: Re-seed train_service — Stations
-- ============================================================
INSERT INTO train_service.stations (name, code, city, state) VALUES
                                                                 ('Mumbai Central',      'BCT',  'Mumbai',    'Maharashtra'),   -- id: 1
                                                                 ('Surat',               'ST',   'Surat',     'Gujarat'),       -- id: 2
                                                                 ('Vadodara Junction',   'BRC',  'Vadodara',  'Gujarat'),       -- id: 3
                                                                 ('Ahmedabad Junction',  'ADI',  'Ahmedabad', 'Gujarat'),       -- id: 4
                                                                 ('Jaipur Junction',     'JP',   'Jaipur',    'Rajasthan'),     -- id: 5
                                                                 ('Delhi Junction',      'DLI',  'Delhi',     'Delhi'),         -- id: 6
                                                                 ('Pune Junction',       'PUNE', 'Pune',      'Maharashtra'),   -- id: 7
                                                                 ('Nagpur Junction',     'NGP',  'Nagpur',    'Maharashtra');   -- id: 8



-- ============================================================
-- STEP 5: Re-seed train_service — Trains
-- ============================================================
INSERT INTO train_service.trains (name, code, train_type) VALUES
                                                              ('Mumbai Ahmedabad Express', 'MAE001', 'EXPRESS'),    -- id: 1
                                                              ('Mumbai Jaipur Superfast',  'MJS002', 'SUPERFAST'),  -- id: 2
                                                              ('Mumbai Delhi Rajdhani',    'MDR003', 'RAJDHANI'),   -- id: 3
                                                              ('Pune Nagpur Intercity',    'PNI004', 'EXPRESS');    -- id: 4



-- ============================================================
-- STEP 6: Re-seed train_service — Routes
-- ============================================================
-- Train 1: Mumbai → Surat → Vadodara → Ahmedabad
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
                                                                                                                                  (1, 1, 1, NULL,    '06:00', 0),
                                                                                                                                  (1, 2, 2, '09:30', '09:35', 263),
                                                                                                                                  (1, 3, 3, '11:15', '11:20', 392),
                                                                                                                                  (1, 4, 4, '13:00', NULL,    493);
-- Train 2: Mumbai → Surat → Jaipur
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
                                                                                                                                  (2, 1, 1, NULL,    '07:00', 0),
                                                                                                                                  (2, 2, 2, '10:20', '10:25', 263),
                                                                                                                                  (2, 5, 3, '18:00', NULL,    1160);
-- Train 3: Mumbai → Vadodara → Jaipur → Delhi
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
                                                                                                                                  (3, 1, 1, NULL,    '08:00', 0),
                                                                                                                                  (3, 3, 2, '12:00', '12:10', 392),
                                                                                                                                  (3, 5, 3, '19:30', '19:40', 1160),
                                                                                                                                  (3, 6, 4, '06:00', NULL,    1411);
-- Train 4: Pune → Nagpur
INSERT INTO train_service.train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
                                                                                                                                  (4, 7, 1, NULL,    '05:30', 0),
                                                                                                                                  (4, 8, 2, '14:00', NULL,    705);



-- ============================================================
-- STEP 7: Re-seed train_service — Seat Configs (fare per km)
-- ============================================================
-- Train 1: Mumbai Ahmedabad Express
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                                  (1, 'SLEEPER',        200, 0.50),
                                                                                                  (1, 'AC_3_TIER',      150, 1.20),
                                                                                                  (1, 'AC_2_TIER',      100, 1.80),
                                                                                                  (1, 'AC_FIRST_CLASS',  50, 3.00);
-- Train 2: Mumbai Jaipur Superfast
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                                  (2, 'SLEEPER',        180, 0.50),
                                                                                                  (2, 'AC_3_TIER',      150, 1.20),
                                                                                                  (2, 'AC_2_TIER',       80, 1.80),
                                                                                                  (2, 'AC_FIRST_CLASS',  40, 3.00);
-- Train 3: Mumbai Delhi Rajdhani (premium — no Sleeper)
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                                  (3, 'AC_3_TIER',      240, 1.40),
                                                                                                  (3, 'AC_2_TIER',      200, 2.00),
                                                                                                  (3, 'AC_FIRST_CLASS',  48, 3.50);
-- Train 4: Pune Nagpur Intercity
INSERT INTO train_service.train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                                  (4, 'SLEEPER',        150, 0.50),
                                                                                                  (4, 'AC_3_TIER',       96, 1.20),
                                                                                                  (4, 'AC_2_TIER',       54, 1.80);
