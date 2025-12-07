/**
 * PDF utility functions
 * Note: html2canvas utilities have been removed in favor of direct canvas rendering
 * for better performance. See ./canvas/ for the new rendering utilities.
 */

export const toDataURL = (url: string) => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    }));

/**
 * Yields control back to the browser to keep the UI responsive.
 * Uses requestIdleCallback when available, falls back to setTimeout.
 * Note: This is now mostly unused since canvas rendering is fast enough
 * to not block the UI.
 */
export const yieldToMain = (): Promise<void> => {
    return new Promise(resolve => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => resolve(), { timeout: 50 });
        } else {
            setTimeout(resolve, 0);
        }
    });
};

// Convert canvas to compressed JPEG data URL
export const canvasToJpeg = (canvas: HTMLCanvasElement, quality: number = 0.85): string => {
    return canvas.toDataURL('image/jpeg', quality);
};
