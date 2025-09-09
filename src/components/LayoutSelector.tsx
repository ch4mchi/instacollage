'use client';

import React, { useState } from 'react';
import { CollageLayout, LAYOUT_CONFIGS, getLayoutDimensions, CustomLayout } from '@/types/collage';

interface LayoutSelectorProps {
  selectedLayout: CollageLayout;
  customLayout: CustomLayout;
  onLayoutChange: (layout: CollageLayout) => void;
  onCustomLayoutChange: (customLayout: CustomLayout) => void;
}

const LAYOUT_DESCRIPTIONS: Record<Exclude<CollageLayout, 'custom'>, string> = {
  '1x1': '1×1 (Single Image)',
  '1x2': '1×2 (Side by Side)',
  '2x1': '2×1 (Top & Bottom)',
  '2x2': '2×2 (Four Square)',
  '3x1': '3×1 (Triple Stack)',
  '1x3': '1×3 (Triple Row)',
  '3x4': '3×4 (12 Images)',
};

export function LayoutSelector({ selectedLayout, customLayout, onLayoutChange, onCustomLayoutChange }: LayoutSelectorProps) {
  const [tempRows, setTempRows] = useState(customLayout.rows.toString());
  const [tempCols, setTempCols] = useState(customLayout.cols.toString());

  const renderLayoutPreview = (layout: CollageLayout) => {
    const config = getLayoutDimensions(layout, customLayout);
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

  const handleCustomLayoutUpdate = () => {
    const rows = parseInt(tempRows);
    const cols = parseInt(tempCols);
    
    if (rows >= 1 && rows <= 10 && cols >= 1 && cols <= 10) {
      onCustomLayoutChange({ rows, cols });
    }
  };

  const predefinedLayouts = Object.keys(LAYOUT_CONFIGS) as (Exclude<CollageLayout, 'custom'>)[];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Layout</h2>
      
      <div className="grid grid-cols-1 gap-3">
        {predefinedLayouts.map((layout) => (
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
                {getLayoutDimensions(layout).cells} images
              </div>
            </div>
          </label>
        ))}
        
        {/* Custom Layout Section */}
        <div className={`p-3 rounded-lg border-2 transition-colors ${
          selectedLayout === 'custom'
            ? 'bg-blue-50 border-blue-500'
            : 'bg-gray-50 border-transparent'
        }`}>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="layout"
              value="custom"
              checked={selectedLayout === 'custom'}
              onChange={() => onLayoutChange('custom')}
              className="sr-only"
            />
            
            <div className="flex-shrink-0">
              {renderLayoutPreview('custom')}
            </div>
            
            <div className="flex-grow">
              <div className="text-sm font-medium text-gray-900">
                Custom Layout(Unstable)
              </div>
              <div className="text-xs text-gray-500">
                {customLayout.rows}×{customLayout.cols} ({customLayout.rows * customLayout.cols} images)
              </div>
            </div>
          </label>
          
          {selectedLayout === 'custom' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Rows (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tempRows}
                      onChange={(e) => setTempRows(e.target.value)}
                      onBlur={handleCustomLayoutUpdate}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomLayoutUpdate()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Columns (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tempCols}
                      onChange={(e) => setTempCols(e.target.value)}
                      onBlur={handleCustomLayoutUpdate}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomLayoutUpdate()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Total images: {parseInt(tempRows) * parseInt(tempCols) || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
