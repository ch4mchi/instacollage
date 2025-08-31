'use client';

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { UploadedImage, CollageLayout, AspectRatio, LAYOUT_CONFIGS, ASPECT_RATIOS } from '@/types/collage';

interface CollageCanvasProps {
  images: UploadedImage[];
  layout: CollageLayout;
  frameWidth: number;
  aspectRatio: AspectRatio;
}

export const CollageCanvas = forwardRef<HTMLCanvasElement, CollageCanvasProps>(
  ({ images, layout, frameWidth, aspectRatio }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    const frameHeight = frameWidth / ASPECT_RATIOS[aspectRatio];
    const config = LAYOUT_CONFIGS[layout];

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, frameWidth, frameHeight);

      // Calculate cell dimensions
      const cellWidth = frameWidth / config.cols;
      const cellHeight = frameHeight / config.rows;

      // Draw images
      const imagePromises = images.slice(0, config.cells).map((image, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = () => {
            const row = Math.floor(index / config.cols);
            const col = index % config.cols;
            const x = col * cellWidth;
            const y = row * cellHeight;

            // Calculate scaling to cover the cell while maintaining aspect ratio
            const imgAspectRatio = img.width / img.height;
            const cellAspectRatio = cellWidth / cellHeight;

            let drawWidth, drawHeight, sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

            if (imgAspectRatio > cellAspectRatio) {
              // Image is wider than cell - crop horizontally
              drawWidth = cellWidth;
              drawHeight = cellHeight;
              sourceWidth = img.height * cellAspectRatio;
              sourceX = (img.width - sourceWidth) / 2;
            } else {
              // Image is taller than cell - crop vertically
              drawWidth = cellWidth;
              drawHeight = cellHeight;
              sourceHeight = img.width / cellAspectRatio;
              sourceY = (img.height - sourceHeight) / 2;
            }

            // Clip to cell boundaries
            ctx.save();
            ctx.rect(x, y, cellWidth, cellHeight);
            ctx.clip();

            // Draw image using source rectangle for proper cropping
            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
              x, y, drawWidth, drawHeight // Destination rectangle
            );
            ctx.restore();

            // Draw border
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellWidth, cellHeight);

            resolve();
          };

          img.onerror = () => {
            // Draw placeholder for failed images
            const row = Math.floor(index / config.cols);
            const col = index % config.cols;
            const x = col * cellWidth;
            const y = row * cellHeight;

            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(x, y, cellWidth, cellHeight);
            
            ctx.fillStyle = '#9ca3af';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Failed to load', x + cellWidth / 2, y + cellHeight / 2);

            resolve();
          };

          img.src = image.url;
        });
      });

      Promise.all(imagePromises).catch(console.error);
    }, [images, layout, frameWidth, frameHeight, config]);

    // Fill empty cells with placeholders
    useEffect(() => {
      if (images.length >= config.cells) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cellWidth = frameWidth / config.cols;
      const cellHeight = frameHeight / config.rows;

      for (let i = images.length; i < config.cells; i++) {
        const row = Math.floor(i / config.cols);
        const col = i % config.cols;
        const x = col * cellWidth;
        const y = row * cellHeight;

        // Draw placeholder
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Draw dashed border
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        ctx.setLineDash([]);

        // Draw placeholder text
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Drop image here', x + cellWidth / 2, y + cellHeight / 2);
      }
    }, [images.length, config, frameWidth, frameHeight]);

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="text-sm text-gray-500">
            {frameWidth} × {Math.round(frameHeight)} px
          </div>
        </div>
        
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded max-w-full h-auto"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
        
        {images.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Images ({images.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-16 object-cover rounded border"
                  />
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CollageCanvas.displayName = 'CollageCanvas';
