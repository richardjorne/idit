
from flask import Blueprint, request, jsonify
import uuid
from backend.database import SessionLocal
from backend.domain_models import EditSession, SourceImage, GeneratedImage

edit_bp = Blueprint("edit", __name__, url_prefix="/api")

@edit_bp.route("/edit-sessions", methods=["POST"])
def create_edit_session():
    data = request.get_json()
    prompt = data.get("prompt")
    model = data.get("modelName", "default")
    user_id = data.get("userId")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

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
        return jsonify({
            "id": str(session.id),
            "prompt": session.prompt,
            "model": session.model,
            "status": session.status,
            "createdAt": session.created_at.isoformat(),
            "updatedAt": session.updated_at.isoformat() if session.updated_at else None,
            "sourceImages": [ {"id": str(i.id), "url": i.url} for i in session.source_images ],
            "generatedImages": [ {"id": str(i.id), "url": i.url, "shared": i.shared, "index": i.index} for i in session.generated_images ]
        })
    finally:
        db.close()

@edit_bp.route("/edit-sessions/<session_id>/source-images", methods=["POST"])
def add_source_images(session_id):
    db = SessionLocal()
    try:
        sid = uuid.UUID(session_id)
        session = db.query(EditSession).filter_by(id=sid).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404

        data = request.get_json()
        urls = data.get("urls", [])

        created = []
        for url in urls:
            img = SourceImage(session_id=sid, url=url)
            db.add(img)
            created.append(img)

        db.commit()
        return jsonify({"sourceImages": [ {"id": str(i.id), "url": i.url} for i in created ]})
    finally:
        db.close()

@edit_bp.route("/edit-sessions/<session_id>/generate", methods=["POST"])
def generate_images(session_id):
    db = SessionLocal()
    try:
        sid = uuid.UUID(session_id)
        session = db.query(EditSession).filter_by(id=sid).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404

        session.status = "generating"
        db.commit()

        body = request.get_json()
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

        return jsonify({"images": [ {"id": str(i.id), "url": i.url, "shared": i.shared, "index": i.index} for i in created ]})
    finally:
        db.close()

@edit_bp.route("/images/<image_id>/share", methods=["POST"])
def share_image(image_id):
    db = SessionLocal()
    try:
        iid = uuid.UUID(image_id)
        img = db.query(GeneratedImage).filter_by(id=iid).first()
        if not img:
            return jsonify({"error": "Image not found"}), 404

        img.shared = True
        db.commit()
        return jsonify({"success": True, "imageId": str(img.id)})
    finally:
        db.close()
