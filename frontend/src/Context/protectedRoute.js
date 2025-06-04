import { Navigate } from "react-router-dom";
import { useAuthContext } from "../Hook/useAuthHook"; 

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext(); 

  if (!user) {
    return <Navigate to="/" />; // Redirect to login if not authenticated
  }

  return children; // Render the children if authenticated
};

export default ProtectedRoute;
