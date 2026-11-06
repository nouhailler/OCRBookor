"""
OCRBookor - Routeur Exports
"""

import json
from pathlib import Path
from typing import Dict, Any

from backend.core.database import get_db_connection
from backend.core.storage import ProjectStorage
from backend.export.epub import EPUBExporter
from backend.export.markdown import MarkdownExporter, TextExporter, HTMLExporter

def export_document(project_id: str, export_format: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    p_row = cursor.fetchone()
    if not p_row:
        conn.close()
        raise KeyError(f"Projet introuvable : {project_id}")

    project_data = dict(p_row)
    if project_data.get("metadata_json"):
        try:
            project_data.update(json.loads(project_data["metadata_json"]))
        except Exception:
            pass

    cursor.execute("SELECT * FROM pages WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    pages = [dict(p) for p in cursor.fetchall()]
    conn.close()

    storage = ProjectStorage(project_id)
    exports_dir = storage.exports_dir
    safe_title = "".join(c for c in project_data.get("title", "document") if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')

    export_payload = {
        "id": project_id,
        "metadata": {
            "title": project_data.get("title", "Document numérisé"),
            "author": project_data.get("author", "Inconnu"),
            "language": project_data.get("language", "fra")
        },
        "pages": pages,
        "chapters": [
            {
                "title": f"Page {p['page_number']}",
                "blocks": [{"text": p.get("raw_text", "")}]
            }
            for p in pages if p.get("raw_text", "").strip()
        ]
    }

    if export_format == "epub":
        filename = f"{safe_title}.epub"
        out_file = exports_dir / filename
        EPUBExporter.generate_epub(export_payload, out_file)
    elif export_format == "markdown":
        filename = f"{safe_title}.md"
        out_file = exports_dir / filename
        MarkdownExporter.export(export_payload, out_file)
    elif export_format == "text":
        filename = f"{safe_title}.txt"
        out_file = exports_dir / filename
        TextExporter.export(export_payload, out_file)
    elif export_format == "html":
        filename = f"{safe_title}.html"
        out_file = exports_dir / filename
        HTMLExporter.export(export_payload, out_file)
    else:
        raise ValueError(f"Format non supporté : {export_format}")

    return {
        "fileName": filename,
        "fileSizeBytes": out_file.stat().st_size,
        "downloadUrl": f"/api/projects/{project_id}/exports/{filename}",
        "filePath": str(out_file)
    }
