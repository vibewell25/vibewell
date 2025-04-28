import { ColorUtils } from '@/utils/color-utils';

interface ColorMatch {
  matchScore: number;
  colorHex: string;
  undertone: 'warm' | 'cool' | 'neutral';
}

export class ColorMatchingService {
  private static readonly SKIN_TONE_RANGES = {
    fair: { minL: 70, maxL: 100 },
    light: { minL: 60, maxL: 70 },
    medium: { minL: 50, maxL: 60 },
    tan: { minL: 40, maxL: 50 },
    deep: { minL: 0, maxL: 40 },
  };

  /**
   * Analyzes skin tone from an image region
   */
  public async analyzeSkinTone(imageData: ImageData): Promise<{
    tone: keyof typeof ColorMatchingService.SKIN_TONE_RANGES;
    undertone: 'warm' | 'cool' | 'neutral';
  }> {
    const lab = await ColorUtils.rgbToLab(imageData);
    const { L, a, b } = lab;

    // Determine skin tone based on lightness
    let tone: keyof typeof ColorMatchingService.SKIN_TONE_RANGES = 'medium';
    for (const [key, range] of Object.entries(ColorMatchingService.SKIN_TONE_RANGES)) {
      if (L >= range.minL && L <= range.maxL) {
        tone = key as keyof typeof ColorMatchingService.SKIN_TONE_RANGES;
        break;
      }
    }

    // Determine undertone based on a and b values
    let undertone: 'warm' | 'cool' | 'neutral';
    if (a > 2) {
      undertone = 'warm';
    } else if (a < -2) {
      undertone = 'cool';
    } else {
      undertone = 'neutral';
    }

    return { tone, undertone };
  }

  /**
   * Matches foundation shades to skin tone
   */
  public async matchFoundation(
    skinTone: keyof typeof ColorMatchingService.SKIN_TONE_RANGES,
    undertone: string,
    availableShades: string[],
  ): Promise<ColorMatch[]> {
    const matches: ColorMatch[] = [];

    for (const shade of availableShades) {
      const lab = await ColorUtils.hexToLab(shade);
      const matchScore = this.calculateMatchScore(skinTone, undertone, lab);

      matches.push({
        matchScore,
        colorHex: shade,
        undertone: undertone as 'warm' | 'cool' | 'neutral',
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Blends makeup colors with skin tone
   */
  public async blendColors(
    baseColor: string,
    makeupColor: string,
    opacity: number,
  ): Promise<string> {
    const base = await ColorUtils.hexToRgb(baseColor);
    const makeup = await ColorUtils.hexToRgb(makeupColor);

    const blended = {
      r: Math.round(base.r * (1 - opacity) + makeup.r * opacity),
      g: Math.round(base.g * (1 - opacity) + makeup.g * opacity),
      b: Math.round(base.b * (1 - opacity) + makeup.b * opacity),
    };

    return ColorUtils.rgbToHex(blended);
  }

  private calculateMatchScore(
    skinTone: keyof typeof ColorMatchingService.SKIN_TONE_RANGES,
    undertone: string,
    lab: { L: number; a: number; b: number },
  ): number {
    const range = ColorMatchingService.SKIN_TONE_RANGES[skinTone];
    const lightnessDiff = Math.abs((range.maxL + range.minL) / 2 - lab.L);

    // Calculate undertone match (a and b values in Lab color space)
    const undertoneMatch =
      undertone === 'warm' ? lab.a > 0 : undertone === 'cool' ? lab.a < 0 : Math.abs(lab.a) < 2;

    // Weighted scoring
    const lightnessScore = 1 - lightnessDiff / 50; // Normalize to 0-1
    const undertoneScore = undertoneMatch ? 1 : 0;

    return lightnessScore * 0.7 + undertoneScore * 0.3; // 70% lightness, 30% undertone
  }
}
