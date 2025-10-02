import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { z } from 'zod';
import { db, auth } from '../services/firebase';
import { useUserStore } from '../stores/userStore';

const accessCodeSchema = z.string().min(6, { message: 'Access code must be at least 6 characters long.' });

export const useLoginForm = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationResult = accessCodeSchema.safeParse(accessCode);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const q = query(collection(db, 'accessCodes'), where('code', '==', validationResult.data));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid access code. Please try again.');
        setLoading(false);
        return;
      }

      const userCredential = await signInAnonymously(auth);
      setUser(userCredential.user);

      localStorage.setItem('userToken', await userCredential.user.getIdToken());
      navigate('/introduction');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to login. Please check your connection and try again.');
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
    handleSubmit,
    handleInputChange,
  };
};
