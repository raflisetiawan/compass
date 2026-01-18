
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  getUserDocByAccessCode,
  updateUserUid,
  auth,
} from '../services/firebase';
import { loadRecaptchaScript, renderRecaptcha, resetRecaptcha, isRecaptchaAvailable } from '../services/recaptcha';
import { useUserStore } from '../stores/userStore';
import {type User} from '@/types'
import { signInAnonymously } from 'firebase/auth';

const accessCodeSchema = z.string().min(6, { message: 'Access code must be at least 6 characters long.' });

export const useLoginForm = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  // Callback when user successfully completes the reCAPTCHA
  const onRecaptchaVerify = useCallback((token: string) => {
    console.log('reCAPTCHA verified');
    setRecaptchaToken(token);
    setError(''); // Clear any previous error
  }, []);

  // Callback when reCAPTCHA expires
  const onRecaptchaExpired = useCallback(() => {
    console.log('reCAPTCHA expired');
    setRecaptchaToken(null);
  }, []);

  // Callback when reCAPTCHA encounters an error
  const onRecaptchaError = useCallback(() => {
    console.error('reCAPTCHA error');
    setRecaptchaToken(null);
    setError('Security verification error. Please try again.');
  }, []);

  // Load reCAPTCHA script on component mount
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        await loadRecaptchaScript();
        setRecaptchaReady(true);
      } catch (error) {
        console.error('Failed to load reCAPTCHA:', error);
        // In development, allow proceeding without reCAPTCHA
        if (import.meta.env.DEV) {
          setRecaptchaReady(true);
          setRecaptchaToken('dev-mode-token');
        }
      }
    };

    initRecaptcha();
  }, []);

  // Render reCAPTCHA widget when script is ready
  useEffect(() => {
    if (recaptchaReady && isRecaptchaAvailable()) {
      // Small delay to ensure container is mounted
      const timer = setTimeout(() => {
        renderRecaptcha(
          'recaptcha-container',
          onRecaptchaVerify,
          onRecaptchaExpired,
          onRecaptchaError
        );
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [recaptchaReady, onRecaptchaVerify, onRecaptchaExpired, onRecaptchaError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationResult = accessCodeSchema.safeParse(accessCode);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    // Check if reCAPTCHA is completed (skip in dev mode if not configured)
    if (!recaptchaToken && isRecaptchaAvailable()) {
      setError('Please complete the security verification.');
      return;
    }

    setLoading(true);
    setError('');
    const submittedAccessCode = validationResult.data;

    try {
      const userDoc = await getUserDocByAccessCode(submittedAccessCode);

      if (!userDoc) {
        setError('Invalid access code. Please try again.');
        setLoading(false);
        // Reset reCAPTCHA for retry
        resetRecaptcha();
        setRecaptchaToken(null);
        return;
      }

      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // If user doc doesn't have a UID, it's a first-time login for this access code.
      if (!userDoc.uid) {
        await updateUserUid(submittedAccessCode, uid);
      }

      const user: User = {
        uid,
        role: userDoc.role || 'patient',
        accessCode: submittedAccessCode,
      };

      setUser(user);

      localStorage.setItem('userToken', await userCredential.user.getIdToken());
      localStorage.setItem('sessionStartTime', Date.now().toString());
      localStorage.setItem('compassAccessCode', submittedAccessCode);

      if (user.role === 'clinican') {
        navigate('/select-patient');
      } else {
        navigate('/introduction');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to login. Please check your connection and try again.');
      // Reset reCAPTCHA for retry
      resetRecaptcha();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessCode(e.target.value);
    if (error) {
      setError('');
    }
  };

  return {
    accessCode,
    error,
    loading,
    recaptchaReady,
    recaptchaToken,
    handleSubmit,
    handleInputChange,
  };
};
