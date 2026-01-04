---------------------------------------------
---------------------------------------------

-- Service - Train Service
-- Project Name - Train Booking Reservation System
-- Created By - Rishi Kundar
-- Created Date - 03-01-2026
-- Purpose - Seeding Data for Station, Train, Routes

---------------------------------------------
---------------------------------------------

DELETE FROM train_routes;
DELETE FROM trains;
DELETE FROM stations;


ALTER SEQUENCE train_routes_id_seq RESTART WITH 1;
ALTER SEQUENCE trains_id_seq RESTART WITH 1;
ALTER SEQUENCE stations_id_seq RESTART WITH 1;



------ Station Table
INSERT INTO stations (name, code, city, state)
VALUES
('Mumbai Central', 'BCT', 'Mumbai', 'Maharashtra'),
('Surat', 'ST', 'Surat', 'Gujarat'),
('Vadodara', 'BRC', 'Vadodara', 'Gujarat'),
('Ahmedabad Junction', 'ADI', 'Ahmedabad', 'Gujarat'),
('Jaipur Junction', 'JP', 'Jaipur', 'Rajasthan');


INSERT INTO trains (name, code, train_type, total_seats)
VALUES
('Mumbai Ahmedabad Express', 'MAE123', 'EXPRESS', 500),
('Mumbai Jaipur Superfast', 'MJS456', 'SUPERFAST', 450);



INSERT INTO train_routes
(train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source)
VALUES
(1, 1, 1, NULL, '06:00', 0),
(1, 2, 2, '09:30', '09:35', 263),
(1, 3, 3, '11:15', '11:20', 392),
(1, 4, 4, '13:00', NULL, 493);


INSERT INTO train_routes
(train_id, station_id, stop_order, arrival_time, departure_time, distance_from_source)
VALUES
(2, 1, 1, NULL, '07:00', 0),
(2, 2, 2, '10:20', '10:25', 263),
(2, 5, 3, '18:00', NULL, 1160);

