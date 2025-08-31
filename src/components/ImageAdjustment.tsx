'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { UploadedImage, ImageAdjustment } from '../types/collage';

interface ImageAdjustmentProps {
  image: UploadedImage;
  cellWidth: number;
  cellHeight: number;
  onAdjustmentChange: (imageId: string, adjustment: ImageAdjustment) => void;
}

export function ImageAdjustmentCanvas({ 
  image, 
  cellWidth, 
  cellHeight, 
  onAdjustmentChange 
}: ImageAdjustmentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const adjustment = useMemo(() => 
    image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 },
    [image.adjustment]
  );

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, cellWidth, cellHeight);
    
    // Calculate image dimensions with zoom
    const imgAspectRatio = img.width / img.height;
    const cellAspectRatio = cellWidth / cellHeight;
    
    let baseWidth, baseHeight;
    
    // Calculate base size to fill the cell
    if (imgAspectRatio > cellAspectRatio) {
      baseHeight = cellHeight;
      baseWidth = baseHeight * imgAspectRatio;
    } else {
      baseWidth = cellWidth;
      baseHeight = baseWidth / imgAspectRatio;
    }
    
    // Apply zoom (constrained so image always covers the cell)
    const minZoom = Math.max(cellWidth / baseWidth, cellHeight / baseHeight);
    const constrainedZoom = Math.max(adjustment.zoom, minZoom);
    
    const scaledWidth = baseWidth * constrainedZoom;
    const scaledHeight = baseHeight * constrainedZoom;
    
    // Calculate position with offset
    const maxOffsetX = (scaledWidth - cellWidth) / 2;
    const maxOffsetY = (scaledHeight - cellHeight) / 2;
    
    const constrainedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, (adjustment.offsetX / 100) * maxOffsetX));
    const constrainedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, (adjustment.offsetY / 100) * maxOffsetY));
    
    const x = (cellWidth - scaledWidth) / 2 + constrainedOffsetX;
    const y = (cellHeight - scaledHeight) / 2 + constrainedOffsetY;
    
    // Clip to cell boundaries
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cellWidth, cellHeight);
    ctx.clip();
    
    // Draw image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    ctx.restore();
    
    // Update adjustment if constraints were applied
    if (constrainedZoom !== adjustment.zoom) {
      onAdjustmentChange(image.id, {
        ...adjustment,
        zoom: constrainedZoom
      });
    }
  }, [image.id, adjustment, cellWidth, cellHeight, onAdjustmentChange]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      drawImage();
    };
    img.src = image.url;
  }, [image.url, drawImage]);

  // Redraw when adjustment changes
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    // Convert pixel delta to percentage delta
    const sensitivityX = 100 / cellWidth;
    const sensitivityY = 100 / cellHeight;
    
    const newOffsetX = adjustment.offsetX + deltaX * sensitivityX;
    const newOffsetY = adjustment.offsetY + deltaY * sensitivityY;
    
    onAdjustmentChange(image.id, {
      ...adjustment,
      offsetX: Math.max(-100, Math.min(100, newOffsetX)),
      offsetY: Math.max(-100, Math.min(100, newOffsetY))
    });
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, adjustment, cellWidth, cellHeight, image.id, onAdjustmentChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const zoomDelta = -e.deltaY * 0.001;
    const newZoom = Math.max(0.5, Math.min(3.0, adjustment.zoom + zoomDelta));
    
    onAdjustmentChange(image.id, {
      ...adjustment,
      zoom: newZoom
    });
  };

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={cellWidth}
        height={cellHeight}
        className="cursor-move border border-gray-300 rounded"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      />
      <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
        Drag to move • Scroll to zoom
      </div>
    </div>
  );
}