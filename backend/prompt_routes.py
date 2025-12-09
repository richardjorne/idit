# backend/prompt_routes.py
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from backend.database import SessionLocal
from backend.models import User
from backend.models import Prompt
from backend.domain_models import GeneratedImage, EditSession
import uuid

prompt_bp = Blueprint("prompts", __name__, url_prefix="/api/prompts")


@prompt_bp.route("/user/<user_id>/images/shared", methods=["GET"])
def get_user_shared_images(user_id):
    """Fetch all shared images for a specific user."""
    db = SessionLocal()
    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 20, type=int)
        offset = (page - 1) * limit
        uid = uuid.UUID(user_id)
        
        # We need to join EditSession to filter by user_id
        images = db.query(GeneratedImage).join(EditSession).filter(
            GeneratedImage.shared == True,
            EditSession.user_id == uid
        ).order_by(GeneratedImage.created_at.desc()).offset(offset).limit(limit).all()
        
        result = []
        for img in images:
            result.append({
                "id": str(img.id),
                "url": img.url,
                "width": 400,
                "height": 600,
                "prompt": {
                    "id": str(img.session.id),
                    "title": img.session.prompt,
                    "content": img.session.prompt,
                    "author": {
                        "id": str(img.session.user.user_id),
                        "username": img.session.user.username,
                        "avatarUrl": ""
                    },
                    "reward": 0
                },
            })
        return jsonify(result)
    finally:
        db.close()


