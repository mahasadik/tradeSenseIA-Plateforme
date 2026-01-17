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

echo "Build completed successfully!"
