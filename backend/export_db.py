#!/usr/bin/env python
"""Export database to SQL file"""
import os
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def export_sqlite():
    """Export SQLite database to SQL file"""
    db_path = "instance/tradesense.db"
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        with open("database.sql", "w", encoding="utf-8") as f:
            for line in conn.iterdump():
                f.write(f"{line}\n")
        conn.close()
        
        file_size = os.path.getsize("database.sql")
        print(f"✓ Export réussi : database.sql ({file_size} bytes)")
        return True
    except Exception as e:
        print(f"✗ Erreur lors de l'export : {e}")
        return False

if __name__ == "__main__":
    export_sqlite()
