import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';

const AuthContext = createContext(); // stores auth data throughout app

// easily access auth data in any component
export function useAuth() {
    return useContext(AuthContext);
}

/*
 * manages auth state
 * provides auth methods
 * makes data available to child components
 */
export function AuthProvider({ children }) {
    // current user stores user data (or null if not auth'd)
    const [currentUser, setCurrentUser] = useState(null);
    // loading tracks whether auth state still being determined
    const [loading, setLoading] = useState(true);

    // uses firebase to create account
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    /*
     * sets up firebase auth state observer
     * updates currentUser when auth state changes
     * sets loading to false once auth determined
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }
    , []);


    // value contains all data / methods to be shared
    const value = {
        currentUser,
        signup,
        login,
        logout,
    };

    // only render children when no longer loading
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}