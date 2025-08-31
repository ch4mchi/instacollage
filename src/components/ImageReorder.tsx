'use client';

import React, { useState } from 'react';
import { UploadedImage } from '@/types/collage';

interface ImageReorderProps {
  images: UploadedImage[];
  onReorder: (reorderedImages: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageReorder({ images, onReorder, maxImages }: ImageReorderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add some visual feedback
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged image from its original position
    newImages.splice(draggedIndex, 1);
    
    // Insert it at the new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newImages.splice(insertIndex, 0, draggedImage);
    
    onReorder(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onReorder(newImages);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all images?')) {
      onReorder([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      // Move image left
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      onReorder(newImages);
    } else if (e.key === 'ArrowRight' && index < images.length - 1) {
      e.preventDefault();
      // Move image right
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      onReorder(newImages);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleRemoveImage(index);
    }
  };

  if (images.length === 0) {
    return null;
  }

  const displayImages = maxImages ? images.slice(0, maxImages) : images;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reorder Images</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {images.length} image{images.length !== 1 ? 's' : ''} uploaded
            {maxImages && images.length > maxImages && (
              <span className="text-amber-600 ml-1">
                ({images.length - maxImages} extra)
              </span>
            )}
          </span>
          {images.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {displayImages.map((image, index) => (
          <div
            key={image.id}
            draggable
            tabIndex={0}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              relative group cursor-move border-2 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${draggedIndex === index ? 'opacity-50 scale-95 rotate-2' : ''}
              ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-200'}
              hover:border-gray-300 hover:shadow-md
            `}
          >
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Order indicator */}
              <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Drag handle */}
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </div>
            </div>
            
            <div className="p-2">
              <p className="text-xs text-gray-600 truncate" title={image.name}>
                {image.name}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {maxImages && images.length > maxImages && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <strong>Note:</strong> Only the first {maxImages} images will be used in the collage. 
            Remove extra images or choose a layout with more cells.
          </p>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Drag & Drop:</strong> Drag images to reorder them</p>
        <p>⌨️  <strong>Keyboard:</strong> Use ← → arrow keys to move, Delete/Backspace to remove</p>
        <p>🎯 <strong>Layout:</strong> Images fill the collage from left to right, top to bottom</p>
      </div>
    </div>
  );
}
