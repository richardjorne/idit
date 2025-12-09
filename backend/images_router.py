# backend/images_router.py
import random
import time
from typing import List, Dict, Any

from fastapi import APIRouter

router = APIRouter()

# 这里的 SAMPLE_USERS / RANDOM_PROMPTS / generate_random_image
# 你可以直接从原来的 api/index.py 中拷贝过来
SAMPLE_USERS = [
    {'id': 'user1', 'username': 'PixelDreamer', 'avatarUrl': ''},
    {'id': 'user2', 'username': 'AI_Artisan', 'avatarUrl': ''},
    {'id': 'user3', 'username': 'SynthWave', 'avatarUrl': ''},
    {'id': 'user4', 'username': 'GlitchMaster', 'avatarUrl': ''},
]

RANDOM_PROMPTS = [
    'Epic cinematic shot of a majestic lion in a futuristic city, neon lights, detailed fur, 8k',
    'A tranquil scene of a cherry blossom tree by a serene lake, digital painting, Studio Ghibli style',
    'Hyperrealistic portrait of an old wizard with a long white beard, intricate details, fantasy art',
    'An astronaut floating in space, looking at a galaxy nebula, vibrant colors, cosmic art',
    'Surreal landscape with floating islands and giant mushrooms, psychedelic art, detailed',
    'A cute robot tending to a small garden on a spaceship, warm lighting, emotional',
    'Steampunk cityscape at dusk, intricate clockwork details, airships in the sky',
]

def generate_random_image() -> Dict[str, Any]:
    random_user = random.choice(SAMPLE_USERS)
    random_prompt = random.choice(RANDOM_PROMPTS)
    return {
        "id": f"img-{random.randint(1000, 9999)}",
        "url": f"https://picsum.photos/seed/{random.randint(1, 100_000)}/400/{random.randint(400, 800)}",
        "author": random_user,
        "prompt": random_prompt,
        "meta": {
            "title": random_prompt.split(',')[0],
            "content": random_prompt,
            "author": random_user,
            "reward": random.randint(1, 10),
        },
    }

@router.get("/images", response_model=List[Dict[str, Any]])
async def fetch_images(page: int, limit: int):
    # 和原来一样，保留打印和模拟延迟（可选）
    print(f"Fetching page {page} with limit {limit}")
    # time.sleep(1)  # 如果还想模拟网络延迟，就解开注释
    return [generate_random_image() for _ in range(limit)]
