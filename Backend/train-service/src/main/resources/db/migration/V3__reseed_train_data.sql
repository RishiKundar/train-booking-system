-----------------------------------------------------------
-----------------------------------------------------------

-- Service - Train Service
-- Project Name - Train Booking Reservation System
-- Created By - Rishi Kundar
-- Created Date - 04-04-2026
-- Purpose - Truncate and re-seed stations, trains, routes with expanded dummy data for testing

-----------------------------------------------------------
-----------------------------------------------------------

DELETE FROM train_routes;
DELETE FROM trains;
DELETE FROM stations;

ALTER SEQUENCE train_routes_id_seq RESTART WITH 1;
ALTER SEQUENCE trains_id_seq RESTART WITH 1;
ALTER SEQUENCE stations_id_seq RESTART WITH 1;


-- ========================
-- Stations (id: 1..8)
-- ========================
INSERT INTO stations (name, code, city, state) VALUES
('Mumbai Central',      'BCT',  'Mumbai',    'Maharashtra'),
('Surat',               'ST',   'Surat',     'Gujarat'),
('Vadodara Junction',   'BRC',  'Vadodara',  'Gujarat'),
('Ahmedabad Junction',  'ADI',  'Ahmedabad', 'Gujarat'),
('Jaipur Junction',     'JP',   'Jaipur',    'Rajasthan'),
('Delhi Junction',      'DLI',  'Delhi',     'Delhi'),
('Pune Junction',       'PUNE', 'Pune',      'Maharashtra'),
('Nagpur Junction',     'NGP',  'Nagpur',    'Maharashtra');


-- ========================
-- Trains (id: 1..4)
-- ========================
INSERT INTO trains (name, code, train_type, total_seats) VALUES
('Mumbai Ahmedabad Express',  'MAE001', 'EXPRESS',   500),
('Mumbai Jaipur Superfast',   'MJS002', 'SUPERFAST', 450),
('Mumbai Delhi Rajdhani',     'MDR003', 'RAJDHANI',  600),
('Pune Nagpur Intercity',     'PNI004', 'EXPRESS',   300);


-- ========================
-- Routes for Train 1: Mumbai → Surat → Vadodara → Ahmedabad
-- ========================
INSERT INTO train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
(1, 1, 1, NULL,    '06:00', 0),
(1, 2, 2, '09:30', '09:35', 263),
(1, 3, 3, '11:15', '11:20', 392),
(1, 4, 4, '13:00', NULL,    493);

-- ========================
-- Routes for Train 2: Mumbai → Surat → Jaipur
-- ========================
INSERT INTO train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
(2, 1, 1, NULL,    '07:00', 0),
(2, 2, 2, '10:20', '10:25', 263),
(2, 5, 3, '18:00', NULL,    1160);

-- ========================
-- Routes for Train 3: Mumbai → Vadodara → Jaipur → Delhi
-- ========================
INSERT INTO train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
(3, 1, 1, NULL,    '08:00', 0),
(3, 3, 2, '12:00', '12:10', 392),
(3, 5, 3, '19:30', '19:40', 1160),
(3, 6, 4, '06:00', NULL,    1411);

-- ========================
-- Routes for Train 4: Pune → Nagpur
-- ========================
INSERT INTO train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source) VALUES
(4, 7, 1, NULL,    '05:30', 0),
(4, 8, 2, '14:00', NULL,    705);
