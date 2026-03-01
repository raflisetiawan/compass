/**
 * Utility functions for PDF generation
 */

/**
 * Load an image from a URL and return an HTMLImageElement.
 * Works with SVG data URLs and regular URLs.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
}

/**
 * Load multiple images in parallel.
 * Returns array of loaded images in the same order as input URLs.
 */
export async function loadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => loadImage(url)));
}
