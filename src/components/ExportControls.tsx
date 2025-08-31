'use client';

import React from 'react';
import { ExportFormat } from '@/types/collage';

interface ExportControlsProps {
  format: ExportFormat;
  quality: number;
  onFormatChange: (format: ExportFormat) => void;
  onQualityChange: (quality: number) => void;
  onExport: () => void;
  disabled: boolean;
}

export function ExportControls({
  format,
  quality,
  onFormatChange,
  onQualityChange,
  onExport,
  disabled,
}: ExportControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Export Settings</h2>
      
      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="jpg"
                checked={format === 'jpg'}
                onChange={() => onFormatChange('jpg')}
                className="mr-2"
              />
              <span className="text-sm">JPG</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="png"
                checked={format === 'png'}
                onChange={() => onFormatChange('png')}
                className="mr-2"
              />
              <span className="text-sm">PNG</span>
            </label>
          </div>
        </div>

        {/* Quality Setting (only for JPG) */}
        {format === 'jpg' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality ({quality}%)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={quality}
              onChange={(e) => onQualityChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower quality</span>
              <span>Higher quality</span>
            </div>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={disabled}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {disabled ? 'Upload images to export' : `Export as ${format.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
