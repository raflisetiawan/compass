/**
 * reCAPTCHA v2 Service
 * 
 * This service provides reCAPTCHA v2 checkbox verification for the login flow
 * to prevent automated access as per PRD security requirements.
 */

/**
 * Type definition for Google reCAPTCHA v2 interface
 */
interface ReCaptchaV2Instance {
  render: (
    container: string | HTMLElement,
    parameters: {
      sitekey: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      theme?: 'light' | 'dark';
      size?: 'normal' | 'compact';
    }
  ) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
}

declare global {
  interface Window {
    grecaptcha: ReCaptchaV2Instance;
    onRecaptchaLoad: () => void;
  }
}

let recaptchaScriptLoaded = false;
let recaptchaWidgetId: number | null = null;
let onLoadCallback: (() => void) | null = null;

/**
 * Dynamically load the reCAPTCHA v2 script
 */
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    
    if (!siteKey || siteKey === 'YOUR_RECAPTCHA_V2_SITE_KEY') {
      if (import.meta.env.DEV) {
        console.warn('reCAPTCHA site key not configured. Skipping script load in development.');
        resolve();
        return;
      }
      reject(new Error('reCAPTCHA site key not configured'));
      return;
    }

    // Check if already loaded
    if (recaptchaScriptLoaded && window.grecaptcha) {
      resolve();
      return;
    }

    // Set up the callback for when script loads
    onLoadCallback = () => {
      recaptchaScriptLoaded = true;
      console.log('reCAPTCHA v2 script loaded successfully');
      resolve();
    };

    // Define global callback function
    window.onRecaptchaLoad = () => {
      if (onLoadCallback) {
        onLoadCallback();
      }
    };

    // Create and append the script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Render the reCAPTCHA v2 checkbox widget
 * @param containerId - The ID of the container element to render the widget in
 * @param onVerify - Callback when user successfully completes the captcha
 * @param onExpired - Callback when the captcha expires
 * @param onError - Callback when an error occurs
 */
export const renderRecaptcha = (
  containerId: string,
  onVerify: (token: string) => void,
  onExpired?: () => void,
  onError?: () => void
): void => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  
  if (!siteKey || siteKey === 'YOUR_RECAPTCHA_V2_SITE_KEY') {
    if (import.meta.env.DEV) {
      console.warn('reCAPTCHA site key not configured. Skipping render in development.');
      // In development, auto-verify with a fake token
      onVerify('dev-mode-token');
      return;
    }
    console.error('reCAPTCHA site key not configured');
    return;
  }

  if (!window.grecaptcha) {
    console.error('reCAPTCHA not loaded');
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element #${containerId} not found`);
    return;
  }

  // Clear any existing widget
  container.innerHTML = '';

  try {
    recaptchaWidgetId = window.grecaptcha.render(containerId, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': onExpired,
      'error-callback': onError,
      theme: 'light',
      size: 'normal',
    });
    console.log('reCAPTCHA widget rendered successfully');
  } catch (error) {
    console.error('Failed to render reCAPTCHA widget:', error);
  }
};

/**
 * Reset the reCAPTCHA widget
 * Call this after a failed login attempt to allow the user to try again
 */
export const resetRecaptcha = (): void => {
  if (window.grecaptcha && recaptchaWidgetId !== null) {
    try {
      window.grecaptcha.reset(recaptchaWidgetId);
      console.log('reCAPTCHA widget reset');
    } catch (error) {
      console.error('Failed to reset reCAPTCHA widget:', error);
    }
  }
};

/**
 * Get the current reCAPTCHA response token
 * Returns empty string if not verified
 */
export const getRecaptchaResponse = (): string => {
  if (window.grecaptcha && recaptchaWidgetId !== null) {
    return window.grecaptcha.getResponse(recaptchaWidgetId);
  }
  return '';
};

/**
 * Check if reCAPTCHA is available (for development mode fallback)
 */
export const isRecaptchaAvailable = (): boolean => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  return !!(siteKey && siteKey !== 'YOUR_RECAPTCHA_V2_SITE_KEY');
};
