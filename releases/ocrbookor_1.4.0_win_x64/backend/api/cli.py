"""
OCRBookor - CLI Passerelle Backend
Fournit une interface en ligne de commande standardisée pour le pont Full-Stack Express / Node.js
et l'exécution automatisée sans dépendance externe obligatoire.
"""

import sys
import json
import uuid
from pathlib import Path
from typing import Dict, Any, Optional

from backend.core.database import get_db_connection, init_db
from backend.core.storage import ProjectStorage
from backend.ocr.manager import OCRManager
from backend.quality.confidence import evaluate_quality_metrics
from backend.export.epub import EPUBExporter
from backend.export.markdown import MarkdownExporter, TextExporter, HTMLExporter

def cmd_init_db():
    init_db()
    print(json.dumps({"status": "ok", "message": "Database initialized"}))

def cmd_system_engines():
    manager = OCRManager()
    statuses = manager.get_engine_statuses()
    print(json.dumps(statuses))

def cmd_list_projects():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    projects = []
    for r in rows:
        row_dict = dict(r)
        if row_dict.get("metadata_json"):
            try:
                meta = json.loads(row_dict["metadata_json"])
                row_dict["meta"] = meta
            except Exception:
                pass
        projects.append(row_dict)
    conn.close()
    print(json.dumps({"projects": projects}))

