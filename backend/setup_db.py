"""
Database setup script
"""
import os
import sqlite3

from config import DB_PATH

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')


def init_db():
    """Initialize database from schema file"""
    with open(SCHEMA_PATH, 'r') as f:
        schema = f.read()
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executescript(schema)
    conn.commit()
    conn.close()
    print(f'Database initialized at {DB_PATH}')


if __name__ == '__main__':
    init_db()
