'use client';

import React from 'react';
import type { ImageAsset } from '../../types';
import Button from '../ui/Button';

interface ImageCardProps {
  image: ImageAsset;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="group relative break-inside-avoid-column overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl mb-4">
      <img
        src={image.url}
        alt={image.prompt.title}
        width={image.width}
        height={image.height}
        className="w-full h-auto"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 ease-in-out">
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <h3 className="text-white font-bold text-md truncate">{image.prompt.title}</h3>
          <p className="text-gray-300 text-sm">by {image.prompt.author?.username}</p>
          <Button className="mt-2 w-full text-sm">
            Reuse Prompt (+{image.prompt.reward} credits)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;