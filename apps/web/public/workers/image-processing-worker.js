/**
 * Image Processing Web Worker
 * 
 * This worker handles intensive image processing operations to keep the main thread responsive.
 * It processes frames for the VirtualTryOnService, applying filters and effects.
 */

// Handle messages from the main thread
self.onmessage = async (event) => {
  try {
    const { frame, landmarks, filters, dimensions } = event.data;
    
    if (!frame || !landmarks || !filters) {
      throw new Error('Missing required data for processing');
    }
    
    // Process the frame with the provided filters
    const processedFrame = await processFrame(frame, landmarks, filters, dimensions);
    
    // Send the processed frame back to the main thread
    self.postMessage({ processedFrame }, [processedFrame]);
  } catch (error) {
    // Report any errors back to the main thread
    self.postMessage({ 
      error: error.message || 'Unknown error in image processing worker' 
    });
  }
};

/**
 * Process a frame with the given filters
 * 
 * @param {ImageBitmap} frame - The frame to process
 * @param {Array} landmarks - Face landmarks from MediaPipe
 * @param {Array} filters - Filters to apply
 * @param {Object} dimensions - Width and height of the frame
 * @returns {ImageBitmap} - The processed frame
 */
async function processFrame(frame, landmarks, filters, dimensions) {
  // Create a canvas to work with
  const canvas = new OffscreenCanvas(dimensions.width, dimensions.height);
  const ctx = canvas.getContext('2d');
  
  // Draw the original frame
  ctx.drawImage(frame, 0, 0);
  
  // Apply each filter
  for (const filter of filters) {
    switch (filter.type) {
      case 'makeup':
        applyMakeupFilter(ctx, landmarks, filter.settings);
        break;
      case 'hair':
        // Hair filters typically need 3D, which is handled on the main thread
        break;
      case 'skin':
        applySkinFilter(ctx, landmarks, filter.settings, dimensions);
        break;
    }
  }
  
  // Return the processed frame as ImageBitmap
  return canvas.transferToImageBitmap();
}

/**
 * Apply makeup filter to the frame
 * 
 * @param {OffscreenCanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} landmarks - Face landmarks
 * @param {Object} settings - Makeup settings
 */
