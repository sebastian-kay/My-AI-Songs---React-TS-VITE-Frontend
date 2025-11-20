export const parseApiColor = (colorString: string): [number, number, number] => {
  const values = colorString.split(', ').map(v => parseInt(v.trim(), 10));
  return [values[0] || 0, values[1] || 0, values[2] || 0];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const calculateContrast = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
  const lum1 = calculateLuminance(...rgb1);
  const lum2 = calculateLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const ensureContrast = (color: [number, number, number], background: [number, number, number] = [26, 26, 26]): [number, number, number] => {
  const contrast = calculateContrast(color, background);
  
  if (contrast >= 4.5) {
    return color;
  }

  // If contrast is too low, adjust the color
  const [r, g, b] = color;
  const luminance = calculateLuminance(r, g, b);
  
  // If color is dark, make it lighter; if light, make it darker
  const factor = luminance > 0.5 ? 0.7 : 1.5;
  
  return [
    Math.min(255, Math.max(0, Math.round(r * factor))),
    Math.min(255, Math.max(0, Math.round(g * factor))),
    Math.min(255, Math.max(0, Math.round(b * factor)))
  ];
};

export const updateCSSColors = (dominantColor: string, complementaryColor: string): void => {
  const dominant = parseApiColor(dominantColor);
  const complementary = parseApiColor(complementaryColor);
  
  // Ensure WCAG AA compliance
  const safeDominant = ensureContrast(dominant);
  const safeComplementary = ensureContrast(complementary);
  
  document.documentElement.style.setProperty('--player-accent', safeDominant.join(', '));
  document.documentElement.style.setProperty('--player-accent-complement', safeComplementary.join(', '));
};