'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchImages } from '../../services/apiService';
import type { ImageAsset } from '../../types';
import ImageCard from './ImageCard';
import Spinner from '../ui/Spinner';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadMoreImages = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const newImages = await fetchImages(page, 10);
      if (newImages.length === 0) {
        setHasMore(false);
      } else {
        setImages(prevImages => [...prevImages, ...newImages]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    loadMoreImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaderRef = useInfiniteScroll(loadMoreImages, isLoading);

  return (
    <div>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map(image => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
      <div ref={loaderRef} className="flex justify-center items-center h-20">
        {isLoading && <Spinner />}
        {!hasMore && <p className="text-brand-text-secondary">You've reached the end!</p>}
      </div>
    </div>
  );
};

export default ImageGallery;