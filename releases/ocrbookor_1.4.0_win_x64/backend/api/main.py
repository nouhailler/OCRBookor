"""
OCRBookor - API Locale FastAPI
Expose les points d'accès REST pour la gestion des projets, les traitements OCR et les exports.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from pathlib import Path
import json
import uuid

from backend.core.database import get_db_connection
from backend.core.storage import ProjectStorage
from backend.ocr.manager import OCRManager
from backend.quality.confidence import evaluate_quality_metrics

app = FastAPI(
    title="OCRBookor Local API",
    description="API locale de numérisation, reconnaissance et reconstruction de livres",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr_manager = OCRManager()

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "OCRBookor",
        "version": "1.0.0",
        "mode": "local_offline"
    }

@app.get("/api/system/ocr-engines")
def get_ocr_engines():
    """Retourne la disponibilité réelle de chaque moteur OCR installé"""
    return ocr_manager.get_engine_statuses()

@app.get("/api/projects")
def list_projects():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projects ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    projects = [dict(r) for r in rows]
    conn.close()
    return {"projects": projects}

@app.post("/api/projects")
def create_project(data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    project_id = data.get("id") or f"proj-{uuid.uuid4().hex[:8]}"

    cursor.execute("""
        INSERT INTO projects (id, title, author, language, status, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        project_id,
        data.get("title", "Nouveau livre"),
        data.get("author", "Inconnu"),
        data.get("language", "fra"),
        data.get("status", "importe"),
        json.dumps(data)
    ))
    conn.commit()
    conn.close()
    return {"id": project_id, "status": "created"}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()

    storage = ProjectStorage(project_id)
    storage.delete_project_data()
    return {"status": "deleted", "id": project_id}
