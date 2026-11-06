"""
OCRBookor - Routeur Projets
"""

import json
import uuid
from typing import Dict, Any, List
from backend.core.database import get_db_connection
from backend.core.storage import ProjectStorage

def list_projects() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    projects = []
    for r in rows:
        row_dict = dict(r)
        if row_dict.get("metadata_json"):
            try:
                row_dict.update(json.loads(row_dict["metadata_json"]))
            except Exception:
                pass
        projects.append(row_dict)
    conn.close()
    return projects

def get_project(project_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise KeyError(f"Projet introuvable : {project_id}")
    
    project = dict(row)
    if project.get("metadata_json"):
        try:
            project.update(json.loads(project["metadata_json"]))
        except Exception:
            pass

    cursor.execute("SELECT * FROM pages WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    project["pages"] = [dict(p) for p in cursor.fetchall()]
    conn.close()
    return project

def save_project(data: Dict[str, Any]) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    project_id = data.get("id") or f"proj-{uuid.uuid4().hex[:8]}"
    
    title = data.get("title", "Livre sans titre")
    author = data.get("author", "Inconnu")
    language = data.get("language", "fra")
    status = data.get("status", "importe")

    cursor.execute("""
        INSERT INTO projects (id, title, author, language, status, metadata_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            author = excluded.author,
            language = excluded.language,
            status = excluded.status,
            metadata_json = excluded.metadata_json,
            updated_at = CURRENT_TIMESTAMP
    """, (project_id, title, author, language, status, json.dumps(data)))
    conn.commit()
    conn.close()

    ProjectStorage(project_id)
    return project_id

def delete_project(project_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    cursor.execute("DELETE FROM pages WHERE project_id = ?", (project_id,))
    conn.commit()
    conn.close()

    storage = ProjectStorage(project_id)
    storage.delete_project_data()
    return True
