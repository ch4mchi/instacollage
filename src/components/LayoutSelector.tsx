'use client';

import React from 'react';
import { CollageLayout, LAYOUT_CONFIGS } from '@/types/collage';

interface LayoutSelectorProps {
  selectedLayout: CollageLayout;
  onLayoutChange: (layout: CollageLayout) => void;
}

const LAYOUT_DESCRIPTIONS: Record<CollageLayout, string> = {
  '1x1': '1×1 (Single Image)',
  '1x2': '1×2 (Side by Side)',
  '2x1': '2×1 (Top & Bottom)',
  '2x2': '2×2 (Four Square)',
  '3x1': '3×1 (Triple Stack)',
  '1x3': '1×3 (Triple Row)',
  '3x4': '3×4 (12 Images)',
};

export function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  const renderLayoutPreview = (layout: CollageLayout) => {
    const config = LAYOUT_CONFIGS[layout];
    const cells = [];
    
    for (let i = 0; i < config.cells; i++) {
      cells.push(
        <div
          key={i}
          className="bg-gray-200 border border-gray-300 rounded-sm"
        />
      );
    }

    return (
      <div
        className={`grid gap-1 w-12 h-8`}
        style={{
          gridTemplateRows: `repeat(${config.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Layout</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {(Object.keys(LAYOUT_CONFIGS) as CollageLayout[]).map((layout) => (
          <label
            key={layout}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedLayout === layout
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <input
              type="radio"
              name="layout"
              value={layout}
              checked={selectedLayout === layout}
              onChange={() => onLayoutChange(layout)}
              className="sr-only"
            />
            
            <div className="flex-shrink-0">
              {renderLayoutPreview(layout)}
            </div>
            
            <div className="flex-grow">
              <div className="text-sm font-medium text-gray-900">
                {LAYOUT_DESCRIPTIONS[layout]}
              </div>
              <div className="text-xs text-gray-500">
                {LAYOUT_CONFIGS[layout].cells} images
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
