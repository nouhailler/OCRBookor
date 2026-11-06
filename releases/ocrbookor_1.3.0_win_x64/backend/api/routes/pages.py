"""
OCRBookor - Routeur Pages & Corrections
"""

import uuid
from typing import Dict, Any, List
from backend.core.database import get_db_connection

def get_pages(project_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pages WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    pages = [dict(p) for p in cursor.fetchall()]
    conn.close()
    return pages

def save_page_text(project_id: str, page_number: int, corrected_text: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, raw_text FROM pages WHERE project_id = ? AND page_number = ?", (project_id, page_number))
    row = cursor.fetchone()

    if row:
        page_id = row["id"]
        original = row["raw_text"]
        cursor.execute("UPDATE pages SET raw_text = ?, validated = 1 WHERE id = ?", (corrected_text, page_id))
        corr_id = f"corr-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO corrections (id, block_id, original_text, corrected_text)
            VALUES (?, ?, ?, ?)
        """, (corr_id, page_id, original, corrected_text))
    else:
        page_id = f"{project_id}-page-{page_number}"
        cursor.execute("""
            INSERT INTO pages (id, project_id, page_number, width, height, dpi, raw_text, validated)
            VALUES (?, ?, ?, 1200, 1600, 300, ?, 1)
        """, (page_id, project_id, page_number, corrected_text))

    conn.commit()
    conn.close()
    return {"status": "ok", "page_id": page_id, "page_number": page_number}
