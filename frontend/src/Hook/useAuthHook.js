import { AuthContext } from "../Context/authContext";
import { useContext } from "react";

export const useAuthContext = () => {
    const context = useContext(AuthContext)

    if(!context){
        throw new Error('userAuthContext must be used inside an AuthContextProvider')
    }

    return context
}