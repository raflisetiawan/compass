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
 * Draw a dashed border around a circle (for icons like "Progressed after focal")
 */
export function drawDashedBorder(
  ctx: CanvasRenderingContext2D,
  { x, y, size }: IconRenderOptions,
  borderColor: string
): void {
  const radius = size / 2;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius - 1, 0, Math.PI * 2);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = size * 0.12;
  ctx.setLineDash([size * 0.18, size * 0.12]);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash
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
 * Draw a stick man icon (matching StickManIcon.tsx SVG path)
 * Original viewBox: 0 -960 960 960
 */
export function drawStickMan(
  ctx: CanvasRenderingContext2D,
  { x, y, size, color }: IconRenderOptions
): void {
  ctx.fillStyle = color;
  
  // Scale from viewBox (960x960) to icon size
  const scale = size / 960;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // The viewBox starts at y=-960, so translate to compensate
  ctx.translate(0, 960);
  
  // Draw the person path from StickManIcon.tsx
  const path = new Path2D('M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z');
  ctx.fill(path);
  
  ctx.restore();
}

/**
 * Draw an image icon (for SVG-based icons like pad/underwear)
 */
export function drawImageIcon(
  ctx: CanvasRenderingContext2D,
  { x, y, size }: IconRenderOptions,
  image: HTMLImageElement | null
): void {
  if (image) {
    ctx.drawImage(image, x, y, size, size);
  }
}

/**
 * Draw a paper roll icon (matching PaperRollIcon.tsx SVG paths)
 * Original viewBox: 350 240 330 290
 */
