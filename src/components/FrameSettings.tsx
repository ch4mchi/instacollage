'use client';

import React from 'react';
import { AspectRatio, SpacingSettings } from '@/types/collage';

interface FrameSettingsProps {
  frameWidth: number;
  aspectRatio: AspectRatio;
  spacing: SpacingSettings;
  onFrameWidthChange: (width: number) => void;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onSpacingChange: (spacing: SpacingSettings) => void;
}

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1 (Square)' },
  { value: '2:3', label: '2:3 (Portrait)' },
  { value: '3:2', label: '3:2 (Landscape)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: '4:3', label: '4:3 (Landscape)' },
  { value: '4:5', label: '4:5 (Portrait)' },
  { value: '5:4', label: '5:4 (Landscape)' },
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Mobile)' },
];

export function FrameSettings({
  frameWidth,
  aspectRatio,
  spacing,
  onFrameWidthChange,
  onAspectRatioChange,
  onSpacingChange,
}: FrameSettingsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Frame Settings</h2>
      
      <div className="space-y-4">
        {/* Frame Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frame Width (px)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="400"
              max="2000"
              step="10"
              value={frameWidth}
              onChange={(e) => onFrameWidthChange(Number(e.target.value))}
              className="flex-grow"
            />
            <input
              type="number"
              min="400"
              max="2000"
              step="10"
              value={frameWidth}
              onChange={(e) => onFrameWidthChange(Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Range: 400px - 2000px
          </div>
          <button
            onClick={() => onFrameWidthChange(1080)}
            className="mt-2 px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          >
            Fit Instagram
          </button>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aspect Ratio
          </label>
          <select
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ASPECT_RATIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spacing Between Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spacing Between Images (px)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={spacing.gap}
              onChange={(e) => onSpacingChange({ ...spacing, gap: Number(e.target.value) })}
              className="flex-grow"
            />
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={spacing.gap}
              onChange={(e) => onSpacingChange({ ...spacing, gap: Number(e.target.value) })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Range: 0px - 50px
          </div>
        </div>

        {/* Outer Margin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outer Margin (px)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={spacing.margin}
              onChange={(e) => onSpacingChange({ ...spacing, margin: Number(e.target.value) })}
              className="flex-grow"
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={spacing.margin}
              onChange={(e) => onSpacingChange({ ...spacing, margin: Number(e.target.value) })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Range: 0px - 100px
          </div>
        </div>
      </div>
    </div>
  );
}
