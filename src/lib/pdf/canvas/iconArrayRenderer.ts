/**
 * Canvas-based IconArray renderer for PDF generation.
 * Renders a 10x10 grid of icons directly to canvas, bypassing html2canvas.
 */

import { drawIcon, type IconType } from './iconRenderers';

export interface IconData {
  name: string;
  value: number;
  color: string;
  iconType?: IconType;
}

export interface RenderOptions {
  scale?: number;
  iconSize?: number;
  padding?: number;
  quality?: number;
}

export interface RenderResult {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Determines the icon type - uses explicit type if provided, otherwise defaults to circle
 * Note: We no longer auto-detect based on name to avoid unintended icon types
 */
function getIconType(hasExplicitType?: IconType): IconType {
  return hasExplicitType || 'circle';
}

/**
 * Renders an IconArray directly to canvas and returns a data URL
 */
export function renderIconArrayToCanvas(
  data: IconData[],
  options: RenderOptions = {}
): HTMLCanvasElement {
  const {
    scale = 2,
    iconSize = 15,
    padding = 4,
  } = options;

  const numRows = 10;
  const numCols = 10;
  const total = 100;

  const gridWidth = numCols * (iconSize + padding);
  const gridHeight = numRows * (iconSize + padding);

  // Create canvas with scaling for higher resolution
  const canvas = document.createElement('canvas');
  canvas.width = gridWidth * scale;
  canvas.height = gridHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Scale context for high-res rendering
  ctx.scale(scale, scale);

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  // Build icon array from data
  const icons: Array<{ color: string; iconType: IconType }> = [];
  for (const item of data) {
    const iconType = getIconType(item.iconType);
    for (let i = 0; i < item.value; i++) {
      icons.push({ color: item.color, iconType });
    }
  }

  // Draw icons in grid
  for (let i = 0; i < total && i < icons.length; i++) {
    const col = i % numCols;
    const row = Math.floor(i / numCols);
    const x = col * (iconSize + padding);
    const y = row * (iconSize + padding);

    drawIcon(ctx, icons[i].iconType, {
      x,
      y,
      size: iconSize,
      color: icons[i].color,
    });
  }

  return canvas;
}

/**
 * Renders an IconArray to a data URL with dimensions
 */
export function renderIconArrayToDataUrl(
  data: IconData[],
  options: RenderOptions = {}
): RenderResult {
  const { quality = 0.92, scale = 2 } = options;
  const canvas = renderIconArrayToCanvas(data, options);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width: canvas.width / scale,
    height: canvas.height / scale,
  };
}

/**
 * Renders a chart with title and IconArray to canvas
 */
export function renderChartWithTitleToCanvas(
  title: string,
  data: IconData[],
  options: RenderOptions & { titleFontSize?: number; titleHeight?: number } = {}
): HTMLCanvasElement {
  const {
    scale = 2,
    iconSize = 15,
    padding = 4,
    titleFontSize = 14,
    titleHeight = 30,
  } = options;

  const numCols = 10;
  const numRows = 10;
  const gridWidth = numCols * (iconSize + padding);
  const gridHeight = numRows * (iconSize + padding);
  const canvasWidth = gridWidth;
  const canvasHeight = gridHeight + titleHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  ctx.scale(scale, scale);

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw title
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, canvasWidth / 2, titleHeight / 2);

  // Build and draw icon array
  const icons: Array<{ color: string; iconType: IconType }> = [];
  for (const item of data) {
    const iconType = getIconType(item.iconType);
    for (let i = 0; i < item.value; i++) {
      icons.push({ color: item.color, iconType });
    }
  }

  const total = 100;
  for (let i = 0; i < total && i < icons.length; i++) {
    const col = i % numCols;
    const row = Math.floor(i / numCols);
    const x = col * (iconSize + padding);
    const y = titleHeight + row * (iconSize + padding);

    drawIcon(ctx, icons[i].iconType, {
      x,
      y,
      size: iconSize,
      color: icons[i].color,
    });
  }

  return canvas;
}

/**
 * Renders a chart with title to a data URL
 */
export function renderChartWithTitleToDataUrl(
  title: string,
  data: IconData[],
  options: RenderOptions & { titleFontSize?: number; titleHeight?: number } = {}
): RenderResult {
  const { quality = 0.92, scale = 2 } = options;
  const canvas = renderChartWithTitleToCanvas(title, data, options);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width: canvas.width / scale,
    height: canvas.height / scale,
  };
}

/**
 * Renders multiple charts in batch (for treatment comparison pages)
 */
export function renderMultipleChartsToDataUrl(
  charts: Array<{ title: string; data: IconData[] }>,
  options: RenderOptions & { titleFontSize?: number; titleHeight?: number } = {}
): RenderResult[] {
  return charts.map(chart => renderChartWithTitleToDataUrl(chart.title, chart.data, options));
}
