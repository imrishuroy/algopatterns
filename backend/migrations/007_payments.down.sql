-- Drop tables in reverse order of creation (to respect foreign key constraints)
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS discount_code_uses;
DROP TABLE IF EXISTS webhook_events;
DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_orders;
DROP TABLE IF EXISTS discount_codes;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS subscription_plans;
