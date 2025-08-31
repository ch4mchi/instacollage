'use client';

import React, { useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { UploadedImage, CollageLayout, AspectRatio, SpacingSettings, LAYOUT_CONFIGS, ASPECT_RATIOS, ImageAdjustment } from '@/types/collage';

interface CollageCanvasProps {
  images: UploadedImage[];
  layout: CollageLayout;
  frameWidth: number;
  aspectRatio: AspectRatio;
  spacing: SpacingSettings;
  onImageAdjustmentChange?: (imageId: string, adjustment: ImageAdjustment) => void;
}

export const CollageCanvas = forwardRef<HTMLCanvasElement, CollageCanvasProps>(
  ({ images, layout, frameWidth, aspectRatio, spacing, onImageAdjustmentChange }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragImageIndex, setDragImageIndex] = useState<number | null>(null);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
    const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
    
    // Touch event state for pinch-to-zoom and panning
    const [touchState, setTouchState] = useState<{
      touches: React.Touch[];
      initialDistance: number;
      initialZoom: number;
      targetImageIndex: number | null;
    } | null>(null);
    
    // Single touch state for panning
    const [panState, setPanState] = useState<{
      isActive: boolean;
      targetImageIndex: number | null;
      lastTouch: { x: number; y: number };
    } | null>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    const frameHeight = frameWidth / ASPECT_RATIOS[aspectRatio];
    const config = LAYOUT_CONFIGS[layout];

    // Utility function to calculate distance between two touches
    const getTouchDistance = useCallback((touch1: React.Touch, touch2: React.Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Utility function to get center point between two touches
    const getTouchCenter = useCallback((touch1: React.Touch, touch2: React.Touch) => {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    }, []);

    const drawImageWithAdjustment = useCallback((
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      cellX: number,
      cellY: number,
      cellWidth: number,
      cellHeight: number,
      adjustment: ImageAdjustment = { offsetX: 0, offsetY: 0, zoom: 1 }
    ) => {
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
      
      const x = cellX + (cellWidth - scaledWidth) / 2 + constrainedOffsetX;
      const y = cellY + (cellHeight - scaledHeight) / 2 + constrainedOffsetY;
      
      // Clip to cell boundaries
      ctx.save();
      ctx.beginPath();
      ctx.rect(cellX, cellY, cellWidth, cellHeight);
      ctx.clip();
      
      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.restore();
      
      return { scaledWidth, scaledHeight, x, y };
    }, []);

    const drawHoverOverlay = useCallback((
      ctx: CanvasRenderingContext2D,
      cellX: number,
      cellY: number,
      cellWidth: number,
      cellHeight: number
    ) => {
      ctx.save();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // Blue overlay
      ctx.fillRect(cellX, cellY, cellWidth, cellHeight);
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);
      
      ctx.restore();
    }, []);

    // Preload images when they change
    useEffect(() => {
      const loadImages = async () => {
        const newLoadedImages = new Map<string, HTMLImageElement>();
        
        // Keep existing loaded images
        for (const [id, img] of loadedImages.entries()) {
          if (images.some(image => image.id === id)) {
            newLoadedImages.set(id, img);
          }
        }
        
        // Load new images
        for (const image of images) {
          if (!newLoadedImages.has(image.id)) {
            try {
              const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const imgElement = new Image();
                imgElement.crossOrigin = 'anonymous';
                imgElement.onload = () => resolve(imgElement);
                imgElement.onerror = reject;
                imgElement.src = image.url;
              });
              newLoadedImages.set(image.id, img);
            } catch (error) {
              console.error('Failed to load image:', image.name, error);
            }
          }
        }
        
        setLoadedImages(newLoadedImages);
      };

      loadImages();
    }, [images]);

    const renderCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      // Clear canvas completely
      ctx.clearRect(0, 0, frameWidth, frameHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, frameWidth, frameHeight);

      // Calculate available space for images (excluding margins)
      const availableWidth = frameWidth - (2 * spacing.margin);
      const availableHeight = frameHeight - (2 * spacing.margin);

      // Calculate total gaps
      const totalHorizontalGaps = (config.cols - 1) * spacing.gap;
      const totalVerticalGaps = (config.rows - 1) * spacing.gap;

      // Calculate cell dimensions (excluding gaps)
      const cellWidth = (availableWidth - totalHorizontalGaps) / config.cols;
      const cellHeight = (availableHeight - totalVerticalGaps) / config.rows;

      // Draw all cells (images and placeholders) in order
      for (let i = 0; i < config.cells; i++) {
        const row = Math.floor(i / config.cols);
        const col = i % config.cols;
        
        // Calculate position with margin and gaps
        const x = spacing.margin + col * (cellWidth + spacing.gap);
        const y = spacing.margin + row * (cellHeight + spacing.gap);

        if (i < images.length) {
          // Draw image if loaded
          const image = images[i];
          const loadedImg = loadedImages.get(image.id);
          
          if (loadedImg) {
            // Draw image with adjustment
            drawImageWithAdjustment(ctx, loadedImg, x, y, cellWidth, cellHeight, image.adjustment);

            // Draw border only when there's spacing between images
            if (spacing.gap > 0) {
              ctx.strokeStyle = '#e5e7eb';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, cellWidth, cellHeight);
            }
          } else {
            // Draw loading placeholder
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(x, y, cellWidth, cellHeight);
            
            ctx.fillStyle = '#9ca3af';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Loading...', x + cellWidth / 2, y + cellHeight / 2);
          }
        } else {
          // Draw placeholder for empty cell
          ctx.fillStyle = '#f9fafb';
          ctx.fillRect(x, y, cellWidth, cellHeight);

          // Draw dashed border only when there's spacing between images
          if (spacing.gap > 0) {
            ctx.setLineDash([10, 10]);
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
            ctx.setLineDash([]);
          }

          // Draw placeholder text
          ctx.fillStyle = '#9ca3af';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Drop image here', x + cellWidth / 2, y + cellHeight / 2);
        }
      }

      // Draw hover overlay if applicable
      if (hoveredImageIndex !== null && hoveredImageIndex < images.length) {
        const index = hoveredImageIndex;
        const row = Math.floor(index / config.cols);
        const col = index % config.cols;
        
        const cellX = spacing.margin + col * (cellWidth + spacing.gap);
        const cellY = spacing.margin + row * (cellHeight + spacing.gap);
        
        drawHoverOverlay(ctx, cellX, cellY, cellWidth, cellHeight);
      }
    }, [images, frameWidth, frameHeight, config, spacing, drawImageWithAdjustment, hoveredImageIndex, drawHoverOverlay, loadedImages]);

    useEffect(() => {
      renderCanvas();
    }, [renderCanvas]);

    // Remove the separate placeholder useEffect since it's now integrated above

    // Get cell info for a given point
    const getCellInfoAtPoint = useCallback((x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const canvasX = (x - rect.left) * scaleX;
      const canvasY = (y - rect.top) * scaleY;

      // Calculate available space for images (excluding margins)
      const availableWidth = frameWidth - (2 * spacing.margin);
      const availableHeight = frameHeight - (2 * spacing.margin);

      // Calculate total gaps
      const totalHorizontalGaps = (config.cols - 1) * spacing.gap;
      const totalVerticalGaps = (config.rows - 1) * spacing.gap;

      // Calculate cell dimensions (excluding gaps)
      const cellWidth = (availableWidth - totalHorizontalGaps) / config.cols;
      const cellHeight = (availableHeight - totalVerticalGaps) / config.rows;

      // Find which cell the point is in
      for (let index = 0; index < Math.min(images.length, config.cells); index++) {
        const row = Math.floor(index / config.cols);
        const col = index % config.cols;
        
        const cellX = spacing.margin + col * (cellWidth + spacing.gap);
        const cellY = spacing.margin + row * (cellHeight + spacing.gap);

        if (canvasX >= cellX && canvasX <= cellX + cellWidth &&
            canvasY >= cellY && canvasY <= cellY + cellHeight) {
          return {
            index,
            cellX,
            cellY,
            cellWidth,
            cellHeight,
            localX: canvasX - cellX,
            localY: canvasY - cellY
          };
        }
      }
      
      return null;
    }, [frameWidth, frameHeight, spacing, config, images.length]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      const cellInfo = getCellInfoAtPoint(e.clientX, e.clientY);
      if (cellInfo && onImageAdjustmentChange) {
        setIsDragging(true);
        setDragImageIndex(cellInfo.index);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    }, [getCellInfoAtPoint, onImageAdjustmentChange]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || dragImageIndex === null || !onImageAdjustmentChange) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      const image = images[dragImageIndex];
      if (!image) return;

      const adjustment = image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 };
      
      // Calculate available space for images (excluding margins)
      const availableWidth = frameWidth - (2 * spacing.margin);
      const availableHeight = frameHeight - (2 * spacing.margin);

      // Calculate total gaps
      const totalHorizontalGaps = (config.cols - 1) * spacing.gap;
      const totalVerticalGaps = (config.rows - 1) * spacing.gap;

      // Calculate cell dimensions (excluding gaps)
      const cellWidth = (availableWidth - totalHorizontalGaps) / config.cols;
      const cellHeight = (availableHeight - totalVerticalGaps) / config.rows;
      
      // Convert pixel delta to percentage delta
      const sensitivityX = 200 / cellWidth; // Higher sensitivity for better control
      const sensitivityY = 200 / cellHeight;
      
      const newOffsetX = adjustment.offsetX + deltaX * sensitivityX;
      const newOffsetY = adjustment.offsetY + deltaY * sensitivityY;
      
      onImageAdjustmentChange(image.id, {
        ...adjustment,
        offsetX: Math.max(-100, Math.min(100, newOffsetX)),
        offsetY: Math.max(-100, Math.min(100, newOffsetY))
      });
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }, [isDragging, dragImageIndex, lastMousePos, images, onImageAdjustmentChange, frameWidth, frameHeight, spacing, config]);

    const handleCanvasMouseEnter = useCallback(() => {
      if (onImageAdjustmentChange && images.length > 0) {
        // Disable page scrolling when mouse enters canvas area
        document.body.style.overflow = 'hidden';
      }
    }, [onImageAdjustmentChange, images.length]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
      if (!onImageAdjustmentChange || isDragging) return;
      
      const cellInfo = getCellInfoAtPoint(e.clientX, e.clientY);
      setHoveredImageIndex(cellInfo?.index ?? null);
    }, [getCellInfoAtPoint, onImageAdjustmentChange, isDragging]);

    const handleCanvasMouseLeave = useCallback(() => {
      // Re-enable page scrolling when mouse leaves canvas area
      document.body.style.overflow = 'auto';
      setHoveredImageIndex(null);
    }, []);

    // Handle wheel events with proper scroll prevention
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !onImageAdjustmentChange) return;

      const handleWheelEvent = (e: WheelEvent) => {
        const cellInfo = getCellInfoAtPoint(e.clientX, e.clientY);
        if (!cellInfo) return;

        // Prevent page scroll when zooming images
        e.preventDefault();
        e.stopPropagation();

        const image = images[cellInfo.index];
        if (!image) return;

        const adjustment = image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 };
        const zoomDelta = -e.deltaY * 0.002; // Smooth zoom
        const newZoom = Math.max(0.5, Math.min(3.0, adjustment.zoom + zoomDelta));
        
        onImageAdjustmentChange(image.id, {
          ...adjustment,
          zoom: newZoom
        });
      };

      // Add non-passive wheel listener to enable preventDefault
      canvas.addEventListener('wheel', handleWheelEvent, { passive: false });

      return () => {
        canvas.removeEventListener('wheel', handleWheelEvent);
      };
    }, [getCellInfoAtPoint, images, onImageAdjustmentChange]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
      setDragImageIndex(null);
    }, []);

    // Touch event handlers for pinch-to-zoom and panning
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!onImageAdjustmentChange) return;

      if (e.touches.length === 2) {
        // Two-finger touch: initiate pinch-to-zoom
        setPanState(null); // Clear any existing pan state
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const center = getTouchCenter(touch1, touch2);
        const cellInfo = getCellInfoAtPoint(center.x, center.y);
        
        if (!cellInfo) {
          setTouchState(null);
          return;
        }

        const image = images[cellInfo.index];
        if (!image) {
          setTouchState(null);
          return;
        }

        const initialDistance = getTouchDistance(touch1, touch2);
        const currentAdjustment = image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 };
        
        setTouchState({
          touches: Array.from(e.touches),
          initialDistance,
          initialZoom: currentAdjustment.zoom,
          targetImageIndex: cellInfo.index
        });

        e.preventDefault();
      } else if (e.touches.length === 1) {
        // Single-finger touch: initiate panning
        setTouchState(null); // Clear any existing zoom state
        
        const touch = e.touches[0];
        const cellInfo = getCellInfoAtPoint(touch.clientX, touch.clientY);
        
        if (!cellInfo) {
          setPanState(null);
          return;
        }

        const image = images[cellInfo.index];
        if (!image) {
          setPanState(null);
          return;
        }

        // Only enable panning if the image is zoomed
        const adjustment = image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 };
        if (adjustment.zoom > 1) {
          setPanState({
            isActive: true,
            targetImageIndex: cellInfo.index,
            lastTouch: { x: touch.clientX, y: touch.clientY }
          });
          e.preventDefault();
        } else {
          setPanState(null);
        }
      }
    }, [onImageAdjustmentChange, getTouchCenter, getTouchDistance, getCellInfoAtPoint, images]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!onImageAdjustmentChange) return;

      if (e.touches.length === 2 && touchState) {
        // Two-finger touch: handle pinch-to-zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = getTouchDistance(touch1, touch2);
        
        if (touchState.targetImageIndex === null) return;
        
        const image = images[touchState.targetImageIndex];
        if (!image) return;

        // Calculate zoom based on distance change
        const scaleChange = currentDistance / touchState.initialDistance;
        const newZoom = touchState.initialZoom * scaleChange;
        const constrainedZoom = Math.max(0.5, Math.min(3.0, newZoom));

        const currentAdjustment = image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 };
        
        onImageAdjustmentChange(image.id, {
          ...currentAdjustment,
          zoom: constrainedZoom
        });

        e.preventDefault();
      } else if (e.touches.length === 1 && panState && panState.isActive) {
        // Single-finger touch: handle panning
        const touch = e.touches[0];
        
        if (panState.targetImageIndex === null) return;
        
        const image = images[panState.targetImageIndex];
        if (!image) return;

        const deltaX = touch.clientX - panState.lastTouch.x;
        const deltaY = touch.clientY - panState.lastTouch.y;
        
        const adjustment = image.adjustment || { offsetX: 0, offsetY: 0, zoom: 1 };
        
        // Calculate available space for images (excluding margins)
        const availableWidth = frameWidth - (2 * spacing.margin);
        const availableHeight = frameHeight - (2 * spacing.margin);

        // Calculate total gaps
        const totalHorizontalGaps = (config.cols - 1) * spacing.gap;
        const totalVerticalGaps = (config.rows - 1) * spacing.gap;

        // Calculate cell dimensions (excluding gaps)
        const cellWidth = (availableWidth - totalHorizontalGaps) / config.cols;
        const cellHeight = (availableHeight - totalVerticalGaps) / config.rows;
        
        // Convert pixel delta to percentage delta
        const sensitivityX = 200 / cellWidth; // Higher sensitivity for better control
        const sensitivityY = 200 / cellHeight;
        
        const newOffsetX = adjustment.offsetX + deltaX * sensitivityX;
        const newOffsetY = adjustment.offsetY + deltaY * sensitivityY;
        
        onImageAdjustmentChange(image.id, {
          ...adjustment,
          offsetX: Math.max(-100, Math.min(100, newOffsetX)),
          offsetY: Math.max(-100, Math.min(100, newOffsetY))
        });
        
        // Update pan state with new touch position
        setPanState({
          ...panState,
          lastTouch: { x: touch.clientX, y: touch.clientY }
        });

        e.preventDefault();
      }
    }, [touchState, panState, onImageAdjustmentChange, getTouchDistance, images, frameWidth, frameHeight, spacing, config]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        setTouchState(null);
      }
      
      if (e.touches.length === 0) {
        setPanState(null);
      }
    }, []);

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

    // Prevent default touch behaviors on the canvas to ensure proper touch handling
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !onImageAdjustmentChange) return;

      const preventDefaultTouch = (e: TouchEvent) => {
        // Prevent default for multi-touch (pinch-to-zoom) and single-touch on zoomed images (panning)
        if (e.touches.length === 2) {
          e.preventDefault();
        } else if (e.touches.length === 1 && panState?.isActive) {
          e.preventDefault();
        }
      };

      // Add passive: false to allow preventDefault
      canvas.addEventListener('touchstart', preventDefaultTouch, { passive: false });
      canvas.addEventListener('touchmove', preventDefaultTouch, { passive: false });

      return () => {
        canvas.removeEventListener('touchstart', preventDefaultTouch);
        canvas.removeEventListener('touchmove', preventDefaultTouch);
      };
    }, [onImageAdjustmentChange, panState]);

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="text-sm text-gray-500">
            {frameWidth} × {Math.round(frameHeight)} px
          </div>
        </div>
        
        <div className="flex justify-center">
          <div 
            className="relative overflow-hidden"
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <canvas
              ref={canvasRef}
              className={`border border-gray-200 rounded max-w-full h-auto ${
                onImageAdjustmentChange ? 'cursor-move' : ''
              }`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block'
              }}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleCanvasMouseEnter}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            {onImageAdjustmentChange && images.length > 0 && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs opacity-75 pointer-events-none">
                <span className="hidden sm:inline">Click & drag to move • Scroll to zoom</span>
                <span className="sm:hidden">Drag to move • Pinch to zoom • Tap & drag zoomed images</span>
              </div>
            )}
          </div>
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
