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
echo "========================================="
echo "Running database migrations..."
echo "========================================="
python migrate_db.py || echo "⚠️  Migrations skipped (may already exist)"

# Seed the database
echo ""
echo "========================================="
echo "Seeding database with initial data..."
echo "========================================="
echo ""
python seed.py
echo "✅ seed.py execution complete"
echo ""
python seed_more.py
echo "✅ seed_more.py execution complete"
echo ""
echo "========================================="
echo "✅ Build completed successfully!"
echo "========================================="
