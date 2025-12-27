import React from 'react';
import { HiMenu } from 'react-icons/hi';
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ user, toggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-white/70 backdrop-blur-md shadow-md border-b border-gray-200 flex justify-between items-center px-6 py-3">
      
      {/* Left Section: Hamburger + Logo */}
      <div className="flex items-center">
        {/* Hamburger Icon */}
        <button
          onClick={toggleSidebar}
          className="text-3xl text-green-700 p-1 rounded-md focus:outline-none hover:bg-green-100 transition flex-shrink-0"
        >
          <HiMenu />
        </button>

        {/* Text Logo next to hamburger */}
        <h1 className="text-2xl font-extrabold text-green-700 tracking-wide ml-4 whitespace-nowrap">
          ZingHR
        </h1>
      </div>

      {/* Right Section: Notifications + User */}
      <div className="flex items-center gap-5">
        <FaBell className="text-gray-600 text-xl hover:text-green-600 cursor-pointer transition" />
        <div className="flex items-center gap-2">
          <FaUserCircle className="text-green-600 text-3xl" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{user.custName}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
