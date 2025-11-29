import { auth, db, googleProvider } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// DOM Elements
const authForm = document.getElementById('auth-form');
const nameGroup = document.getElementById('name-group');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const toggleAuthBtn = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');
const googleBtn = document.getElementById('google-btn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

let isSignUp = false;

// Check Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    }
});

// Toggle Login/Signup
toggleAuthBtn.addEventListener('click', () => {
    isSignUp = !isSignUp;
    
    if (isSignUp) {
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Start managing your fleet today';
        nameGroup.style.display = 'block';
        nameInput.required = true;
        btnText.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        toggleAuthBtn.textContent = 'Sign in';
    } else {
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to manage your fleet';
        nameGroup.style.display = 'none';
        nameInput.required = false;
        btnText.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleAuthBtn.textContent = 'Sign up';
    }
    
    // Clear errors
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
});

// Handle Form Submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const name = nameInput.value;
    
    // Basic Validation
    if (isSignUp && name.length < 2) {
        showError('name-error', 'Name must be at least 2 characters');
        return;
    }
    
    setLoading(true);
    
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
    } catch (error) {
        console.error(error);
        let msg = 'Authentication failed';
        if (error.code === 'auth/email-already-in-use') msg = 'Email already in use';
        if (error.code === 'auth/wrong-password') msg = 'Invalid password';
        if (error.code === 'auth/user-not-found') msg = 'User not found';
        if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters';
        
        showError('email-error', msg); // Showing generic error under email for simplicity
        showToast(msg, 'error');
    } finally {
        setLoading(false);
    }
});

// Handle Google Sign In
googleBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user doc exists, if not create it
        // For simplicity, we'll just set it (merge: true handles updates)
        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            lastLogin: serverTimestamp()
        }, { merge: true });
        
        showToast('Signed in with Google!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Google sign in failed', 'error');
    }
});

// UI Helpers
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.style.opacity = isLoading ? '0.7' : '1';
    btnText.textContent = isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In');
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    toast.querySelector('i').className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}
