"""
Migration script to add first_name and last_name columns to User table
Run this script to update existing database schema
"""
from app import create_app
from models import db

def migrate():
    app = create_app()
    with app.app_context():
        # Add columns using raw SQL (SQLite compatible)
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN first_name VARCHAR(100)'))
                conn.commit()
            print("✓ Added first_name column")
        except Exception as e:
            print(f"first_name column might already exist: {e}")
        
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN last_name VARCHAR(100)'))
                conn.commit()
            print("✓ Added last_name column")
        except Exception as e:
            print(f"last_name column might already exist: {e}")
        
        print("\n✓ Migration completed!")
        print("Note: Existing users will have NULL values for first_name and last_name")

if __name__ == "__main__":
    migrate()
