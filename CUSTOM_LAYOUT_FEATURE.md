# Custom Layout Feature

## Overview
Added support for custom NxM layouts while preserving all existing predefined layouts (1x1, 1x2, 2x1, 2x2, 3x1, 1x3, 3x4).

## Features Added

### 1. Custom Layout Type Support
- Extended `CollageLayout` type to include 'custom' option
- Added `CustomLayout` interface with `rows` and `cols` properties
- Created `getLayoutDimensions()` helper function to handle both predefined and custom layouts

### 2. Enhanced Layout Selector
- Added custom layout section with input fields for rows and columns
- Interactive preview showing the grid structure
- Real-time validation (1-10 for both rows and columns)
- Visual feedback showing total number of images

### 3. State Management
- Added `customLayout` state to track user-defined grid dimensions
- Updated all components to handle the new custom layout parameter
- Maintained backward compatibility with existing layouts

## Technical Implementation

### Files Modified:
1. **`src/types/collage.ts`**
   - Added `CustomLayout` interface
   - Extended `CollageLayout` type
   - Added `getLayoutDimensions()` helper function
   - Updated `LAYOUT_CONFIGS` to exclude custom type

2. **`src/components/LayoutSelector.tsx`**
   - Added props for custom layout handling
   - Implemented custom layout input controls
   - Added real-time preview and validation

3. **`src/components/CollageApp.tsx`**
   - Added `customLayout` state management
   - Updated layout dimension calculations
   - Passed custom layout props to child components

4. **`src/components/CollageCanvas.tsx`**
   - Added support for custom layout parameter
   - Updated to use `getLayoutDimensions()` helper

## Usage
1. Select "Custom Layout" from the layout options
2. Enter desired number of rows (1-10) and columns (1-10)
3. The preview updates in real-time showing the grid structure
4. Total image count is displayed for reference
5. Layout is applied immediately to the collage canvas

## Validation
- Input fields are restricted to numbers between 1-10
- Real-time calculation of total image slots
- Visual preview updates automatically
- Handles edge cases and invalid input gracefully

## Backward Compatibility
- All existing predefined layouts remain unchanged
- No breaking changes to existing functionality
- Seamless integration with existing features (export, image adjustment, etc.)
