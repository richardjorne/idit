import type { ImageAsset } from '../types';

const API_BASE_URL = '';

export const fetchImages = async (page: number, limit: number): Promise<ImageAsset[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images?page=${page}&limit=${limit}`);
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
