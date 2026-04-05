-- Add auditing columns to existing tables
ALTER TABLE trains        ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE trains        ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE stations      ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE stations      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE train_routes  ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE train_routes  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Drop the now-redundant column
ALTER TABLE trains DROP COLUMN total_seats;

-- New seat configuration table
CREATE TABLE train_seat_configs (
                                    id              BIGSERIAL PRIMARY KEY,
                                    train_id        BIGINT        NOT NULL,
                                    seat_class      VARCHAR(20)   NOT NULL,
                                    total_seats     INT           NOT NULL,
                                    fare_per_km     DECIMAL(10,2) NOT NULL,
                                    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
                                    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

                                    CONSTRAINT fk_seat_config_train FOREIGN KEY (train_id) REFERENCES trains(id),
                                    CONSTRAINT uq_train_seat_class  UNIQUE (train_id, seat_class)
);

-- Seed seat configs for all 4 trains
-- Train 1: Mumbai Ahmedabad Express
INSERT INTO train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                    (1, 'SLEEPER',       200, 0.50),
                                                                                    (1, 'AC_3_TIER',     150, 1.20),
                                                                                    (1, 'AC_2_TIER',     100, 1.80),
                                                                                    (1, 'AC_FIRST_CLASS',  50, 3.00);

-- Train 2: Mumbai Jaipur Superfast
INSERT INTO train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                    (2, 'SLEEPER',       180, 0.50),
                                                                                    (2, 'AC_3_TIER',     150, 1.20),
                                                                                    (2, 'AC_2_TIER',      80, 1.80),
                                                                                    (2, 'AC_FIRST_CLASS',  40, 3.00);

-- Train 3: Mumbai Delhi Rajdhani (premium — no Sleeper)
INSERT INTO train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                    (3, 'AC_3_TIER',     240, 1.40),
                                                                                    (3, 'AC_2_TIER',     200, 2.00),
                                                                                    (3, 'AC_FIRST_CLASS',  48, 3.50);

-- Train 4: Pune Nagpur Intercity
INSERT INTO train_seat_configs (train_id, seat_class, total_seats, fare_per_km) VALUES
                                                                                    (4, 'SLEEPER',       150, 0.50),
                                                                                    (4, 'AC_3_TIER',      96, 1.20),
                                                                                    (4, 'AC_2_TIER',       54, 1.80);
