import { useAuthContext } from "./useAuthHook"; 
import { useNavigate } from "react-router-dom"; 

export const useLogout = () => {
    const { dispatch } = useAuthContext(); // Access the context to update state
    const navigate = useNavigate(); // Redirect after logout

    const logout = async () => {
        try {
            // Notify backend to clear session cookies
            const response = await fetch('/api/user/logout', {
                method: 'POST',
                credentials: 'include', // Ensure cookies are included
            });

            if (!response.ok) {
                throw new Error("Logout failed. Please try again.");
            }

            // Clear saved email and reset context state
            localStorage.removeItem("savedEmail");
            dispatch({ type: "LOGOUT" });

            // Redirect to login or landing page
            navigate("/");
        } catch (err) {
            console.error("Logout Error:", err.message);
        }
    };

    return { logout };
};
