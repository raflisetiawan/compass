/**
 * Canvas-based icon renderers for PDF generation.
 * These functions draw icons directly to canvas, bypassing html2canvas for performance.
 */

export interface IconRenderOptions {
  size: number;
  color: string;
  x: number;
  y: number;
}

/**
 * Draw a filled circle icon
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  { x, y, size, color }: IconRenderOptions
): void {
  const radius = size / 2;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draw a circle with a pill overlay (for medication-assisted outcomes)
 */
export function drawCircleWithPill(
  ctx: CanvasRenderingContext2D,
  { x, y, size, color }: IconRenderOptions
): void {
  // Draw base circle
  drawCircle(ctx, { x, y, size, color });

  // Draw pill overlay
  const center = size / 2;
  const pillWidth = size * 0.6;
  const pillHeight = size * 0.35;
  const pillRadius = pillHeight / 2;
  const pillX = x + center - pillWidth / 2;
  const pillY = y + center - pillHeight / 2;

  // Left half (blue)
  ctx.beginPath();
  ctx.moveTo(pillX + pillRadius, pillY);
  ctx.lineTo(pillX + pillWidth / 2, pillY);
  ctx.lineTo(pillX + pillWidth / 2, pillY + pillHeight);
  ctx.lineTo(pillX + pillRadius, pillY + pillHeight);
  ctx.arc(pillX + pillRadius, pillY + pillRadius, pillRadius, Math.PI / 2, -Math.PI / 2, false);
  ctx.fillStyle = '#007bff';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Right half (white)
  ctx.beginPath();
  ctx.moveTo(pillX + pillWidth / 2, pillY);
  ctx.lineTo(pillX + pillWidth - pillRadius, pillY);
  ctx.arc(pillX + pillWidth - pillRadius, pillY + pillRadius, pillRadius, -Math.PI / 2, Math.PI / 2, false);
  ctx.lineTo(pillX + pillWidth / 2, pillY + pillHeight);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Center dividing line
  ctx.beginPath();
  ctx.moveTo(pillX + pillWidth / 2, pillY);
  ctx.lineTo(pillX + pillWidth / 2, pillY + pillHeight);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/**
 * Draw a sun icon (used for "rarely/never" outcomes)
 */
export function drawSunIcon(
  ctx: CanvasRenderingContext2D,
  { x, y, size, color }: IconRenderOptions
): void {
  const center = size / 2;
  const cx = x + center;
  const cy = y + center;
  const innerRadius = size * 0.25;
  const outerRadius = size * 0.45;
  const numRays = 8;

  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Draw center circle
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw rays
  ctx.lineWidth = size * 0.08;
  for (let i = 0; i < numRays; i++) {
    const angle = (i * Math.PI * 2) / numRays;
    const startX = cx + Math.cos(angle) * (innerRadius + size * 0.05);
    const startY = cy + Math.sin(angle) * (innerRadius + size * 0.05);
    const endX = cx + Math.cos(angle) * outerRadius;
    const endY = cy + Math.sin(angle) * outerRadius;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

/**
 * Draw a droplet icon (used for leakage outcomes)
 */
export function drawDropletIcon(
  ctx: CanvasRenderingContext2D,
  { x, y, size, color }: IconRenderOptions
): void {
  const cx = x + size / 2;

  ctx.fillStyle = color;
  ctx.beginPath();

  // Draw droplet shape using bezier curves
  const topY = y + size * 0.1;
  const bottomY = y + size * 0.85;
  const midY = y + size * 0.5;
  const width = size * 0.35;

  ctx.moveTo(cx, topY); // Top point
  ctx.bezierCurveTo(
    cx - width * 1.2, midY,     // Left control point 1
    cx - width, bottomY,        // Left control point 2
    cx, bottomY                  // Bottom center
  );
  ctx.bezierCurveTo(
    cx + width, bottomY,        // Right control point 1
    cx + width * 1.2, midY,     // Right control point 2
    cx, topY                     // Back to top
  );
  ctx.fill();
}

/**
 * Icon type definitions matching the chart data
 */
export type IconType = 'circle' | 'pill' | 'sun' | 'droplet';

/**
 * Draw an icon by type
 */
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  iconType: IconType,
  options: IconRenderOptions
): void {
  switch (iconType) {
    case 'pill':
      drawCircleWithPill(ctx, options);
      break;
    case 'sun':
      drawSunIcon(ctx, options);
      break;
    case 'droplet':
      drawDropletIcon(ctx, options);
      break;
    case 'circle':
    default:
      drawCircle(ctx, options);
      break;
  }
}
