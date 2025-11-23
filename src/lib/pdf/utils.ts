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

export const renderChartToImage = async (
    Component: React.ComponentType<any>,
    props: any,
    scale: number = 1 // Reduced from 2 to 1 for smaller file size
): Promise<HTMLCanvasElement> => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    const root = ReactDOM.createRoot(tempContainer);
    root.render(React.createElement(Component, props));

    // Wait for rendering - 200ms is a good balance between speed and reliability
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(tempContainer, { scale });

    root.unmount();
    document.body.removeChild(tempContainer);

    return canvas;
};

// Convert canvas to compressed JPEG data URL
export const canvasToJpeg = (canvas: HTMLCanvasElement, quality: number = 0.85): string => {
    return canvas.toDataURL('image/jpeg', quality);
};
