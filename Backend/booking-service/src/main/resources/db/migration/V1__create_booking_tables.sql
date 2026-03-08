CREATE SCHEMA IF NOT EXISTS booking_service;

CREATE TABLE seat_inventory (
    id BIGSERIAL PRIMARY KEY,
    train_id BIGINT NOT NULL,
    travel_date DATE NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (train_id, travel_date)
);

CREATE TABLE booking (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    train_id BIGINT NOT NULL,
    source_station_id BIGINT NOT NULL,
    destination_station_id BIGINT NOT NULL,
    travel_date DATE NOT NULL,
    seats_booked INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_seats (
    id BIGSERIAL PRIMARY KEY,
    booking_id UUID NOT NULL,
    seat_no VARCHAR(10) NOT NULL
);