function applyMakeupFilter(ctx, landmarks, settings) {
  // Extract facial features from landmarks
  const facialFeatures = extractFacialFeatures(landmarks);
  
  // Apply lipstick
  if (settings.lipstick) {
    ctx.fillStyle = settings.lipstick.color;
    ctx.beginPath();
    facialFeatures.lips.forEach((point, index) => {
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  }
  
  // Apply eye makeup
  if (settings.eyeMakeup) {
    facialFeatures.eyes.forEach((eye) => {
      ctx.strokeStyle = settings.eyeMakeup.color;
      ctx.lineWidth = settings.eyeMakeup.width || 2;
      ctx.beginPath();
      eye.forEach((point, index) => {
        const x = point.x * ctx.canvas.width;
        const y = point.y * ctx.canvas.height;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    });
  }
}

/**
 * Extract facial features from landmarks
 * 
 * @param {Array} landmarks - MediaPipe face landmarks
 * @returns {Object} - Object containing facial features (eyes, lips, etc.)
 */
function extractFacialFeatures(landmarks) {
  // MediaPipe face mesh indices for facial features
  const LIPS_INDICES = [
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0
  ];
  
  const LEFT_EYE_INDICES = [
    263, 249, 390, 373, 374, 380, 381, 382, 362, 263
  ];
  
  const RIGHT_EYE_INDICES = [
    33, 7, 163, 144, 145, 153, 154, 155, 133, 33
  ];
  
  // Extract features from landmarks
  const lips = LIPS_INDICES.map(index => landmarks[index]);
  const leftEye = LEFT_EYE_INDICES.map(index => landmarks[index]);
  const rightEye = RIGHT_EYE_INDICES.map(index => landmarks[index]);
  
  return {
    lips,
    eyes: [leftEye, rightEye]
  };
}

/**
 * Apply skin filter to the frame
 * 
 * @param {OffscreenCanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} landmarks - Face landmarks
 * @param {Object} settings - Skin filter settings
 * @param {Object} dimensions - Frame dimensions
 */
function applySkinFilter(ctx, landmarks, settings, dimensions) {
  // Apply skin smoothing
  if (settings.smoothing) {
    const imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
    const smoothedData = applySkinSmoothing(imageData, settings.smoothing);
    ctx.putImageData(smoothedData, 0, 0);
  }

  // Apply skin tone adjustment
  if (settings.toneAdjustment) {
    const imageData = ctx.getImageData(0, 0, dimensions.width, dimensions.height);
    const adjustedData = adjustSkinTone(imageData, settings.toneAdjustment);
    ctx.putImageData(adjustedData, 0, 0);
  }
}

/**
 * Apply skin smoothing effect
 * 
 * @param {ImageData} imageData - Image data to process
 * @param {number} strength - Smoothing strength (0-1)
 * @returns {ImageData} - Processed image data
 */
function applySkinSmoothing(imageData, strength) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // Performance optimization: Only process every other pixel
  const skipFactor = strength > 0.7 ? 1 : 2;

  for (let y = 1; y < height - 1; y += skipFactor) {
    for (let x = 1; x < width - 1; x += skipFactor) {
      const idx = (y * width + x) * 4;

      // Apply gaussian blur to each color channel
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        sum += data[idx - width * 4 + c] * 0.1;
        sum += data[idx - 4 + c] * 0.1;
        sum += data[idx + c] * 0.6;
        sum += data[idx + 4 + c] * 0.1;
        sum += data[idx + width * 4 + c] * 0.1;
        
        data[idx + c] = sum * strength + data[idx + c] * (1 - strength);
        
        // If we're skipping pixels, copy this pixel's value to neighbors
        if (skipFactor > 1) {
          if (x + 1 < width) data[idx + 4 + c] = data[idx + c];
          if (y + 1 < height) data[idx + width * 4 + c] = data[idx + c];
        }
      }
    }
  }

  return new ImageData(data, width, height);
}

/**
 * Adjust skin tone in the image
 * 
 * @param {ImageData} imageData - Image data to process
 * @param {Object} adjustment - Tone adjustment parameters
 * @returns {ImageData} - Processed image data
 */
function adjustSkinTone(imageData, adjustment) {
  const data = new Uint8ClampedArray(imageData.data);
  const skipFactor = 2; // Process every other pixel for performance
  const totalPixels = data.length / 4;

  for (let i = 0; i < totalPixels; i += skipFactor) {
    const pixelIndex = i * 4;
    
    if (pixelIndex >= data.length) break;
    
    const [h, s, l] = rgbToHsl(
      data[pixelIndex], 
      data[pixelIndex + 1], 
      data[pixelIndex + 2]
    );

    const newHue = (h + adjustment.hue) % 360;
    const newSat = Math.max(0, Math.min(100, s + adjustment.saturation));
    const newLight = Math.max(0, Math.min(100, l + adjustment.brightness));

    const [r, g, b] = hslToRgb(newHue, newSat, newLight);

    data[pixelIndex] = r;
    data[pixelIndex + 1] = g;
    data[pixelIndex + 2] = b;
    
    // If we're skipping pixels, copy this pixel's value to the skipped neighbor
    if (skipFactor > 1 && i + 1 < totalPixels) {
      const nextPixelIndex = (i + 1) * 4;
      if (nextPixelIndex < data.length) {
        data[nextPixelIndex] = r;
        data[nextPixelIndex + 1] = g;
        data[nextPixelIndex + 2] = b;
      }
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Convert RGB color to HSL
 * 
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Array} - [h, s, l] where h is 0-360, s and l are 0-100
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL color to RGB
 * 
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {Array} - [r, g, b] where r, g, b are 0-255
 */
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
} 