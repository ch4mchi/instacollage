# InstaCollage - Image Collage Creator

A modern, client-only Next.js application for creating beautiful image collages with various layouts and customization options.

## 🌟 Features

### Core Functionality
- **Multi-Image Upload**: Load multiple images from local files via drag & drop or file browser
- **Image Reordering**: Freely rearrange images within frames using drag & drop or keyboard shortcuts
- **Interactive Photo Adjustment**: Fine-tune each photo's position and zoom within its frame
  - **Drag to Reposition**: Click and drag photos to adjust their placement
  - **Scroll to Zoom**: Use mouse wheel to zoom in/out while maintaining frame coverage
  - **Visual Feedback**: Hover effects and instruction overlay guide adjustments
- **Multiple Layout Options**: Create collages in various arrangements:
  - 1×1 (Single Image)
  - 1×2 (Side by Side)
  - 2×1 (Top & Bottom)  
  - 2×2 (Four Square)
  - 3×1 (Triple Stack)
  - 1×3 (Triple Row)
  - 3×4 (Twelve Grid)

### Frame Customization
- **Adjustable Frame Size**: Set horizontal pixel size from 400px to 2000px
- **Aspect Ratio Selection**: Choose from 8 different ratios:
  - 2:3 (Portrait)
  - 3:2 (Landscape)
  - 3:4 (Portrait)
  - 4:3 (Landscape)
  - 4:5 (Portrait)
  - 5:4 (Landscape)
  - 16:9 (Widescreen)
  - 9:16 (Mobile)

### Export Options
- **Multiple Formats**: Export in JPG or PNG format
- **Quality Control**: Adjustable JPG quality (10% - 100%)
- **Direct Download**: One-click export to your device

## 🛠️ Technology Stack

- **Next.js 15.5.2** - Latest React framework with App Router
- **TypeScript 5.x** - Type-safe development
- **TailwindCSS 4.x** - Modern utility-first CSS framework
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code quality and consistency

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd instacollage
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm run build
pnpm start
```

## 📋 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint for code quality checks
- `pnpm export` - Build and export static files for GitHub Pages
- `pnpm deploy` - Build, export, and prepare files for deployment

## 🚀 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

1. **Push to main/master branch** - The app will automatically build and deploy
2. **Access your deployed app** at: `https://<your-username>.github.io/instacollage`

### Manual Deployment Setup

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"

2. **Repository Settings** (if needed):
   - Ensure Actions have write permissions: Settings → Actions → General → Workflow permissions

3. **Push your code**:
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### Local Static Export

To test the static export locally:
```bash
pnpm run export
# Serve the 'out' directory with any static file server
```

### Configuration Details

- **Static Export**: Configured for client-only operation (no server required)
- **Asset Optimization**: Images and assets are optimized for static hosting
- **Base Path**: Automatically configured for GitHub Pages subdirectory
- **Jekyll Bypass**: Includes `.nojekyll` file for proper asset serving

## 🎨 Usage

1. **Upload Images**: Drag and drop images or click "browse" to select files
2. **Reorder Images**: 
   - **Drag & Drop**: Drag image thumbnails to rearrange them
   - **Keyboard**: Use ← → arrow keys to move images, Delete/Backspace to remove
   - **Visual Feedback**: See numbered indicators and hover effects
3. **Adjust Individual Photos**: Fine-tune each photo in the preview:
   - **Reposition**: Click and drag any photo to adjust its placement within the frame
   - **Zoom**: Use mouse wheel while hovering over a photo to zoom in/out
   - **Visual Cues**: Blue overlay indicates interactive photos, instruction banner provides guidance
   - **Monitor Changes**: Check the adjustment panel to see current position and zoom values
4. **Choose Layout**: Select from 7 available collage layouts
5. **Adjust Frame**: Set your desired width and aspect ratio  
6. **Customize Spacing**: Adjust gaps between images and outer margins
7. **Export**: Choose format (JPG/PNG) and quality, then download

### Image Management Features

- **Add More Images**: Upload additional images that append to your collection
- **Remove Individual Images**: Click the red × button or use keyboard shortcuts
- **Clear All**: Remove all images at once with the "Clear All" button
- **Interactive Photo Adjustment**: Fine-tune individual photos within their frames
  - **Smart Constraints**: Photos maintain coverage while allowing repositioning and zooming
  - **Real-time Feedback**: See adjustments immediately in the preview
  - **Adjustment Tracking**: Monitor which photos have been modified with current values
- **Excess Image Handling**: Visual warnings when you have more images than layout slots
- **Real-time Preview**: See your collage update instantly as you make changes

## 🏗️ Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── CollageApp.tsx   # Main application component
│   ├── CollageCanvas.tsx # Canvas rendering component
│   ├── ExportControls.tsx # Export settings
│   ├── FrameSettings.tsx # Frame customization
│   ├── ImageAdjustment.tsx # Individual image adjustment controls
│   ├── ImageAdjustmentPanel.tsx # Adjustment status panel
│   ├── ImageReorder.tsx # Image reordering interface
│   ├── ImageUpload.tsx  # File upload handling
│   └── LayoutSelector.tsx # Layout selection
└── types/               # TypeScript type definitions
    └── collage.ts       # Application types
```

## ✨ Key Features Implementation

### Client-Only Architecture
- No server-side operations
- All image processing happens in the browser
- Secure - images never leave your device

### Responsive Design
- Mobile-friendly interface
- Adaptive layout for different screen sizes
- Touch-friendly controls

### Performance Optimized
- Canvas-based rendering for smooth performance
- Interactive photo adjustments with real-time updates
- Efficient image scaling and positioning
- Memory-conscious file handling
- Smart constraint system for optimal user experience

## 🔧 Customization

The application is built with modularity in mind. Key configuration points:

- Layout definitions in `src/types/collage.ts`
- Canvas rendering logic in `src/components/CollageCanvas.tsx`
- UI styling via TailwindCSS classes

## 📱 Browser Support

Modern browsers with Canvas 2D API support:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using Next.js, TypeScript, and TailwindCSS
