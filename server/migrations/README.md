# Database Migrations

This directory contains database migration scripts for HabitPlanet.

## Creating a Migration

Create a new SQL file with a numbered prefix:

```
migrations/
  001_initial_schema.sql       # Already applied via schema.sql
  002_add_user_preferences.sql # Example future migration
  003_add_notifications.sql    # Example future migration
```

## Running Migrations

```bash
# Run a specific migration
psql -U habitplanet_user -d habitplanet -f server/migrations/002_add_user_preferences.sql
```

## Migration Naming Convention

Format: `NNN_descriptive_name.sql`

- `NNN`: Three-digit number (001, 002, 003, etc.)
- `descriptive_name`: Brief description using underscores

## Best Practices

1. **Always test migrations** on a development database first
2. **Make migrations reversible** when possible (include DOWN migration)
3. **One change per migration** for easier rollback
4. **Document breaking changes** in the migration file header
5. **Back up data** before running migrations in production

## Example Migration File

```sql
-- Migration: 002_add_user_preferences.sql
-- Description: Add user preferences table for custom settings
-- Author: Your Name
-- Date: 2024-01-16

-- UP Migration
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOWN Migration (commented out, run manually if needed)
-- DROP TABLE IF EXISTS user_preferences;
```
