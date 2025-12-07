import html2canvas from 'html2canvas-pro';
import React from 'react';
import ReactDOM from 'react-dom/client';

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

/**
 * Original synchronous version - kept for backwards compatibility
 */
export const renderChartToImage = async (
    Component: React.ComponentType<any>,
    props: any,
    scale: number = 1
): Promise<HTMLCanvasElement> => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    const root = ReactDOM.createRoot(tempContainer);
    root.render(React.createElement(Component, props));

    // 50ms wait time - optimized for speed while maintaining reliability
    await new Promise(resolve => setTimeout(resolve, 50));

    // Optimized html2canvas settings for faster PDF generation
    const canvas = await html2canvas(tempContainer, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        windowWidth: tempContainer.scrollWidth,
        windowHeight: tempContainer.scrollHeight
    });

    root.unmount();
    document.body.removeChild(tempContainer);

    return canvas;
};

/**
 * Non-blocking version that yields to browser between operations.
 * Returns a data URL string along with actual dimensions for correct aspect ratio.
 */
export const renderChartToImageNonBlocking = async (
    Component: React.ComponentType<any>,
    props: any,
    scale: number = 1,
    quality: number = 0.85
): Promise<{ dataUrl: string; width: number; height: number }> => {
    // Yield before starting heavy work
    await yieldToMain();

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    const root = ReactDOM.createRoot(tempContainer);
    root.render(React.createElement(Component, props));

    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Yield again before html2canvas
    await yieldToMain();

    const canvas = await html2canvas(tempContainer, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        removeContainer: false,
        windowWidth: tempContainer.scrollWidth,
        windowHeight: tempContainer.scrollHeight
    });

    root.unmount();
    document.body.removeChild(tempContainer);

    // Convert to data URL and capture dimensions
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const width = canvas.width / scale;
    const height = canvas.height / scale;
    
    // Yield after heavy work
    await yieldToMain();

    return { dataUrl, width, height };
};

/**
 * Renders multiple charts with yielding between each for better responsiveness.
 * Returns array of objects with dataUrl and dimensions for each chart.
 */
export const renderChartsNonBlocking = async (
    charts: Array<{ Component: React.ComponentType<any>; props: any }>,
    onProgress?: (completed: number, total: number) => void,
    scale: number = 1,
    quality: number = 0.85
): Promise<Array<{ dataUrl: string; width: number; height: number }>> => {
    const results: Array<{ dataUrl: string; width: number; height: number }> = [];
    
    for (let i = 0; i < charts.length; i++) {
        const { Component, props } = charts[i];
        const result = await renderChartToImageNonBlocking(Component, props, scale, quality);
        results.push(result);
        
        if (onProgress) {
            onProgress(i + 1, charts.length);
        }
        
        // Extra yield between charts
        await yieldToMain();
    }
    
    return results;
};

// Convert canvas to compressed JPEG data URL
export const canvasToJpeg = (canvas: HTMLCanvasElement, quality: number = 0.85): string => {
    return canvas.toDataURL('image/jpeg', quality);
};
