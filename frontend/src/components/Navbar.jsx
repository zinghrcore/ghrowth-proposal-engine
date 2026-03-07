import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ user }) => {
  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-950 text-white shadow-md flex justify-between items-center px-6 py-3 border-b border-blue-700">
      
      {/* Left Section: Hamburger + Logo */}
      <div className="flex items-center">

        {/* Text Logo */}
        <h1 className="text-2xl font-extrabold tracking-wide ml-4 whitespace-nowrap text-white drop-shadow-sm">
          ZingHR
        </h1>
      </div>

      {/* Right Section: Notifications + User */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <FaBell className="text-white/80 text-xl hover:text-blue-400 cursor-pointer transition" />

        {/* User Info */}
        <div className="flex items-center gap-2 bg-blue-900/60 px-3 py-1 rounded-xl hover:bg-blue-800/70 transition">
          <FaUserCircle className="text-blue-400 text-3xl" />
          <div>
            <p className="text-sm font-semibold text-white">{user.custName}</p>
            <p className="text-xs text-blue-300 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