def cmd_get_project(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        print(json.dumps({"error": f"Project not found: {project_id}"}), file=sys.stderr)
        sys.exit(1)

    project_data = dict(row)
    if project_data.get("metadata_json"):
        try:
            parsed = json.loads(project_data["metadata_json"])
            project_data.update(parsed)
        except Exception:
            pass

    # Fetch pages
    cursor.execute("SELECT * FROM pages WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    pages = [dict(p) for p in cursor.fetchall()]
    project_data["pages"] = pages

    # Fetch chapters
    cursor.execute("SELECT * FROM chapters WHERE project_id = ? ORDER BY order_index ASC", (project_id,))
    chapters = [dict(c) for c in cursor.fetchall()]
    project_data["chapters"] = chapters

    conn.close()
    print(json.dumps(project_data))

def cmd_save_project(json_payload: str):
    data = json.loads(json_payload)
    project_id = data.get("id") or f"proj-{uuid.uuid4().hex[:8]}"
    title = data.get("title") or (data.get("metadata", {}).get("title") if isinstance(data.get("metadata"), dict) else "Nouveau livre")
    author = data.get("author") or (data.get("metadata", {}).get("author") if isinstance(data.get("metadata"), dict) else "Inconnu")
    language = data.get("language") or (data.get("metadata", {}).get("language") if isinstance(data.get("metadata"), dict) else "fra")
    status = data.get("status", "importe")

    conn = get_db_connection()
    cursor = conn.cursor()
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
    """, (
        project_id,
        title,
        author,
        language,
        status,
        json.dumps(data)
    ))

    # Pages if supplied
    pages = data.get("pages", [])
    for p in pages:
        page_num = p.get("pageNumber") or p.get("page_number", 1)
        p_id = p.get("id") or f"{project_id}-page-{page_num}"
        raw_text = p.get("rawText") or p.get("raw_text", "")
        conf = float(p.get("confidence", 0.0))
        cursor.execute("""
            INSERT INTO pages (id, project_id, page_number, width, height, dpi, raw_text, confidence, validated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                raw_text = excluded.raw_text,
                confidence = excluded.confidence,
                validated = excluded.validated
        """, (
            p_id,
            project_id,
            page_num,
            p.get("width", 1200),
            p.get("height", 1600),
            p.get("dpi", 300),
            raw_text,
            conf,
            1 if p.get("validated") else 0
        ))

    conn.commit()
    conn.close()

    # Ensure storage folders exist
    ProjectStorage(project_id)

    print(json.dumps({"status": "saved", "id": project_id}))

def cmd_delete_project(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    cursor.execute("DELETE FROM pages WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM chapters WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM illustrations WHERE project_id = ?", (project_id,))
    cursor.execute("DELETE FROM jobs WHERE project_id = ?", (project_id,))
    conn.commit()
    conn.close()

    storage = ProjectStorage(project_id)
    storage.delete_project_data()
    print(json.dumps({"status": "deleted", "id": project_id}))

def cmd_save_page_text(project_id: str, page_number_str: str, corrected_text: str):
    page_num = int(page_number_str)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find page
    cursor.execute("SELECT id, raw_text FROM pages WHERE project_id = ? AND page_number = ?", (project_id, page_num))
    row = cursor.fetchone()
    if row:
        page_id = row["id"]
        original_text = row["raw_text"]
        cursor.execute("""
            UPDATE pages SET raw_text = ?, validated = 1 WHERE id = ?
        """, (corrected_text, page_id))

        # Log correction record
        corr_id = f"corr-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO corrections (id, block_id, original_text, corrected_text)
            VALUES (?, ?, ?, ?)
        """, (corr_id, page_id, original_text, corrected_text))
    else:
        # Create page entry if it wasn't registered yet
        page_id = f"{project_id}-page-{page_num}"
        cursor.execute("""
            INSERT INTO pages (id, project_id, page_number, width, height, dpi, raw_text, validated)
            VALUES (?, ?, ?, 1200, 1600, 300, ?, 1)
        """, (page_id, project_id, page_num, corrected_text))

    conn.commit()
    conn.close()
    print(json.dumps({"status": "ok", "project_id": project_id, "page_number": page_num}))

def cmd_export(project_id: str, export_format: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    p_row = cursor.fetchone()
    if not p_row:
        conn.close()
        print(json.dumps({"error": f"Project not found: {project_id}"}), file=sys.stderr)
        sys.exit(1)

    project_data = dict(p_row)
    if project_data.get("metadata_json"):
        try:
            meta = json.loads(project_data["metadata_json"])
            project_data.update(meta)
        except Exception:
            pass

    # Pages
    cursor.execute("SELECT * FROM pages WHERE project_id = ? ORDER BY page_number ASC", (project_id,))
    pages = [dict(p) for p in cursor.fetchall()]
    conn.close()

    storage = ProjectStorage(project_id)
    exports_dir = storage.exports_dir
    safe_title = "".join(c for c in project_data.get("title", "document") if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')

    # Prepare project data structure for exporters
    export_payload = {
        "id": project_id,
        "metadata": {
            "title": project_data.get("title", "Sans titre"),
            "author": project_data.get("author", "Inconnu"),
            "language": project_data.get("language", "fra"),
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
        print(json.dumps({"error": f"Format d'export non supporté : {export_format}"}), file=sys.stderr)
        sys.exit(1)

    print(json.dumps({
        "status": "success",
        "file_name": filename,
        "file_path": str(out_file),
        "size_bytes": out_file.stat().st_size
    }))

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified"}), file=sys.stderr)
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "init-db":
        cmd_init_db()
    elif cmd == "system-engines":
        cmd_system_engines()
    elif cmd == "list-projects":
        cmd_list_projects()
    elif cmd == "get-project":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing project_id"}), file=sys.stderr)
            sys.exit(1)
        cmd_get_project(sys.argv[2])
    elif cmd == "save-project":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing project JSON"}), file=sys.stderr)
            sys.exit(1)
        cmd_save_project(sys.argv[2])
    elif cmd == "delete-project":
        if len(sys.argv) < 3:
            print(json.dumps({"error": "Missing project_id"}), file=sys.stderr)
            sys.exit(1)
        cmd_delete_project(sys.argv[2])
    elif cmd == "save-page-text":
        if len(sys.argv) < 5:
            print(json.dumps({"error": "Missing arguments for save-page-text"}), file=sys.stderr)
            sys.exit(1)
        cmd_save_page_text(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "export":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing project_id or format"}), file=sys.stderr)
            sys.exit(1)
        cmd_export(sys.argv[2], sys.argv[3])
    else:
        print(json.dumps({"error": f"Unknown command: {cmd}"}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
