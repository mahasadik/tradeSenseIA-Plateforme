"""Add phone and currency columns to user table"""
from app import create_app, db

def migrate():
    app = create_app()
    with app.app_context():
        try:
            # Try to add phone column
            db.session.execute(db.text("ALTER TABLE user ADD COLUMN phone VARCHAR(20)"))
            print("✓ Added phone column")
        except Exception as e:
            print(f"Phone column already exists or error: {e}")
        
        try:
            # Try to add currency column with default
            db.session.execute(db.text("ALTER TABLE user ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'"))
            print("✓ Added currency column")
        except Exception as e:
            print(f"Currency column already exists or error: {e}")
        
        db.session.commit()
        print("\n✅ Migration completed successfully!")

if __name__ == '__main__':
    migrate()
