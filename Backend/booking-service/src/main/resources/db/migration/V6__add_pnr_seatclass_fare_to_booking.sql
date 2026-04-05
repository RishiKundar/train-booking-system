-- Add seat_class, fare, pnr to booking table
ALTER TABLE booking_service.booking
    ADD COLUMN seat_class  VARCHAR(20),
    ADD COLUMN fare        DECIMAL(10,2),
    ADD COLUMN pnr         VARCHAR(30);

-- pnr must be unique (sparse — only CONFIRMED bookings will have it)
CREATE UNIQUE INDEX uq_booking_pnr
    ON booking_service.booking (pnr)
    WHERE pnr IS NOT NULL;
