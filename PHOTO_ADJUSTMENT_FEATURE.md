# Photo Adjustment Feature

## Overview
The InstaCollage app now includes interactive photo adjustment functionality that allows users to customize how their uploaded photos appear in the collage preview.

## Features

### Interactive Photo Positioning
- **Drag to Move**: Click and drag any photo in the preview to adjust its position within the frame
- **Scroll to Zoom**: Use the mouse wheel while hovering over a photo to zoom in or out
- **Constraint System**: Photos are automatically constrained to always fill their assigned frame space

### Visual Feedback
- **Hover Effects**: Photos show a blue overlay when hovered, indicating they're interactive
- **Instruction Overlay**: A helpful instruction banner appears in the preview when adjustment mode is active
- **Adjustment Panel**: A dedicated panel shows which photos have been adjusted with their current values

### Smart Constraints
- **Minimum Zoom**: Zoom is limited so photos always cover their entire frame area
- **Position Limits**: Photo positioning is constrained to prevent empty spaces in frames
- **Automatic Adjustment**: Invalid zoom levels are automatically corrected to maintain coverage

## Usage

1. **Upload Photos**: Add photos to your collage as usual
2. **Adjust Photos**: 
   - Click and drag on any photo in the preview to reposition it
   - Use scroll wheel over a photo to zoom in/out
3. **Monitor Changes**: Check the adjustment panel to see current position and zoom values
4. **Reset if Needed**: Use the reset buttons to restore photos to their default position and zoom

## Technical Implementation

### New Types
- `ImageAdjustment`: Stores offsetX, offsetY (percentages), and zoom level
- Enhanced `UploadedImage`: Now includes optional adjustment data

### Enhanced Components
- **CollageCanvas**: Now supports interactive mouse and wheel events
- **ImageAdjustmentPanel**: Shows adjustment status and reset controls
- **CollageApp**: Manages adjustment state and propagates changes

### Smart Rendering
- Photos maintain aspect ratio while allowing repositioning
- Zoom constraints ensure frames are always filled
- Real-time preview updates as adjustments are made
