🚆 Train Booking Reservation System

A production-grade microservices application built with Java 21 and Spring Boot.

Architecture highlights:
- API Gateway with JWT authentication, token-bucket rate limiting (Bucket4j), and distributed request tracing via X-Correlation-Id
- Role-Based Access Control: ADMIN for write operations, USER for reads
- Async booking flow with in-memory worker queue (BlockingQueue + daemon thread)
- Idempotency key prevents duplicate bookings on client retry
- Pessimistic locking (SELECT FOR UPDATE) on seat inventory for race condition safety
- Inter-service HTTP communication via Spring RestClient for dynamic fare calculation
- PNR generation with UUID-based uniqueness
- Flyway database migrations, full Swagger UI on all services

Tech: Java 21, Spring Boot 3, Spring Cloud Gateway, Spring Security, JPA/Hibernate, PostgreSQL (Neon), Flyway, Bucket4j, SpringDoc OpenAPI
