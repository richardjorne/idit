# backend/images_routes.py
from flask import Blueprint, jsonify, request
from sqlalchemy.orm import joinedload
from backend.database import SessionLocal
from backend.models import Prompt, User
from backend.domain_models import GeneratedImage, EditSession

images_bp = Blueprint('images', __name__)

@images_bp.route("/images/shared", methods=['GET'])
def fetch_shared_images():
    db = SessionLocal()
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        offset = (page - 1) * limit

        images_from_prompts = []
        if page == 1:
            # Get the 5 example prompts
            prompts = db.query(Prompt).options(joinedload(Prompt.owner)).order_by(Prompt.created_at.desc()).limit(5).all()

            for p in prompts:
                images_from_prompts.append({
                    "id": str(p.prompt_id),
                    "url": p.preview_image_url,
                    "width": 400,
                    "height": 600,
                    "prompt": {
                        "id": str(p.prompt_id),
                        "title": p.title,
                        "content": p.content,
                        "author": {
                            "id": str(p.owner.user_id),
                            "username": p.owner.username,
                            "avatarUrl": ""
                        },
                        "reward": p.reward
                    },
                })

        # Get the shared images
        images = db.query(GeneratedImage).join(EditSession).join(User).filter(GeneratedImage.shared==True).order_by(GeneratedImage.created_at.desc()).offset(offset).limit(limit).all()
        
        images_from_shared = []
        for img in images:
            images_from_shared.append({
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
        
        # Combine the two lists
        all_images = images_from_prompts + images_from_shared
        
        return jsonify(all_images)
    finally:
        db.close()

@images_bp.route("/images", methods=['GET'])
def fetch_images():
    db = SessionLocal()
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        offset = (page - 1) * limit

        prompts = db.query(Prompt).options(joinedload(Prompt.owner)).order_by(Prompt.created_at.desc()).offset(offset).limit(limit).all()

        images = []
        for p in prompts:
            images.append({
                "id": str(p.prompt_id),
                "url": p.preview_image_url,
                "width": 400,
                "height": 600,
                "prompt": {
                    "id": str(p.prompt_id),
                    "title": p.title,
                    "content": p.content,
                    "author": {
                        "id": str(p.owner.user_id),
                        "username": p.owner.username,
                        "avatarUrl": ""
                    },
                    "reward": p.reward
                },
            })

        return jsonify(images)
    finally:
        db.close()

# import random
# from flask import Blueprint, jsonify, request
# from typing import List, Dict, Any

# images_bp = Blueprint('images', __name__)

# SAMPLE_USERS = [
#     {'id': 'user1', 'username': 'PixelDreamer', 'avatarUrl': ''},
#     {'id': 'user2', 'username': 'AI_Artisan', 'avatarUrl': ''},
#     {'id': 'user3', 'username': 'SynthWave', 'avatarUrl': ''},
#     {'id': 'user4', 'username': 'GlitchMaster', 'avatarUrl': ''},
# ]

# RANDOM_PROMPTS = [
#     'Epic cinematic shot of a majestic lion in a futuristic city, neon lights, detailed fur, 8k',
#     'A tranquil scene of a cherry blossom tree by a serene lake, digital painting, Studio Ghibli style',
#     'Hyperrealistic portrait of an old wizard with a long white beard, intricate details, fantasy art',
#     'An astronaut floating in space, looking at a galaxy nebula, vibrant colors, cosmic art',
#     'Surreal landscape with floating islands and giant mushrooms, psychedelic art, detailed',
#     'A cute robot tending to a small garden on a spaceship, warm lighting, emotional',
#     'Steampunk cityscape at dusk, intricate clockwork details, airships in the sky',
# ]

# def generate_random_image() -> Dict[str, Any]:
#     random_user = random.choice(SAMPLE_USERS)
#     random_prompt = random.choice(RANDOM_PROMPTS)
#     return {
#         "id": f"img-{random.randint(1000, 9999)}",
#         "url": f"https://picsum.photos/seed/{random.randint(1, 100_000)}/400/{random.randint(400, 800)}",
#         "author": random_user,
#         "prompt": random_prompt,
#         "meta": {
#             "title": random_prompt.split(',')[0],
#             "content": random_prompt,
#             "author": random_user,
#             "reward": random.randint(1, 10),
#         },
#     }

# @images_bp.route("/images", methods=['GET'])
# def fetch_images():
#     page = request.args.get('page', 1, type=int)
#     limit = request.args.get('limit', 10, type=int)
#     safe_page = max(page, 1)
#     safe_limit = min(limit, 100)
#     print(f"Fetching page {safe_page} with limit {safe_limit}")
#     return jsonify([generate_random_image() for _ in range(safe_limit)])
