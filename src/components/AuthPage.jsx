/*
 * Login page for the website.
 * This is what the website opens with by default if the user is not logged in.
 * Uses Firebase for authentication.
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get authentication functions from AuthContext
    const { signup, login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            setLoading(true);
            if (isSignUp) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('The email address is already in use.');
                    break;
                case 'auth/invalid-email':
                    setError('The email address is not valid.');
                    break;
                case 'auth/weak-password':
                    setError('The password is too weak. Please use at least 6 characters.');
                    break;
                case 'auth/user-not-found':
                    setError('No user found with this email.');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password.');
                    break;
                case 'auth/invalid-credential':
                    setError('The email or password is incorrect.');
                    break;
                default:
                    setError(`Failed to ${isSignUp ? 'create account' : 'log in'}: ${err.message}`);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-card">
            <h1>Welcome to Calendo</h1>
            
            <form onSubmit={handleSubmit}>
                <h2>{isSignUp ? 'Create Account' : 'Log In'}</h2> {/* login / signup */}
                
                {error && <div className="error-message">{error}</div>} {/* error message if user messes up */}
                
                {/* email input */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                    />
                </div>
                
                {/* password input */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password123"
                        required
                    />
                </div>
                
                <button type="submit" className="submit-btn" disabled={loading}>
                    {isSignUp ? 'Sign Up' : 'Log In'}
                </button>
                
                <div className="auth-toggle">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button 
                        type="button" 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="toggle-btn"
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AuthPage;