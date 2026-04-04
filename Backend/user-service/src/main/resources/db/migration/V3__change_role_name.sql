-- =========================================================
-- USER SERVICE - UPDATE
-- Version: V3
-- Purpose: Update Role Names in roles Table (USER & ADMIN)
-- =========================================================

update user_service.roles set role = 'ROLE_USER' where id = 1;

update user_service.roles set role = 'ROLE_ADMIN' where id = 2;