import React from 'react'
import {Link} from 'react-router-dom'
import logo from '../pages/apartment.png'
import { Button } from "@mui/material";
import { useLogout } from "../Hook/useLogout";
import {useAuthContext } from "../Hook/useAuthHook"

const Navbar = () => {
  const {user} = useAuthContext();
  const { logout } = useLogout();


  return (
    <>
<nav className='flex bg-slate-200 p-3 justify-between pl-20 pr-20 drop-shadow-xl mb:pr-2 mb:pl-6'>
      <Link to="/">
        <img src={logo} alt="Logo" className='h-16 w-16 rounded-full'  />
      </Link>
      <ul className='flex gap-5 pt-5'>
      {user ? (
        <li>
          <span>{user.email}</span>
          <Button
            variant="outlined"
            color="secondary"
            onClick={logout}
            className="!text-sm !tracking-widest !font-playfair !text-center !text-green-700 !border-green-700"
          >
            Logout
          </Button>
        </li>
      ) : (
        <>
          <li className="text-sm tracking-widest font-playfair ">
            <Link to="/signup" className='border border-blue-500 rounded-2xl py-2 px-6 font-semibold hover:bg-blue-400 hover:border-blue-400 hover:text-green-950 transition-all mb:text-xs'>Sign Up</Link>
          </li>
          <li className="text-sm tracking-widest font-playfair">
            <Link to="/" className='border border-blue-500 rounded-2xl py-2 px-6 font-semibold hover:bg-blue-400 hover:border-blue-400 hover:text-green-950 transition-all mb:text-xs'>Sign In</Link>
          </li>
        </>
      )}
    </ul>
    </nav>

    </>
  )
}

export default Navbar