'use client';

import React, { useCallback } from 'react';
import { UploadedImage } from '@/types/collage';

interface ImageUploadProps {
  onImagesUpload: (images: UploadedImage[]) => void;
}

export function ImageUpload({ onImagesUpload }: ImageUploadProps) {
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const imagePromises = files.map((file) => {
      return new Promise<UploadedImage>((resolve) => {
        const url = URL.createObjectURL(file);
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          file,
          url,
          name: file.name,
          size: file.size,
        });
      });
    });

    Promise.all(imagePromises).then(onImagesUpload);
  }, [onImagesUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length === 0) return;

    const imagePromises = files.map((file) => {
      return new Promise<UploadedImage>((resolve) => {
        const url = URL.createObjectURL(file);
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          file,
          url,
          name: file.name,
          size: file.size,
        });
      });
    });

    Promise.all(imagePromises).then(onImagesUpload);
  }, [onImagesUpload]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Images</h2>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or{' '}
              <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
