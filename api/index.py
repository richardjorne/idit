from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import time
from typing import List, Dict, Any
from backend.edit_router import router as edit_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

#Include edit-session router (implements /api/edit-sessions, generate, share, etc.)
app.include_router(edit_router, prefix="/api")

sample_users = [
    {'id': 'user1', 'username': 'PixelDreamer', 'avatarUrl': ''},
    {'id': 'user2', 'username': 'AI_Artisan', 'avatarUrl': ''},
    {'id': 'user3', 'username': 'SynthWave', 'avatarUrl': ''},
    {'id': 'user4', 'username': 'GlitchMaster', 'avatarUrl': ''},
]

sample_prompts = [
    'Epic cinematic shot of a majestic lion in a futuristic city, neon lights, detailed fur, 8k',
    'A tranquil scene of a cherry blossom tree by a serene lake, digital painting, Studio Ghibli style',
    'Hyperrealistic portrait of an old wizard with a long white beard, intricate details, fantasy art',
    'An astronaut floating in space, looking at a galaxy nebula, vibrant colors, cosmic art',
    'Surreal landscape with floating islands and giant mushrooms, psychedelic art, detailed',
    'A cute robot tending to a small garden on a spaceship, warm lighting, emotional',
    'Steampunk cityscape at dusk, intricate clockwork details, airships in the sky',
]

image_id_counter = 0

def generate_random_image():
    global image_id_counter
    width = random.randint(400, 600)
    height = random.randint(400, 700)
    random_user = random.choice(sample_users)
    random_prompt = random.choice(sample_prompts)
    
    image_id_counter += 1

    return {
        'id': f'img_{image_id_counter}',
        'url': f'https://picsum.photos/{width}/{height}?random={image_id_counter}',
        'width': width,
        'height': height,
        'prompt': {
            'id': f'prompt_{image_id_counter}',
            'title': random_prompt.split(',')[0],
            'content': random_prompt,
            'author': random_user,
            'reward': random.randint(1, 10),
        },
    }

@app.get("/api/images", response_model=List[Dict[str, Any]])
def fetch_images(page: int, limit: int):
    print(f"Fetching page {page} with limit {limit}")
    # time.sleep(1)  # Simulate network delay
    images = [generate_random_image() for _ in range(limit)]
    return images

