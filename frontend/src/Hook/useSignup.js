import { useState } from "react";
import { useAuthContext } from "./useAuthHook";

export const useSignup = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Initialize with false
    const { dispatch } = useAuthContext();

    const signup = async (name, email, password, role) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
                credentials: 'include', // Include cookies in the request
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error); // Throw an error if the response is not ok
            }

            // Update the auth context with user ID from response
            dispatch({ type: 'LOGIN', payload:  json});

            return true;   
        } catch (err) {
            setError(err.message); // Set error message
            return false;
        } finally {
            setIsLoading(false); // Always set loading to false at the end
        }
    };

    return { signup, isLoading, error };
};
