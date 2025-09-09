'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImageReorder } from './ImageReorder';
import { LayoutSelector } from './LayoutSelector';
import { FrameSettings } from './FrameSettings';
import { CollageCanvas } from './CollageCanvas';
import { ExportControls } from './ExportControls';
import { ImageAdjustmentPanel } from './ImageAdjustmentPanel';
import { UploadedImage, CollageLayout, AspectRatio, SpacingSettings, getLayoutDimensions, ImageAdjustment, CustomLayout } from '@/types/collage';

export function CollageApp() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout>('2x1');
  const [customLayout, setCustomLayout] = useState<CustomLayout>({ rows: 2, cols: 2 });
  const [frameWidth, setFrameWidth] = useState<number>(1080);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [exportQuality, setExportQuality] = useState<number>(90);
  const [spacing, setSpacing] = useState<SpacingSettings>({ gap: 10, margin: 10 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImagesUpload = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages);
  }, []);

  const handleImagesReorder = useCallback((reorderedImages: UploadedImage[]) => {
    setImages(reorderedImages);
  }, []);

  const handleImageAdjustmentChange = useCallback((imageId: string, adjustment: ImageAdjustment) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === imageId 
          ? { ...img, adjustment }
          : img
      )
    );
  }, []);

  const handleResetAdjustment = useCallback((imageId: string) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === imageId 
          ? { ...img, adjustment: undefined }
          : img
      )
    );
  }, []);

  const maxImagesForLayout = getLayoutDimensions(selectedLayout, customLayout).cells;

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const mimeType = 'image/jpeg';
    const quality = exportQuality / 100;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'collage.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, mimeType, quality);
  }, [exportQuality]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          InstaCollage - Image Collage Creator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload and Layout Controls - Always first on mobile */}
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-1">
            <ImageUpload 
              onImagesUpload={handleImagesUpload}
              existingImages={images}
            />
            
            {images.length > 0 && (
              <ImageReorder
                images={images}
                onReorder={handleImagesReorder}
                maxImages={maxImagesForLayout}
              />
            )}
            
            <LayoutSelector
              selectedLayout={selectedLayout}
              customLayout={customLayout}
              onLayoutChange={setSelectedLayout}
              onCustomLayoutChange={setCustomLayout}
            />
            
            {/* Frame Settings - hidden on mobile, shown after canvas */}
            <div className="hidden lg:block">
              <FrameSettings
                frameWidth={frameWidth}
                aspectRatio={aspectRatio}
                spacing={spacing}
                onFrameWidthChange={setFrameWidth}
                onAspectRatioChange={setAspectRatio}
                onSpacingChange={setSpacing}
              />
            </div>

            {/* Image Adjustment Panel - hidden on mobile, shown after canvas */}
            <div className="hidden lg:block">
              {images.length > 0 && (
                <ImageAdjustmentPanel
                  images={images}
                  onResetAdjustment={handleResetAdjustment}
                />
              )}
            </div>
            
            {/* Export Controls - shown here on desktop */}
            <div className="hidden lg:block">
              <ExportControls
                quality={exportQuality}
                onQualityChange={setExportQuality}
                onExport={handleExport}
                disabled={images.length === 0}
              />
            </div>
          </div>

          {/* Canvas Area - Second on mobile (after upload/layout), second on desktop */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <CollageCanvas
              ref={canvasRef}
              images={images}
              layout={selectedLayout}
              customLayout={customLayout}
              frameWidth={frameWidth}
              aspectRatio={aspectRatio}
              spacing={spacing}
              onImageAdjustmentChange={handleImageAdjustmentChange}
            />
          </div>

          {/* Frame Settings - shown here on mobile, after canvas */}
          <div className="lg:hidden order-3 space-y-6">
            <FrameSettings
              frameWidth={frameWidth}
              aspectRatio={aspectRatio}
              spacing={spacing}
              onFrameWidthChange={setFrameWidth}
              onAspectRatioChange={setAspectRatio}
              onSpacingChange={setSpacing}
            />

            {images.length > 0 && (
              <ImageAdjustmentPanel
                images={images}
                onResetAdjustment={handleResetAdjustment}
              />
            )}
            
            <ExportControls
              quality={exportQuality}
              onQualityChange={setExportQuality}
              onExport={handleExport}
              disabled={images.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
