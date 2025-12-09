import type { ImageAsset } from '../types';

const API_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://127.0.0.1:5001';


export const fetchImages = async (page: number, limit: number): Promise<ImageAsset[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/shared?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data as ImageAsset[];
  } catch (error) {
    console.error("Failed to fetch images:", error);
    return [];
  }
};
