'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { LayoutSelector } from './LayoutSelector';
import { FrameSettings } from './FrameSettings';
import { CollageCanvas } from './CollageCanvas';
import { ExportControls } from './ExportControls';
import { UploadedImage, CollageLayout, AspectRatio, ExportFormat } from '@/types/collage';

export function CollageApp() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout>('2x2');
  const [frameWidth, setFrameWidth] = useState<number>(800);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:3');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('jpg');
  const [exportQuality, setExportQuality] = useState<number>(90);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImagesUpload = useCallback((newImages: UploadedImage[]) => {
    setImages(newImages);
  }, []);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = exportFormat === 'jpg' ? exportQuality / 100 : undefined;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `collage.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, mimeType, quality);
  }, [exportFormat, exportQuality]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          InstaCollage - Image Collage Creator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <ImageUpload onImagesUpload={handleImagesUpload} />
            
            <LayoutSelector
              selectedLayout={selectedLayout}
              onLayoutChange={setSelectedLayout}
            />
            
            <FrameSettings
              frameWidth={frameWidth}
              aspectRatio={aspectRatio}
              onFrameWidthChange={setFrameWidth}
              onAspectRatioChange={setAspectRatio}
            />
            
            <ExportControls
              format={exportFormat}
              quality={exportQuality}
              onFormatChange={setExportFormat}
              onQualityChange={setExportQuality}
              onExport={handleExport}
              disabled={images.length === 0}
            />
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <CollageCanvas
              ref={canvasRef}
              images={images}
              layout={selectedLayout}
              frameWidth={frameWidth}
              aspectRatio={aspectRatio}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
