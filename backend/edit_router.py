from fastapi import APIRouter, HTTPException, Request
from typing import Any, Dict, List
import uuid
from backend.database import SessionLocal
from backend.domain_models import EditSession, SourceImage, GeneratedImage

router = APIRouter()


def serialize_session(session) -> Dict[str, Any]:
    return {
        "id": str(session.id),
        "prompt": session.prompt,
        "model": session.model,
        "status": session.status,
        "createdAt": session.created_at.isoformat(),
        "updatedAt": session.updated_at.isoformat() if session.updated_at else None,
        "sourceImages": [ {"id": str(i.id), "url": i.url} for i in session.source_images ],
        "generatedImages": [ {"id": str(i.id), "url": i.url, "shared": i.shared, "index": i.index} for i in session.generated_images ]
    }


#Create edit session
@router.post("/edit-sessions")
async def create_edit_session(request: Request):
    data = await request.json()
    prompt = data.get("prompt")
    model = data.get("model", "default")
    user_id = data.get("userId")

    #No prompt
    if not prompt:
        raise HTTPException(status_code=400, detail={"error": "Prompt is required"})

    db = SessionLocal()
    try:
        session = EditSession(
            prompt=prompt,
            model=model,
            user_id=uuid.UUID(user_id) if user_id else None
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return serialize_session(session)
    finally:
        db.close()

#Update session
@router.patch("/edit-sessions/{session_id}")
async def update_edit_session(session_id: str, request: Request):
    db = SessionLocal()
    try:
        sid = uuid.UUID(session_id)
        session = db.query(EditSession).filter_by(id=sid).first()
        if not session:
            raise HTTPException(status_code=404, detail={"error": "Session not found"})

        data = await request.json()
        if "prompt" in data:
            session.prompt = data["prompt"]
        if "model" in data:
            session.model = data["model"]

        db.commit()
        db.refresh(session)
        return serialize_session(session)
    finally:
        db.close()

#Register source image URLs
@router.post("/edit-sessions/{session_id}/source-images")
async def add_source_images(session_id: str, request: Request):
    db = SessionLocal()
    try:
        sid = uuid.UUID(session_id)
        session = db.query(EditSession).filter_by(id=sid).first()
        if not session:
            raise HTTPException(status_code=404, detail={"error": "Session not found"})

        data = await request.json()
        urls = data.get("urls", [])

        created = []
        for url in urls:
            img = SourceImage(session_id=sid, url=url)
            db.add(img)
            created.append(img)

        db.commit()
        return {"sourceImages": [ {"id": str(i.id), "url": i.url} for i in created ]}
    finally:
        db.close()

#Placeholder image generation
@router.post("/edit-sessions/{session_id}/generate")
async def generate_images(session_id: str, request: Request):
    db = SessionLocal()
    try:
        sid = uuid.UUID(session_id)
        session = db.query(EditSession).filter_by(id=sid).first()
        if not session:
            raise HTTPException(status_code=404, detail={"error": "Session not found"})

        session.status = "generating"
        db.commit()

        body = await request.json()
        num = int(body.get("numImages", 1))

        created = []
        existing = db.query(GeneratedImage).filter_by(session_id=sid).count()

        for i in range(num):
            #placeholder image
            url = f"https://picsum.photos/512/512"
            gi = GeneratedImage(session_id=sid, url=url, index=existing + i)
            db.add(gi)
            created.append(gi)

        session.status = "completed"
        db.commit()

        return {"images": [ {"id": str(i.id), "url": i.url, "shared": i.shared, "index": i.index} for i in created ]}
    finally:
        db.close()


#Mark as shared
@router.post("/images/{image_id}/share")
async def share_image(image_id: str):
    db = SessionLocal()
    try:
        iid = uuid.UUID(image_id)
        img = db.query(GeneratedImage).filter_by(id=iid).first()
        if not img:
            raise HTTPException(status_code=404, detail={"error": "Image not found"})

        img.shared = True
        db.commit()
        return {"success": True, "imageId": str(img.id)}
    finally:
        db.close()
