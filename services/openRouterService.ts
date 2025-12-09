import { EditSession } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function generateImageWithOpenRouter(
  session: EditSession,
  imageDataUrl: string,
  editPrompt: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set in .env.local');
  }

  const messageContent = imageDataUrl 
      ? [
          { type: "text", text: editPrompt },
          { type: "image_url", image_url: { url: imageDataUrl } }
        ]
      : editPrompt;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: messageContent
        }
      ],
      modalities: ["image", "text"],
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const result = await response.json();
    
  if (!result.choices || result.choices.length === 0) {
    throw new Error("No choices in response");
  }

  const message = result.choices[0].message;

  if (message.images && message.images.length > 0) {
    const image = message.images[0];
    const imageUrl = image.imageUrl?.url || image.image_url?.url;
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }
  }
  
  throw new Error("No image data found in response");
}
