'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from '../../lib/firebase';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp && name.length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Profile
        await updateProfile(user, { displayName: name });

        // Create User Document
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          createdAt: serverTimestamp()
        });

        showToast('Account created successfully!', 'success');
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Signed in successfully!', 'success');
      }
      // Redirect handled by onAuthStateChanged
    } catch (err) {
      console.error(err);
      let msg = 'Authentication failed';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use';
      if (err.code === 'auth/wrong-password') msg = 'Invalid password';
      if (err.code === 'auth/user-not-found') msg = 'User not found';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters';
      if (err.code === 'auth/invalid-credential') msg = 'Invalid credentials';
      
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user doc exists, if not create it (merge: true handles updates)
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        lastLogin: serverTimestamp()
      }, { merge: true });

      showToast('Signed in with Google!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Google sign in failed', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <i className="fa-solid fa-truck-fast"></i> FLEETGUARD
          </div>
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{isSignUp ? 'Start managing your fleet today' : 'Sign in to manage your fleet'}</p>
        </div>

        <form onSubmit={handleSubmit} id="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message" style={{ display: 'block', marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            <span className="btn-text">{loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}</span>
            {!loading && <i className="fa-solid fa-arrow-right"></i>}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button onClick={handleGoogleSignIn} className="btn btn-google">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
          Continue with Google
        </button>

        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="btn-link" 
            style={{ fontWeight: 600, marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>

      {toast.show && (
        <div className={`toast ${toast.show ? 'show' : ''}`} style={{ display: 'flex', opacity: 1, transform: 'translateY(0)' }}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
