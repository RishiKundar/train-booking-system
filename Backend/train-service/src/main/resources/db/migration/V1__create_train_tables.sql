-----------------------------------------------------------
-----------------------------------------------------------

-- Service - Train Service
-- Project Name - Train Booking Reservation System
-- Created By - Rishi Kundar
-- Created Date - 03-01-2026
-- Purpose - Creation of train, station, route tables

-----------------------------------------------------------
-----------------------------------------------------------


CREATE TABLE stations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL
);

CREATE TABLE trains (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    train_type VARCHAR(50),
    total_seats INT NOT NULL
);

CREATE TABLE train_routes (
    id BIGSERIAL PRIMARY KEY,
    train_id BIGINT NOT NULL,
    station_id BIGINT NOT NULL,
    stop_order INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    distance_from_source INT,

    CONSTRAINT fk_route_train FOREIGN KEY (train_id) REFERENCES trains(id),
    CONSTRAINT fk_route_station FOREIGN KEY (station_id) REFERENCES stations(id)
);