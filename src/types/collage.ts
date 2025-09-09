export interface ImageAdjustment {
  offsetX: number; // Horizontal offset percentage (-100 to 100)
  offsetY: number; // Vertical offset percentage (-100 to 100)
  zoom: number; // Zoom level (0.5 to 2.0)
}

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  adjustment?: ImageAdjustment;
}

export type CollageLayout = '1x1' | '1x2' | '2x1' | '2x2' | '3x1' | '1x3' | '3x4' | 'custom';

export interface CustomLayout {
  rows: number;
  cols: number;
}

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '16:9' | '9:16';

export type ExportFormat = 'jpg';

export interface LayoutDimensions {
  rows: number;
  cols: number;
  cells: number;
}

export interface SpacingSettings {
  gap: number; // Space between images in pixels
  margin: number; // Outer margin around the entire collage in pixels
}

export const LAYOUT_CONFIGS: Record<Exclude<CollageLayout, 'custom'>, LayoutDimensions> = {
  '1x1': { rows: 1, cols: 1, cells: 1 },
  '1x2': { rows: 1, cols: 2, cells: 2 },
  '2x1': { rows: 2, cols: 1, cells: 2 },
  '2x2': { rows: 2, cols: 2, cells: 4 },
  '3x1': { rows: 3, cols: 1, cells: 3 },
  '1x3': { rows: 1, cols: 3, cells: 3 },
  '3x4': { rows: 3, cols: 4, cells: 12 },
};

// Helper function to get layout dimensions for any layout type
export const getLayoutDimensions = (layout: CollageLayout, customLayout?: CustomLayout): LayoutDimensions => {
  if (layout === 'custom' && customLayout) {
    return {
      rows: customLayout.rows,
      cols: customLayout.cols,
      cells: customLayout.rows * customLayout.cols,
    };
  }
  return LAYOUT_CONFIGS[layout as Exclude<CollageLayout, 'custom'>];
};

export const ASPECT_RATIOS: Record<AspectRatio, number> = {
  '1:1': 1,
  '2:3': 2/3,
  '3:2': 3/2,
  '3:4': 3/4,
  '4:3': 4/3,
  '4:5': 4/5,
  '5:4': 5/4,
  '16:9': 16/9,
  '9:16': 9/16,
};
