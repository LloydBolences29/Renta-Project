// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Create the UserContext
// export const UserContext = createContext();

// // Custom hook for using the UserContext
// export const useUserContext = () => useContext(UserContext);

// // In useUserContext.js
// export function UserProvider({ children }) {
//     const [userRole, setUserRole] = useState(null);
  
//     useEffect(() => {
//       const fetchUserData = async () => {
//         try {
//           const token = localStorage.getItem('token'); // or use another method to retrieve the token
//           if (!token) throw new Error("No token found"); // Handle missing token
    
//           const response = await fetch('/api/user/get-user', {
//             headers: {
//               'Authorization': `Bearer ${token}`, // Set token in Authorization header
//               'Content-Type': 'application/json'
//             }
//           });
          
//           if (!response.ok) throw new Error("Failed to fetch user data");
          
//           const userData = await response.json();
//           console.log('Fetched user data:', userData);
//           setUserRole(userData.role || userData.user?.role); // Set userRole to role value
//         } catch (error) {
//           console.error("Failed to fetch user data:", error);
//         }
//       };
    
//       fetchUserData();
//     }, []);
    
  
//     console.log('Current userRole in context:', userRole); // Add this log
  
//     return (
//       <UserContext.Provider value={{ userRole, setUserRole }}>
//         {children}
//       </UserContext.Provider>
//     );
//   }