# Vibewell AR & Skin Analysis

A modern web application that provides AR try-on capabilities and AI-powered skin analysis.

## Features

### Skin Analysis
- Real-time skin condition analysis
- ML-based detection of:
  - Acne
  - Dryness
  - Oiliness
  - Pigmentation
  - Sensitivity
  - Aging signs
- Personalized skincare recommendations
- Secure image processing

### AR Try-On
- Virtual product try-on
- Real-time face tracking
- Support for:
  - Makeup products
  - Accessories
  - Skincare visualization
- Adjustable intensity and placement
- Performance optimization
- Mobile-first design

## Technology Stack

- **Frontend Framework**: Next.js 13
- **3D Rendering**: Three.js, React Three Fiber
- **AR/VR**: WebXR API
- **Face Detection**: TensorFlow.js, Face-API.js
- **UI Components**: Material-UI
- **State Management**: Zustand
- **Testing**: Jest, React Testing Library

## Prerequisites

- Node.js 18+
- Modern browser with WebGL and WebXR support
- Camera access for AR features
- Gyroscope for device orientation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibewell.git
cd vibewell
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_STORAGE_URL=your_storage_url
```

4. Start the development server:
```bash
npm run dev
```

## Usage

### Skin Analysis

1. Navigate to the skin analysis page
2. Grant camera access when prompted
3. Position your face in the frame
4. Click "Analyze Skin" to start the analysis
5. View results and recommendations

### AR Try-On

1. Browse available products
2. Select a product to try on
3. Grant camera access
4. Adjust product placement and intensity
5. Capture and share your look

## Development

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Performance Optimization

The application includes several performance optimization features:

- Lazy loading of 3D models
- Texture compression
- Memory management
- Frame rate optimization
- Network request batching
- Asset caching

## Security Measures

- Secure image processing
- Data sanitization
- Input validation
- Resource cleanup
- Error handling
- Privacy protection

## Browser Support

- Chrome 90+
- Firefox 89+
- Safari 15+
- Edge 90+
- Chrome for Android 90+
- Safari iOS 15+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@vibewell.com or join our Slack channel.
