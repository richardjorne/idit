'use client';

import React from 'react';
import ImageGallery from '../gallery/ImageGallery';

const ImageGalleryPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-text">
          Idit
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-text-secondary">
          The community for AI image editing and prompt sharing.
        </p>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-brand-text mb-6">Community Creations</h2>
        <ImageGallery />
      </div>
    </div>
  );
};

export default ImageGalleryPage;