export function drawPaperRoll(
  ctx: CanvasRenderingContext2D,
  { x, y, size, color }: IconRenderOptions
): void {
  ctx.fillStyle = color;
  
  // Scale from viewBox (330x290) to icon size
  const scale = size / 330;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Translate to compensate for viewBox offset (350, 240)
  ctx.translate(-350, -240);
  
  // Main body path
  const path1 = new Path2D('M573.574646,247.141388 C581.816162,247.658936 589.702698,246.875305 597.430603,248.257919 C616.246338,251.624283 630.171997,262.428925 640.994446,277.662445 C655.406860,297.949158 662.590332,320.775330 663.222717,345.467316 C663.976807,374.913635 663.875977,404.380890 664.303040,433.836792 C664.649841,457.761505 668.228455,481.209259 675.364319,504.081146 C675.909851,505.829651 676.537781,507.560791 676.950195,509.341095 C679.172668,518.935669 673.865112,525.945801 663.995056,526.206726 C656.833801,526.396057 649.663635,526.247192 642.497437,526.248474 C597.666870,526.256592 552.836304,526.269165 508.005768,526.269104 C497.243317,526.269104 493.099976,523.381287 489.412872,513.168701 C485.340729,501.889954 481.439514,490.541138 479.021912,478.776306 C478.256897,475.053467 476.458191,473.941742 472.856781,473.983978 C459.526550,474.140228 446.174805,473.612488 432.865509,474.166504 C405.425964,475.308685 386.203857,462.060944 371.934113,440.114685 C359.301025,420.685547 353.700409,398.925842 351.548309,376.052582 C349.034851,349.338654 352.613342,323.487213 362.859650,298.784729 C370.885712,279.434937 382.853943,263.022919 402.164429,253.210831 C409.230774,249.620270 416.678986,247.579102 424.718903,247.593475 C458.041382,247.653091 491.364227,247.624557 524.686707,247.542343 C540.835938,247.502502 556.984741,247.272614 573.574646,247.141388 M631.427979,321.028534 C628.490479,311.060089 624.568176,301.496582 618.429138,293.072815 C609.937317,281.420685 599.139160,274.544373 583.846008,274.764404 C550.364990,275.246063 516.872253,274.898682 483.384308,274.939728 C481.322510,274.942230 479.063843,274.301392 477.271179,275.894836 C476.977203,277.903656 478.261444,279.141632 479.168030,280.473938 C490.977722,297.829834 496.465607,317.442780 499.289703,337.895660 C501.297882,352.439056 500.548645,367.115417 500.485596,381.757507 C500.395416,402.723450 500.795837,423.691589 502.393066,444.607605 C503.662140,461.226227 506.131561,477.636963 511.477509,493.527557 C512.764648,497.353516 514.594788,499.080383 518.951782,499.062225 C559.103821,498.895050 599.256958,498.968658 639.409729,498.947937 C644.848755,498.945129 645.226624,498.442566 644.010986,493.164581 C639.511841,473.631256 637.478455,453.785095 636.738892,433.804840 C635.808472,408.664398 635.897583,383.506989 636.046570,358.354034 C636.119873,345.971191 634.905884,333.773743 631.427979,321.028534 M399.729309,431.757019 C401.564789,433.683716 403.309570,435.707428 405.250427,437.521393 C418.298737,449.716522 433.718567,449.753998 446.758759,437.631622 C452.305939,432.474823 456.774353,426.453979 459.992249,419.623077 C476.771790,384.003815 477.062256,347.654083 464.005402,310.995056 C459.783661,299.141907 453.529572,288.299622 443.014221,280.600403 C432.983032,273.255646 421.205078,272.926941 410.807404,279.617828 C399.643921,286.801514 393.142670,297.544525 388.351562,309.437195 C378.527008,333.823944 376.457916,359.201508 380.631897,384.925110 C383.335938,401.589600 388.507294,417.615753 399.729309,431.757019 z');
  ctx.fill(path1);
  
  // Inner circles/details
  const path2 = new Path2D('M512.816528,349.246765 C515.481628,343.570496 519.662109,340.740601 525.554016,340.719604 C530.598450,340.701630 534.538635,342.928589 537.103455,347.272736 C540.448303,352.938293 539.632202,359.076233 535.092896,363.720856 C530.540405,368.378967 524.666199,369.309082 519.212097,366.235474 C513.311829,362.910431 510.822449,356.582886 512.816528,349.246765 z');
  ctx.fill(path2);
  
  const path3 = new Path2D('M616.007202,341.431702 C622.081299,344.128662 625.617554,348.349335 625.176453,354.744080 C624.781738,360.464417 621.661377,364.740570 616.240112,366.961731 C610.794617,369.192841 606.136597,367.477295 602.118835,363.593292 C598.031494,359.642059 596.926758,354.257202 599.197388,348.945709 C601.342712,343.927490 605.189636,341.039642 610.707947,340.743622 C612.333923,340.656372 613.987671,341.085175 616.007202,341.431702 z');
  ctx.fill(path3);
  
  const path4 = new Path2D('M557.775940,362.034332 C554.101013,356.645050 553.818604,351.500610 557.377014,346.376740 C560.539978,341.822388 565.095703,340.097229 570.430542,340.822418 C576.344543,341.626282 579.796204,345.415314 581.535828,350.966675 C583.249146,356.434021 580.340515,363.078491 574.825989,366.176300 C568.960083,369.471588 563.446350,368.219635 557.775940,362.034332 z');
  ctx.fill(path4);
  
  const path5 = new Path2D('M409.369476,380.347443 C404.184326,366.280365 404.159821,352.657501 410.238312,339.262512 C413.291229,332.534912 418.063721,327.142883 425.918732,327.212585 C433.647369,327.281189 438.644562,332.329926 441.712097,339.165009 C448.055115,353.298431 447.828278,367.517914 441.939484,381.719940 C440.789368,384.493652 439.057556,386.961761 437.047394,389.207672 C430.889954,396.087036 422.037292,396.351959 415.559235,389.768921 C412.982697,387.150665 410.795624,384.216797 409.369476,380.347443 z');
  ctx.fill(path5);
  
  ctx.restore();
}

/**
 * Icon type definitions matching the chart data
 */
export type IconType = 'circle' | 'pill' | 'sun' | 'droplet' | 'stickman' | 'image' | 'paperroll';

/**
 * Draw an icon by type
 */
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  iconType: IconType,
  options: IconRenderOptions,
  image?: HTMLImageElement | null,
  borderColor?: string
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
    case 'stickman':
      drawStickMan(ctx, options);
      break;
    case 'image':
      drawImageIcon(ctx, options, image || null);
      break;
    case 'paperroll':
      drawPaperRoll(ctx, options);
      break;
    case 'circle':
    default:
      drawCircle(ctx, options);
      break;
  }
  // Draw dashed border if borderColor is specified
  if (borderColor) {
    drawDashedBorder(ctx, options, borderColor);
  }
}
