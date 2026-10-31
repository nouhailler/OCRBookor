"""
OCRBookor - API Locale FastAPI
Conforme à la Partie 2.1 et 2.3 du Cahier des Charges
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="OCRBookor Local API",
    description="API locale de traitement documentaire, reconnaissance OCR et reconstruction de livres",
    version="1.0.0"
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "OCRBookor", "mode": "local"}

@app.get("/api/projects")
def list_projects():
    return {"projects": []}
