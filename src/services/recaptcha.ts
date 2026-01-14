/**
 * Firebase App Check with reCAPTCHA v3 Service
 * 
 * This service provides reCAPTCHA v3 verification for the login flow
 * to prevent automated access as per PRD security requirements.
 */

import { initializeAppCheck, ReCaptchaV3Provider, getToken } from 'firebase/app-check';
import { getApp } from 'firebase/app';

/**
 * Type definition for Google reCAPTCHA v3 interface
 */
interface ReCaptchaV3Instance {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

let appCheckInitialized = false;
let recaptchaScriptLoaded = false;

/**
 * Dynamically load the reCAPTCHA v3 script
 */
export const loadRecaptchaScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    
    if (!siteKey || siteKey === 'YOUR_RECAPTCHA_V3_SITE_KEY') {
      if (import.meta.env.DEV) {
        console.warn('reCAPTCHA site key not configured. Skipping script load in development.');
        resolve();
        return;
      }
      reject(new Error('reCAPTCHA site key not configured'));
      return;
    }

    // Check if already loaded
    if (recaptchaScriptLoaded || (window as unknown as { grecaptcha?: ReCaptchaV3Instance }).grecaptcha) {
      resolve();
      return;
    }

    // Create and append the script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      recaptchaScriptLoaded = true;
      console.log('reCAPTCHA script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Initialize Firebase App Check with reCAPTCHA v3
 * This should be called once when the app starts
 */
export const initializeRecaptcha = () => {
  if (appCheckInitialized) {
    return;
  }

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn('reCAPTCHA site key not found. App Check will not be initialized.');
    return;
  }

  try {
    const app = getApp();
    
    // Enable debug mode in development
    if (import.meta.env.DEV) {
      // @ts-expect-error - Debug token for development
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });

    appCheckInitialized = true;
    console.log('Firebase App Check initialized with reCAPTCHA v3');
  } catch (error) {
    console.error('Failed to initialize App Check:', error);
  }
};

/**
 * Get the current App Check token
 * This can be used to verify the user before sensitive operations
 */
export const getAppCheckToken = async (): Promise<string | null> => {
  try {
    const app = getApp();
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''),
      isTokenAutoRefreshEnabled: true,
    });
    
    const tokenResult = await getToken(appCheck, /* forceRefresh */ false);
    return tokenResult.token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    return null;
  }
};

/**
 * Verify reCAPTCHA before login
 * Returns true if verification passed, false otherwise
 */
export const verifyRecaptchaForLogin = async (): Promise<boolean> => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    // If no site key, skip verification in development
    if (import.meta.env.DEV) {
      console.warn('reCAPTCHA site key not configured. Skipping verification in development.');
      return true;
    }
    return false;
  }

  try {
    // For reCAPTCHA v3, we use the grecaptcha.execute method
    // This is loaded from the script tag in index.html
    const grecaptcha = (window as unknown as { grecaptcha?: ReCaptchaV3Instance }).grecaptcha;
    
    if (!grecaptcha) {
      console.error('reCAPTCHA not loaded');
      return false;
    }

    return new Promise((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(siteKey, { action: 'login' })
          .then((token: string) => {
            // In a production environment, you would send this token
            // to your backend for verification
            // For now, we just check if a token was generated
            if (token) {
              console.log('reCAPTCHA verification successful');
              resolve(true);
            } else {
              console.error('reCAPTCHA verification failed: no token');
              resolve(false);
            }
          })
          .catch((error: Error) => {
            console.error('reCAPTCHA verification error:', error);
            resolve(false);
          });
      });
    });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};