# GET /api/prompts/user/<user_id> - Get all prompts for a specific user
@prompt_bp.route("/user/<user_id>", methods=["GET"])
def get_user_prompts(user_id):
    """Fetch all prompts belonging to a specific user."""
    db = SessionLocal()
    try:
        # Validate user_id is a valid UUID
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            return jsonify({"error": "Invalid user ID format"}), 400

        # Check if user exists
        user = db.query(User).filter(User.user_id == user_uuid).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch prompts for the user
        prompts = db.query(Prompt).filter(Prompt.owner_id == user_uuid).order_by(Prompt.created_at.desc()).all()

        prompts_list = [{
            "promptId": str(p.prompt_id),
            "title": p.title,
            "content": p.content,
            "previewImageUrl": p.preview_image_url,
            "isPublic": p.is_public,
            "status": p.status,
            "timesUsed": p.times_used,
            "likesCount": p.likes_count,
            "createdAt": p.created_at.isoformat(),
            "updatedAt": p.updated_at.isoformat(),
        } for p in prompts]

        return jsonify({
            "userId": user_id,
            "username": user.username,
            "prompts": prompts_list,
            "totalCount": len(prompts_list)
        }), 200

    except Exception as e:
        print(f"Error fetching user prompts: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


# GET /api/prompts/public - Get all public/approved prompts
@prompt_bp.route("/public", methods=["GET"])
def get_public_prompts():
    """Fetch all public and approved prompts."""
    db = SessionLocal()
    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 20, type=int)
        offset = (page - 1) * limit

        # Fetch public and approved prompts
        prompts = db.query(Prompt).join(User).filter(
            Prompt.is_public == True,
            Prompt.status == "APPROVED"
        ).order_by(Prompt.created_at.desc()).offset(offset).limit(limit).all()

        prompts_list = [{
            "promptId": str(p.prompt_id),
            "title": p.title,
            "content": p.content,
            "previewImageUrl": p.preview_image_url,
            "timesUsed": p.times_used,
            "likesCount": p.likes_count,
            "createdAt": p.created_at.isoformat(),
            "author": {
                "userId": str(p.owner.user_id),
                "username": p.owner.username
            }
        } for p in prompts]

        return jsonify({
            "prompts": prompts_list,
            "page": page,
            "limit": limit
        }), 200

    except Exception as e:
        print(f"Error fetching public prompts: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


# POST /api/prompts - Create a new prompt
@prompt_bp.route("", methods=["POST"])
def create_prompt():
    """Create a new prompt for a user."""
    data = request.get_json() or {}
    owner_id = data.get("ownerId", "").strip()
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    preview_image_url = data.get("previewImageUrl", "").strip() or None
    is_public = data.get("isPublic", False)

    if not owner_id or not title or not content:
        return jsonify({"error": "ownerId, title, and content are required"}), 400

    db = SessionLocal()
    try:
        # Validate owner_id
        try:
            owner_uuid = uuid.UUID(owner_id)
        except ValueError:
            return jsonify({"error": "Invalid owner ID format"}), 400

        # Check if user exists
        user = db.query(User).filter(User.user_id == owner_uuid).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Create prompt
        prompt = Prompt(
            owner_id=owner_uuid,
            title=title,
            content=content,
            preview_image_url=preview_image_url,
            is_public=is_public,
            status="PENDING" if is_public else "APPROVED"  # Auto-approve private prompts
        )
        db.add(prompt)
        db.commit()

        return jsonify({
            "promptId": str(prompt.prompt_id),
            "title": prompt.title,
            "content": prompt.content,
            "previewImageUrl": prompt.preview_image_url,
            "isPublic": prompt.is_public,
            "status": prompt.status,
            "createdAt": prompt.created_at.isoformat()
        }), 201

    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Failed to create prompt"}), 409
    except Exception as e:
        db.rollback()
        print(f"Error creating prompt: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


# PUT /api/prompts/<prompt_id> - Update a prompt
@prompt_bp.route("/<prompt_id>", methods=["PUT"])
def update_prompt(prompt_id):
    """Update an existing prompt."""
    data = request.get_json() or {}
    
    db = SessionLocal()
    try:
        # Validate prompt_id
        try:
            prompt_uuid = uuid.UUID(prompt_id)
        except ValueError:
            return jsonify({"error": "Invalid prompt ID format"}), 400

        prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_uuid).first()
        if not prompt:
            return jsonify({"error": "Prompt not found"}), 404

        # Update fields if provided
        if "title" in data:
            prompt.title = data["title"].strip()
        if "content" in data:
            prompt.content = data["content"].strip()
        if "previewImageUrl" in data:
            prompt.preview_image_url = data["previewImageUrl"].strip() or None
        if "isPublic" in data:
            prompt.is_public = data["isPublic"]
            # Reset status to PENDING if making public
            if data["isPublic"] and prompt.status != "APPROVED":
                prompt.status = "PENDING"

        db.commit()

        return jsonify({
            "promptId": str(prompt.prompt_id),
            "title": prompt.title,
            "content": prompt.content,
            "previewImageUrl": prompt.preview_image_url,
            "isPublic": prompt.is_public,
            "status": prompt.status,
            "updatedAt": prompt.updated_at.isoformat()
        }), 200

    except Exception as e:
        db.rollback()
        print(f"Error updating prompt: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


# DELETE /api/prompts/<prompt_id> - Delete a prompt
@prompt_bp.route("/<prompt_id>", methods=["DELETE"])
def delete_prompt(prompt_id):
    """Delete a prompt."""
    db = SessionLocal()
    try:
        # Validate prompt_id
        try:
            prompt_uuid = uuid.UUID(prompt_id)
        except ValueError:
            return jsonify({"error": "Invalid prompt ID format"}), 400

        prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_uuid).first()
        if not prompt:
            return jsonify({"error": "Prompt not found"}), 404

        db.delete(prompt)
        db.commit()

        return jsonify({"message": "Prompt deleted successfully"}), 200

    except Exception as e:
        db.rollback()
        print(f"Error deleting prompt: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


# POST /api/prompts/<prompt_id>/use - Increment usage count
@prompt_bp.route("/<prompt_id>/use", methods=["POST"])
def use_prompt(prompt_id):
    """Increment the usage count of a prompt."""
    db = SessionLocal()
    try:
        try:
            prompt_uuid = uuid.UUID(prompt_id)
        except ValueError:
            return jsonify({"error": "Invalid prompt ID format"}), 400

        prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_uuid).first()
        if not prompt:
            return jsonify({"error": "Prompt not found"}), 404

        prompt.times_used += 1
        db.commit()

        return jsonify({
            "promptId": str(prompt.prompt_id),
            "timesUsed": prompt.times_used
        }), 200

    except Exception as e:
        db.rollback()
        print(f"Error incrementing prompt usage: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()


# POST /api/prompts/<prompt_id>/like - Increment like count
@prompt_bp.route("/<prompt_id>/like", methods=["POST"])
def like_prompt(prompt_id):
    """Increment the like count of a prompt."""
    db = SessionLocal()
    try:
        try:
            prompt_uuid = uuid.UUID(prompt_id)
        except ValueError:
            return jsonify({"error": "Invalid prompt ID format"}), 400

        prompt = db.query(Prompt).filter(Prompt.prompt_id == prompt_uuid).first()
        if not prompt:
            return jsonify({"error": "Prompt not found"}), 404

        prompt.likes_count += 1
        db.commit()

        return jsonify({
            "promptId": str(prompt.prompt_id),
            "likesCount": prompt.likes_count
        }), 200

    except Exception as e:
        db.rollback()
        print(f"Error liking prompt: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        db.close()