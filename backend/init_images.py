
import uuid
import random
from backend.database import SessionLocal
from backend.models import User, Prompt

def create_sample_data():
    db = SessionLocal()
    try:
        # Create users if they don't exist
        users_to_create = [
            {'username': 'PixelDreamer', 'email': 'pixel@dream.com', 'password_hash': 'hashed_password'},
            {'username': 'AI_Artisan', 'email': 'ai@artisan.com', 'password_hash': 'hashed_password'},
            {'username': 'SynthWave', 'email': 'synth@wave.com', 'password_hash': 'hashed_password'},
            {'username': 'GlitchMaster', 'email': 'glitch@master.com', 'password_hash': 'hashed_password'},
        ]

        users = []
        for user_data in users_to_create:
            user = db.query(User).filter_by(email=user_data['email']).first()
            if not user:
                user = User(**user_data)
                db.add(user)
                db.commit()
            users.append(user)

        # Create 5 image prompts
        prompts_to_create = [
            {
                'title': 'Epic cinematic shot of a majestic lion in a futuristic city, neon lights, detailed fur, 8k',
                'content': 'A majestic lion stands proudly amidst a sprawling futuristic cityscape. Towering skyscrapers with holographic advertisements pierce the clouds, while flying vehicles zip between them. The lion\'s fur is rendered in exquisite detail, catching the glow of the vibrant neon lights that bathe the scene in a cyberpunk aesthetic. The image is captured in a cinematic 8k resolution, emphasizing the grandeur and scale of the moment.',
                'preview_image_url': 'https://picsum.photos/seed/101/400/600',
                'is_public': True,
                'status': 'APPROVED',
                'reward': 5
            },
            {
                'title': 'A tranquil scene of a cherry blossom tree by a serene lake, digital painting, Studio Ghibli style',
                'content': 'In the style of a Studio Ghibli digital painting, a magnificent cherry blossom tree in full bloom stands by the edge of a crystal-clear, serene lake. The gentle breeze scatters petals across the water\'s surface, creating soft ripples. The color palette is soft and dreamlike, with pastel pinks, blues, and greens dominating the scene, evoking a sense of peace and tranquility.',
                'preview_image_url': 'https://picsum.photos/seed/102/400/500',
                'is_public': True,
                'status': 'APPROVED',
                'reward': 3
            },
            {
                'title': 'Hyperrealistic portrait of an old wizard with a long white beard, intricate details, fantasy art',
                'content': 'A hyperrealistic fantasy art portrait of a wise and ancient wizard. Every wrinkle on his face tells a story, and his long, flowing white beard is rendered with incredible detail. His eyes, full of wisdom and a hint of magic, seem to look directly at the viewer. He wears ornate robes adorned with mystical symbols, and a faint magical aura surrounds him.',
                'preview_image_url': 'https://picsum.photos/seed/103/400/700',
                'is_public': True,
                'status': 'APPROVED',
                'reward': 8
            },
            {
                'title': 'An astronaut floating in space, looking at a galaxy nebula, vibrant colors, cosmic art',
                'content': 'A lone astronaut floats weightlessly in the vast expanse of space, dwarfed by the breathtaking beauty of a colorful galaxy nebula. Swirls of vibrant pink, purple, and blue gases create a cosmic masterpiece, with distant stars twinkling like diamonds. The astronaut\'s helmet reflects the nebula, creating a powerful and awe-inspiring image of humanity\'s place in the universe.',
                'preview_image_url': 'https://picsum.photos/seed/104/400/550',
                'is_public': True,
                'status': 'APPROVED',
                'reward': 10
            },
            {
                'title': 'Surreal landscape with floating islands and giant mushrooms, psychedelic art, detailed',
                'content': 'A surreal and psychedelic landscape where giant, glowing mushrooms illuminate a world of floating islands. The sky is a kaleidoscope of colors, and strange, exotic plants grow on the islands. The artwork is highly detailed, inviting the viewer to get lost in its fantastical and dreamlike world. The overall effect is one of wonder and otherworldliness.',
                'preview_image_url': 'https://picsum.photos/seed/105/400/650',
                'is_public': True,
                'status': 'APPROVED',
                'reward': 7
            },
        ]

        for prompt_data in prompts_to_create:
            # Check if a prompt with the same title already exists
            existing_prompt = db.query(Prompt).filter_by(title=prompt_data['title']).first()
            if existing_prompt:
                # Update reward if it exists
                existing_prompt.reward = prompt_data['reward']
            else:
                # Assign a random owner from the created users
                owner = random.choice(users)
                prompt = Prompt(
                    owner_id=owner.user_id,
                    **prompt_data
                )
                db.add(prompt)

        db.commit()
        print("Sample data created successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error creating sample data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
