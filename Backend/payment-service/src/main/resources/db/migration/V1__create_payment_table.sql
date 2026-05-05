CREATE SCHEMA IF NOT EXISTS payment_service;

CREATE TABLE payment_service.payment (
    id                  UUID PRIMARY KEY,
    booking_id          UUID NOT NULL UNIQUE,
    razorpay_order_id   VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100),
    amount              NUMERIC(12, 2) NOT NULL,
    currency            VARCHAR(10)  NOT NULL DEFAULT 'INR',
    status              VARCHAR(30)  NOT NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);
