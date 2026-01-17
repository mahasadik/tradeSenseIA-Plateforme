#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip

# Install psycopg2-binary first (PostgreSQL adapter)
pip install psycopg2-binary==2.9.9

# Install other dependencies
pip install -r requirements.txt

# Install gunicorn for production server
pip install gunicorn==21.2.0

# Run database migrations if needed
echo "Running database migrations..."
python migrate_db.py || true

# Seed the database
echo "Seeding database with initial data..."
python seed.py || echo "Plans already seeded or seed.py failed"
python seed_more.py || echo "Additional seeds already applied or seed_more.py failed"

echo "Build completed successfully!"
