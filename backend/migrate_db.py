"""Migration script to add template and personal_info columns to resumes table"""
import sqlite3
import os
from app.config import settings
from app.database import engine

def migrate_database():
    """Add template and personal_info columns to resumes table if they don't exist"""
    # Get database URL
    db_url = settings.DATABASE_URL
    
    # Extract database file path if it's SQLite
    if "sqlite" in db_url.lower():
        # Remove "sqlite:///" prefix
        if db_url.startswith("sqlite:///"):
            db_path = db_url.replace("sqlite:///", "")
        elif db_url.startswith("sqlite://"):
            db_path = db_url.replace("sqlite://", "")
        else:
            db_path = db_url
        
        # Convert relative path to absolute if needed
        if not os.path.isabs(db_path):
            db_path = os.path.join(os.path.dirname(__file__), db_path)
        
        print(f"Migrating database at: {db_path}")
        
        if not os.path.exists(db_path):
            print(f"Database file not found at {db_path}. Creating new database...")
            from app.database import Base
            from app import models
            Base.metadata.create_all(bind=engine)
            print("Database created successfully!")
            return
        
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if columns exist
            cursor.execute("PRAGMA table_info(resumes)")
            columns = [row[1] for row in cursor.fetchall()]
            
            # Add template column if it doesn't exist
            if 'template' not in columns:
                print("Adding 'template' column...")
                cursor.execute("ALTER TABLE resumes ADD COLUMN template TEXT")
                print("[OK] Added 'template' column")
            else:
                print("[OK] 'template' column already exists")
            
            # Add personal_info column if it doesn't exist
            if 'personal_info' not in columns:
                print("Adding 'personal_info' column...")
                cursor.execute("ALTER TABLE resumes ADD COLUMN personal_info TEXT")
                print("[OK] Added 'personal_info' column")
            else:
                print("[OK] 'personal_info' column already exists")
            
            # Add customization column if it doesn't exist
            if 'customization' not in columns:
                print("Adding 'customization' column...")
                cursor.execute("ALTER TABLE resumes ADD COLUMN customization TEXT")
                print("[OK] Added 'customization' column")
            else:
                print("[OK] 'customization' column already exists")
            
            conn.commit()
            print("\n[SUCCESS] Migration completed successfully!")
            
        except Exception as e:
            conn.rollback()
            print(f"\n[ERROR] Migration failed: {e}")
            raise
        finally:
            conn.close()
    else:
        # For non-SQLite databases (PostgreSQL), provide SQL commands
        print("For non-SQLite databases, please run these SQL commands manually:")
        print("\nALTER TABLE resumes ADD COLUMN IF NOT EXISTS template JSON;")
        print("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS personal_info JSON;")
        print("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS customization JSON;")
        print("\nOr use your database migration tool (Alembic, etc.)")

if __name__ == "__main__":
    migrate_database()

