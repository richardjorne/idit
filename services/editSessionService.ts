import { EditSession } from '../types';
import { API_BASE_URL } from './apiConfig';

// Template function to polish a prompt.
// In a real scenario, this would call a backend API to an LLM.
export const polishPrompt = async (prompt: string): Promise<string> => {
  console.log('Polishing prompt:', prompt);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const polishedPrompt = `An enhanced, highly-detailed, and photorealistic version of: ${prompt}`;
  console.log('Polished prompt:', polishedPrompt);
  return polishedPrompt;
};

// Template function to generate an image.
// This would call the backend to start the generation process.
export const generateImage = async (session: Omit<EditSession, 'sessionId' | 'status' | 'outputImageUrl'>): Promise<string> => {
  console.log('Starting image generation with session:', session);
  try {
    //Create a edit session
    const createResp = await fetch(`${API_BASE_URL}/api/edit-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: session.prompt, model: session.modelName })
    });

    if (!createResp.ok) {
      throw new Error(`Failed to create session: ${createResp.status}`);
    }

    const created = await createResp.json();
    const sessionId = created.id;

    //If there is an input image URL, add it as a source image 
    if ((session as any).inputImageUrl) {
      try {
        await fetch(`${API_BASE_URL}/api/edit-sessions/${sessionId}/source-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: [(session as any).inputImageUrl] })
        });
      } catch (err) {
        console.warn('Failed to register source image URL with backend (this may be expected for blob URLs).', err);
      }
    }

    //Ask backend to generate images
    const genResp = await fetch(`${API_BASE_URL}/api/edit-sessions/${sessionId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numImages: 1 })
    });

    if (!genResp.ok) {
      throw new Error(`Generation failed: ${genResp.status}`);
    }

    const genBody = await genBody.json();
    const images = genBody.images || [];
    if (images.length === 0) {
      throw new Error('No images returned from generation endpoint');
    }

    const first = images[0];
    //Return the URL 
    try {
      (window as any).__lastGeneratedImage = { id: first.id, url: first.url };
    } catch (e) {
      //ignore if window not available in some contexts
    }

    console.log('Image generation finished. Output URL:', first.url);
    return first.url;
  } catch (err) {
    console.error('Error calling backend generation endpoints, falling back to simulated image:', err);

    // Fallback simulated behavior
    await new Promise(resolve => setTimeout(resolve, 3000));
    const outputImageUrl = 'https://picsum.photos/512/512'; //Placeholder image
    return outputImageUrl;
  }
};

//Template function to share an image to the gallery.
//This will be implemented in a future task.
export const shareToGallery = async (session: EditSession): Promise<void> => {
  //Prefer an image id if available 
  const last = (window as any).__lastGeneratedImage;
  const imageId = last?.id;

  if (imageId) {
    const resp = await fetch(`${API_BASE_URL}/api/images/${imageId}/share`, { method: 'POST' });
    if (!resp.ok) throw new Error('Failed to share image');
    return;
  }

  if (!session.outputImageUrl) {
    console.error('Cannot share to gallery: no output image URL in the session.');
    throw new Error('No image to share.');
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Image shared successfully.');
};
