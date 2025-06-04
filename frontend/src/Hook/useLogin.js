import { useState } from "react";
import { useAuthContext } from "./useAuthHook";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext();
    const [savedEmail, setSavedEmail] = useState(localStorage.getItem("savedEmail") || "");
    const navigate = useNavigate();

    const login = async (email, password, rememberMe) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Include cookies in the request
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || 'Login failed'); // Handle server errors
            }

            // Store email if "Remember Me" is checked
            if (rememberMe) {
                localStorage.setItem("savedEmail", email);
            } else {
                localStorage.removeItem("savedEmail");
            }

            // Dispatch the user info with role and email to the context
            dispatch({ type: 'LOGIN', payload: { email: json.email, role: json.role }});

            // Navigate to the dashboard or any other route
            navigate('/dashboard'); 

        } catch (err) {
            if (err.message === 'Failed to fetch') {
                setError('Unable to connect to the server. Please try again later.');
            } else {
                setError(err.message); // Set the error from the server
            }
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    return { login, isLoading, error, savedEmail, setSavedEmail };
};