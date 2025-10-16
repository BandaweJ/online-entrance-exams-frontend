import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  largeText: boolean;
  normalText: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ColorContrastService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Calculate the contrast ratio between two colors
   */
  calculateContrastRatio(color1: string, color2: string): number {
    if (!isPlatformBrowser(this.platformId)) return 0;

    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.getLuminance(rgb1);
    const lum2 = this.getLuminance(rgb2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast meets WCAG standards
   */
  checkContrast(foreground: string, background: string, fontSize?: number): ContrastResult {
    const ratio = this.calculateContrastRatio(foreground, background);
    const isLargeText = fontSize ? fontSize >= 18 : false;
    
    let level: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
    let normalText = false;
    let largeText = false;

    if (ratio >= 7) {
      level = 'AAA';
      normalText = true;
      largeText = true;
    } else if (ratio >= 4.5) {
      level = 'AA';
      normalText = true;
      largeText = true;
    } else if (ratio >= 3 && isLargeText) {
      level = 'AA';
      largeText = true;
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      largeText,
      normalText
    };
  }

  /**
   * Get recommended colors for better contrast
   */
  getRecommendedColors(background: string, currentForeground: string): string[] {
    const recommendations: string[] = [];
    
    // Common accessible colors
    const accessibleColors = [
      '#000000', // Black
      '#FFFFFF', // White
      '#333333', // Dark gray
      '#666666', // Medium gray
      '#1a1a1a', // Very dark gray
      '#2d2d2d', // Dark gray
      '#404040', // Medium dark gray
      '#000080', // Navy blue
      '#800080', // Purple
      '#008000', // Green
      '#800000', // Maroon
      '#808000'  // Olive
    ];

    for (const color of accessibleColors) {
      const result = this.checkContrast(color, background);
      if (result.level !== 'FAIL') {
        recommendations.push(color);
      }
    }

    return recommendations;
  }

  /**
   * Validate all colors in the current theme
   */
  validateThemeColors(): { [key: string]: ContrastResult } {
    if (!isPlatformBrowser(this.platformId)) return {};

    const results: { [key: string]: ContrastResult } = {};
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // Get CSS custom properties
    const cssVariables = [
      '--anarchy-blue',
      '--anarchy-gold',
      '--anarchy-grey',
      '--anarchy-off-white',
      '--text-primary',
      '--text-secondary',
      '--background-primary',
      '--background-secondary'
    ];

    for (const variable of cssVariables) {
      const color = computedStyle.getPropertyValue(variable).trim();
      if (color) {
        // Test against common background colors
        const backgrounds = ['#ffffff', '#000000', '#f5f5f5', '#333333'];
        for (const bg of backgrounds) {
          const result = this.checkContrast(color, bg);
          const key = `${variable}_on_${bg}`;
          results[key] = result;
        }
      }
    }

    return results;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    
    // Convert to relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Apply high contrast mode if needed
   */
  applyHighContrastMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = document.documentElement;
    root.style.setProperty('--anarchy-blue', '#0000ff');
    root.style.setProperty('--anarchy-gold', '#ffd700');
    root.style.setProperty('--anarchy-grey', '#000000');
    root.style.setProperty('--anarchy-off-white', '#ffffff');
    root.style.setProperty('--text-primary', '#000000');
    root.style.setProperty('--text-secondary', '#333333');
    root.style.setProperty('--background-primary', '#ffffff');
    root.style.setProperty('--background-secondary', '#f5f5f5');
  }

  /**
   * Reset to normal contrast mode
   */
  resetContrastMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = document.documentElement;
    root.style.removeProperty('--anarchy-blue');
    root.style.removeProperty('--anarchy-gold');
    root.style.removeProperty('--anarchy-grey');
    root.style.removeProperty('--anarchy-off-white');
    root.style.removeProperty('--text-primary');
    root.style.removeProperty('--text-secondary');
    root.style.removeProperty('--background-primary');
    root.style.removeProperty('--background-secondary');
  }
}
