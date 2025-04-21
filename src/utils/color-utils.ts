export enum ColorSpaces {
  RGB = 'rgb',
  HSL = 'hsl',
  HSV = 'hsv',
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  L: number;
  a: number;
  b: number;
}

export class ColorUtils {
  rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Converts RGB color to LAB color space
   */
  public static async rgbToLab(imageData: ImageData): Promise<LAB> {
    // Get average RGB from image data
    let r = 0,
      g = 0,
      b = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      r += imageData.data[i];
      g += imageData.data[i + 1];
      b += imageData.data[i + 2];
    }
    const pixels = imageData.data.length / 4;
    r = r / pixels / 255;
    g = g / pixels / 255;
    b = b / pixels / 255;

    // Convert to XYZ
    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Convert XYZ to Lab
    x = x / 0.95047;
    y = y / 1.0;
    z = z / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    return {
      L: 116 * y - 16,
      a: 500 * (x - y),
      b: 200 * (y - z),
    };
  }

  /**
   * Converts hex color to LAB color space
   */
  public static async hexToLab(hex: string): Promise<LAB> {
    const rgb = await this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    // Convert to XYZ
    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Convert XYZ to Lab
    x = x / 0.95047;
    y = y / 1.0;
    z = z / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    return {
      L: 116 * y - 16,
      a: 500 * (x - y),
      b: 200 * (y - z),
    };
  }

  /**
   * Converts hex color to RGB
   */
  public static async hexToRgb(hex: string): Promise<RGB> {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error('Invalid hex color');
    }

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  /**
   * Converts RGB color to hex
   */
  public static rgbToHex(rgb: RGB): string {
    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
  }
}
