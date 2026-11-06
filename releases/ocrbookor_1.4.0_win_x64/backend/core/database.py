"""
OCRBookor - Base de données SQLite Locale
Stocke les métadonnées de projets, les pages, les blocs de texte et les corrections.
"""

import sqlite3
import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from backend.core.config import DATABASE_PATH

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialise le schéma de la base de données SQLite"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT DEFAULT 'Inconnu',
        language TEXT DEFAULT 'fra',
        status TEXT DEFAULT 'importe',
        progress_percent INTEGER DEFAULT 0,
        source_file_name TEXT,
        file_size_bytes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata_json TEXT DEFAULT '{}'
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        dpi INTEGER DEFAULT 300,
        has_native_text BOOLEAN DEFAULT 0,
        is_blank BOOLEAN DEFAULT 0,
        is_degraded BOOLEAN DEFAULT 0,
        raw_text TEXT DEFAULT '',
        confidence REAL DEFAULT 0.0,
        quality TEXT DEFAULT 'moyenne',
        validated BOOLEAN DEFAULT 0,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        type TEXT NOT NULL,
        heading_level INTEGER,
        text TEXT NOT NULL,
        confidence REAL DEFAULT 0.0,
        bbox_json TEXT DEFAULT '[0, 0, 0, 0]',
        validated BOOLEAN DEFAULT 0,
        FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS corrections (
        id TEXT PRIMARY KEY,
        block_id TEXT NOT NULL,
        original_text TEXT,
        corrected_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(block_id) REFERENCES blocks(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        start_page INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS illustrations (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        title TEXT,
        caption TEXT,
        image_path TEXT NOT NULL,
        bbox_json TEXT DEFAULT '[0, 0, 0, 0]',
        FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        job_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        progress REAL DEFAULT 0.0,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

# Auto-initialize database on import
init_db()
