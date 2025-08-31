'use client';

import React from 'react';
import { UploadedImage } from '../types/collage';

interface ImageAdjustmentPanelProps {
  images: UploadedImage[];
  onResetAdjustment: (imageId: string) => void;
}

export function ImageAdjustmentPanel({ 
  images, 
  onResetAdjustment 
}: ImageAdjustmentPanelProps) {
  const imagesWithAdjustments = images.filter(img => img.adjustment);

  if (imagesWithAdjustments.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 12 12">
              <path d="M6 0C2.7 0 0 2.7 0 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 9L3 6h6L6 9z"/>
            </svg>
          </div>
          <h3 className="text-sm font-medium text-blue-800">Photo Adjustment</h3>
        </div>
        <p className="text-sm text-blue-700">
          Click and drag on photos in the preview to reposition them, or scroll to zoom in/out.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Photo Adjustments</h3>
      
      <div className="space-y-3">
        {imagesWithAdjustments.map((image) => {
          const adjustment = image.adjustment!;
          return (
            <div key={image.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <img
                src={image.url}
                alt={image.name}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">
                  {image.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Position: {adjustment.offsetX.toFixed(0)}%, {adjustment.offsetY.toFixed(0)}% • 
                  Zoom: {adjustment.zoom.toFixed(2)}x
                </div>
              </div>
              <button
                onClick={() => onResetAdjustment(image.id)}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Reset adjustments"
              >
                Reset
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => {
            imagesWithAdjustments.forEach(image => {
              onResetAdjustment(image.id);
            });
          }}
          className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Reset All Adjustments
        </button>
      </div>
    </div>
  );
}
