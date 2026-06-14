# Discount Codes

## Active Codes

| Code | Discount | Applies To | Final Price | Max Uses | Description |
|------|----------|------------|-------------|----------|-------------|
| `LAUNCH50` | 50% off | Lifetime | ₹2,500 → ₹1,250 | 50 | Early launch special |
| `EARLYBIRD` | 30% off | All plans | Monthly: ₹209, Yearly: ₹840, Lifetime: ₹1,750 | 100 | Early adopter discount |
| `STUDENT25` | 25% off | Yearly, Lifetime | Yearly: ₹900, Lifetime: ₹1,875 | 200 | Student discount |
| `FRIEND20` | 20% off | All plans | Monthly: ₹239, Yearly: ₹960, Lifetime: ₹2,000 | 500 | Referral code |
| `FIRST100` | ₹100 off | Monthly | ₹299 → ₹199 | 100 | First month discount |

## Price Summary

### Original Prices
- Monthly: ₹299/month
- Yearly: ₹1,200/year (₹100/month)
- Lifetime: ₹2,500 one-time

### Best Discount Per Plan
- **Monthly**: `FIRST100` → ₹199
- **Yearly**: `EARLYBIRD` → ₹840
- **Lifetime**: `LAUNCH50` → ₹1,250

## Managing Codes

### Add New Code (SQL)
```sql
INSERT INTO discount_codes (code, discount_type, discount_value, applicable_plans, max_uses, is_active)
VALUES ('CODE_NAME', 'percentage', 20, '["pro_monthly", "pro_yearly", "pro_lifetime"]', 100, true);
```

### Discount Types
- `percentage` - discount_value is percentage (e.g., 20 = 20% off)
- `fixed_amount` - discount_value is in paise (e.g., 10000 = ₹100 off)

### Deactivate Code
```sql
UPDATE discount_codes SET is_active = false WHERE code = 'CODE_NAME';
```

### Check Usage
```sql
SELECT code, current_uses, max_uses FROM discount_codes;
```

### View All Codes
```sql
SELECT code, discount_type, discount_value, applicable_plans, max_uses, current_uses, is_active 
FROM discount_codes 
ORDER BY created_at DESC;
```

## Notes
- Codes are case-sensitive
- Each user can use a code only once (max_uses_per_user = 1)
- GST (18%) is applied after discount
