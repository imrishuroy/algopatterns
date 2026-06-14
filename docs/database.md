# Database

AlgoPatterns uses CockroachDB Serverless (GCP asia-south1).

## Connection

### Quick Connect
```bash
psql "postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:26257/defaultdb?sslmode=verify-full"
```

### Connection Details
| Field | Value |
|-------|-------|
| Host | See `DB_HOST` in `.env` |
| Port | `26257` |
| Database | `defaultdb` |
| User | See `DB_USER` in `.env` |
| SSL Mode | `verify-full` |

### Where to Find Credentials
- **Local**: `backend/.env` → `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- **Production**: GCP Secret Manager → `db-password`

## Common Commands

### List Tables
```sql
\dt
```

### Describe Table
```sql
\d table_name
```

### Users
```sql
SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 10;
```

### Subscriptions
```sql
SELECT u.email, s.plan_id, s.status, s.current_period_end 
FROM subscriptions s 
JOIN users u ON s.user_id = u.id 
WHERE s.status = 'active';
```

### Payments
```sql
SELECT u.email, p.amount/100 as amount_inr, p.status, p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC LIMIT 10;
```

### Discount Codes
```sql
SELECT code, discount_type, discount_value, applicable_plans, current_uses, max_uses, is_active 
FROM discount_codes;
```

## Migrations

### Run Migrations (Local)
```bash
cd backend
go run cmd/migrate/main.go up
```

### Migration Files
Located in `backend/migrations/`:
- `001_initial.up.sql` - Users, sessions
- `002_problems.up.sql` - Problems, solutions
- `003_progress.up.sql` - User progress
- `007_payments.up.sql` - Plans, subscriptions, payments, discount codes

## CockroachDB Cloud Console

Dashboard: https://cockroachlabs.cloud/

- Cluster: `algopatterns-16304`
- Region: `gcp-asia-south1`

## Troubleshooting

### Too Many Failed Auth Attempts
CockroachDB locks account after multiple failed logins. Wait 10-15 minutes for auto-reset.

### Connection Refused
1. Check IP allowlist in CockroachDB Console
2. Verify SSL certificate: `~/.postgresql/root.crt`

### Slow Queries
```sql
SHOW SLOW QUERIES;
```
