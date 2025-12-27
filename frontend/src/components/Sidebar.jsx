import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMenu } from 'react-icons/hi';
import {
  FaHome,
  FaFileAlt,
  FaCogs,
  FaBox,
  FaLayerGroup,
  FaBullhorn,
  FaChartBar,
  FaClipboardCheck,
  FaListAlt,
  FaSignOutAlt,
} from 'react-icons/fa';

const Sidebar = ({ role, isOpen, setIsOpen }) => {
  const [hover, setHover] = useState(false);

  // Common menu for all roles
  const commonMenu = [
    { name: 'Home', icon: <FaHome />, link: '/dashboard' },
    { name: 'Settings', icon: <FaCogs />, link: '/settings' },
  ];

  // Role-specific menu items
  const adminItems = [
    { name: 'Module Management', icon: <FaBox />, link: '/module-management' },
    { name: 'Package Management', icon: <FaLayerGroup />, link: '/package-management' },
    { name: 'Campaign & Discounts', icon: <FaBullhorn />, link: '/campaign-management' },
    { name: 'Reports', icon: <FaChartBar />, link: '/reports' },
  ];

  const approverItems = [
    { name: 'Pending Approvals', icon: <FaClipboardCheck />, link: '/pending-approvals' },
    { name: 'Approved Proposals', icon: <FaListAlt />, link: '/approved-proposals' },
  ];

  const customerItems = [
    { name: 'Create Proposal', icon: <FaFileAlt />, link: '/create-proposal' },
    { name: 'View Proposals', icon: <FaFileAlt />, link: '/view-proposals' },
  ];

  // Combine menus based on role
  let menuItems = [...commonMenu];
  if (role === 'admin') menuItems = [...menuItems, ...adminItems];
  else if (role === 'approver') menuItems = [...menuItems, ...approverItems];
  else if (role === 'customer') menuItems = [...menuItems, ...customerItems];

  const width = hover || isOpen ? 'w-64' : 'w-20';

  return (
    <>
      {/* Hamburger Icon for Mobile */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-3xl text-white bg-green-700 p-2 rounded-md shadow-md hover:bg-green-800 transition"
        >
          <HiMenu />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50
          bg-gradient-to-b from-green-600/60 to-teal-500/60
          backdrop-blur-xl border-r border-white/20 text-white
          shadow-[0_4px_30px_rgba(0,0,0,0.1)]
          transform transition-all duration-300 ease-in-out
          ${width} ${isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'}
          md:rounded-r-2xl
        `}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Profile Section */}
        <div
          className={`mb-10 flex items-center gap-3 ${
            width === 'w-20' ? 'justify-center' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold shadow-md">
            {role === 'admin' ? 'A' : role === 'approver' ? 'P' : 'C'}
          </div>
          <div
            className={`transition-all duration-300 ${
              width === 'w-20' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <h2 className="font-semibold capitalize">{role}</h2>
            <p className="text-sm opacity-80">Welcome</p>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.link}
                className="flex items-center gap-3 p-3 rounded-xl 
                  hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] 
                  transition-all cursor-pointer font-medium"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className={`transition-all duration-300 ${
                    width === 'w-20' ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          ))}

          {/* Logout */}
          <li className="mt-6">
            <Link
              to="/login"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-600/80 transition-all cursor-pointer font-medium text-red-200 hover:text-white"
              onClick={() => {
                localStorage.removeItem('user');
                setIsOpen(false);
              }}
            >
              <FaSignOutAlt />
              <span
                className={`transition-all duration-300 ${
                  width === 'w-20' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                Logout
              </span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
