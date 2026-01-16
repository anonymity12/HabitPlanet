#!/bin/bash

# HabitPlanet Database Initialization Script
# This script sets up the PostgreSQL database for HabitPlanet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}HabitPlanet Database Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Default configuration
DB_NAME="${DB_NAME:-habitplanet}"
DB_USER="${DB_USER:-habitplanet_user}"
DB_PASSWORD="${DB_PASSWORD:-habitplanet123}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql@14"
    echo "  - Ubuntu: sudo apt-get install postgresql-14"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo -e "${YELLOW}Using configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL:"
    echo "  - macOS: brew services start postgresql@14"
    echo "  - Ubuntu: sudo service postgresql start"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to run SQL as postgres user
run_as_postgres() {
    PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "$1" 2>/dev/null || {
        echo -e "${YELLOW}Note: Running as superuser failed. Trying with current user...${NC}"
        psql -h "$DB_HOST" -p "$DB_PORT" -c "$1"
    }
}

# Function to run SQL as app user
run_as_user() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" "$@"
}

# Step 1: Create database and user
echo -e "${YELLOW}Step 1: Creating database and user...${NC}"

# Check if database exists
DB_EXISTS=$(PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy]es$ ]]; then
        echo "Dropping database..."
        run_as_postgres "DROP DATABASE IF EXISTS $DB_NAME;"
        DB_EXISTS="0"
    fi
fi

if [ "$DB_EXISTS" != "1" ]; then
    echo "Creating database '$DB_NAME'..."
    run_as_postgres "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Using existing database${NC}"
fi

# Check if user exists
USER_EXISTS=$(PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "0")

if [ "$USER_EXISTS" != "1" ]; then
    echo "Creating user '$DB_USER'..."
    run_as_postgres "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo -e "${GREEN}✓ User created${NC}"
else
    echo -e "${GREEN}✓ User already exists${NC}"
fi

# Grant privileges
echo "Granting privileges..."
run_as_postgres "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
run_as_postgres "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
echo -e "${GREEN}✓ Privileges granted${NC}"
echo ""

# Step 2: Run schema
echo -e "${YELLOW}Step 2: Creating database schema...${NC}"
if [ -f "$SCRIPT_DIR/schema.sql" ]; then
    run_as_user -f "$SCRIPT_DIR/schema.sql" > /dev/null
    echo -e "${GREEN}✓ Schema created successfully${NC}"
else
    echo -e "${RED}Error: schema.sql not found${NC}"
    exit 1
fi
echo ""

# Step 3: Load seed data (optional)
echo -e "${YELLOW}Step 3: Loading seed data...${NC}"
read -p "Do you want to load sample data? (yes/no): " -r
if [[ $REPLY =~ ^[Yy]es$ ]]; then
    if [ -f "$SCRIPT_DIR/seed.sql" ]; then
        run_as_user -f "$SCRIPT_DIR/seed.sql" > /dev/null
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}"
    else
        echo -e "${YELLOW}Warning: seed.sql not found, skipping...${NC}"
    fi
else
    echo -e "${YELLOW}Skipping seed data${NC}"
fi
echo ""

# Step 4: Verify installation
echo -e "${YELLOW}Step 4: Verifying installation...${NC}"
TABLE_COUNT=$(run_as_user -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  Tables created: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
else
    echo -e "${RED}Warning: No tables were created${NC}"
fi
echo ""

# Step 5: Display connection info
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Add this to your .env.local file:"
echo ""
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "Or use individual variables:"
echo "DB_HOST=$DB_HOST"
echo "DB_PORT=$DB_PORT"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update your .env.local file with the database credentials"
echo "  2. Run 'npm install' to install dependencies"
echo "  3. Run 'npm run dev' to start the development server"
echo ""
